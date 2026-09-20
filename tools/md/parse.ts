import type { Root } from 'mdast'
import remarkDirective from 'remark-directive'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import { unified } from 'unified'
import type { z } from 'zod'
import { ContentError } from './errors.ts'
import { splitFrontmatter } from './frontmatter.ts'
import { resolveKind, type DocKind } from './kind.ts'
import { parseBody } from './sections.ts'
import {
  AuditFm,
  AuditOverviewFm,
  ChampionFm,
  ChampionOverviewFm,
  DimensionFm,
  EconomyFm,
  JobFm,
  LandFm,
  LandOverviewFm,
  formatIssues,
} from './schema.ts'
import type { ParseContext } from './table.ts'

/** 只用 .parse(), 不走 .process(); 管线无状态, 建一次复用。 */
const processor = unified().use(remarkParse).use(remarkGfm).use(remarkDirective)

const SCHEMAS = {
  job: JobFm,
  dimension: DimensionFm,
  champion: ChampionFm,
  'champion-overview': ChampionOverviewFm,
  land: LandFm,
  'land-overview': LandOverviewFm,
  audit: AuditFm,
  'audit-overview': AuditOverviewFm,
  economy: EconomyFm,
} as const satisfies Record<DocKind, z.ZodType>

export interface LoadedDoc {
  kind: DocKind
  /** 列表型文档的排序键; 单例型为 null */
  order: number | null
  /** 与 types.ts 对应接口同形的普通对象 */
  doc: Record<string, unknown>
}

/** 把绝对路径归一成相对 src/content 的正斜杠路径, 供 kind 分流与报错显示。 */
export function contentRelativePath(absPath: string): string {
  const normalized = absPath.replace(/\\/g, '/')
  const marker = '/src/content/'
  const at = normalized.lastIndexOf(marker)
  return at === -1 ? normalized : normalized.slice(at + marker.length)
}

/**
 * 一篇 .md -> 与 types.ts 同形的数据对象。纯函数, 不碰文件系统也不碰 Vite,
 * 因此 Vite 插件与 tools/check-content.ts 共用同一份实现, 不存在两处解析各自漂移。
 */
export function loadDoc(source: string, absPath: string): LoadedDoc {
  const relative = contentRelativePath(absPath)
  const file = relative
  const { kind, id } = resolveKind(relative, file)

  const { data, body, lineOffset, hasFrontmatter } = splitFrontmatter(source, file)
  if (!hasFrontmatter) {
    throw new ContentError(file, 1, 1, '文件开头缺少 --- frontmatter 块')
  }

  const parsed = SCHEMAS[kind].safeParse(data)
  if (!parsed.success) {
    throw new ContentError(file, 2, 1, `frontmatter 不合法 —— ${formatIssues(parsed.error)}`)
  }
  const fm = parsed.data as Record<string, unknown>

  const tree = processor.parse(body) as Root
  const ctx: ParseContext = { source: body, file, lineOffset }
  const { intro, sections } = parseBody(tree, ctx)

  if (kind === 'economy') {
    return { kind, order: null, doc: { ...fm, intro, topics: sections } }
  }

  const { order, ...rest } = fm as { order?: number }
  const base = { ...rest, intro, sections }
  return {
    kind,
    order: order ?? null,
    doc: id === null ? base : { id, ...base },
  }
}
