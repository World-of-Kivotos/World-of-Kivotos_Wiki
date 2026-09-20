import { parse as parseYaml } from 'yaml'
import { ContentError } from './errors.ts'

/**
 * 手切 frontmatter 而不用 remark-frontmatter: 少一个依赖, 且能算出 body 相对文件的行偏移,
 * 报错行号才对得上真实文件行。
 */
export interface Split {
  /** frontmatter 解析结果; 没有 frontmatter 块时为空对象 */
  data: Record<string, unknown>
  /** 去掉 frontmatter 后的正文, 已归一为 LF */
  body: string
  /** body 第 1 行对应文件的第 (lineOffset + 1) 行 */
  lineOffset: number
  /** 是否真的存在 frontmatter 块 */
  hasFrontmatter: boolean
}

const FENCE = '---'
const BYTE_ORDER_MARK = 0xfeff

/** 用码位判断而不是写成正则里的转义字符, 免得那个不可见字符本身混进源码。 */
function stripByteOrderMark(text: string): string {
  return text.charCodeAt(0) === BYTE_ORDER_MARK ? text.slice(1) : text
}

export function splitFrontmatter(rawSource: string, file: string): Split {
  const source = stripByteOrderMark(rawSource).replace(/\r\n?/g, '\n')

  if (!source.startsWith(`${FENCE}\n`)) {
    return { data: {}, body: source, lineOffset: 0, hasFrontmatter: false }
  }

  const lines = source.split('\n')
  const closing = lines.findIndex((line, i) => i > 0 && line.trimEnd() === FENCE)
  if (closing === -1) {
    throw new ContentError(file, 1, 1, 'frontmatter 起始的 --- 没有对应的结束 ---')
  }

  const yamlText = lines.slice(1, closing).join('\n')
  let data: unknown
  try {
    data = parseYaml(yamlText)
  } catch (err) {
    // yaml 的错误行号相对 frontmatter 内部, +1 跳过起始的 --- 行换算成文件行。
    const at = (err as { linePos?: { line: number; col: number }[] }).linePos?.[0]
    throw new ContentError(
      file,
      (at?.line ?? 1) + 1,
      at?.col ?? 1,
      `frontmatter 不是合法 YAML: ${(err as Error).message.split('\n')[0]}`,
    )
  }

  if (data === null || data === undefined) data = {}
  if (typeof data !== 'object' || Array.isArray(data)) {
    throw new ContentError(file, 2, 1, 'frontmatter 必须是键值映射')
  }

  return {
    data: data as Record<string, unknown>,
    body: lines.slice(closing + 1).join('\n'),
    lineOffset: closing + 1,
    hasFrontmatter: true,
  }
}