import { Link, useParams } from 'react-router-dom'
import { JOBS, type GrowthStep } from '@/content/wiki'
import { Tag } from '@/components/ui/Tag'
import { StatStrip } from '@/components/wiki/StatStrip'
import { ContentSection } from '@/components/wiki/Section'
import { ArticleToc, type TocItem } from '@/components/wiki/ArticleToc'

function GrowthBlock({ steps }: { steps: GrowthStep[] }) {
  return (
    <section className="space-y-4">
      <h2 id="growth" className="scroll-mt-24 text-lg font-semibold tracking-tight">
        成长路线
      </h2>
      <ol className="relative ml-1 space-y-5 border-l border-border pl-6">
        {steps.map((s, i) => (
          <li key={i} className="relative">
            <span className="absolute -left-[27px] top-1.5 size-2 rounded-full bg-foreground/55 ring-4 ring-background" />
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-xs text-muted-foreground">{s.tier}</span>
              <span className="font-medium">{s.title}</span>
            </div>
            <p className="mt-1 max-w-[64ch] text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}

export function JobPage() {
  const { jobId } = useParams()
  const job = JOBS.find((j) => j.id === jobId)

  if (!job) {
    return (
      <div className="py-12">
        <p className="text-sm text-muted-foreground">未找到这个职业。</p>
        <Link to="/wiki" className="mt-2 inline-block text-sm underline underline-offset-4">
          返回职业列表
        </Link>
      </div>
    )
  }

  const toc: TocItem[] = [
    ...job.sections.map((s, i) => ({ id: `sec-${i}`, label: s.heading })),
    ...(job.growth ? [{ id: 'growth', label: '成长路线' }] : []),
  ]

  return (
    <ArticleToc items={toc}>
      <article className="space-y-8">
        <nav className="text-xs text-muted-foreground">
          <Link to="/wiki" className="transition-colors hover:text-foreground">
            职业
          </Link>
          <span className="px-1.5">/</span>
          <span className="text-foreground">{job.name}</span>
        </nav>

        <header className="space-y-3.5">
          <div className="flex flex-wrap items-baseline gap-3">
            <h1 className="text-3xl font-semibold tracking-tight">{job.name}</h1>
            <span className="font-mono text-sm text-muted-foreground">{job.en}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Tag>{job.category}</Tag>
            <Tag>难度 · {job.difficulty}</Tag>
          </div>
          <p className="max-w-[64ch] text-base leading-relaxed text-muted-foreground">{job.tagline}</p>
        </header>

        <StatStrip facts={job.facts} />

        <p className="max-w-[72ch] text-[15px] leading-relaxed text-foreground/85">{job.intro}</p>

        <div className="space-y-9">
          {job.sections.map((s, i) => (
            <ContentSection key={i} id={`sec-${i}`} {...s} />
          ))}
        </div>

        {job.growth && <GrowthBlock steps={job.growth} />}
      </article>
    </ArticleToc>
  )
}
