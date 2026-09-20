/**
 * Wiki 内容入口: 把 src/content 下的 .md 汇总成各板块的数组与单例。
 *
 * .md 在构建期由 tools/vite-plugin-content.ts 折叠成 `{ order, doc }` 的 JS 字面量,
 * 所以这里拿到的就是与 ./types 逐字段同形的普通对象, 浏览器侧没有任何解析开销。
 * 内容怎么写见 ./README.md。
 */

export * from './types'
export * from './taxonomy'

import type {
  AuditDoc,
  AuditInfo,
  ChampionEffect,
  ChampionInfo,
  Dimension,
  EconomyContent,
  Job,
  LandDoc,
  LandInfo,
} from './types'
import { AUDIT_GROUP_ORDER, CHAMPION_POOLS, LAND_GROUP_ORDER } from './taxonomy'

interface ContentModule<T> {
  /** 列表型文档的排序键; 单例型为 null */
  order: number | null
  doc: T
}

/** 按 frontmatter 的 order 排序。顺序必须来自内容自身, 不能依赖 glob 的返回次序。 */
function ordered<T>(modules: Record<string, ContentModule<T>>): T[] {
  return Object.values(modules)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((m) => m.doc)
}

function single<T>(modules: Record<string, ContentModule<T>>): T {
  const values = Object.values(modules)
  if (values.length !== 1) {
    throw new Error(`总览页应当只有一篇, 实际匹配到 ${values.length} 篇`)
  }
  return values[0].doc
}

/** 职业总表(顺序即首页/侧栏展示顺序): 生产职在前, 战斗辅助职在后。 */
export const JOBS: Job[] = ordered<Job>(
  import.meta.glob<ContentModule<Job>>('./jobs/*.md', { eager: true, import: 'default' }),
)

/** 维度总表: 矿业维度先行; 后续别的维度作同级追加。 */
export const DIMENSIONS: Dimension[] = ordered<Dimension>(
  import.meta.glob<ContentModule<Dimension>>('./dimensions/*.md', {
    eager: true,
    import: 'default',
  }),
)

export const ECONOMY: EconomyContent = single<EconomyContent>(
  import.meta.glob<ContentModule<EconomyContent>>('./economy.md', {
    eager: true,
    import: 'default',
  }),
)

/** 精英怪: 总览(系统机制) + 全部已实现词条(一效果一页)。[!_] 把 _overview.md 排除在列表外。 */
export const CHAMPION_INFO: ChampionInfo = single<ChampionInfo>(
  import.meta.glob<ContentModule<ChampionInfo>>('./champions/_overview.md', {
    eager: true,
    import: 'default',
  }),
)
export const CHAMPION_EFFECTS: ChampionEffect[] = ordered<ChampionEffect>(
  import.meta.glob<ContentModule<ChampionEffect>>('./champions/[!_]*.md', {
    eager: true,
    import: 'default',
  }),
)

/** 领地(Flan mod): 总览 + 各主题文档(上手/参考/服主三组)。 */
export const LAND_INFO: LandInfo = single<LandInfo>(
  import.meta.glob<ContentModule<LandInfo>>('./land/_overview.md', {
    eager: true,
    import: 'default',
  }),
)
export const LAND_DOCS: LandDoc[] = ordered<LandDoc>(
  import.meta.glob<ContentModule<LandDoc>>('./land/[!_]*.md', { eager: true, import: 'default' }),
)

/** 临时 main 分支审计区, 与正式玩家文档数据隔离。 */
export const AUDIT_INFO: AuditInfo = single<AuditInfo>(
  import.meta.glob<ContentModule<AuditInfo>>('./audit/_overview.md', {
    eager: true,
    import: 'default',
  }),
)
export const AUDIT_DOCS: AuditDoc[] = ordered<AuditDoc>(
  import.meta.glob<ContentModule<AuditDoc>>('./audit/[!_]*.md', { eager: true, import: 'default' }),
)

/** 只保留当前真有内容的分组, 避免侧栏与索引页出现空组; 顺序由 taxonomy 固定。 */
export const CHAMPION_POOL_GROUPS: string[] = CHAMPION_POOLS.filter((pool) =>
  CHAMPION_EFFECTS.some((e) => e.pool === pool),
)
export const LAND_GROUPS: string[] = LAND_GROUP_ORDER.filter((group) =>
  LAND_DOCS.some((d) => d.group === group),
)
export const AUDIT_GROUPS: string[] = AUDIT_GROUP_ORDER.filter((group) =>
  AUDIT_DOCS.some((d) => d.group === group),
)
