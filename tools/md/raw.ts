import { failAt, type HasPosition } from './errors.ts'

/**
 * 取块节点的原文切片。这是整套方言的地基 —— 解析器不消费任何行内节点。
 *
 * 为什么不用 mdast 的行内节点: 内容里有 miner.* / plate_armor_* / *Registry.java 这类
 * 单行内成对的星号下划线, 标准行内解析会把它们吃成 emphasis。直接按 offset 切原文,
 * 这些文本一字不改地保留, 作者也不必背任何转义表。
 */

/** CommonMark 定义的 ASCII 标点; 反斜杠只对这些字符有转义意义。 */
const ASCII_PUNCTUATION = '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~'

/**
 * 还原 CommonMark 反斜杠转义。用逐字符扫描而不是正则字面量:
 * 该字符集跨越 [ \ ` 这些在正则字符类里含义特殊的字符, 写成字面量会同时踩到
 * TypeScript 的正则语法检查与 eslint 的 no-useless-escape, 两者的要求还互相冲突。
 */
function unescapeBackslashes(text: string): string {
  if (!text.includes('\\')) return text
  let out = ''
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i]
    const next = text[i + 1]
    if (ch === '\\' && next !== undefined && ASCII_PUNCTUATION.includes(next)) {
      out += next
      i += 1
    } else {
      out += ch
    }
  }
  return out
}

export interface SliceTarget {
  children?: HasPosition[]
  position?: { start: { line: number; column: number } }
}

interface OffsetPosition {
  start: { offset?: number; line: number; column: number }
  end: { offset?: number; line: number }
}

function positionOf(node: HasPosition): OffsetPosition {
  return node.position as unknown as OffsetPosition
}

/**
 * 切出块节点内部的原文并还原反斜杠转义。
 * 零子节点(空表格单元格、纯装饰的菜单格)返回空串 —— 必须是第一个分支,
 * 否则 children[0] 为 undefined 会直接抛 TypeError。
 */
export function rawText(source: string, node: SliceTarget, file: string, lineOffset: number): string {
  const kids = node.children
  if (!kids || kids.length === 0) return ''

  const first = positionOf(kids[0])
  const last = positionOf(kids[kids.length - 1])
  const from = first?.start?.offset
  const to = last?.end?.offset
  if (from === undefined || to === undefined) {
    failAt(file, node as HasPosition, lineOffset, '内部错误: 子节点缺少 offset 位置信息')
  }

  if (first.start.line !== last.end.line) {
    failAt(
      file,
      kids[0],
      lineOffset,
      '这段文本跨了多行(软换行)。一段必须写在一行内; 要分段请空一行另起一段。',
    )
  }

  return unescapeBackslashes(source.slice(from, to))
}
