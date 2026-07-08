import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import type { Job } from '@/content/wiki'
import { Tag } from '@/components/ui/Tag'

/** 职业列表: divide-y 行式排布 (非卡片网格), 名称 + 英文 + 分类 + 一句话 + 难度。 */
export function JobList({ jobs }: { jobs: Job[] }) {
  return (
    <ul className="divide-y divide-border">
      {jobs.map((j) => (
        <li key={j.id}>
          <Link to={`/wiki/jobs/${j.id}`} className="group flex items-center gap-4 py-3.5">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="font-medium group-hover:underline">{j.name}</span>
                <span className="font-mono text-xs text-muted-foreground">{j.en}</span>
                <Tag>{j.category}</Tag>
              </div>
              <p className="mt-1 truncate text-sm text-muted-foreground">{j.tagline}</p>
            </div>
            <span className="hidden shrink-0 font-mono text-xs text-muted-foreground sm:inline">
              {j.difficulty}
            </span>
            <ArrowRight className="size-4 shrink-0 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
          </Link>
        </li>
      ))}
    </ul>
  )
}
