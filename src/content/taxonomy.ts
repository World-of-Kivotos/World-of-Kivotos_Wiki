/**
 * 分类法单一真源: 枚举取值与展示顺序。
 * 它不是内容而是应用层分类, 所以留在代码里而不是散进各篇 markdown 的 frontmatter。
 * 构建期由 tools/md/schema.ts 的 zod 枚举直接吃它, 拼错(含全角半角差异)会在构建期炸,
 * 不再出现"分组名打错就从索引页静默消失"的情况。
 */

export const JOB_CATEGORIES = ['生产', '战斗辅助'] as const
export const JOB_DIFFICULTIES = ['入门', '进阶', '硬核'] as const

/** 精英怪四个点数池; 同时是侧栏与总览页的分组展示顺序。 */
export const CHAMPION_POOLS = ['生存', '战斗', '机动', '技能'] as const
export const CHAMPION_STATUSES = ['已实现', '半成品'] as const

/**
 * 精英怪词条的类别小标签。收进枚举是为了挡住同义异名 ——
 * 迁移前代码里三条写「自我维持类」一条写「自维持类」, 靠自由字符串谁也发现不了。
 */
export const CHAMPION_GROUPS = [
  '减伤类',
  '自我维持类',
  '体型类',
  '即时伤害类',
  '持续伤害类',
  '削弱类',
  '位移类',
  '干扰类',
  '反制类',
  '召唤类',
  '处决类',
  '多段打击类',
  '击飞类',
  '传送类',
  '范围伤害类',
  '换位类',
  '突袭类',
] as const

/** 领地文档的侧栏折叠组顺序。 */
export const LAND_GROUP_ORDER = ['上手', '参考', '服主'] as const

/** 临时审计区的专题分组顺序。 */
export const AUDIT_GROUP_ORDER = ['证据', '玩法', '职业', '内容', '联动', '边界'] as const
