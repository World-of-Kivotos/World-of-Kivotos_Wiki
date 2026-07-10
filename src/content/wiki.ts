/**
 * Wiki 内容索引: 汇总各职业与经济内容, 统一对外导出。
 * 类型见 ./types; 各职业内容在 ./jobs/<id>.ts; 经济在 ./economy.ts。
 * 数值忠于 mod 设计文档(docs/), 后期可改为构建期从 mod JSON / 后台 API 自动抽取。
 */

export * from './types'

import type { Job, Dimension } from './types'
import { miner } from './jobs/miner'
import { farmer } from './jobs/farmer'
import { engineer } from './jobs/engineer'
import { tarot } from './jobs/tarot'
import { chef } from './jobs/chef'
import { munitions } from './jobs/munitions'
import { agent } from './jobs/agent'

import { mining } from './dimensions/mining'

export { ECONOMY } from './economy'

/** 精英怪: 总览(系统机制) + 全部已实现词条(一效果一页, 数量以 CHAMPION_EFFECTS 为准)。数值忠于 mod 源码。 */
export { CHAMPION_INFO, CHAMPION_EFFECTS } from './champions'

/** 职业总表(顺序即首页/侧栏展示顺序): 生产职在前, 战斗辅助职在后。 */
export const JOBS: Job[] = [miner, farmer, engineer, tarot, chef, munitions, agent]

/** 维度总表: 矿业维度先行; 后续别的维度作同级追加。 */
export const DIMENSIONS: Dimension[] = [mining]
