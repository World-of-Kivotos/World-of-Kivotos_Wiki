import type { LandDoc } from '../types'

/**
 * 服主配置与运维: flan_config.json 全部关键字段 + 权限节点 + 已确证的源码异常。
 * 默认值取自 Config 类字段初始化; 异常条目均附源码位置, 经对抗式复核确认。
 */
export const admin: LandDoc = {
  id: 'admin',
  name: '服主配置与运维',
  en: 'Server Config',
  group: '服主',
  tagline: '配置文件在哪、每个字段管什么、以及几个必须绕开的坑。',
  facts: [
    { label: '配置文件', value: 'config/flan/flan_config.json' },
    { label: '配置键', value: '50 个' },
    { label: '热重载', value: '/flan reload' },
    { label: '默认 OP 等级', value: '2' },
  ],
  intro:
    'Flan 的全部服务端行为由一个 JSON 配置文件驱动,Fabric 和 Forge 的位置完全一致。' +
    '这页列出服主最常改的字段和它们的确切效果,以及几条从源码里读出来的、会咬人的实现问题。',
  sections: [
    {
      heading: '文件都在哪',
      table: {
        columns: ['内容', '路径'],
        monoCols: [1],
        rows: [
          ['配置文件', '<服务端根>/config/flan/flan_config.json'],
          ['各世界的领地数据', '<存档>/<维度目录>/data/claims'],
          ['玩家额度数据', '<存档>/playerdata/claimData/<UUID>.json'],
        ],
      },
      bullets: [
        '删配置不会掉领地; 领地在存档里, 和配置是两码事。',
        '/flan reload 可以热重载配置, 需要 OP 2 级。',
        '每次加载配置都会把文件重写一遍 —— 你手写的注释和字段顺序会被冲掉, 未知字段也会消失。改之前先备份。',
      ],
    },
    {
      heading: '额度经济',
      table: {
        columns: ['键名', '默认值', '作用'],
        monoCols: [0],
        rows: [
          ['startingBlocks', '500', '新玩家首次进服拿到的基础额度'],
          ['maxClaimBlocks', '5000', '基础额度上限。填 -1 等于彻底关掉额度限制'],
          ['ticksForNextBlock', '600', '在线多少 tick 涨 1 点额度。600 tick = 30 秒, 约每小时 120 点'],
          ['maxBuyBlocks', '-1', '单人购买获得的附加额度上限, -1 不限'],
          ['buySellHandler', '子对象', '用钱/物品/经验买卖额度的整套配置'],
        ],
      },
      note: 'maxClaimBlocks 填 -1 有副作用: 除了放开限制, 还会让自然增长永远失败, 并且不再显示额度提示、/flan list 不再打印额度行。想"无限圈地"这样配没问题, 想"上限很高"就填一个大数而不是 -1。',
    },
    {
      heading: '尺寸、深度与数量',
      table: {
        columns: ['键名', '默认值', '作用'],
        monoCols: [0],
        rows: [
          ['minClaimsize', '100', '领地最小底面积, 100 即最小 10x10'],
          ['defaultClaimDepth', '10', '普通领地从较低角往下延伸多少格。填 -1 直接到世界底'],
          ['subClaimsInheritParentDepth', 'true', '子领地是否继承父领地的下边界'],
          ['maxClaims', '-1', '单人最多几块主领地, -1 不限'],
          ['main3dClaims', 'true', '是否允许主领地做成分层领地。子领地不受此限制'],
          ['minHeight3d', '10', '分层领地的最小高度'],
          ['noSpawnClaim', 'false', '是否禁止在出生点保护区内圈地; 需服务器 spawn-protection 大于 0'],
          ['autoClaimStructures', 'false', '世界生成结构时自动圈成管理员领地(村庄、要塞等)'],
          ['claimingCooldown', '0', '两次圈地之间的冷却 tick。见下方警告, 务必保持 0'],
        ],
      },
      note: '严重警告: claimingCooldown 只要填成大于 0 的任何值, 全服就再也建不了领地。判定方向在代码里写反了, 而且它依赖的时间戳是纯内存字段、每次登录归零, 于是判定恒为拒绝。这个配置项目前无法安全使用。',
    },
    {
      heading: '工具、显示与权限等级',
      table: {
        columns: ['键名', '默认值', '作用'],
        monoCols: [0],
        rows: [
          ['claimingItem', 'minecraft:golden_hoe', '圈地工具'],
          ['claimingNBT', '{}', '圈地工具需要带的 NBT, 部分匹配即可'],
          ['inspectionItem', 'minecraft:stick', '查看工具'],
          ['claimDisplayTime', '600', '边界显示持续多少 tick, 600 即 30 秒'],
          ['particleDisplay', 'false', 'false 发假方块, true 发粒子。粒子对客户端更轻但没那么清楚'],
          ['claimDisplayActionBar', 'false', '进出提示显示在屏幕中央还是物品栏上方'],
          ['nearbyClaimsToolDisplay', '24', '手持工具时自动高亮周围多少格内的领地'],
          ['permissionLevel', '2', '管理类命令所需的 OP 等级'],
        ],
      },
      bullets: [
        '只要玩家手里还拿着圈地工具或查看工具, 边界显示就不会到点消失 —— 30 秒的计时对手持状态无效。',
        'permissionLevel 只对 10 条标记为管理员的命令分支生效。/flan add、/flan list、/flan unlockDrops 的无参形式是普通玩家命令, 只有带参数的那一层才要管理员权限。',
      ],
    },
    {
      heading: '世界名单',
      table: {
        columns: ['键名', '默认值', '作用'],
        monoCols: [0],
        rows: [
          ['blacklistedWorlds', '[]', '维度 id 列表, 必须写完整 id, 不支持只写命名空间'],
          ['worldWhitelist', 'false', '反转上面列表的语义'],
        ],
      },
      note: 'worldWhitelist 为 false 时那个列表是黑名单; 为 true 时是白名单。开了白名单又不填列表 = 全服禁止圈地。开了管理员模式的人不受此限制。',
    },
    {
      heading: '保护豁免名单: 墓碑类 mod 必看',
      paragraphs: [
        '这一组是放行清单。命中的方块或实体 Flan 直接不管,交给对应 mod 自己处理。' +
          '最典型的场景就是墓碑: 玩家死在别人领地里,如果 Flan 拦着,他就拿不回自己的坟。',
      ],
      table: {
        columns: ['键名', '默认值', '作用'],
        monoCols: [0],
        rows: [
          ['breakBlockBlacklist', '两个墓碑 mod', '破坏时豁免。可填完整 id, 也可只填命名空间豁免整个 mod'],
          ['interactBlockBlacklist', '墓碑 + 路径点 + 商店', '右键时豁免, 规则同上'],
          ['breakBlockEntityTagBlacklist', '[]', '按方块实体的顶层 NBT 键名豁免破坏'],
          ['interactBlockEntityTagBlacklist', '三项', '按 NBT 键名豁免右键'],
          ['ignoredEntities', 'corpse:corpse', '完全不受保护约束的实体类型'],
          ['entityTagIgnore', 'graves.marker', '按实体的计分板 tag 豁免'],
          ['lenientBlockEntityCheck', 'false', '对"有方块实体但不是容器"的方块放宽检查'],
        ],
      },
      bullets: [
        'NBT 键名匹配的是顶层键名精确相等, 不支持点号路径。默认项里那个带点的键名就是一个字面含点的顶层键。',
        'lenientBlockEntityCheck 为 false 时, 所有方块实体一律按"打开容器"权限判。模组机器多的整合包建议开 true, 否则每台机器都吃容器权限。',
        '两个平台对"什么算容器"的判定范围不同, Forge 还额外认带物品处理能力的方块实体。',
      ],
    },
    {
      heading: '全服强制权限',
      paragraphs: [
        'globalDefaultPerms 让你按维度强制某些权限,做到玩家改不了。这是做全服规则的地方。' +
          '键可以是具体维度 id,也可以用星号表示所有维度。',
      ],
      table: {
        columns: ['取值', '含义'],
        monoCols: [0],
        rows: [
          ['ALLTRUE', '强制开启, 领地主人在菜单和命令里都改不了'],
          ['ALLFALSE', '强制关闭, 同样改不了'],
          ['TRUE', '默认开启, 主人可以自己改'],
          ['FALSE', '默认关闭, 主人可以自己改'],
          ['NONE', '不设全局默认, 走权限项自己的默认值'],
        ],
      },
      bullets: [
        '也可以直接写布尔值: true 等价于 ALLTRUE, false 等价于 ALLFALSE。注意这两个都是"锁死"档。',
        '被锁死的权限在菜单里会带一行深红的"不可编辑", 点了只响拒绝音。',
        '默认配置锁死了 7 条: 鞘翅飞行强制开、锁定物品强制开; 允许飞行、刷怪、传送、没有饥饿感、编辑附加效果强制关。',
      ],
      note: '编辑附加效果默认被锁成禁止, 所以开箱即用状态下没有任何人能进药水效果菜单 —— 包括领地主人。要启用这个功能必须先改这里。',
    },
    {
      heading: '默认权限组',
      paragraphs: [
        'defaultGroups 决定新领地自动带哪些权限组。默认是 Co-Owner(全权限)和 Visitor(11 项基础交互)。',
      ],
      note: '如果玩家用 /flan personalGroups 配了自己的个人模板, 新领地会改用个人模板, 这里配的两个组不再生成 —— 是替换不是叠加。',
    },
    {
      heading: '不活跃玩家清理',
      table: {
        columns: ['键名', '默认值', '作用'],
        monoCols: [0],
        rows: [
          ['inactivityTimeDays', '-1', '多少天不上线判为过期, -1 = 永不过期'],
          ['inactivityBlocksMax', '2000', '只清理总额度低于这个数的玩家'],
          ['deletePlayerFile', 'false', '清理后是否连玩家额度存档一起删'],
          ['bannedDeletionTime', '30', '永久封禁玩家的领地在封禁多少天后删除, -1 = 不删'],
        ],
      },
      bullets: [
        '不活跃分支的三个条件是"且"关系: 开关打开 + 超时 + 额度低于门槛, 缺一不可。',
        '门槛 2000 意味着攒过约 12.5 小时在线的老玩家永远不会被自动清理, 这是有意为之的保护。',
        '封禁分支只认永久封禁, 临时封禁按普通不活跃处理, 且不看额度门槛。',
        '清理时机是世界加载时逐维度执行, 不是运行中定时跑。',
        'Java 字段叫 inactivityTime, 但 JSON 里的键是 inactivityTimeDays —— 改配置认后者。',
      ],
    },
    {
      heading: '接权限 mod 做分级',
      paragraphs: [
        '不装权限 mod 时,标为管理员的命令按 OP 等级判,其余命令所有人可用。' +
          '装了 FTB Ranks(两平台通用)或 fabric-permissions-api(仅 Fabric)之后,权限节点才真正起作用。',
      ],
      table: {
        columns: ['数值型节点', '作用'],
        monoCols: [0],
        rows: [
          ['flan.claim.blocks.max', '覆盖 maxClaimBlocks, 决定自然增长的封顶'],
          ['flan.claim.blocks.cap', '对基础额度做上限截断'],
          ['flan.claim.blocks.bonus', '直接给额度加一个常数'],
          ['flan.claims.amount', '覆盖 maxClaims, 决定能有几块地'],
        ],
      },
      note: 'Forge 侧没有 fabric-permissions-api 那条路径, 只有 FTB Ranks 一条细粒度授权途径。',
    },
    {
      heading: '已确证的实现问题',
      paragraphs: [
        '以下每条都能在源码里直接读到,不是推测。上线前建议逐条对照。',
      ],
      table: {
        columns: ['严重度', '问题', '影响与规避'],
        rows: [
          [
            'Critical',
            'claimingCooldown 大于 0 会让全服无法圈地',
            '判定方向写反且依赖的时间戳每次登录归零。保持 0',
          ],
          [
            'Critical',
            'Fabric 侧用货币卖额度: 成交后仍报错, 且可能双倍结算',
            '两个经济 mod 分支都缺少成功返回, 且互不排斥。同时装 OctoEconomy 和 DiamondEconomy 时玩家会被付两次钱、扣两次额度。只装一个, 或改用物品/经验模式',
          ],
          [
            'Major',
            '经验模式卖出按买入单价计价',
            '配置里的卖出价在经验模式下只参与"是否禁用"的判定, 不参与计价',
          ],
          [
            'Major',
            '经验模式卖出成功后命令返回失败',
            '经验已发、额度已扣, 但命令返回 0。用命令方块或计分板统计交易会记成失败',
          ],
          [
            'Minor',
            'dropTicks 配置不起作用',
            '真实解锁时长硬编码为 1200 tick(60 秒), 这个配置只填进提示文案。改它只会让提示说谎',
          ],
          [
            'Minor',
            '买入超上限时提示显示原始 key',
            'flan.buyLimit 在语言文件里不存在。想用 maxBuyBlocks 就自己补这个 key',
          ],
          [
            'Minor',
            '物品模式买入可能重复计费',
            '同一组物品若匹配多条规则会被记账两次。别配范围重叠的物品规则',
          ],
          [
            'Minor',
            '经验模式在特定等级会抛数组越界',
            '缓存边界判定少了一个等号。等级恰好等于上次分配长度时触发',
          ],
          [
            'Minor',
            'legacyOverrides 及四个历史键已失效',
            '功能已迁到数据包 claim_interactions_override, 改配置没有任何效果',
          ],
          [
            'Minor',
            'Create 移动机械那条权限的按领地开关是死的',
            '代码里的判定写法导致开关不起作用',
          ],
        ],
      },
    },
  ],
}
