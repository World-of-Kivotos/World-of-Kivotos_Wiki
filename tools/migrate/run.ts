import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import {
  AUDIT_DOCS,
  AUDIT_INFO,
  CHAMPION_EFFECTS,
  CHAMPION_INFO,
  DIMENSIONS,
  ECONOMY,
  JOBS,
  LAND_DOCS,
  LAND_INFO,
} from '@/content/wiki'
import type { Section } from '../../src/content/types.ts'
import { loadDoc } from '../md/parse.ts'
import { emitMarkdown } from './emit.ts'

/**
 * 迁移期专用: 把旧 TS 内容对象发射成 .md, 再用正式解析器读回来做逐字段深比较。
 * 渲染组件一行没改, 输入对象逐字段相同 -> 输出 DOM 必然相同, 这是"逐像素一致"的机械证明。
 * 阶段 6 连同 migrate/ 一起删除。
 */

const CONTENT_ROOT = resolve(import.meta.dirname, '../../src/content')

type Doc = Record<string, unknown>

interface Emission {
  /** 相对 src/content 的输出路径 */
  path: string
  frontmatter: Record<string, unknown>
  intro: string
  sections: Section[]
  /** 期望解析回来的完整对象 */
  expected: Doc
}

/** 值为 undefined 的键与空的 numericCols/monoCols 在渲染侧行为完全相同, 归一后再比。 */
function normalize(value: unknown, key?: string): unknown {
  if (Array.isArray(value)) {
    if ((key === 'numericCols' || key === 'monoCols') && value.length === 0) return undefined
    return value.map((item) => normalize(item))
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      const normalized = normalize(v, k)
      if (normalized !== undefined) out[k] = normalized
    }
    return out
  }
  return value
}

function firstDiff(a: unknown, b: unknown, path = ''): string | null {
  if (a === b) return null
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return `${path} 数组长度 ${a.length} vs ${b.length}`
    for (let i = 0; i < a.length; i += 1) {
      const diff = firstDiff(a[i], b[i], `${path}[${i}]`)
      if (diff) return diff
    }
    return null
  }
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    const ka = Object.keys(a as object).sort()
    const kb = Object.keys(b as object).sort()
    const missing = ka.filter((k) => !kb.includes(k))
    const extra = kb.filter((k) => !ka.includes(k))
    if (missing.length > 0) return `${path} 解析结果缺少字段 ${missing.join(',')}`
    if (extra.length > 0) return `${path} 解析结果多出字段 ${extra.join(',')}`
    for (const k of ka) {
      const diff = firstDiff(
        (a as Record<string, unknown>)[k],
        (b as Record<string, unknown>)[k],
        `${path}.${k}`,
      )
      if (diff) return diff
    }
    return null
  }
  return `${path} 期望 ${JSON.stringify(a)} 实际 ${JSON.stringify(b)}`
}

const orderOf = (index: number) => index * 10 + 10

function jobEmissions(): Emission[] {
  return JOBS.map((job, i) => ({
    path: `jobs/${job.id}.md`,
    frontmatter: {
      order: orderOf(i),
      name: job.name,
      en: job.en,
      category: job.category,
      difficulty: job.difficulty,
      tagline: job.tagline,
      facts: job.facts,
      growth: job.growth,
    },
    intro: job.intro,
    sections: job.sections,
    expected: job as unknown as Doc,
  }))
}

function dimensionEmissions(): Emission[] {
  return DIMENSIONS.map((dim, i) => ({
    path: `dimensions/${dim.id}.md`,
    frontmatter: {
      order: orderOf(i),
      name: dim.name,
      en: dim.en,
      tagline: dim.tagline,
      facts: dim.facts,
    },
    intro: dim.intro,
    sections: dim.sections,
    expected: dim as unknown as Doc,
  }))
}

function championEmissions(): Emission[] {
  const effects = CHAMPION_EFFECTS.map((effect, i) => ({
    path: `champions/${effect.id}.md`,
    frontmatter: {
      order: orderOf(i),
      name: effect.name,
      en: effect.en,
      pool: effect.pool,
      group: effect.group,
      status: effect.status,
      statusNote: effect.statusNote,
      tagline: effect.tagline,
      facts: effect.facts,
    },
    intro: effect.intro,
    sections: effect.sections,
    expected: effect as unknown as Doc,
  }))
  return [
    {
      path: 'champions/_overview.md',
      frontmatter: {
        name: CHAMPION_INFO.name,
        en: CHAMPION_INFO.en,
        dummyIntro: CHAMPION_INFO.dummyIntro,
        dummies: CHAMPION_INFO.dummies,
      },
      intro: CHAMPION_INFO.intro,
      sections: CHAMPION_INFO.sections,
      expected: CHAMPION_INFO as unknown as Doc,
    },
    ...effects,
  ]
}

function landEmissions(): Emission[] {
  const docs = LAND_DOCS.map((doc, i) => ({
    path: `land/${doc.id}.md`,
    frontmatter: {
      order: orderOf(i),
      name: doc.name,
      en: doc.en,
      group: doc.group,
      tagline: doc.tagline,
      facts: doc.facts,
    },
    intro: doc.intro,
    sections: doc.sections,
    expected: doc as unknown as Doc,
  }))
  return [
    {
      path: 'land/_overview.md',
      frontmatter: { name: LAND_INFO.name, en: LAND_INFO.en, facts: LAND_INFO.facts },
      intro: LAND_INFO.intro,
      sections: LAND_INFO.sections,
      expected: LAND_INFO as unknown as Doc,
    },
    ...docs,
  ]
}

function auditEmissions(): Emission[] {
  const docs = AUDIT_DOCS.map((doc, i) => ({
    path: `audit/${doc.id}.md`,
    frontmatter: {
      order: orderOf(i),
      name: doc.name,
      en: doc.en,
      group: doc.group,
      tagline: doc.tagline,
      facts: doc.facts,
    },
    intro: doc.intro,
    sections: doc.sections,
    expected: doc as unknown as Doc,
  }))
  return [
    {
      path: 'audit/_overview.md',
      frontmatter: {
        name: AUDIT_INFO.name,
        en: AUDIT_INFO.en,
        tagline: AUDIT_INFO.tagline,
        facts: AUDIT_INFO.facts,
      },
      intro: AUDIT_INFO.intro,
      sections: AUDIT_INFO.sections,
      expected: AUDIT_INFO as unknown as Doc,
    },
    ...docs,
  ]
}

function economyEmissions(): Emission[] {
  return [
    {
      path: 'economy.md',
      frontmatter: { name: ECONOMY.name },
      intro: ECONOMY.intro,
      sections: ECONOMY.topics,
      expected: ECONOMY as unknown as Doc,
    },
  ]
}

const SECTIONS: Record<string, () => Emission[]> = {
  economy: economyEmissions,
  jobs: jobEmissions,
  dimensions: dimensionEmissions,
  land: landEmissions,
  champions: championEmissions,
  audit: auditEmissions,
}

function main(): void {
  const requested = process.argv.slice(2).filter((a) => !a.startsWith('--'))
  const dryRun = process.argv.includes('--dry-run')
  const names = requested.length > 0 ? requested : Object.keys(SECTIONS)

  let written = 0
  const failures: string[] = []

  for (const name of names) {
    const build = SECTIONS[name]
    if (!build) throw new Error(`不认识的板块 ${name}; 可用: ${Object.keys(SECTIONS).join(' / ')}`)

    for (const emission of build()) {
      const absPath = join(CONTENT_ROOT, emission.path)
      const markdown = emitMarkdown(
        emission.frontmatter as Parameters<typeof emitMarkdown>[0],
        emission.intro,
        emission.sections,
      )
      if (!dryRun) {
        mkdirSync(join(absPath, '..'), { recursive: true })
        writeFileSync(absPath, markdown, 'utf8')
        written += 1
      }

      const source = dryRun ? markdown : readFileSync(absPath, 'utf8')
      try {
        const { doc } = loadDoc(source, absPath)
        const diff = firstDiff(normalize(emission.expected), normalize(doc))
        if (diff) failures.push(`${emission.path} ${diff}`)
      } catch (err) {
        failures.push(`${emission.path} 解析失败: ${(err as Error).message}`)
      }
    }
  }

  if (failures.length > 0) {
    console.error(`等价性校验未通过, 共 ${failures.length} 条:`)
    for (const failure of failures.slice(0, 40)) console.error(`  ${failure}`)
    if (failures.length > 40) console.error(`  ... 还有 ${failures.length - 40} 条`)
    process.exitCode = 1
    return
  }

  console.log(`等价性校验通过: ${names.join(', ')} 共 ${written} 篇, 逐字段与旧 TS 对象完全一致`)
}

main()
