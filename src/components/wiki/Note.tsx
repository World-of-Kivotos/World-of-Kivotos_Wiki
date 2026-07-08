import type { ReactNode } from 'react'

/** 旁注 / 要点: 左侧细竖线 + 略淡正文, 不用色块卡片包裹。 */
export function Note({ children }: { children: ReactNode }) {
  return (
    <p className="border-l-2 border-foreground/30 py-0.5 pl-4 text-[15px] leading-relaxed text-muted-foreground">
      {children}
    </p>
  )
}
