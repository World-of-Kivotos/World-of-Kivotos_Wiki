/**
 * 内容错误: 统一携带 文件:行:列, 让 Vite 插件能调 this.error({ loc }) 把位置打到终端。
 * 行号以文件第一行为 1, 列号以行首为 1, 与编辑器一致。
 */
export class ContentError extends Error {
  readonly file: string
  readonly line: number
  readonly column: number

  constructor(file: string, line: number, column: number, reason: string) {
    super(`${file}:${line}:${column} ${reason}`)
    this.name = 'ContentError'
    this.file = file
    this.line = line
    this.column = column
  }
}

/** mdast 节点位置到 ContentError 的桥: 节点缺 position 时退到文件开头, 不让报错本身崩掉。 */
export interface HasPosition {
  position?: { start: { line: number; column: number } }
}

export function failAt(file: string, node: HasPosition, lineOffset: number, reason: string): never {
  const start = node.position?.start
  throw new ContentError(file, (start?.line ?? 1) + lineOffset, start?.column ?? 1, reason)
}
