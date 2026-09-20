import { ContentError } from './errors.ts'

/**
 * 路径 -> 文档形状的分流。glob 到但分流不到任何 kind 的 .md 直接构建失败,
 * 杜绝"新加了文件但没生效"这种静默问题。
 */
export type DocKind =
  | 'job'
  | 'dimension'
  | 'champion'
  | 'champion-overview'
  | 'land'
  | 'land-overview'
  | 'audit'
  | 'audit-overview'
  | 'economy'

/** 列表型文档必须有 order(决定侧栏与索引页顺序); 单例型文档禁止写 order。 */
export const LIST_KINDS: ReadonlySet<DocKind> = new Set<DocKind>([
  'job',
  'dimension',
  'champion',
  'land',
  'audit',
])

interface Resolved {
  kind: DocKind
  /** 文件名去掉 .md, 即文档 id 与 URL 片段; 单例型为 null */
  id: string | null
}

/** 目录名 -> [列表型 kind, 单例型 kind]; 单例型为 null 表示该目录不允许 _overview.md。 */
const BY_DIRECTORY: Record<string, [DocKind, DocKind | null]> = {
  jobs: ['job', null],
  dimensions: ['dimension', null],
  champions: ['champion', 'champion-overview'],
  land: ['land', 'land-overview'],
  audit: ['audit', 'audit-overview'],
}

/**
 * @param relativePath 相对 src/content 的正斜杠路径, 如 'jobs/miner.md' 或 'economy.md'
 */
export function resolveKind(relativePath: string, file: string): Resolved {
  const segments = relativePath.split('/')
  const base = segments[segments.length - 1]
  if (!base.endsWith('.md')) {
    throw new ContentError(file, 1, 1, `不是 markdown 文件: ${relativePath}`)
  }
  const stem = base.slice(0, -'.md'.length)

  if (segments.length === 1) {
    if (stem === 'economy') return { kind: 'economy', id: null }
    throw new ContentError(
      file,
      1,
      1,
      `src/content 根目录只允许 economy.md, 不认识 ${base}; 其它文档要放进 jobs/ dimensions/ champions/ land/ audit/ 之一`,
    )
  }

  if (segments.length !== 2) {
    throw new ContentError(file, 1, 1, `内容目录只有一层, 不支持嵌套路径 ${relativePath}`)
  }

  const mapping = BY_DIRECTORY[segments[0]]
  if (!mapping) {
    throw new ContentError(
      file,
      1,
      1,
      `不认识的内容目录 ${segments[0]}/; 可用的是 ${Object.keys(BY_DIRECTORY).join(' / ')}`,
    )
  }

  const [listKind, overviewKind] = mapping
  if (stem.startsWith('_')) {
    if (stem === '_overview' && overviewKind) return { kind: overviewKind, id: null }
    throw new ContentError(
      file,
      1,
      1,
      overviewKind
        ? `${segments[0]}/ 下带下划线前缀的文件只允许 _overview.md`
        : `${segments[0]}/ 下不存在总览页, 不要用下划线前缀`,
    )
  }

  return { kind: listKind, id: stem }
}
