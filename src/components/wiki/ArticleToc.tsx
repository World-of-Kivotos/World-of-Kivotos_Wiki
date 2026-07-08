import type { ReactNode } from 'react'

export interface TocItem {
  id: string
  label: string
}

/**
 * 文章 + 右侧"本页目录"两栏。宽屏(xl+)铺出右栏目录用满分辨率;窄屏隐藏目录, 内容占满。
 * 内容区不限死宽度: 正文段落自身限读宽, 表格/列表用满, 故大屏能多显示。
 */
export function ArticleToc({ items, children }: { items: TocItem[]; children: ReactNode }) {
  return (
    <div className="flex gap-10 xl:gap-14">
      <div className="min-w-0 flex-1">{children}</div>

      {items.length > 0 && (
        <aside className="sticky top-[88px] hidden h-fit w-48 shrink-0 xl:block">
          <p className="mb-2.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
            本页内容
          </p>
          <nav className="border-l border-border">
            {items.map((it) => (
              <a
                key={it.id}
                href={`#${it.id}`}
                className="-ml-px block border-l-2 border-transparent py-1 pl-3 text-[13px] leading-snug text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
              >
                {it.label}
              </a>
            ))}
          </nav>
        </aside>
      )}
    </div>
  )
}
