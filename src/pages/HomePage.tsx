import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { JOBS, DIMENSIONS } from '@/content/wiki'
import { JobList } from '@/components/wiki/JobList'
import { LinkRow } from '@/components/wiki/LinkRow'

function SectionHead({ label, title, right }: { label: string; title: string; right?: string }) {
  return (
    <div className="flex items-end justify-between">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
        <h2 className="mt-1.5 text-xl font-semibold tracking-tight">{title}</h2>
      </div>
      {right && <span className="font-mono text-xs text-muted-foreground">{right}</span>}
    </div>
  )
}

export function HomePage() {
  return (
    <div className="mx-auto w-full max-w-[1680px] px-5 sm:px-8 lg:px-12 2xl:px-16">
      <section className="py-16 sm:py-24">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          World of Kivotos · 服务器 Wiki
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
          服务器的一切,都记在这里
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          这是 World of Kivotos 的主 Wiki —— 职业、经济与各个维度的完整说明,随版本持续更新。
          当教程看,开服前后都用得上。
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            to="/wiki"
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            浏览 Wiki <ArrowRight className="size-4" />
          </Link>
          <Link
            to="/wiki/economy"
            className="inline-flex items-center rounded-md border border-border-strong px-4 py-2 text-sm font-medium transition-colors hover:bg-subtle"
          >
            经济总览
          </Link>
        </div>
      </section>

      <section className="border-t border-border py-12">
        <SectionHead label="板块" title="职业" right={`${JOBS.length} 个`} />
        <p className="mt-3 max-w-[60ch] text-sm leading-relaxed text-muted-foreground">
          七大职业,主打经济产出、战斗只做少量加成。每个职业有自己的玩法、技能和赚钱方式。
        </p>
        <div className="mt-5">
          <JobList jobs={JOBS} />
        </div>
      </section>

      <section className="border-t border-border py-12">
        <SectionHead label="板块" title="维度" />
        <p className="mt-3 max-w-[60ch] text-sm leading-relaxed text-muted-foreground">
          服务器的各个玩法世界,每个维度有自己的地形、机制和产出。
        </p>
        <ul className="mt-5 divide-y divide-border">
          {DIMENSIONS.map((d) => (
            <li key={d.id}>
              <LinkRow to={`/wiki/dimensions/${d.id}`} name={d.name} en={d.en} desc={d.tagline} />
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-muted-foreground">更多维度陆续开放。</p>
      </section>
    </div>
  )
}
