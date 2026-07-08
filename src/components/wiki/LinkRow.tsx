import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

/** 一行链接(板块/维度/经济入口): 名称 + 英文 + 一句话, divide-y 行式, 非卡片。 */
export function LinkRow({
  to,
  name,
  en,
  desc,
}: {
  to: string
  name: string
  en?: string
  desc?: string
}) {
  return (
    <Link to={to} className="group flex items-center gap-4 py-3.5">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="font-medium group-hover:underline">{name}</span>
          {en && <span className="font-mono text-xs text-muted-foreground">{en}</span>}
        </div>
        {desc && <p className="mt-1 truncate text-sm text-muted-foreground">{desc}</p>}
      </div>
      <ArrowRight className="size-4 shrink-0 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
    </Link>
  )
}
