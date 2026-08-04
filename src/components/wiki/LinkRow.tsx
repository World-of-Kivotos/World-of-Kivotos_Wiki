import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * 一行链接(板块/维度/经济入口): 名称 + 英文 + 一句话, divide-y 行式, 非卡片。
 * dense 供首页分栏用: 栏宽只有整宽的三分之一, 说明改成两行截断而不是单行截断, 免得话被砍掉大半。
 */
export function LinkRow({
  to,
  name,
  en,
  desc,
  meta,
  dense,
}: {
  to: string
  name: string
  en?: string
  desc?: string
  /** 右侧小字(难度/分类这类) */
  meta?: string
  dense?: boolean
}) {
  return (
    <Link
      to={to}
      className={cn('group flex items-center gap-3', dense ? 'py-2.5' : 'py-3.5 gap-4')}
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
          <span className="font-medium group-hover:underline">{name}</span>
          {en && <span className="font-mono text-xs text-muted-foreground">{en}</span>}
        </div>
        {desc && (
          <p
            className={cn(
              'text-sm text-muted-foreground',
              dense ? 'mt-0.5 line-clamp-2 leading-snug' : 'mt-1 truncate',
            )}
          >
            {desc}
          </p>
        )}
      </div>
      {meta && (
        <span className="hidden shrink-0 font-mono text-xs text-muted-foreground sm:inline">
          {meta}
        </span>
      )}
      <ArrowRight className="size-4 shrink-0 text-muted-foreground/40 transition-transform duration-300 ease-spring group-hover:translate-x-1 group-hover:text-foreground" />
    </Link>
  )
}
