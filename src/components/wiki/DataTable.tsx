import type { WikiTable } from '@/content/wiki'
import { cn } from '@/lib/utils'

/** 干净表格: 数值列右对齐 + 等宽, 细线分隔, 替代成片的统计卡。 */
export function DataTable({ data }: { data: WikiTable }) {
  const numeric = new Set(data.numericCols ?? [])
  return (
    <figure className="my-2">
      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-strong">
              {data.columns.map((c, i) => (
                <th
                  key={c}
                  className={cn(
                    'px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground',
                    numeric.has(i) && 'text-right',
                  )}
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row, ri) => (
              <tr
                key={ri}
                className="border-b border-border transition-colors last:border-0 hover:bg-subtle"
              >
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    className={cn(
                      'px-4 py-2.5',
                      ci === 0 && 'font-medium text-foreground',
                      numeric.has(ci) && 'text-right font-mono tabular-nums',
                    )}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.caption && (
        <figcaption className="mt-2 text-xs text-muted-foreground">{data.caption}</figcaption>
      )}
    </figure>
  )
}
