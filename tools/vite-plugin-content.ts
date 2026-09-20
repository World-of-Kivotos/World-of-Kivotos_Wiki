import type { Plugin } from 'vite'
import { ContentError } from './md/errors.ts'
import { loadDoc } from './md/parse.ts'

/**
 * 构建期把 src/content 下的 .md 折叠成 JS 字面量。
 * 浏览器产物里没有 unified / remark / zod / yaml 一行代码 —— 内容本来就是静态数据,
 * 没有理由为它在运行期再付一次解析成本。
 */
export function contentMarkdown(): Plugin {
  return {
    name: 'wok:content-markdown',
    enforce: 'pre',

    transform: {
      filter: { id: /[\\/]src[\\/]content[\\/].*\.md$/ },
      handler(code, id) {
        try {
          const { order, doc } = loadDoc(code, id)
          // order 与 doc 分开导出, 让 src/content/index.ts 能按 order 排序后只取 doc。
          return {
            code: `export default ${JSON.stringify({ order, doc })}\n`,
            map: null,
          }
        } catch (err) {
          if (err instanceof ContentError) {
            // 带 loc 报错, 终端才会打出 文件:行:列; 构建随之中止而不是降级成空白页。
            this.error({
              message: err.message,
              id,
              loc: { file: err.file, line: err.line, column: err.column },
            })
          }
          throw err
        }
      },
    },

    // .md 不是可热替换的模块图节点, 整页刷新最诚实。
    hotUpdate({ file }) {
      if (!file.endsWith('.md')) return
      this.environment.hot.send({ type: 'full-reload', path: '*' })
      return []
    },
  }
}
