import type { LandDoc } from '../types'

/**
 * 保护范围与 mod 兼容: 判定链、假玩家处理、数据包覆盖机制、第三方接入清单。
 * 取自 event/ 与 api/ 目录及各平台 integration 实现, 经源码复核。
 */
export const compat: LandDoc = {
  id: 'compat',
  name: 'mod 兼容与自动化',
  en: 'Compatibility',
  group: '服主',
  tagline: '模组方块被误判怎么修、机器假人怎么授权、接了哪些第三方 mod。',
  facts: [
    { label: '覆盖机制', value: '数据包' },
    { label: '覆盖场景', value: '5 类' },
    { label: '假玩家默认', value: '禁止' },
    { label: '对外 API', value: '单独 api jar' },
  ],
  intro:
    '整合包里最常见的两类问题: 模组方块被 Flan 判成了错误的权限,以及机器假人在别人领地里被拦住。' +
    '两者都有正规解法 —— 前者用数据包覆盖映射表,后者用假玩家白名单。这页把两条路都讲清楚。',
  sections: [
    {
      heading: '一次交互是怎么被判定的',
      steps: [
        '事件层拦下原版行为(挖方块、右键、攻击实体等)。',
        '按坐标取出权限容器: 命中领地就用那块领地, 没命中就用世界级的兜底规则。',
        '把这次行为翻译成一个权限 id, 比如 flan:break。翻译规则可以被数据包覆盖。',
        '在权限容器里判定允许还是拒绝; 拒绝时发提示并回滚客户端显示, 避免出现幽灵方块。',
      ],
      note: '第 3 步是整套机制的关键: Flan 靠原版类型判断决定"这个方块算什么"。模组方块通常不继承原版类, 判断就会出错 —— 这正是数据包覆盖要解决的。',
    },
    {
      heading: '模组方块被误判: 用数据包修',
      paragraphs: [
        '几个真实例子: 存储抽屉左键是取物品但被当成破坏方块;Mekanism 的储物箱同理;' +
          'AE2 的扳手右键机器是旋转配置却被当成放置方块;Taterzens 的 NPC 承担商人角色却按互动动物判。',
        '解法是往数据包里丢一份映射表,把"某个方块/物品/实体 + 某种交互场景"直接指到你要的权限上,' +
          '绕开原版类型判断。这张表跟着 /reload 热重载。',
      ],
      table: {
        columns: ['文件放哪', '值'],
        monoCols: [1],
        rows: [
          ['路径', 'data/<命名空间>/claim_interactions_override/<随便起名>.json'],
          ['可放位置', 'mod 资源里, 或存档的 datapacks/<你的包>/ 下'],
          ['热重载', '跟 /reload 一起'],
        ],
      },
      code: {
        caption: '内置的存储抽屉覆盖, 可以直接照着改。entry 支持具体 id, 也支持 # 开头的标签。',
        text: `{
  "type": "flan:block_left_click",
  "values": [
    {
      "entry": "#storagedrawers:drawers",
      "permission": "flan:open_container"
    }
  ]
}`,
      },
      bullets: [
        'type 五选一: flan:block_left_click(左键方块)、flan:block_interact(与方块交互)、flan:item_use(使用物品)、flan:entity_attack(攻击实体)、flan:entity_interact(右键实体)。',
        '优先级: 具体 id 最优先, 标签次之, Flan 的内置判断最后。数据包写什么就是什么, 一定盖得住。',
        '左键方块、攻击实体、右键实体这三类没有任何内置默认, 完全靠数据包。',
        '别在多个 json 文件里重复定义同一个条目 —— 谁最终生效取决于遍历顺序, Flan 不做保证。',
      ],
      note: '旧版的四个配置项(customItemPermission 这一类)已经彻底失效, 配置文件里那个 legacyOverrides 字段没有任何消费方。必须改用数据包。',
    },
    {
      heading: '机器假人(fake player)',
      paragraphs: [
        '自动化 mod 的机器通常用一个"假玩家"来代替真人执行操作。Flan 的识别方式很简单:' +
          '只要不是真正的玩家对象本尊,就算假玩家。所以各家 mod 的假人都会被自动识破,不需要单独适配。',
      ],
      table: {
        columns: ['情况', '结果'],
        rows: [
          ['UUID 在这块地的假玩家白名单里', '无条件放行, 连原始权限都不查'],
          ['假玩家的 UUID 恰好是领地主人, 或已被加进某个权限组', '保留原始权限, 按正常玩家判'],
          ['其余情况', '不管它想干什么, 一律只看"假人"这一个开关'],
        ],
      },
      bullets: [
        '"假人"是全局类权限, 默认关闭 —— 也就是默认禁止一切自动化设备操作别人的领地。',
        '领地之外不走这套改判, 假人按世界级默认值处理, 一般是放行。',
        '假玩家永远收不到拒绝提示, 不会刷屏。',
      ],
    },
    {
      heading: '给自动化设备授权',
      table: {
        columns: ['做法', '说明'],
        monoCols: [0],
        rows: [
          ['打开"假人"权限', '这块地对所有假玩家开放。最省事, 也最危险'],
          ['/flan fakePlayer add <uuid>', '只放行某一个假玩家, 精确授权, 推荐'],
          ['/flan fakePlayer remove <uuid>', '移除授权'],
          ['领地菜单第 6 格', '图形界面里加人和删人, 输入的是玩家名不是 UUID'],
        ],
      },
      bullets: [
        '假人被拦下时, 在线的领地主会收到一条通知, 里面带一个可直接点击的授权命令。',
        '同一块地、同一个假人 UUID 的通知每 60 秒最多一次, 不会刷屏。',
        '点通知里那条授权命令时必须站在自己的领地里才有效 —— 命令是按你当前坐标找领地的。',
        '嫌吵可以用 /flan fakePlayer(不带参数)关掉通知。',
      ],
    },
    {
      heading: '接了哪些第三方 mod',
      table: {
        columns: ['类别', 'Mod', '平台', '做了什么'],
        rows: [
          ['权限', 'fabric-permissions-api', 'Fabric', '接 LuckPerms 一类的权限系统, 支持布尔节点与数值型 meta'],
          ['权限', 'FTB Ranks', '两端', '查布尔与数值节点, 查不到时回落到 OP 等级'],
          ['经济', 'Impactor', '两端', '优先级最高, 检测到就不再走平台特有实现'],
          ['经济', 'OctoEconomy', 'Fabric', '硬编码使用某一种货币, 找不到会提示缺少经济 mod'],
          ['经济', 'Diamond Economy', 'Fabric', '金额被强转为整数, 单价配小数会被截断成 0'],
          ['经济', 'DiceMC Money', 'Forge', '通过其余额接口增减'],
          ['地图', 'Dynmap', '两端', '每块领地一个区域标记, 管理员领地与玩家领地不同色'],
          ['地图', 'BlueMap', '两端', '建 3D 与平面两套标记集, 启动时全量刷一遍'],
          ['圈地冲突', 'FTB Chunks', '两端', '圈地时检查是否压到已认领区块'],
          ['圈地冲突', 'GOML', 'Fabric', '外扩 1 格检查冲突'],
          ['圈地冲突', 'MineColonies', 'Forge', '逐区块查殖民地权限'],
          ['数据导入', 'GriefPrevention', '两端', '用命令从插件数据文件导入领地, 不需要装那个插件'],
          ['通用保护', 'common-protection-api', 'Fabric', 'Flan 注册为提供方, 别的 mod 无需依赖 Flan 就能查询'],
          ['飞行', 'PlayerAbilityLib', 'Fabric', '用专门的能力来源授予飞行, 避免和别的飞行 mod 抢'],
          ['农业', 'Harvest with ease', 'Fabric', '右键收割也要过破坏权限'],
          ['机械', 'Create', '两端', '矿车装置移动到不同领地时检查通过权限'],
          ['数据包兼容', 'Storage Drawers / Mekanism / AE2 / Taterzens', '两端', '靠内置的映射覆盖, 无需代码'],
        ],
      },
      note: '还有一批 mod 是靠配置里的默认豁免名单直接放行的: Universal Graves、YIGD、Waystones、Universal Shops、Corpse、Gunpowder 等。墓碑类 mod 尤其重要 —— 不豁免的话玩家死在别人领地里就拿不回自己的坟。',
    },
    {
      heading: '给 mod 作者的 API',
      paragraphs: [
        'Flan 把对外接口单独打成 api jar 发布,用 compileOnly 引入即可,不会把 Flan 的一堆可选依赖拖进来。' +
          '最常用的就是一个方法: 查某个玩家能不能在某个坐标做某件事。',
      ],
      code: {
        caption: '官方推荐的唯一入口。permission 传权限的完整 id, 比如 flan:break。',
        text: `ClaimHandler.canInteract(ServerPlayer player,
                         BlockPos pos,
                         ResourceLocation permission)`,
      },
      bullets: [
        '同一个类里还提供了按世界取权限存储、按玩家取额度数据的方法, 离线玩家也能查。',
        'Fabric 侧另外注册了通用保护接口的提供方, 支持那套 API 的 mod 不用依赖 Flan 就能问"这里能不能动"。',
      ],
    },
  ],
}
