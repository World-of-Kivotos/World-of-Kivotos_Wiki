import { Link, useParams } from 'react-router-dom'
import { AUDIT_DOCS } from '@/content/wiki'
import { ArticleToc, type TocItem } from '@/components/wiki/ArticleToc'
import { ContentSection } from '@/components/wiki/Section'
import { StatStrip } from '@/components/wiki/StatStrip'
import { Tag } from '@/components/ui/Tag'

export function AuditDocPage() {
  const { docId } = useParams()
  const doc = AUDIT_DOCS.find((entry) => entry.id === docId)

  if (!doc) {
    return (
      <div className="py-12">
        <p className="text-sm text-muted-foreground">未找到这篇审计文档。</p>
        <Link to="/wiki/audit" className="mt-2 inline-block text-sm underline underline-offset-4">
          返回临时审计区
        </Link>
      </div>
    )
  }

  const toc: TocItem[] = doc.sections.map((section, index) => ({
    id: `sec-${index}`,
    label: section.heading,
  }))

  return (
    <ArticleToc items={toc}>
      <article className="space-y-8">
        <nav className="text-xs text-muted-foreground">
          <Link to="/wiki/audit" className="transition-colors hover:text-foreground">
            临时审计
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
            <Tag>临时</Tag>
            <Tag>{doc.group}</Tag>
          </div>
          <p className="max-w-[64ch] text-base leading-relaxed text-muted-foreground">{doc.tagline}</p>
        </header>

        {doc.facts && doc.facts.length > 0 && <StatStrip facts={doc.facts} />}
        <p className="max-w-[72ch] text-[15px] leading-relaxed text-foreground/85">{doc.intro}</p>

        <div className="space-y-9">
          {doc.sections.map((section, index) => (
            <ContentSection key={section.heading} id={`sec-${index}`} {...section} />
          ))}
        </div>
      </article>
    </ArticleToc>
  )
}
