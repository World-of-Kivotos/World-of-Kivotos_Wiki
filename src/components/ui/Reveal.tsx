import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * 滚动入场包裹件: 元素进视口后打上 data-shown, 由 index.css 的 .reveal / .reveal-group 规则接管弹入动画。
 * 只触发一次(进过视口就断开观察), 避免来回滚动时反复抖动。
 * stagger=true 时自身不动, 改为让内部带 .stagger-item 的子项依次弹入 —— 列表用这个, 单块用默认。
 */
export function Reveal({
  children,
  className,
  delay = 0,
  stagger = false,
}: {
  children: ReactNode
  className?: string
  /** 相对进入视口时刻的额外延迟(毫秒), 用于让并排的几栏错开 */
  delay?: number
  stagger?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  // 观察器缺失(老浏览器/测试环境)时直接以显示态初始化, 绝不能让内容卡在 opacity:0。
  const [shown, setShown] = useState(() => typeof IntersectionObserver === 'undefined')

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true)
          io.disconnect()
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.04 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      data-shown={shown}
      style={{ '--reveal-delay': `${delay}ms` } as CSSProperties}
      className={cn(stagger ? 'reveal-group' : 'reveal', className)}
    >
      {children}
    </div>
  )
}
