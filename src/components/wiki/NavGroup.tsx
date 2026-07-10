import type { ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * 可折叠侧栏分组: 组头(名称 + 条数徽标 + chevron)点击展开/收起, 组体为传入的列表项。
 * 受控组件——open / onToggle 由使用方(布局层)托管, 便于做"路由命中自动展开 + 会话内保持手动展开"。
 * 字体/间距/muted 色与既有 itemCls、GroupLabel 一致; 通用件, 职业/经济/维度组日后可无痛接入。
 */
export function NavGroup({
  label,
  count,
  open,
  onToggle,
  children,
}: {
  label: string
  count: number
  open: boolean
  onToggle: () => void
  children: ReactNode
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-subtle/60 hover:text-foreground"
      >
        <span className="flex-1 truncate text-left">{label}</span>
        <span className="font-mono text-[10px] font-normal tabular-nums text-muted-foreground/50">
          {count}
        </span>
        <ChevronRight
          aria-hidden
          className={cn(
            'size-3.5 shrink-0 text-muted-foreground/50 transition-transform',
            open && 'rotate-90',
          )}
        />
      </button>
      {open && <ul className="mt-0.5 space-y-0.5 pl-2">{children}</ul>}
    </li>
  )
}
