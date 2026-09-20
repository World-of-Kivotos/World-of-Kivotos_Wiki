import type { ContainerDirective } from 'mdast-util-directive'
import type { MenuLayout, MenuSlot } from '../../src/content/types.ts'
import { failAt } from './errors.ts'
import { attr, cellsOf, rejectUnknownAttrs, requireAttr, singleTableOf, type ParseContext } from './table.ts'

const HEADER = ['槽位', '物品', '点击效果'] as const

/** 槽位区间简写 10-16,19-25 展开成下标序列; 保持书写顺序, 不排序不去重合并。 */
function expandSlotIndexes(
  raw: string,
  node: ContainerDirective,
  ctx: ParseContext,
  capacity: number,
): number[] {
  const out: number[] = []
  const parts = raw.split(',').map((p) => p.trim()).filter((p) => p.length > 0)
  if (parts.length === 0) {
    failAt(ctx.file, node, ctx.lineOffset, '槽位列不能为空')
  }

  for (const part of parts) {
    const range = /^(\d+)-(\d+)$/.exec(part)
    const single = /^(\d+)$/.exec(part)
    let from: number
    let to: number
    if (range) {
      from = Number(range[1])
      to = Number(range[2])
      if (from > to) {
        failAt(ctx.file, node, ctx.lineOffset, `槽位区间 ${part} 的左端大于右端`)
      }
    } else if (single) {
      from = Number(single[1])
      to = from
    } else {
      failAt(
        ctx.file,
        node,
        ctx.lineOffset,
        `槽位 ${part} 不是合法写法; 支持 12 单个、10-16 闭区间、或用逗号连接的 10-16,19-25`,
      )
    }

    if (to >= capacity) {
      failAt(
        ctx.file,
        node,
        ctx.lineOffset,
        `槽位 ${to} 越界; rows="${capacity / 9}" 的容器只有 ${capacity} 格(下标 0 到 ${capacity - 1})`,
      )
    }
    for (let i = from; i <= to; i += 1) out.push(i)
  }

  return out
}

/**
 * :::menu{title rows openedBy} + 槽位表 -> MenuLayout。
 * 区间简写是 land/menus.ts 里 [10,11,...,43].map() 那处程序化生成的正式解法:
 * 既不用手写 28 行, 又让"跳过箱子边框列"的规律一眼可见。
 */
export function parseMenuDirective(node: ContainerDirective, ctx: ParseContext): MenuLayout {
  rejectUnknownAttrs(node, ['title', 'rows', 'openedBy'], ctx)

  const title = requireAttr(node, 'title', ctx)
  const rowsRaw = requireAttr(node, 'rows', ctx)
  if (!/^[1-6]$/.test(rowsRaw)) {
    failAt(ctx.file, node, ctx.lineOffset, `rows="${rowsRaw}" 必须是 1 到 6 的整数(箱子容器行数)`)
  }
  const rows = Number(rowsRaw)
  const capacity = rows * 9

  const table = singleTableOf(node, ctx)
  const [headerRow, ...bodyRows] = table.children
  if (!headerRow) {
    failAt(ctx.file, node, ctx.lineOffset, '槽位表缺少表头行')
  }

  const header = cellsOf(headerRow, ctx)
  if (header.length !== HEADER.length || header.some((cell, i) => cell !== HEADER[i])) {
    failAt(
      ctx.file,
      headerRow,
      ctx.lineOffset,
      `槽位表的表头必须逐字是 ${HEADER.join(' / ')}, 当前是 ${header.join(' / ')}`,
    )
  }

  const slots: MenuSlot[] = []
  const seen = new Set<number>()
  for (const row of bodyRows) {
    const cells = cellsOf(row, ctx)
    if (cells.length !== HEADER.length) {
      failAt(
        ctx.file,
        row,
        ctx.lineOffset,
        `这一行有 ${cells.length} 格, 槽位表固定 3 列; 单元格里的竖线要写成 \\|`,
      )
    }
    const [indexRaw, label, action] = cells
    if (label === '') {
      failAt(ctx.file, row, ctx.lineOffset, '槽位的物品名不能为空')
    }
    for (const index of expandSlotIndexes(indexRaw, node, ctx, capacity)) {
      if (seen.has(index)) {
        failAt(ctx.file, row, ctx.lineOffset, `槽位 ${index} 重复出现`)
      }
      seen.add(index)
      slots.push({ index, label, ...(action === '' ? {} : { action }) })
    }
  }

  if (slots.length === 0) {
    failAt(ctx.file, node, ctx.lineOffset, '槽位表只有表头没有数据行')
  }

  const openedBy = attr(node, 'openedBy')
  return { title, rows, slots, ...(openedBy === undefined ? {} : { openedBy }) }
}
