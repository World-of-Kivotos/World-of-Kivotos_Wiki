import type { Blockquote, Code, Heading, List, Paragraph, Root, RootContent } from 'mdast'
import type { ContainerDirective } from 'mdast-util-directive'
import type { Section } from '../../src/content/types.ts'
import { ContentError, failAt } from './errors.ts'
import { rawText } from './raw.ts'
import { parseTableDirective, type ParseContext } from './table.ts'
import { parseMenuDirective } from './menu.ts'

/**
 * 书写顺序即渲染顺序。ContentSection.tsx 的渲染顺序写死为下面这串, 方言强制正文的
 * 书写顺序与之一致 —— 现状是 note 写在表格前面渲染仍跑到最后, 属于"所写非所得",
 * 用一次构建期报错换掉这种查不清的困惑。
 */
const SLOT_ORDER = ['段落', '有序列表', '无序列表', '表格', '菜单', '代码块', '旁注'] as const
type SlotName = (typeof SLOT_ORDER)[number]

function slotIndex(name: SlotName): number {
  return SLOT_ORDER.indexOf(name)
}

function parseListItems(list: List, ctx: ParseContext): string[] {
  return list.children.map((item) => {
    if (item.children.length !== 1 || item.children[0].type !== 'paragraph') {
      failAt(
        ctx.file,
        item,
        ctx.lineOffset,
        '列表项里只能有一段文字, 不能再嵌列表、表格或多个段落',
      )
    }
    return rawText(ctx.source, item.children[0], ctx.file, ctx.lineOffset)
  })
}

function parseNote(quote: Blockquote, ctx: ParseContext): string {
  if (quote.children.length !== 1 || quote.children[0].type !== 'paragraph') {
    failAt(ctx.file, quote, ctx.lineOffset, '旁注(> 开头的块)里只能有一段文字')
  }
  return rawText(ctx.source, quote.children[0], ctx.file, ctx.lineOffset)
}

/** 围栏 info string 里语言标注之后的部分按属性串解析, 只认 caption。 */
function parseCodeMeta(node: Code, ctx: ParseContext): string | undefined {
  if (!node.lang) {
    failAt(
      ctx.file,
      node,
      ctx.lineOffset,
      '代码块必须写语言标注(如 ```json 或 ```text); 不写会让 caption= 被当成语言名',
    )
  }
  const meta = node.meta?.trim()
  if (!meta) return undefined

  const matched = /^caption=(?:"([^"]*)"|'([^']*)')$/.exec(meta)
  if (!matched) {
    failAt(
      ctx.file,
      node,
      ctx.lineOffset,
      `代码块的语言标注后面只支持 caption="..." , 不认识 ${meta}`,
    )
  }
  return matched[1] ?? matched[2]
}

function buildSection(heading: Heading, blocks: RootContent[], ctx: ParseContext): Section {
  const section: Section = { heading: rawText(ctx.source, heading, ctx.file, ctx.lineOffset) }
  let highWater = -1

  const claim = (slot: SlotName, node: RootContent) => {
    const index = slotIndex(slot)
    if (index < highWater) {
      failAt(
        ctx.file,
        node,
        ctx.lineOffset,
        `块顺序必须是 ${SLOT_ORDER.join(' -> ')}; 这里的${slot}写在了${SLOT_ORDER[highWater]}后面`,
      )
    }
    highWater = index
  }

  const claimOnce = (slot: SlotName, node: RootContent, taken: boolean) => {
    if (taken) {
      failAt(ctx.file, node, ctx.lineOffset, `同一小节里只能有一个${slot}; 内容再多请拆成两个 ## 小节`)
    }
    claim(slot, node)
  }

  for (const node of blocks) {
    if (node.type === 'paragraph') {
      claim('段落', node)
      ;(section.paragraphs ??= []).push(rawText(ctx.source, node as Paragraph, ctx.file, ctx.lineOffset))
    } else if (node.type === 'list' && node.ordered) {
      claimOnce('有序列表', node, section.steps !== undefined)
      section.steps = parseListItems(node, ctx)
    } else if (node.type === 'list') {
      claimOnce('无序列表', node, section.bullets !== undefined)
      section.bullets = parseListItems(node, ctx)
    } else if (node.type === 'containerDirective') {
      const directive = node as ContainerDirective
      if (directive.name === 'table') {
        claimOnce('表格', node, section.table !== undefined)
        section.table = parseTableDirective(directive, ctx)
      } else if (directive.name === 'menu') {
        claimOnce('菜单', node, section.menu !== undefined)
        section.menu = parseMenuDirective(directive, ctx)
      } else {
        failAt(
          ctx.file,
          node,
          ctx.lineOffset,
          `不认识的容器指令 :::${directive.name}; 只有 table 与 menu 两个`,
        )
      }
    } else if (node.type === 'code') {
      claimOnce('代码块', node, section.code !== undefined)
      const caption = parseCodeMeta(node, ctx)
      section.code = { ...(caption === undefined ? {} : { caption }), text: node.value }
    } else if (node.type === 'blockquote') {
      claimOnce('旁注', node, section.note !== undefined)
      section.note = parseNote(node, ctx)
    } else if (node.type === 'table') {
      failAt(
        ctx.file,
        node,
        ctx.lineOffset,
        '裸表格要用 :::table{caption="..."} 容器包起来(DataTable 需要图注与等宽列信息)',
      )
    } else {
      failAt(ctx.file, node, ctx.lineOffset, `正文里不支持 ${node.type} 这种块`)
    }
  }

  return section
}

export interface Body {
  intro: string
  sections: Section[]
}

/** 正文 = 一段导语 + 若干 ## 小节。 */
export function parseBody(tree: Root, ctx: ParseContext): Body {
  const firstHeading = tree.children.findIndex((node) => node.type === 'heading')
  const lead = firstHeading === -1 ? tree.children : tree.children.slice(0, firstHeading)

  const leadParagraphs = lead.filter((node) => node.type === 'paragraph')
  if (leadParagraphs.length !== 1 || lead.length !== 1) {
    const at = lead[1] ?? lead[0]
    if (at) {
      failAt(
        ctx.file,
        at,
        ctx.lineOffset,
        '第一个 ## 之前必须恰好有一段导语(不能是列表/表格, 也不能写两段)',
      )
    }
    throw new ContentError(ctx.file, ctx.lineOffset + 1, 1, '缺少导语: frontmatter 之后要写一段引言再开始 ## 小节')
  }
  const intro = rawText(ctx.source, leadParagraphs[0], ctx.file, ctx.lineOffset)

  const sections: Section[] = []
  let current: { heading: Heading; blocks: RootContent[] } | null = null
  for (const node of tree.children.slice(firstHeading === -1 ? tree.children.length : firstHeading)) {
    if (node.type === 'heading') {
      if (node.depth !== 2) {
        failAt(ctx.file, node, ctx.lineOffset, `只允许 ## 二级标题, 这里写了 ${'#'.repeat(node.depth)}`)
      }
      if (current) sections.push(buildSection(current.heading, current.blocks, ctx))
      current = { heading: node, blocks: [] }
    } else if (current) {
      current.blocks.push(node)
    }
  }
  if (current) sections.push(buildSection(current.heading, current.blocks, ctx))

  if (sections.length === 0) {
    throw new ContentError(ctx.file, ctx.lineOffset + 1, 1, '至少要有一个 ## 小节')
  }

  const seen = new Set<string>()
  for (const section of sections) {
    if (seen.has(section.heading)) {
      throw new ContentError(
        ctx.file,
        ctx.lineOffset + 1,
        1,
        `## 标题「${section.heading}」在同一篇里出现了两次; 标题同时用作本页目录与 React key, 必须唯一`,
      )
    }
    seen.add(section.heading)
  }

  return { intro, sections }
}
