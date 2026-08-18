import { AUDIT_DOCS, AUDIT_GROUPS, AUDIT_INFO, type AuditDoc } from '@/content/wiki'
import { ArticleToc, type TocItem } from '@/components/wiki/ArticleToc'
import { ContentSection } from '@/components/wiki/Section'
import { LinkRow } from '@/components/wiki/LinkRow'
import { StatStrip } from '@/components/wiki/StatStrip'

function DocGroup({ group, docs }: { group: string; docs: AuditDoc[] }) {
  if (docs.length === 0) return null
  return (
    <div>
      <h3 className="mb-1.5 text-sm font-medium text-muted-foreground">{group}</h3>
      <ul className="divide-y divide-border">
        {docs.map((doc) => (
          <li key={doc.id}>
            <LinkRow
              to={`/wiki/audit/${doc.id}`}
              name={doc.name}
              en={doc.en}
              desc={doc.tagline}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}

export function AuditIndexPage() {
  const toc: TocItem[] = [
    ...AUDIT_INFO.sections.map((section, index) => ({ id: `sec-${index}`, label: section.heading })),
    { id: 'audit-docs', label: '审计文档' },
  ]

  return (
    <ArticleToc items={toc}>
      <article className="space-y-8">
        <nav className="text-xs text-muted-foreground">
          <span className="text-foreground">临时审计</span>
        </nav>

        <header className="space-y-3.5">
          <div className="flex flex-wrap items-baseline gap-3">
            <h1 className="text-3xl font-semibold tracking-tight">main 功能审计</h1>
            <span className="font-mono text-sm text-muted-foreground">Temporary audit</span>
          </div>
          <p className="max-w-[64ch] text-base leading-relaxed text-muted-foreground">
            只读统计当前生产 JAR 的功能、职业、注册物、联动与完整玩法，用于版本核对和 Bug 复现。
          </p>
        </header>

        <StatStrip facts={AUDIT_INFO.facts} />
        <p className="max-w-[72ch] text-[15px] leading-relaxed text-foreground/85">{AUDIT_INFO.intro}</p>

        <div className="space-y-9">
          {AUDIT_INFO.sections.map((section, index) => (
            <ContentSection key={section.heading} id={`sec-${index}`} {...section} />
          ))}
        </div>

        <section className="space-y-5">
          <h2 id="audit-docs" className="scroll-mt-24 text-lg font-semibold tracking-tight">
            审计文档（{AUDIT_DOCS.length} 篇）
          </h2>
          <div className="space-y-6">
            {AUDIT_GROUPS.map((group) => (
              <DocGroup key={group} group={group} docs={AUDIT_DOCS.filter((doc) => doc.group === group)} />
            ))}
          </div>
        </section>
      </article>
    </ArticleToc>
  )
}
