import type { MenuLayout, Section, WikiTable } from '../../src/content/types.ts'

/**
 * 迁移期专用: 把旧的 TS 内容对象发射成 markdown。阶段 6 连同 migrate/ 一起删除。
 * 正确性不靠肉眼 —— run.ts 会用正式解析器把发射结果读回来, 与源对象逐字段深比较。
 */

/* ----------------------------- YAML ----------------------------- */

/** 命中其一就必须加引号, 否则 yaml 会把它读成数字/布尔/null, 或者直接解析失败。 */
function needsQuoting(value: string): boolean {
  if (value === '') return true
  if (value !== value.trim()) return true
  if (/^[-?:,[\]{}#&*!|>'"%@`]/.test(value)) return true
  if (value.includes(': ') || value.includes(' #')) return true
  if (value.endsWith(':')) return true
  if (/^[+-]?(\d[\d_]*)(\.\d*)?([eE][+-]?\d+)?$/.test(value)) return true
  if (/^0[xob]/i.test(value)) return true
  if (/^(true|false|yes|no|on|off|null|~)$/i.test(value)) return true
  return false
}

function yamlScalar(value: string): string {
  if (!needsQuoting(value)) return value
  // YAML 单引号风格里只需要把单引号翻倍, 没有别的转义规则。
  return `'${value.replace(/'/g, "''")}'`
}

type YamlValue = string | number | YamlValue[] | { [key: string]: YamlValue | undefined }

function yamlInline(value: YamlValue): string {
  if (typeof value === 'number') return String(value)
  if (typeof value === 'string') return yamlScalar(value)
  throw new Error('yamlInline 只处理标量; 数组与映射走 yamlBlock')
}

function yamlBlock(data: Record<string, YamlValue | undefined>, indent = ''): string[] {
  const out: string[] = []
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) continue
    if (Array.isArray(value)) {
      if (value.length === 0) {
        // 裸的 `key:` 会被 yaml 读成 null, 空数组必须写成流式 []。
        out.push(`${indent}${key}: []`)
        continue
      }
      out.push(`${indent}${key}:`)
      for (const item of value) {
        if (typeof item === 'object' && !Array.isArray(item)) {
          const entries = Object.entries(item).filter(([, v]) => v !== undefined)
          const [firstKey, firstValue] = entries[0]
          out.push(`${indent}  - ${firstKey}: ${yamlInline(firstValue as YamlValue)}`)
          for (const [k, v] of entries.slice(1)) {
            out.push(`${indent}    ${k}: ${yamlInline(v as YamlValue)}`)
          }
        } else {
          out.push(`${indent}  - ${yamlInline(item)}`)
        }
      }
    } else if (typeof value === 'object') {
      out.push(`${indent}${key}:`)
      out.push(...yamlBlock(value as Record<string, YamlValue>, `${indent}  `))
    } else {
      out.push(`${indent}${key}: ${yamlInline(value)}`)
    }
  }
  return out
}

/* --------------------------- 正文转义 --------------------------- */

/** 块首字符若是 markdown 的块起始符, 加一个反斜杠挡住; 表格单元格不需要这层(已实测)。 */
function escapeBlockText(text: string): string {
  const escaped = text.replace(/\\/g, '\\\\')
  if (/^[#>\-+*|`~:=]/.test(escaped) || /^\d+[.)]/.test(escaped)) {
    return `\\${escaped}`
  }
  return escaped
}

function escapeCell(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/\|/g, '\\|')
}

function attrValue(value: string, what: string): string {
  const hasDouble = value.includes('"')
  const hasSingle = value.includes("'")
  if (hasDouble && hasSingle) {
    throw new Error(`${what} 同时含有两种直引号, 无法写进指令属性: ${value}`)
  }
  return hasDouble ? `'${value}'` : `"${value}"`
}

/* ----------------------------- 块 ----------------------------- */

function emitTable(table: WikiTable): string[] {
  const attrs: string[] = []
  if (table.caption !== undefined) attrs.push(`caption=${attrValue(table.caption, '表格 caption')}`)
  const mono = table.monoCols ?? []
  if (mono.length > 0) attrs.push(`mono="${mono.join(',')}"`)

  const numeric = new Set(table.numericCols ?? [])
  const separator = table.columns.map((_, i) => (numeric.has(i) ? '---:' : '---'))

  return [
    `:::table${attrs.length > 0 ? `{${attrs.join(' ')}}` : ''}`,
    `| ${table.columns.map(escapeCell).join(' | ')} |`,
    `| ${separator.join(' | ')} |`,
    ...table.rows.map((row) => `| ${row.map(escapeCell).join(' | ')} |`),
    ':::',
  ]
}

/** 把书写顺序里连续且 label/action 相同的槽位压成区间, 还原 [10,11,...].map() 那种写法的本意。 */
function compressSlots(menu: MenuLayout): { indexes: string; label: string; action: string }[] {
  const rows: { indexes: string; label: string; action: string }[] = []
  let current: { parts: number[][]; label: string; action: string } | null = null

  const flush = () => {
    if (!current) return
    rows.push({
      indexes: current.parts
        .map(([from, to]) => (from === to ? String(from) : `${from}-${to}`))
        .join(','),
      label: current.label,
      action: current.action,
    })
    current = null
  }

  for (const slot of menu.slots) {
    const action = slot.action ?? ''
    if (current && current.label === slot.label && current.action === action) {
      const last = current.parts[current.parts.length - 1]
      if (slot.index === last[1] + 1) last[1] = slot.index
      else current.parts.push([slot.index, slot.index])
    } else {
      flush()
      current = { parts: [[slot.index, slot.index]], label: slot.label, action }
    }
  }
  flush()
  return rows
}

function emitMenu(menu: MenuLayout): string[] {
  const attrs = [`title=${attrValue(menu.title, '菜单 title')}`, `rows="${menu.rows}"`]
  if (menu.openedBy !== undefined) attrs.push(`openedBy=${attrValue(menu.openedBy, '菜单 openedBy')}`)

  return [
    `:::menu{${attrs.join(' ')}}`,
    '| 槽位 | 物品 | 点击效果 |',
    '| --- | --- | --- |',
    ...compressSlots(menu).map(
      (row) => `| ${escapeCell(row.indexes)} | ${escapeCell(row.label)} | ${escapeCell(row.action)} |`,
    ),
    ':::',
  ]
}

function emitCode(code: { caption?: string; text: string }): string[] {
  const longest = [...code.text.matchAll(/`+/g)].reduce((max, m) => Math.max(max, m[0].length), 0)
  const fence = '`'.repeat(Math.max(3, longest + 1))
  const meta = code.caption === undefined ? '' : ` caption=${attrValue(code.caption, '代码块 caption')}`
  // 语言标注固定 text: 渲染侧的 <pre> 没有语法高亮, 这个标注只给编辑器看。
  return [`${fence}text${meta}`, code.text, fence]
}

function emitSection(section: Section): string[] {
  const out: string[] = [`## ${section.heading}`]
  const push = (lines: string[]) => {
    out.push('')
    out.push(...lines)
  }

  for (const paragraph of section.paragraphs ?? []) push([escapeBlockText(paragraph)])
  if (section.steps) push(section.steps.map((s, i) => `${i + 1}. ${escapeBlockText(s)}`))
  if (section.bullets) push(section.bullets.map((b) => `- ${escapeBlockText(b)}`))
  if (section.table) push(emitTable(section.table))
  if (section.menu) push(emitMenu(section.menu))
  if (section.code) push(emitCode(section.code))
  if (section.note) push([`> ${escapeBlockText(section.note)}`])

  return out
}

/* ---------------------------- 整篇 ---------------------------- */

export function emitMarkdown(
  frontmatter: Record<string, YamlValue | undefined>,
  intro: string,
  sections: Section[],
): string {
  const lines = ['---', ...yamlBlock(frontmatter), '---', '', escapeBlockText(intro)]
  for (const section of sections) {
    lines.push('')
    lines.push(...emitSection(section))
  }
  return `${lines.join('\n')}\n`
}
