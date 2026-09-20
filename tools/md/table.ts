import type { Table, TableRow } from 'mdast'
import type { ContainerDirective } from 'mdast-util-directive'
import type { WikiTable } from '../../src/content/types.ts'
import { failAt } from './errors.ts'
import { rawText } from './raw.ts'

export interface ParseContext {
  source: string
  file: string
  lineOffset: number
}

/** 指令属性是扁平的 string | null | undefined 表; 统一成 string | undefined 便于校验。 */
export function attr(node: ContainerDirective, name: string): string | undefined {
  const value = node.attributes?.[name]
  return value === null || value === undefined ? undefined : value
}

export function requireAttr(node: ContainerDirective, name: string, ctx: ParseContext): string {
  const value = attr(node, name)
  if (value === undefined || value === '') {
    failAt(ctx.file, node, ctx.lineOffset, `:::${node.name} 缺少必填属性 ${name}="..."`)
  }
  return value
}

export function rejectUnknownAttrs(
  node: ContainerDirective,
  allowed: readonly string[],
  ctx: ParseContext,
): void {
  for (const key of Object.keys(node.attributes ?? {})) {
    // remark-directive 把 .class / #id 简写记成 class / id 两个属性, 这里一并当成写错。
    if (!allowed.includes(key)) {
      failAt(
        ctx.file,
        node,
        ctx.lineOffset,
        `:::${node.name} 不认识属性 ${key}; 可用的是 ${allowed.join(' / ')}`,
      )
    }
  }
}

/** 取出容器指令里唯一的 GFM 表格; 多块或空容器都报错。 */
export function singleTableOf(node: ContainerDirective, ctx: ParseContext): Table {
  const blocks = node.children
  if (blocks.length !== 1 || blocks[0].type !== 'table') {
    failAt(
      ctx.file,
      node,
      ctx.lineOffset,
      `:::${node.name} 里必须且只能有一张 GFM 表格, 不能放别的内容`,
    )
  }
  return blocks[0]
}

/** 一行的单元格原文; 空单元格产出空串而不是 undefined。 */
export function cellsOf(row: TableRow, ctx: ParseContext): string[] {
  return row.children.map((cell) => rawText(ctx.source, cell, ctx.file, ctx.lineOffset))
}

function parseIndexList(
  raw: string,
  node: Table | ContainerDirective,
  ctx: ParseContext,
  columnCount: number,
): number[] {
  const parts = raw.split(',').map((p) => p.trim()).filter((p) => p.length > 0)
  const out: number[] = []
  for (const part of parts) {
    if (!/^\d+$/.test(part)) {
      failAt(ctx.file, node, ctx.lineOffset, `mono="${raw}" 里的 ${part} 不是列下标(0 起的整数)`)
    }
    const index = Number(part)
    if (index >= columnCount) {
      failAt(
        ctx.file,
        node,
        ctx.lineOffset,
        `mono 里的列下标 ${index} 越界, 这张表只有 ${columnCount} 列(下标 0 到 ${columnCount - 1})`,
      )
    }
    out.push(index)
  }
  return [...new Set(out)].sort((a, b) => a - b)
}

/**
 * 一张 GFM 表格 -> WikiTable。
 * 右对齐列(分隔行写 ---:)即 numericCols —— DataTable 对 numericCols 做的正是右对齐 +
 * 等宽数字, 语义完全重合, 所以不再造一个属性, 作者在任何 markdown 预览里也能直接看出效果。
 *
 * @param at 报错时指向的节点: 裸表格指自己, 带容器时指容器
 */
export function parseTable(
  table: Table,
  at: Table | ContainerDirective,
  ctx: ParseContext,
  options: { caption?: string; mono?: string } = {},
): WikiTable {
  const node = at

  const [headerRow, ...bodyRows] = table.children
  if (!headerRow) {
    failAt(ctx.file, node, ctx.lineOffset, '表格缺少表头行')
  }

  const columns = cellsOf(headerRow, ctx)
  const columnCount = columns.length

  const align = table.align ?? []
  for (let i = 0; i < align.length; i += 1) {
    if (align[i] === 'left' || align[i] === 'center') {
      failAt(
        ctx.file,
        node,
        ctx.lineOffset,
        `第 ${i} 列写了 ${align[i] === 'left' ? ':---' : ':---:'}; DataTable 只有默认与右对齐两种, 请写 --- 或 ---:`,
      )
    }
  }
  const numericCols = align
    .map((a, i) => (a === 'right' ? i : -1))
    .filter((i) => i >= 0)

  const rows = bodyRows.map((row) => {
    const cells = cellsOf(row, ctx)
    if (cells.length !== columnCount) {
      failAt(
        ctx.file,
        row,
        ctx.lineOffset,
        `这一行有 ${cells.length} 格, 表头是 ${columnCount} 列; 单元格里的竖线要写成 \\|`,
      )
    }
    return cells
  })

  if (rows.length === 0) {
    failAt(ctx.file, node, ctx.lineOffset, '表格只有表头没有数据行')
  }

  const { caption, mono } = options
  const monoCols = mono === undefined ? [] : parseIndexList(mono, node, ctx, columnCount)

  return {
    ...(caption === undefined ? {} : { caption }),
    columns,
    ...(numericCols.length > 0 ? { numericCols } : {}),
    ...(monoCols.length > 0 ? { monoCols } : {}),
    rows,
  }
}

/** :::table{caption="..." mono="0,2"} 包着的表格; 不需要这两个属性时直接写裸 GFM 表格即可。 */
export function parseTableDirective(node: ContainerDirective, ctx: ParseContext): WikiTable {
  rejectUnknownAttrs(node, ['caption', 'mono'], ctx)
  const table = singleTableOf(node, ctx)
  const caption = attr(node, 'caption')
  const mono = attr(node, 'mono')
  if (caption === undefined && mono === undefined) {
    failAt(
      ctx.file,
      node,
      ctx.lineOffset,
      ':::table 没带 caption 或 mono, 这层容器是多余的; 直接写普通 GFM 表格',
    )
  }
  return parseTable(table, node, ctx, { caption, mono })
}
