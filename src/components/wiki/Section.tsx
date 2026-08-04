import type { Section } from '@/content/types'
import { DataTable } from './DataTable'
import { SlotGrid } from './SlotGrid'
import { Note } from './Note'

/** 内容小节: 标题 + 正文 + 有序步骤 + 圆点要点 + 表格 + 菜单槽位图 + 旁注。复用于职业页/经济页/领地页。 */
export function ContentSection({
  id,
  heading,
  paragraphs,
  steps,
  bullets,
  table,
  menu,
  note,
}: Section & { id?: string }) {
  return (
    <section className="space-y-3.5">
      <h2
        id={id}
        className="scroll-mt-24 text-lg font-semibold tracking-tight text-foreground"
      >
        {heading}
      </h2>

      {paragraphs?.map((p, i) => (
        <p key={i} className="max-w-[72ch] text-[15px] leading-relaxed text-foreground/85">
          {p}
        </p>
      ))}

      {steps && steps.length > 0 && (
        <ol className="max-w-[70ch] list-decimal space-y-1.5 pl-5 text-[15px] leading-relaxed text-foreground/85 marker:font-mono marker:text-muted-foreground">
          {steps.map((s, i) => (
            <li key={i} className="pl-1">
              {s}
            </li>
          ))}
        </ol>
      )}

      {bullets && bullets.length > 0 && (
        <ul className="max-w-[70ch] list-disc space-y-1.5 pl-5 text-[15px] leading-relaxed text-foreground/85 marker:text-muted-foreground/60">
          {bullets.map((b, i) => (
            <li key={i} className="pl-1">
              {b}
            </li>
          ))}
        </ul>
      )}

      {table && <DataTable data={table} />}
      {menu && <SlotGrid menu={menu} />}
      {note && <Note>{note}</Note>}
    </section>
  )
}
