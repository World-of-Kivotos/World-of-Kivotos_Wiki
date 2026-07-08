import type { Fact } from '@/content/wiki'

/**
 * 内联 stat 条 —— 刻意不用"一个数字一张大卡片"。
 * 一排 标签 + 等宽值, 上下细线收口, 横向排布, 移动端自然换行。
 */
export function StatStrip({ facts }: { facts: Fact[] }) {
  return (
    <dl className="flex flex-wrap gap-x-8 gap-y-3 border-y border-border py-3.5">
      {facts.map((f) => (
        <div key={f.label} className="flex flex-col gap-1">
          <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">{f.label}</dt>
          <dd className="font-mono text-sm tabular-nums text-foreground">{f.value}</dd>
        </div>
      ))}
    </dl>
  )
}
