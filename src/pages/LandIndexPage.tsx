import { LAND_INFO, LAND_DOCS, LAND_GROUPS, type LandDoc } from '@/content/wiki'
import { StatStrip } from '@/components/wiki/StatStrip'
import { ContentSection } from '@/components/wiki/Section'
import { LinkRow } from '@/components/wiki/LinkRow'
import { ArticleToc, type TocItem } from '@/components/wiki/ArticleToc'

function DocGroup({ group, docs }: { group: string; docs: LandDoc[] }) {
  if (docs.length === 0) return null
  return (
    <div>
      <h3 className="mb-1.5 text-sm font-medium text-muted-foreground">{group}</h3>
      <ul className="divide-y divide-border">
        {docs.map((d) => (
          <li key={d.id}>
            <LinkRow to={`/wiki/land/${d.id}`} name={d.name} en={d.en} desc={d.tagline} />
          </li>
        ))}
      </ul>
    </div>
  )
}

export function LandIndexPage() {
  const toc: TocItem[] = [
    ...LAND_INFO.sections.map((s, i) => ({ id: `sec-${i}`, label: s.heading })),
    { id: 'docs', label: '全部文档' },
  ]

  return (
    <ArticleToc items={toc}>
      <article className="space-y-8">
        <nav className="text-xs text-muted-foreground">
          <span className="text-foreground">领地</span>
        </nav>

        <header className="space-y-3.5">
          <div className="flex flex-wrap items-baseline gap-3">
            <h1 className="text-3xl font-semibold tracking-tight">领地总览</h1>
            <span className="font-mono text-sm text-muted-foreground">Flan</span>
          </div>
        </header>

        <StatStrip facts={LAND_INFO.facts} />

        <p className="max-w-[72ch] text-[15px] leading-relaxed text-foreground/85">{LAND_INFO.intro}</p>

        <div className="space-y-9">
          {LAND_INFO.sections.map((s, i) => (
            <ContentSection key={i} id={`sec-${i}`} {...s} />
          ))}
        </div>

        <section className="space-y-5">
          <h2 id="docs" className="scroll-mt-24 text-lg font-semibold tracking-tight">
            全部文档({LAND_DOCS.length} 篇)
          </h2>
          <div className="space-y-6">
            {LAND_GROUPS.map((group) => (
              <DocGroup key={group} group={group} docs={LAND_DOCS.filter((d) => d.group === group)} />
            ))}
          </div>
        </section>
      </article>
    </ArticleToc>
  )
}
