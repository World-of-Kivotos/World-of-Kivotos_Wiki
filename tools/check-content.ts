import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { ContentError } from './md/errors.ts'
import { contentRelativePath, loadDoc, type LoadedDoc } from './md/parse.ts'
import { LIST_KINDS } from './md/kind.ts'
import type { ChampionEffect, Section } from '../src/content/types.ts'

/**
 * 全量体检: 一次跑完所有 .md 并汇总列出全部错误, 一轮改完,
 * 不用 build-fail-fix 反复来回。CI 单独跑一遍, 防止有人绕过 pnpm build。
 */

const CONTENT_ROOT = resolve(import.meta.dirname, '../src/content')

function walkMarkdown(dir: string): string[] {
  const out: string[] = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) out.push(...walkMarkdown(full))
    else if (entry.endsWith('.md')) out.push(full)
  }
  return out
}

/** 词条页的品质表契约: 替代迁移前 tierTable() 提供的定长 6 元组类型约束。 */
const TIER_COLUMNS = ['品质', '普通', '中级', '高级', '超凡', '闪耀']

function checkChampionTierTables(file: string, sections: Section[], problems: string[]): void {
  for (const section of sections) {
    const table = section.table
    if (!table) continue
    const mismatch =
      table.columns.length !== TIER_COLUMNS.length ||
      table.columns.some((c, i) => c !== TIER_COLUMNS[i])
    if (mismatch) {
      problems.push(
        `${file} 小节「${section.heading}」的表格列名是 ${table.columns.join('/')}; 词条页的表必须是 ${TIER_COLUMNS.join('/')}`,
      )
      continue
    }
    const expected = [1, 2, 3, 4, 5]
    const actual = table.numericCols ?? []
    if (expected.length !== actual.length || expected.some((v, i) => v !== actual[i])) {
      problems.push(
        `${file} 小节「${section.heading}」的品质表第 1 到 5 列必须右对齐(分隔行写 ---:)`,
      )
    }
  }
}

/** 页面里硬编码的内容 id 路由: 重命名 .md 会让它静默落到"未找到"分支, 这里反向兜住。 */
const ROUTE_PATTERN = /\/wiki\/(jobs|land|dimensions|champions|audit)\/([a-z0-9-]+)/g
const ROUTE_DIRECTORY: Record<string, string> = {
  jobs: 'jobs',
  land: 'land',
  dimensions: 'dimensions',
  champions: 'champions',
  audit: 'audit',
}

function walkSource(dir: string): string[] {
  const out: string[] = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) out.push(...walkSource(full))
    else if (entry.endsWith('.tsx') || entry.endsWith('.ts')) out.push(full)
  }
  return out
}

function checkHardcodedRoutes(ids: Map<string, Set<string>>, problems: string[]): void {
  const roots = [resolve(import.meta.dirname, '../src/pages'), resolve(import.meta.dirname, '../src/components')]
  for (const root of roots) {
    for (const file of walkSource(root)) {
      const text = readFileSync(file, 'utf8')
      for (const [, section, id] of text.matchAll(ROUTE_PATTERN)) {
        const directory = ROUTE_DIRECTORY[section]
        if (ids.get(directory)?.has(id)) continue
        problems.push(
          `${contentRelativePath(file)} 里写死的路由 /wiki/${section}/${id} 找不到对应的 src/content/${directory}/${id}.md`,
        )
      }
    }
  }
}

function main(): void {
  const files = walkMarkdown(CONTENT_ROOT).sort()
  const problems: string[] = []
  const loaded: { file: string; result: LoadedDoc }[] = []

  for (const absPath of files) {
    const relative = contentRelativePath(absPath)
    try {
      loaded.push({ file: relative, result: loadDoc(readFileSync(absPath, 'utf8'), absPath) })
    } catch (err) {
      problems.push(err instanceof ContentError ? err.message : `${relative} ${(err as Error).message}`)
    }
  }

  // 同目录内 order 不得重复, 否则排序结果依赖 glob 返回顺序, 会静默漂移。
  const orders = new Map<string, Map<number, string>>()
  const idsByDirectory = new Map<string, Set<string>>()
  for (const { file, result } of loaded) {
    const directory = file.includes('/') ? file.slice(0, file.indexOf('/')) : '.'
    const id = result.doc.id
    if (typeof id === 'string') {
      const bucket = idsByDirectory.get(directory) ?? new Set<string>()
      bucket.add(id)
      idsByDirectory.set(directory, bucket)
    }
    if (!LIST_KINDS.has(result.kind)) continue
    if (result.order === null) {
      problems.push(`${file} 缺少 order 字段`)
      continue
    }
    const bucket = orders.get(directory) ?? new Map<number, string>()
    const taken = bucket.get(result.order)
    if (taken) problems.push(`${file} 的 order ${result.order} 与 ${taken} 重复`)
    bucket.set(result.order, file)
    orders.set(directory, bucket)
  }

  for (const { file, result } of loaded) {
    if (result.kind !== 'champion') continue
    const doc = result.doc as unknown as ChampionEffect
    checkChampionTierTables(file, doc.sections, problems)
  }

  checkHardcodedRoutes(idsByDirectory, problems)

  const stats = loaded.reduce(
    (acc, { result }) => {
      const sections = (result.doc.sections ?? result.doc.topics) as Section[] | undefined
      acc.sections += sections?.length ?? 0
      acc.tables += sections?.filter((s) => s.table).length ?? 0
      acc.notes += sections?.filter((s) => s.note).length ?? 0
      acc.menus += sections?.filter((s) => s.menu).length ?? 0
      return acc
    },
    { sections: 0, tables: 0, notes: 0, menus: 0 },
  )

  if (problems.length > 0) {
    console.error(`内容校验未通过, 共 ${problems.length} 条:`)
    for (const problem of problems) console.error(`  ${problem}`)
    process.exitCode = 1
    return
  }

  console.log(
    `内容校验通过: ${loaded.length} 篇 / ${stats.sections} 小节 / ${stats.tables} 表 / ${stats.notes} 旁注 / ${stats.menus} 菜单图`,
  )
}

main()
