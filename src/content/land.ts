/**
 * 领地板块(Flan mod)内容索引。
 * 数值忠于 Flan 1.11.16 (MC 1.20.1) 源码常量与 config 默认值; 服主改过配置的以游戏内为准。
 */

import type { LandDoc } from './types'
import { gettingStarted } from './land/getting-started'
import { bestPractices } from './land/best-practices'

export { LAND_INFO } from './land/overview'

/** 文档总表(顺序即侧栏与总览页内的展示顺序)。 */
export const LAND_DOCS: LandDoc[] = [gettingStarted, bestPractices]

/** 侧栏折叠组的固定顺序; 只保留当前真有文档的组, 避免出现空组。 */
const GROUP_ORDER = ['上手', '参考', '服主']
export const LAND_GROUPS: string[] = GROUP_ORDER.filter((g) => LAND_DOCS.some((d) => d.group === g))
