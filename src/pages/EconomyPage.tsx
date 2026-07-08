import { ECONOMY } from '@/content/wiki'
import { ContentSection } from '@/components/wiki/Section'
import { ArticleToc, type TocItem } from '@/components/wiki/ArticleToc'

export function EconomyPage() {
  const toc: TocItem[] = ECONOMY.topics.map((t, i) => ({ id: `sec-${i}`, label: t.heading }))

  return (
    <ArticleToc items={toc}>
      <article className="space-y-8">
        <nav className="text-xs text-muted-foreground">
          <span className="text-foreground">经济</span>
        </nav>

        <header className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight">经济总览</h1>
          <p className="max-w-[72ch] text-base leading-relaxed text-muted-foreground">{ECONOMY.intro}</p>
        </header>

        <div className="space-y-9">
          {ECONOMY.topics.map((t, i) => (
            <ContentSection key={i} id={`sec-${i}`} {...t} />
          ))}
        </div>
      </article>
    </ArticleToc>
  )
}
