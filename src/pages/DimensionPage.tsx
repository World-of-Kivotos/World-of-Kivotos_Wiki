import { Link, useParams } from 'react-router-dom'
import { DIMENSIONS } from '@/content/wiki'
import { StatStrip } from '@/components/wiki/StatStrip'
import { ContentSection } from '@/components/wiki/Section'
import { ArticleToc, type TocItem } from '@/components/wiki/ArticleToc'

export function DimensionPage() {
  const { dimId } = useParams()
  const dim = DIMENSIONS.find((d) => d.id === dimId)

  if (!dim) {
    return (
      <div className="py-12">
        <p className="text-sm text-muted-foreground">未找到这个维度。</p>
        <Link to="/wiki" className="mt-2 inline-block text-sm underline underline-offset-4">
          返回 Wiki 概览
        </Link>
      </div>
    )
  }

  const toc: TocItem[] = dim.sections.map((s, i) => ({ id: `sec-${i}`, label: s.heading }))

  return (
    <ArticleToc items={toc}>
      <article className="space-y-8">
        <nav className="text-xs text-muted-foreground">
          <span>维度</span>
          <span className="px-1.5">/</span>
          <span className="text-foreground">{dim.name}</span>
        </nav>

        <header className="space-y-3.5">
          <div className="flex flex-wrap items-baseline gap-3">
            <h1 className="text-3xl font-semibold tracking-tight">{dim.name}</h1>
            <span className="font-mono text-sm text-muted-foreground">{dim.en}</span>
          </div>
          <p className="max-w-[64ch] text-base leading-relaxed text-muted-foreground">{dim.tagline}</p>
        </header>

        <StatStrip facts={dim.facts} />

        <p className="max-w-[72ch] text-[15px] leading-relaxed text-foreground/85">{dim.intro}</p>

        <div className="space-y-9">
          {dim.sections.map((s, i) => (
            <ContentSection key={i} id={`sec-${i}`} {...s} />
          ))}
        </div>
      </article>
    </ArticleToc>
  )
}
