import { z } from 'zod'
import {
  AUDIT_GROUP_ORDER,
  CHAMPION_GROUPS,
  CHAMPION_POOLS,
  CHAMPION_STATUSES,
  JOB_CATEGORIES,
  JOB_DIFFICULTIES,
  LAND_GROUP_ORDER,
} from '../../src/content/taxonomy.ts'
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
  Section,
} from '../../src/content/types.ts'

/**
 * frontmatter 的 zod schema。一律用 strictObject: 多写一个键立刻报错,
 * taglien 这种拼错必须当场炸, 不能被默认 strip 策略静默丢掉。
 */

const text = z.string().min(1)
const order = z.number().int().nonnegative()

const fact = z.strictObject({ label: text, value: text })
const facts = z.array(fact).min(1)

const growthStep = z.strictObject({ tier: text, title: text, desc: text })

export const JobFm = z.strictObject({
  order,
  name: text,
  en: text,
  category: z.enum(JOB_CATEGORIES),
  difficulty: z.enum(JOB_DIFFICULTIES),
  tagline: text,
  facts,
  growth: z.array(growthStep).min(1).optional(),
})

export const DimensionFm = z.strictObject({
  order,
  name: text,
  en: text,
  tagline: text,
  facts,
})

export const ChampionFm = z
  .strictObject({
    order,
    name: text,
    en: text,
    pool: z.enum(CHAMPION_POOLS),
    group: z.enum(CHAMPION_GROUPS),
    status: z.enum(CHAMPION_STATUSES),
    statusNote: text.optional(),
    tagline: text,
    facts,
  })
  .superRefine((value, ctx) => {
    // facts 里的「所属池」「状态」与同名字段是双真源, 改一处忘改另一处在迁移前没有任何告警。
    const find = (label: string) => value.facts.find((f) => f.label === label)
    const poolFact = find('所属池')
    if (!poolFact) {
      ctx.addIssue({ code: 'custom', path: ['facts'], message: 'facts 里必须有一条 label 为「所属池」' })
    } else if (poolFact.value !== value.pool) {
      ctx.addIssue({
        code: 'custom',
        path: ['facts'],
        message: `facts 里「所属池」写的是 ${poolFact.value}, 与 pool 字段的 ${value.pool} 不一致`,
      })
    }
    const statusFact = find('状态')
    if (!statusFact) {
      ctx.addIssue({ code: 'custom', path: ['facts'], message: 'facts 里必须有一条 label 为「状态」' })
    } else if (statusFact.value !== value.status) {
      ctx.addIssue({
        code: 'custom',
        path: ['facts'],
        message: `facts 里「状态」写的是 ${statusFact.value}, 与 status 字段的 ${value.status} 不一致`,
      })
    }
    if (value.status === '半成品' && value.statusNote === undefined) {
      ctx.addIssue({
        code: 'custom',
        path: ['statusNote'],
        message: '半成品词条必须写 statusNote 说明缺口, 总览页要用它拼说明句',
      })
    }
    if (value.status !== '半成品' && value.statusNote !== undefined) {
      ctx.addIssue({
        code: 'custom',
        path: ['statusNote'],
        message: 'statusNote 只有半成品词条才填',
      })
    }
  })

export const ChampionOverviewFm = z.strictObject({
  name: text,
  en: text,
  dummyIntro: text,
  dummies: z.array(
    z.strictObject({ name: text, en: text, pool: z.enum(CHAMPION_POOLS), note: text }),
  ),
})

export const LandFm = z.strictObject({
  order,
  name: text,
  en: text,
  group: z.enum(LAND_GROUP_ORDER),
  tagline: text,
  facts: facts.optional(),
})

export const LandOverviewFm = z.strictObject({ name: text, en: text, facts })

export const AuditFm = z.strictObject({
  order,
  name: text,
  en: text,
  group: z.enum(AUDIT_GROUP_ORDER),
  tagline: text,
  facts: facts.optional(),
})

export const AuditOverviewFm = z.strictObject({
  name: text,
  en: text,
  tagline: text,
  facts,
})

export const EconomyFm = z.strictObject({ name: text })

/** zod 的错误明细 -> 人读的一行; 不用 z.prettifyError, 它的输出带勾叉符号。 */
export function formatIssues(error: z.ZodError): string {
  return error.issues
    .map((issue) => {
      const path = issue.path.map((p) => String(p)).join('.')
      return path ? `${path}: ${issue.message}` : issue.message
    })
    .join('; ')
}

/* ------------------------------------------------------------------ *
 * 防漂移断言: schema 与 types.ts 两份定义各自演化是 markdown 化后最典型的
 * 长期风险。下面把它钉在编译期 —— 字段名增删改或类型不再可赋值, tsc -b 立刻红。
 * 收敛到"键集相同 + 解析产物可赋给目标接口"这两条, 而不是要求双向可赋值:
 * schema 用 z.enum 收紧 pool/group 这类 types.ts 里写成 string 的字段是有意为之,
 * 要求反向可赋值会把这种正当收紧也判成错。
 * ------------------------------------------------------------------ */

type Assert<T extends true> = T
type SameKeys<A, B> = [keyof A] extends [keyof B]
  ? [keyof B] extends [keyof A]
    ? true
    : false
  : false
type Conforms<Parsed, Target> = SameKeys<Parsed, Target> extends true
  ? Parsed extends Target
    ? true
    : false
  : false

type Body = { intro: string; sections: Section[] }
type WithId<T> = T & { id: string }

type ParsedJob = WithId<Omit<z.infer<typeof JobFm>, 'order'>> & Body
type ParsedDimension = WithId<Omit<z.infer<typeof DimensionFm>, 'order'>> & Body
type ParsedChampion = WithId<Omit<z.infer<typeof ChampionFm>, 'order'>> & Body
type ParsedChampionInfo = z.infer<typeof ChampionOverviewFm> & Body
type ParsedLand = WithId<Omit<z.infer<typeof LandFm>, 'order'>> & Body
type ParsedLandInfo = z.infer<typeof LandOverviewFm> & Body
type ParsedAudit = WithId<Omit<z.infer<typeof AuditFm>, 'order'>> & Body
type ParsedAuditInfo = z.infer<typeof AuditOverviewFm> & Body
type ParsedEconomy = z.infer<typeof EconomyFm> & { intro: string; topics: Section[] }

export type _JobConforms = Assert<Conforms<ParsedJob, Job>>
export type _DimensionConforms = Assert<Conforms<ParsedDimension, Dimension>>
export type _ChampionConforms = Assert<Conforms<ParsedChampion, ChampionEffect>>
export type _ChampionInfoConforms = Assert<Conforms<ParsedChampionInfo, ChampionInfo>>
export type _LandConforms = Assert<Conforms<ParsedLand, LandDoc>>
export type _LandInfoConforms = Assert<Conforms<ParsedLandInfo, LandInfo>>
export type _AuditConforms = Assert<Conforms<ParsedAudit, AuditDoc>>
export type _AuditInfoConforms = Assert<Conforms<ParsedAuditInfo, AuditInfo>>
export type _EconomyConforms = Assert<Conforms<ParsedEconomy, EconomyContent>>
