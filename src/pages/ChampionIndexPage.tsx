import { CHAMPION_INFO, CHAMPION_EFFECTS, type ChampionEffect } from '@/content/wiki'
import { ContentSection } from '@/components/wiki/Section'
import { DataTable } from '@/components/wiki/DataTable'
import { LinkRow } from '@/components/wiki/LinkRow'
import { ArticleToc, type TocItem } from '@/components/wiki/ArticleToc'

const POOL_ORDER = ['生存', '战斗', '机动', '技能'] as const

function EffectGroup({ pool, effects }: { pool: string; effects: ChampionEffect[] }) {
  if (effects.length === 0) return null
  return (
    <div>
      <h3 className="mb-1.5 text-sm font-medium text-muted-foreground">{pool}池</h3>
      <ul className="divide-y divide-border">
        {effects.map((e) => (
          <li key={e.id}>
            <LinkRow
              to={`/wiki/champions/${e.id}`}
              name={e.name}
              en={e.en}
              desc={e.status.includes('半成品') ? `半成品 · ${e.tagline}` : `${e.group} · ${e.tagline}`}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}

export function ChampionIndexPage() {
  const toc: TocItem[] = [
    ...CHAMPION_INFO.sections.map((s, i) => ({ id: `sec-${i}`, label: s.heading })),
    { id: 'effects', label: '词条一览' },
    { id: 'dummies', label: '尚未生效' },
  ]

  return (
    <ArticleToc items={toc}>
      <article className="space-y-8">
        <nav className="text-xs text-muted-foreground">
          <span className="text-foreground">精英怪</span>
        </nav>

        <header className="space-y-3.5">
          <div className="flex flex-wrap items-baseline gap-3">
            <h1 className="text-3xl font-semibold tracking-tight">精英怪总览</h1>
            <span className="font-mono text-sm text-muted-foreground">Champion</span>
          </div>
        </header>

        <p className="max-w-[72ch] text-[15px] leading-relaxed text-foreground/85">{CHAMPION_INFO.intro}</p>

        <div className="space-y-9">
          {CHAMPION_INFO.sections.map((s, i) => (
            <ContentSection key={i} id={`sec-${i}`} {...s} />
          ))}
        </div>

        <section className="space-y-5">
          <h2 id="effects" className="scroll-mt-24 text-lg font-semibold tracking-tight">
            词条一览(24 条已实现)
          </h2>
          <p className="max-w-[72ch] text-sm leading-relaxed text-muted-foreground">
            以下每条都能在游戏里刷出并生效, 点进去看触发、结算与各品质数值。反震目前是半成品(只有单体反伤)。
          </p>
          <div className="space-y-6">
            {POOL_ORDER.map((pool) => (
              <EffectGroup key={pool} pool={pool} effects={CHAMPION_EFFECTS.filter((e) => e.pool === pool)} />
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 id="dummies" className="scroll-mt-24 text-lg font-semibold tracking-tight">
            尚未生效 / 未来内容
          </h2>
          <p className="max-w-[72ch] text-sm leading-relaxed text-muted-foreground">{CHAMPION_INFO.dummyIntro}</p>
          <DataTable
            data={{
              columns: ['词条', '代码名', '所属池', '说明'],
              rows: CHAMPION_INFO.dummies.map((d) => [d.name, d.en, `${d.pool}池`, d.note]),
            }}
          />
        </section>
      </article>
    </ArticleToc>
  )
}
