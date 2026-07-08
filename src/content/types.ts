/**
 * Wiki 内容数据模型 (无任何 import, 供各内容文件与索引共用)。
 * 设计面向"当教程看"的详尽内容: 段落 + 有序步骤 + 无序要点 + 表格 + 旁注。
 */

export type Difficulty = '入门' | '进阶' | '硬核'
export type JobCategory = '生产' | '战斗辅助'

export interface Fact {
  label: string
  value: string
}

export interface WikiTable {
  caption?: string
  columns: string[]
  /** 右对齐 + 等宽的列下标 (数值列) */
  numericCols?: number[]
  rows: string[][]
}

export interface Section {
  heading: string
  /** 正文段落 */
  paragraphs?: string[]
  /** 有序步骤 (怎么开始 / 操作流程), 渲染为带序号列表 */
  steps?: string[]
  /** 无序要点 (小贴士 / 注意事项), 渲染为圆点列表 */
  bullets?: string[]
  table?: WikiTable
  /** 一句旁注 (左竖线, 非色块卡) */
  note?: string
}

export interface GrowthStep {
  tier: string
  title: string
  desc: string
}

export interface Job {
  id: string
  name: string
  en: string
  category: JobCategory
  difficulty: Difficulty
  tagline: string
  facts: Fact[]
  intro: string
  sections: Section[]
  growth?: GrowthStep[]
}

export interface EconomyContent {
  intro: string
  topics: Section[]
}

/** 一个维度(矿业维度等)。维度讲的是这个世界本身的机制, 与职业解耦; 后续别的维度作同级追加。 */
export interface Dimension {
  id: string
  name: string
  en: string
  tagline: string
  facts: Fact[]
  intro: string
  sections: Section[]
}

/** 一条已实现的精英怪词条(效果)。一效果一页, 结构仿职业页: facts 属性条 + intro + 分节详解。 */
export interface ChampionEffect {
  id: string
  /** 中文名, 如 复合装甲。 */
  name: string
  /** 代码枚举名, 如 COMPOSITE_ARMOR。 */
  en: string
  /** 所属点数池: 生存 / 战斗 / 机动。 */
  pool: string
  /** 类别小标签, 如 减伤类 / 持续伤害类。 */
  group: string
  /** 实现状态: 已实现 / 半成品。 */
  status: string
  tagline: string
  facts: Fact[]
  intro: string
  sections: Section[]
}

/** 未接线的哑词条(数据齐全但游戏里无效果), 诚实列出以免误解。 */
export interface ChampionDummy {
  name: string
  en: string
  pool: string
  note: string
}

/** 精英怪总览(总览页内容): 讲系统本身(星级/品质/点数/白名单/红线 + 系统机制), 与单个词条解耦。 */
export interface ChampionInfo {
  intro: string
  /** 总览 + 系统机制, 复用 Section 结构渲染。 */
  sections: Section[]
  /** 哑词条区的引言。 */
  dummyIntro: string
  dummies: ChampionDummy[]
}
