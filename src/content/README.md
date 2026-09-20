# Wiki 内容写作规范

这个目录下的 `.md` 就是网站的全部内容。构建期由 `tools/md/` 的解析器折叠成数据对象，
交给 `src/components/wiki/` 下的渲染组件。写错了不会渲染成奇怪的样子，而是直接让
`pnpm build` 带着 `文件:行:列` 失败。

随时可以单独体检：

```
pnpm content:check
```

它一次列全所有文件的所有错误，不用改一处 build 一次。

## 文件放哪里

| 路径 | 对应什么 | URL |
| --- | --- | --- |
| `jobs/<id>.md` | 一个职业 | `/wiki/jobs/<id>` |
| `dimensions/<id>.md` | 一个维度 | `/wiki/dimensions/<id>` |
| `champions/_overview.md` | 精英怪总览 | `/wiki/champions` |
| `champions/<id>.md` | 一条精英怪词条 | `/wiki/champions/<id>` |
| `land/_overview.md` | 领地总览 | `/wiki/land` |
| `land/<id>.md` | 一篇领地文档 | `/wiki/land/<id>` |
| `audit/_overview.md` | 临时审计区总览 | `/wiki/audit` |
| `audit/<id>.md` | 一篇审计文档 | `/wiki/audit/<id>` |
| `economy.md` | 经济总览 | `/wiki/economy` |

**文件名就是 id 就是 URL。** frontmatter 里不写 `id`，改 URL 就是重命名文件。
放在这五个目录之外、或者多加一层子目录的 `.md` 会让构建失败，不会被静默忽略。

## 四条铁律

**一、正文里的行内 markdown 全部失效。** `*` `_` `` ` `` `[]` `<>` `:` 都按字面显示，
所以 `miner.*`、`tacz:m4a1`、`minecraft:zombie`、`<entity>`、`src/main/java/.../*Registry.java`
直接写，不用转义；代价是**不能**用 `**粗体**` 和 `[链接]()`（写了只会原样显示出来）。

这不是洁癖。实测把现有内容按标准行内解析跑一遍，11164 个文本块里有 **814 处**显示会变样：
`tacz:m4a1` 被当成行内指令吃成 `tacz`，`<entity>` 被当成行内 HTML 整个吞掉。
Minecraft wiki 的内容里资源 ID 和尖括号占位符遍地都是，开了行内解析反而要到处加转义，
写起来只会更难。真到了非要链接不可的那天再按 `tools/md/` 里预留的路径升级。

**二、一段写一行。** 段落、列表项、表格单元格、旁注都不能软换行。要分段就空一行另起一段。
长行靠编辑器软换行显示。

**三、书写顺序就是渲染顺序。** 一个 `##` 小节里，块必须按这个顺序写：

```
段落 -> 有序列表 -> 无序列表 -> 表格 -> 菜单 -> 代码块 -> 旁注
```

写反了会报错。`表格 / 菜单 / 代码块 / 旁注` 每个小节各最多一个，内容再多就拆成两个 `##`。

**四、`order` 按 10 递增。** 它决定侧栏与索引页的顺序，留出空档方便以后插入。
同一目录内不能重复。总览页（`_overview.md`）与 `economy.md` 不写 `order`。

## frontmatter

一律 YAML，写在文件最顶上的 `---` 块里。**多写一个字段就报错**，`taglien` 这种拼错会当场炸。

值里有下面这些情况时必须用单引号包起来，否则 YAML 会读错甚至解析失败：

- 纯数字、`true`/`false`/`null` 这类（`value: '8'` 而不是 `value: 8`）
- 含有半角冒号加空格（`title: '开张: 1 台军火台'`）
- 以 `-` `:` `#` `*` `&` `|` `>` `%` `@` 等开头（`tagline: '超凡+ 背水核弹...'`）

各类文档的字段：

| 类型 | 字段 |
| --- | --- |
| job | `order` `name` `en` `category` `difficulty` `tagline` `facts` `growth?` |
| dimension | `order` `name` `en` `tagline` `facts` |
| champion | `order` `name` `en` `pool` `group` `status` `statusNote?` `tagline` `facts` |
| champions/_overview | `name` `en` `dummyIntro` `dummies` |
| land | `order` `name` `en` `group` `tagline` `facts?` |
| land/_overview | `name` `en` `facts` |
| audit | `order` `name` `en` `group` `tagline` `facts?` |
| audit/_overview | `name` `en` `tagline` `facts` |
| economy | `name` |

`category` `difficulty` `pool` `group` `status` 是枚举，取值见
[`taxonomy.ts`](./taxonomy.ts)——那里是唯一真源，要加新取值先改它。

`facts` 是自由的 `label` / `value` 序列，不是固定字段名：矿工的 `label` 写「它是干嘛的」，
其余职业写「定位」，这种差异是有意的，`StatStrip` 会把 `label` 原样显示出来。

champion 还有一条交叉校验：`facts` 里「所属池」「状态」两项的值必须与 `pool` `status`
字段一致，不一致直接构建失败。`status: 半成品` 的词条必须写 `statusNote` 说明缺口，
精英怪总览页用它拼出那句「某某目前是半成品(原因)」。

## 正文骨架

```markdown
---
order: 10
name: 矿工
en: Miner
category: 生产
difficulty: 进阶
tagline: 下矿洞、挖值钱的矿、卖给系统换钱。
facts:
  - label: 它是干嘛的
    value: 在矿洞维度挖矿, 把矿物卖给系统换钱
growth:
  - tier: Lv.1
    title: 入门
    desc: 自带挖矿提速和省耐久; 只能进简单难度矿洞。
---

矿工就是下矿洞挖值钱的矿、卖给系统换钱。这一段是导语, 必须恰好一段。

## 怎么开始

1. 在职业面板里选矿工, 1 级起步。
2. 进矿洞维度。新号只能进简单区。

> 这是旁注, 渲染成左侧细竖线加略淡的正文。一个小节最多一条。

## 怎么赚钱

矿工的主要收入来自三种系统直接收购的高价矿。

:::table{caption="系统直接收购的高价矿 · 基准价与每日额度"}
| 矿种 | 基准价(每个) | 每日软上限 |
| --- | ---: | ---: |
| 远古残骸 | 4,500 | 8 |
| 钻石 | 500 | 64 |
:::
```

只允许 `##` 二级标题，且同一篇里标题不能重复（它同时用作本页目录的锚点与 React key）。
`##` 之前必须恰好一段导语。

## 表格

普通表格直接写标准 GFM，不用包任何东西：

```markdown
| 品质 | 最多带几个效果 | 会不会翻车 |
| --- | ---: | --- |
| 低级 | 1 | 会 |
| 超凡 | 3 | 不会 |
```

只有需要**图注**或**等宽列**时才用 `:::table` 容器包一层：

```markdown
:::table{caption="系统直接收购的高价矿 · 基准价与每日额度" mono="0"}
| 命令 | 说明 | 权限 |
| --- | --- | ---: |
| /flan menu | 打开领地菜单 | 所有人 |
:::
```

包了容器却不写 `caption` 也不写 `mono` 会报错——那层容器是多余的。

- **右对齐（分隔行写 `---:`）就是数值列**，渲染成右对齐 + 等宽数字。不用另外数列号。
- 只有 `---` 与 `---:` 两种，写 `:---` 或 `:---:` 会报错（渲染层没有左/居中对齐这回事）。
- `mono="0,2"` 指定哪几列用等宽字体（命令、权限 id、配置键这类），下标从 0 起。
- 单元格里的竖线写成 `\|`。漏了会被「这一行格数与表头列数不符」的报错兜住。
- 单元格可以留空，渲染成空格子。

## 箱子菜单槽位图

```markdown
:::menu{title="全域权限 / 某个组的权限" rows="6" openedBy="领地菜单第 2 格"}
| 槽位 | 物品 | 点击效果 |
| --- | --- | --- |
| 0 | 返回 | 回领地菜单 |
| 10-16,19-25,28-34,37-43 | 权限项 | 点一下推进一档状态 |
| 47 | 上一页 | 不在第一页时才出现 |
:::
```

- 表头必须逐字是 `槽位 / 物品 / 点击效果`。
- `rows` 是容器行数（1 到 6），槽位下标范围是 `0` 到 `rows * 9 - 1`，越界或重复都报错。
- 槽位列支持三种写法：单个 `12`、闭区间 `10-16`、逗号连接 `10-16,19-25`。
  区间是为了表达「跳过箱子边框列」这种规律，不用手写 28 行。
- 第三列留空表示纯装饰格。
- **展开顺序就是书写顺序**：上方网格按下标对号入座，但下方那张清单是按书写顺序排的。

## 代码块

````markdown
```text caption="内置的存储抽屉覆盖, 可以直接照着改。"
{ "type": "flan:block_left_click" }
```
````

语言标注必填（渲染侧没有语法高亮，这个标注只给编辑器看），`caption` 可选。
代码块内部原样保留，不做任何转义。

## 正文里的转义

只有一种情况需要转义：**段落、列表项、旁注的第一个字符**是
`#` `>` `-` `+` `*` `|` `` ` `` `~` `:` `=` 或者形如 `1.` `1)` 时，前面加一个 `\`，
否则会被当成标题、引用、列表或指令。表格单元格里不需要这层（只有竖线要转义）。

## 改内容时还要看一眼的地方

- 改 champion 的 `pool` 或 `status`：`facts` 里「所属池」「状态」两项要同步改，
  否则构建失败。这是故意的。
- 改文件名（等于改 URL）：`src/pages` 与 `src/components` 里写死的 `/wiki/...` 链接
  会被 `pnpm content:check` 反向检查，指到不存在的文件会报错。
- 加新的分组名 / 难度 / 池：先改 [`taxonomy.ts`](./taxonomy.ts)，它是唯一真源。
- `audit/` 下的 `registry-blocks.md` 与 `registry-items.md` 是注册表快照，
  原先由数组程序化生成，迁到 markdown 后是物化的大表。要更新请从 Wok-Project 的
  Forge 注册表重新导出后整表替换，不要手改单行。
