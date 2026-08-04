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
  /** 左对齐但用等宽字体的列下标 (命令 / 权限 id / 配置键这类代码文本) */
  monoCols?: number[]
  rows: string[][]
}

/** 箱子菜单里的一格。index 与 mod 源码的 slot 下标一致(0 起, 逐行从左到右)。 */
export interface MenuSlot {
  index: number
  /** 格子里摆的物品显示名 */
  label: string
  /** 点这一格会发生什么; 留空表示纯装饰格 */
  action?: string
}

/** 一个箱子菜单的槽位布局: rows 行 x 9 列的容器。 */
export interface MenuLayout {
  /** 菜单标题(游戏里容器顶部那行字) */
  title: string
  /** 容器行数 */
  rows: number
  slots: MenuSlot[]
  /** 打开方式 */
  openedBy?: string
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
  /** 箱子菜单槽位图 (领地板块用) */
  menu?: MenuLayout
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

/**
 * 领地板块(Flan mod)的一篇文档页。
 * 与职业页不同, 这里一篇是一个主题(上手/命令/菜单/权限/服主配置), 用 group 归到侧栏折叠组。
 */
export interface LandDoc {
  id: string
  name: string
  /** 英文/代码名, 侧栏与标题旁的等宽小字 */
  en: string
  /** 侧栏折叠组: 上手 / 参考 / 服主 */
  group: string
  tagline: string
  facts?: Fact[]
  intro: string
  sections: Section[]
}

/** 领地板块总览页内容。 */
export interface LandInfo {
  /** mod 版本等标识信息 */
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
