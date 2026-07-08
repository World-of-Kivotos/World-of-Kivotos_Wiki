import { Link, useParams } from 'react-router-dom'
import { CHAMPION_EFFECTS } from '@/content/wiki'
import { Tag } from '@/components/ui/Tag'
import { StatStrip } from '@/components/wiki/StatStrip'
import { ContentSection } from '@/components/wiki/Section'
import { ArticleToc, type TocItem } from '@/components/wiki/ArticleToc'

/** 单条精英怪词条页(一效果一页): 结构仿职业页 —— 属性条 + 引言 + 分节详解。 */
export function ChampionEffectPage() {
  const { effectId } = useParams()
  const effect = CHAMPION_EFFECTS.find((e) => e.id === effectId)

  if (!effect) {
    return (
      <div className="py-12">
        <p className="text-sm text-muted-foreground">未找到这个词条。</p>
        <Link to="/wiki/champions" className="mt-2 inline-block text-sm underline underline-offset-4">
          返回精英怪总览
        </Link>
      </div>
    )
  }

  const toc: TocItem[] = effect.sections.map((s, i) => ({ id: `sec-${i}`, label: s.heading }))

  return (
    <ArticleToc items={toc}>
      <article className="space-y-8">
        <nav className="text-xs text-muted-foreground">
          <Link to="/wiki/champions" className="transition-colors hover:text-foreground">
            精英怪
          </Link>
          <span className="px-1.5">/</span>
          <span className="text-foreground">{effect.name}</span>
        </nav>

        <header className="space-y-3.5">
          <div className="flex flex-wrap items-baseline gap-3">
            <h1 className="text-3xl font-semibold tracking-tight">{effect.name}</h1>
            <span className="font-mono text-sm text-muted-foreground">{effect.en}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Tag>{effect.pool}池</Tag>
            <Tag>{effect.group}</Tag>
            <Tag>{effect.status}</Tag>
          </div>
          <p className="max-w-[64ch] text-base leading-relaxed text-muted-foreground">{effect.tagline}</p>
        </header>

        <StatStrip facts={effect.facts} />

        <p className="max-w-[72ch] text-[15px] leading-relaxed text-foreground/85">{effect.intro}</p>

        <div className="space-y-9">
          {effect.sections.map((s, i) => (
            <ContentSection key={i} id={`sec-${i}`} {...s} />
          ))}
        </div>
      </article>
    </ArticleToc>
  )
}
