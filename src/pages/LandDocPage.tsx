import { Link, useParams } from 'react-router-dom'
import { LAND_DOCS } from '@/content'
import { Tag } from '@/components/ui/Tag'
import { StatStrip } from '@/components/wiki/StatStrip'
import { ContentSection } from '@/components/wiki/Section'
import { ArticleToc, type TocItem } from '@/components/wiki/ArticleToc'

/** 领地板块的单篇文档页(命令/菜单/权限/服主配置各一篇), 结构与职业页一致。 */
export function LandDocPage() {
  const { docId } = useParams()
  const doc = LAND_DOCS.find((d) => d.id === docId)

  if (!doc) {
    return (
      <div className="py-12">
        <p className="text-sm text-muted-foreground">未找到这篇领地文档。</p>
        <Link to="/wiki/land" className="mt-2 inline-block text-sm underline underline-offset-4">
          返回领地总览
        </Link>
      </div>
    )
  }

  const toc: TocItem[] = doc.sections.map((s, i) => ({ id: `sec-${i}`, label: s.heading }))

  return (
    <ArticleToc items={toc}>
      <article className="space-y-8">
        <nav className="text-xs text-muted-foreground">
          <Link to="/wiki/land" className="transition-colors hover:text-foreground">
            领地
          </Link>
          <span className="px-1.5">/</span>
          <span className="text-foreground">{doc.name}</span>
        </nav>

        <header className="space-y-3.5">
          <div className="flex flex-wrap items-baseline gap-3">
            <h1 className="text-3xl font-semibold tracking-tight">{doc.name}</h1>
            <span className="font-mono text-sm text-muted-foreground">{doc.en}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Tag>{doc.group}</Tag>
          </div>
          <p className="max-w-[64ch] text-base leading-relaxed text-muted-foreground">{doc.tagline}</p>
        </header>

        {doc.facts && doc.facts.length > 0 && <StatStrip facts={doc.facts} />}

        <p className="max-w-[72ch] text-[15px] leading-relaxed text-foreground/85">{doc.intro}</p>

        <div className="space-y-9">
          {doc.sections.map((s, i) => (
            <ContentSection key={i} id={`sec-${i}`} {...s} />
          ))}
        </div>
      </article>
    </ArticleToc>
  )
}
