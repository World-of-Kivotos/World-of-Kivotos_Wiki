import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { CSSProperties } from 'react'

/** 合并 class 名: clsx 处理条件类, tailwind-merge 消解 Tailwind 冲突类。 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 给 Reveal 的 stagger 列表项算逐项入场延迟。
 * 放在这里而不是 Reveal.tsx 里, 是因为组件文件只导出组件才能保住 fast refresh。
 */
export function staggerDelay(index: number, step = 45): CSSProperties {
  return { '--d': `${index * step}ms` } as CSSProperties
}
