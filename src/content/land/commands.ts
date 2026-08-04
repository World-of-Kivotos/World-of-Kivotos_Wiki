import type { LandDoc } from '../types'

/**
 * 命令大全: 覆盖 /flan 根命令下 56 条可执行分支的全部内容。
 * 语法与行为取自 CommandClaim.register 的命令树, 每条都经过对抗式源码复核。
 */
export const commands: LandDoc = {
  id: 'commands',
  name: '命令大全',
  en: 'Commands',
  group: '参考',
  tagline: '/flan 下面所有能敲的命令, 按用途分好类, 附带几个坑人的行为差异。',
  facts: [
    { label: '根命令', value: '/flan' },
    { label: '别名', value: '无' },
    { label: '子命令', value: '34 个' },
    { label: '可执行分支', value: '56 条' },
  ],
  intro:
    '所有命令都挂在 /flan 下面,没有 /claim、/land 之类的简写 —— mod 本体不提供别名。' +
    '大部分日常操作用 /flan menu 打开箱子菜单点着做就行,命令主要用来做菜单里做不了的事,或者批量操作。' +
    '下面标了"管理员"的分支在没装权限 mod 的服上需要 OP 2 级。',
  sections: [
    {
      heading: '圈地与调整',
      table: {
        columns: ['命令', '作用', '要站在领地里'],
        monoCols: [0],
        rows: [
          ['/flan add <角1> <角2>', '用坐标圈地, 支持 ~ 相对坐标。等价于拿金锄头点两下', '否'],
          [
            '/flan add all',
            '以你当前位置为中心, 把剩余额度一次性用满, 圈一个尽可能大的正方形',
            '否',
          ],
          ['/flan add rect <长> <宽>', '以你当前位置为中心圈一个指定长宽的矩形', '否'],
          [
            '/flan expand <格数>',
            '朝你面对的方向把边界推出去; 填负数就是往回收。收缩会退还额度',
            '是',
          ],
          ['/flan switchMode <模式>', '切换圈地模式, 四选一(见下)', '否'],
        ],
      },
      bullets: [
        '圈地模式四个值: DEFAULT(普通)、SUBCLAIM(子领地)、DEFAULT_3D(分层领地)、SUBCLAIM_3D(分层子领地)。',
        '/flan add rect 的两个角都取在你脚下往下 5 格的位置, 所以领地下边界会比你站的地方低一些。',
        '/flan expand 认的是你面朝的水平方向, 推的是那一条边, 不是四面一起扩。',
      ],
      note: '模式填错值时会弹出一条红色的"圈地模式已设为 xxx"。看着像成功, 其实是失败提示复用了成功的文案, 模式并没有改。认准颜色。',
    },
    {
      heading: '日常与查看',
      table: {
        columns: ['命令', '作用', '要站在领地里'],
        monoCols: [0],
        rows: [
          ['/flan menu', '打开领地箱子菜单, 权限、成员、改名全在里面', '是'],
          ['/flan info', '在聊天栏打印这块地的详细信息', '是'],
          ['/flan info <类型>', '只看某一部分: SIMPLE 基础 / GLOBAL 全局权限 / GROUP 分组 / ALL 全部', '是'],
          ['/flan list', '列出你自己在所有世界里的全部领地', '否'],
          ['/flan name <名字>', '给这块地起名。带空格要加英文双引号', '是'],
          ['/flan setHome', '把当前位置设为这块地的传送落点', '是'],
          ['/flan trapped', '被困在别人领地里出不来时用, 站着别动 5 秒会把你传出去', '是'],
          ['/flan unlockDrops', '解锁自己的死亡掉落, 让别人也能帮你捡', '否'],
          ['/flan personalGroups', '编辑你的个人默认分组模板, 以后新圈的地自动套用', '否'],
          ['/flan transferClaim <玩家>', '把这块地过户给别人', '是'],
        ],
      },
      bullets: [
        '/flan info 里的权限与分组部分只有具备"修改权限"的人才看得见, 普通访客只看到基础信息。',
        '/flan trapped 只能在别人的领地里用。站在自己家里用会提示不需要救援。',
        '过户之后这块地就完全是对方的了, 你自己反倒变成没权限的人, 而且这一步没有二次确认。',
      ],
      note: '过户前系统会检查对方的额度够不够装下这块地; 不够会直接拒绝。',
    },
    {
      heading: '删除',
      table: {
        columns: ['命令', '作用', '需要二次确认'],
        monoCols: [0],
        rows: [
          ['/flan delete', '删掉你脚下这块领地', '否'],
          ['/flan deleteAll', '删掉你在所有世界里的全部领地', '是'],
          ['/flan deleteSubClaim', '删掉脚下的这一块子领地', '否'],
          ['/flan deleteAllSubClaims', '删掉当前领地里的全部子领地', '是'],
        ],
      },
      bullets: [
        '需要确认的命令用 /flan confirm confirm 执行, /flan confirm deny 取消。',
        '确认窗口是 20 秒, 超时后待办被悄悄丢弃, 不会有任何提示, 再敲 confirm 也没反应。',
        '每个人同一时间只能挂一条待确认命令, 挂第二条会直接顶掉第一条, 而且不提示。',
      ],
      note: '重要: 如果你当前是子领地模式, /flan delete 删不掉主领地, 会提示"这里没有子领地"; /flan deleteAll 更糟 —— 确认之后什么都不会发生, 而且一声不吭。删主领地前先 /flan switchMode DEFAULT。',
    },
    {
      heading: '分组与成员',
      paragraphs: [
        '分组是给领地成员分权限的方式: 先建组、给组配权限,再把人塞进组。这一整套在箱子菜单里点更快,' +
          '命令适合批量加人。所有分组命令都要求你站在领地里并具备"修改权限"。',
      ],
      table: {
        columns: ['命令', '作用'],
        monoCols: [0],
        rows: [
          ['/flan group add <组名>', '新建一个空权限组'],
          ['/flan group remove <组名>', '删掉这个组, 组里的人一并被摘出去'],
          ['/flan group players add <组名> <玩家>', '把人加进组; 人已经在别的组里时不做改动'],
          ['/flan group players add <组名> <玩家> overwrite', '强制覆盖对方原本所属的组'],
          ['/flan group players remove <组名> <玩家>', '把人从领地成员里移除'],
        ],
      },
      bullets: [
        '加人和移除人的 <组名> 只接受不带空格的名字。带空格的组名可以建、可以在菜单里用, 但没法用这两条命令操作。',
        '移除时填的 <组名> 其实只影响 tab 补全 —— 不管对方在哪个组, 都会被移出去。',
        '领地主人本人加不进任何组, 这是设计如此。',
      ],
    },
    {
      heading: '权限开关',
      paragraphs: [
        '三条分支分别管三个层次: 整块地的默认值、某个组的值、以及你自己的个人模板。',
      ],
      table: {
        columns: ['命令', '改的是什么', '要站在领地里'],
        monoCols: [0],
        rows: [
          ['/flan permission global <权限> <取值>', '这块地对所有人的默认值', '是'],
          ['/flan permission group <组名> <权限> <取值>', '这块地里某个组的值', '是'],
          ['/flan permission personal <组名> <权限> <取值>', '你的个人默认分组模板', '否'],
        ],
      },
      note: '取值只认三个小写单词: true 允许、false 禁止、default 跟随上一层。填错的话 —— 包括 True、1、拼错的 ture —— 一律被当成 false 处理, 而且不报错。写脚本时务必用精确的小写。',
    },
    {
      heading: '传送',
      table: {
        columns: ['命令', '传到哪'],
        monoCols: [0],
        rows: [
          ['/flan teleport self <领地>', '你自己名下的某块地'],
          ['/flan teleport global <领地>', '某块管理员领地(公共设施)'],
          ['/flan teleport other <玩家> <领地>', '别人名下的某块地, 需要对方那块地给了你传送权限'],
        ],
      },
      bullets: [
        '落点是那块地用 /flan setHome 设的位置; 没设过就用默认点。',
        '传送要站着不动 5 秒, 中途移动会被打断。',
        '只能传到你当前所在世界里的领地, 不支持跨世界传送。',
        '落点如果被埋在方块里, 系统会自动往上找一个不卡住的位置。',
      ],
    },
    {
      heading: '额度买卖',
      paragraphs: [
        '如果服主开启了额度买卖,你可以用钱、物品或经验换额度,也可以把多余的额度卖回去。' +
          '买来的算"附加额度",和在线攒出来的基础额度分开记。',
      ],
      table: {
        columns: ['命令', '作用'],
        monoCols: [0],
        rows: [
          ['/flan buy <数量>', '购买指定数量的额度'],
          ['/flan sell <数量>', '卖掉指定数量的附加额度'],
        ],
      },
      note: '已经被领地占用的那部分卖不掉, 只能卖真正闲置的附加额度。服主没开这个功能时会直接提示已禁用。',
    },
    {
      heading: '进出提示语与忽略名单',
      table: {
        columns: ['命令', '作用'],
        monoCols: [0],
        rows: [
          [
            '/flan claimMessage enter title string <文字>',
            '设置别人进入这块地时显示的大标题',
          ],
          [
            '/flan claimMessage enter subtitle string <文字>',
            '设置进入时的副标题',
          ],
          [
            '/flan claimMessage leave title string <文字>',
            '设置离开时的大标题',
          ],
          [
            '/flan claimMessage <类型> <位置> text <JSON>',
            '同上, 但接受原版 JSON 文本, 可以带颜色和点击事件',
          ],
          [
            '/flan ignoreList add <类别> <条目>',
            '把某个物品/方块/实体加进忽略名单, 在这块地里跳过权限检查',
          ],
          ['/flan ignoreList remove <类别> <条目>', '从忽略名单里移除'],
        ],
      },
      bullets: [
        '忽略名单六个类别: item(物品)、block_break(破坏方块)、block_place(放置方块)、block_use(右键方块)、entity_attack(攻击实体)、entity_use(交互实体)。',
        '条目既可以填单个 id(如 minecraft:stone), 也可以填标签(如 #minecraft:logs)。',
        '把文字设成 $empty 可以清空对应的提示语。',
      ],
      note: '忽略名单的意思是"这块地里谁都能用它"。别把箱子、熔炉这类容器方块随手加进 block_use, 等于给所有人开了箱子权限。',
    },
    {
      heading: '管理员命令',
      paragraphs: [
        '以下分支在没装权限 mod 的服上需要 OP 2 级(具体等级由服主配置决定)。',
      ],
      table: {
        columns: ['命令', '作用'],
        monoCols: [0],
        rows: [
          ['/flan bypass', '开关管理员模式, 无视所有普通领地的保护'],
          ['/flan reload', '重载 Flan 的配置文件'],
          ['/flan adminDelete', '强制删除脚下的领地, 不检查任何权限'],
          ['/flan adminDelete all <玩家>', '删掉指定玩家的全部领地, 可一次多人。玩家执行时需二次确认'],
          ['/flan setAdminClaim <true|false>', '把脚下的领地转成管理员领地或转回来'],
          ['/flan listAdminClaims', '列出当前世界里的全部管理员领地'],
          ['/flan giveClaimBlocks <玩家> <数量>', '给玩家发放附加额度, 支持离线玩家, 填负数即扣除'],
          ['/flan giveClaimBlocks <玩家> base <数量>', '直接改玩家的基础额度, 不受上限约束'],
          ['/flan add <角1> <角2> <世界> <玩家>', '在指定世界为指定玩家圈地, 跳过额度与尺寸校验'],
          ['/flan list <玩家>', '列出别人的全部领地'],
          ['/flan unlockDrops <玩家>', '批量解锁在线玩家的死亡掉落'],
          ['/flan readGriefPrevention', '从 GriefPrevention 插件的数据文件导入领地'],
        ],
      },
      bullets: [
        '管理员模式开启后, 圈地会跳过世界白名单、领地数量上限和额度检查三项。',
        '要无视管理员领地本身, 除了管理员模式还需要额外的一条权限节点。',
        '管理员领地不计入任何人的已用额度, 所以把玩家领地转成管理员领地等于把额度退还给对方。',
        '/flan add 的第四个参数填 +Admin 会建成无主的管理员领地; 填玩家名则先建后过户。',
      ],
      note: '给别人建地那条命令的 tab 补全给的是 UUID, 但代码实际按玩家名查档案。照着补全填 UUID 多半查不到人, 直接填名字才对。',
    },
    {
      heading: '帮助与确认',
      table: {
        columns: ['命令', '作用'],
        monoCols: [0],
        rows: [
          ['/flan help', '分页列出所有命令'],
          ['/flan help <页码>', '翻到指定页'],
          ['/flan help cmd <命令名>', '查看某条命令的详细说明'],
          ['/flan ?', '等价于 /flan help cmd help'],
          ['/flan confirm confirm', '执行挂起的待确认命令'],
          ['/flan confirm deny', '取消挂起的待确认命令'],
        ],
      },
    },
  ],
}
