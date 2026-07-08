import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/** 极简标签 (难度 / 分类): 描边 + 中性灰, 不抢眼。 */
export function Tag({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border border-border-strong px-2 py-0.5 text-[11px] font-medium text-muted-foreground',
        className,
      )}
    >
      {children}
    </span>
  )
}
