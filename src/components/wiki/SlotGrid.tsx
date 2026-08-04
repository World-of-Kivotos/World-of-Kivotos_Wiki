import type { MenuLayout } from '@/content/types'
import { cn } from '@/lib/utils'

/**
 * 箱子菜单槽位图: 按 rows x 9 还原游戏里容器的格子排布, 空格留虚线, 有内容的格子标出槽位号与物品名。
 * 下方跟一张"槽位 - 物品 - 点击效果"清单, 因为格子里塞不下完整说明, 且清单对读屏与窄屏更友好。
 */
export function SlotGrid({ menu }: { menu: MenuLayout }) {
  const byIndex = new Map(menu.slots.map((s) => [s.index, s]))
  const cells = Array.from({ length: menu.rows * 9 }, (_, i) => byIndex.get(i))

  return (
    <figure className="my-2 space-y-3">
      <div className="overflow-x-auto rounded-lg border border-border bg-card p-3">
        <div className="min-w-[560px] space-y-2">
          <p className="px-0.5 text-[11px] uppercase tracking-wider text-muted-foreground">
            {menu.title}
            <span className="ml-2 font-mono normal-case tracking-normal text-muted-foreground/60">
              {menu.rows} x 9
            </span>
          </p>
          <div className="grid grid-cols-9 gap-1">
            {cells.map((slot, i) => (
              <div
                key={i}
                title={slot ? `${i} · ${slot.label}${slot.action ? ' — ' + slot.action : ''}` : `${i} · 空格`}
                className={cn(
                  'flex aspect-square flex-col justify-between rounded p-1 text-[10px] leading-tight',
                  slot
                    ? 'border border-border-strong bg-subtle text-foreground'
                    : 'border border-dashed border-border text-muted-foreground/30',
                )}
              >
                <span className="font-mono text-[9px] text-muted-foreground/60">{i}</span>
                {slot && <span className="line-clamp-2 break-all">{slot.label}</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <ul className="divide-y divide-border border-y border-border">
        {menu.slots.map((s) => (
          <li key={s.index} className="flex gap-3 py-2 text-sm">
            <span className="w-8 shrink-0 pt-0.5 text-right font-mono text-xs tabular-nums text-muted-foreground">
              {s.index}
            </span>
            <div className="min-w-0 flex-1">
              <span className="font-medium">{s.label}</span>
              {s.action && (
                <span className="text-muted-foreground"> — {s.action}</span>
              )}
            </div>
          </li>
        ))}
      </ul>

      {menu.openedBy && (
        <figcaption className="text-xs text-muted-foreground">打开方式: {menu.openedBy}</figcaption>
      )}
    </figure>
  )
}
