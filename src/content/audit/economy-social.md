---
order: 60
name: 经济、社交与 WebUI 审计
en: Economy, social systems and WebUI
group: 玩法
tagline: 从货币产销、跳蚤市场和任务一路核到婚姻、实体堆叠、SQLite 与浏览器桥接，区分真正可玩的入口、可选依赖和仅入包代码。
facts:
  - label: 审计基线
    value: main @ 701093bd8492
  - label: 核心货币
    value: CREDIT / AZURE
  - label: 服务端动作
    value: 70 个已注册 action
  - label: 统一数据库
    value: miningdim.db / schema V4
  - label: 审计日期
    value: 2026-08-18
---

本页是 main 分支生产路径的只读审计，不是设计稿复述。结论同时核对了 MiningDim 的子系统装配、事件和命令入口、WebUI action 注册、SQLite 迁移以及发布 JAR 边界。GameTest 虽位于 src/main/java 并随 JAR 入包，仍只作为验证证据，不算玩家玩法；Claude 工作区记忆只用于定位线索，凡与当前源码冲突均以源码为准。

## 一、启动装配与玩家可达性

:::table{mono="1"}
| 系统 | 主入口证据 | 当前状态与入口 |
| --- | --- | --- |
| 统一存储 | src/main/java/com/miningdim/MiningDim.java:72；store/MiningStoreSubsystem.java | 已装配。ServerAboutToStart 打开世界根目录 miningdim.db，ServerStopped 关闭。 |
| 网络 | src/main/java/com/miningdim/MiningDim.java:76；network/NetworkSystem.java | 已装配。Forge SimpleChannel 承载矿区同步和双向 WebUI 消息。 |
| 经济 | src/main/java/com/miningdim/MiningDim.java:94；economy/EconomySystem.java | 已装配。矿物结算、钱包、登录迁移、命令及 WebUI 均有生产入口。 |
| 婚姻 | src/main/java/com/miningdim/MiningDim.java:147；marriage/MarriageSystem.java | 已装配。命令、戒指交互、共享背包、传送和离婚扫描均可达。 |
| 实体堆叠 | src/main/java/com/miningdim/MiningDim.java:153；stacking/StackingSystem.java | 已装配且默认启用。事件和周期扫描直接驱动，没有命令或 WebUI。 |
| WebUI 服务端 | src/main/java/com/miningdim/MiningDim.java:158；webui/server/WebUiServerSubsystem.java | 已装配。注册网关、握手、批处理、首页面板及各业务 action。 |
| 跳蚤市场 | src/main/java/com/miningdim/MiningDim.java:168；market/MarketSubsystem.java | 已装配。仅通过 WebUI action 操作，无聊天命令。 |
| 任务 | src/main/java/com/miningdim/MiningDim.java:173；quest/QuestSystem.java | 已装配且默认启用。事件、命令、WebUI 和世界 SavedData 均接通。 |
| WebUI 客户端 | src/main/java/com/miningdim/MiningDim.java:182；client/webui/WebUiClientSubsystem.java | 客户端装配，但实际浏览器依赖可选 MCEF；缺少 MCEF 时 Java 业务仍在，平板 UI 不可用。 |
:::

> MCEF 在 META-INF/mods.toml 中是 CLIENT 侧、mandatory=false、版本 [2.1.6,) 的可选依赖，build.gradle 也只以 compileOnly 引入；TaCZ 同样是可选依赖，版本范围 [1.1.8,1.1.9)。

## 二、货币模型与完整流向

- CREDIT 的 Currency.transferable=true，是市场唯一允许转移的货币；AZURE 为绑定货币，transferable=false，市场不能选择它。证据：economy/Currency.java。
- 矿物事件的 settleOreSale 命名容易误导：源码只给钱包入账，不消耗方块掉落物。玩家仍拿到实体物品，同一物品之后还能进入市场或其他玩法。证据：economy/EconomySystem.java:169-231、EconomyService.java:116-134。
- 连锁挖掘生成的高价值掉落会在同一个 SQLite 事务中逐项结算；普通方块破坏处理器会先记录有效破坏并解除 afkFrozen，再调用结算，所以 AFK 后第一次合法破坏仍可获得钱。

| 路径 | 货币变化 | 闸门与含义 |
| --- | --- | --- |
| 矿区高价值矿物破坏 | 生成 CREDIT | 仅矿业维度、有效实例区域、未取消的 BreakEvent；钻石、金、下界合金碎片按定价与两层衰减结算。 |
| 农夫出售小麦 | 生成 CREDIT | 基础单价 1，与卖矿、精英怪奖励、特工奖励共用 credit_faucet。 |
| 精英怪与特工奖励 | 生成 CREDIT / AZURE | CREDIT 走共享 credit_faucet；两条 AZURE 来源都走共享 azure_faucet 与同一每日 30 上限。 |
| 任务领奖 | 生成 CREDIT | 使用独立 quest_faucet，不占卖矿、卖菜和战斗奖励的 credit_faucet 档位。 |
| 跳蚤市场成交 | 买家向卖家转移 CREDIT | 不是 faucet。在线卖家即时入账，离线卖家写 pending_payout 后于登录领取。 |
| 系统消费 | 销毁 CREDIT 或 AZURE | 市场上架费、任务刷新、婚姻、卡包、开箱、金钱修补、调味台和军械工作费都是生产 sink。 |
| 管理员调整 | 注入或销毁 | /economy grant 与 admin.economy.set 绕过自然产出循环，属于运维入口并写审计日志。 |

## 三、基础价格、衰减和每日上限

| 项目 | 默认值 | 计算或时钟 |
| --- | ---: | --- |
| 钻石矿物结算价 | 500 CREDIT | 每个掉落单位的 V0；逐矿软上限 64。 |
| 金矿物结算价 | 120 CREDIT | 每个掉落单位的 V0；逐矿软上限 256。 |
| 下界合金碎片或远古残骸结算价 | 4,500 CREDIT | 每个掉落单位的 V0；逐矿软上限 8。 |
| 逐矿超额系数 | 0.97 的超额次数次方 | 低于各自软上限为 1；最终最低为原价的 1%。 |
| 共享 CREDIT faucet 档宽 | 60,000 原始 CREDIT | UTC 日内每跨一档乘 0.6，最低系数 1%，小数 carry 跨笔保留。 |
| 前十档累计净入账 | 约 149,093 CREDIT | 按分段积分计算；进入 1% 地板后，每 60,000 原始量仍入账 600，所以不存在数学硬上限。 |
| 任务 CREDIT faucet 档宽 | 1,000,000 原始 CREDIT | 独立 key=quest_faucet，同样 0.6 衰减和 1% 地板。 |
| AZURE 日上限 | 30 / 玩家 / UTC 日 | key=azure_faucet，硬截断；精英怪与特工赏金共享。 |
| AFK 无有效破坏阈值 | 2,400 tick | 约 120 秒；有效移动阈值 4 格。 |

> 价格与闸门真源分别是 economy/ShopPriceTable.java 和 economy/EconomyConstants.java。每日 economy 计数采用 UTC；市场 P2P 用服务器本地日期，二者并非同一个日界线。

## 四、生产 sink 与默认收费

| 消费点 | 默认收费 | 可达性或备注 |
| --- | ---: | --- |
| 矿区难度入场费 | Easy 0 / Medium 0 / Hard 0 CREDIT | 入口实际读取 miningdim-server.toml，默认免费。 |
| 任务日常刷新 | 500 CREDIT | 每次替换指定的 1-based daily 槽。 |
| 任务周常刷新 | 2,500 CREDIT | 每次替换 weekly 槽。 |
| 订婚戒指 | 5,000 CREDIT | 由购买者支付。 |
| 婚礼 | 20,000 CREDIT 总额 | 发起者支付向上取整的一半，伴侣支付向下取整的一半；默认各 10,000。 |
| 发起离婚 | 10,000 CREDIT | 仅发起者先付；发起者取消时退款。 |
| 普通塔罗包 | 200 CREDIT | 每玩家 UTC 日所有购买型卡包合计上限 20 包。 |
| 高级塔罗包 | 1,200 CREDIT | 与普通包共用每日 20 包限制。 |
| 闪耀塔罗包 | 64 AZURE | 不收 CREDIT，也计入同一购包日限。 |
| 创始箱开启 | 50,000 CREDIT + 10 AZURE | 双币 bundle 扣款，配置在 caseopening/CaseOpeningConfig.java。 |
| 调味台一次作业 | 5 CREDIT | chef 配置允许服主调为 0。 |
| 军械冲压一次作业 | 200 CREDIT × 品质材料倍率 | 实际费用随选定品质变化。 |
| 军械装配一次作业 | 5,000 CREDIT | 装配工作台固定基础配置。 |
| 金钱修补 | 材料总价 / 最大耐久 × 2.0 / 每耐久点 | 每件每秒最多修 10 点；铁维修估值 60，金和钻石复用 ShopPriceTable。 |
| 市场上架 | 动态且不退 | 公式见市场章节；取消或未售出不返还。 |

> 这里列的是默认配置，不是不可改常量。来源：config/MiningServerConfig.java:255-292、quest/QuestConfig.java、job/tarot/TarotConfig.java、job/chef/ChefConfig.java、job/munitions/MunitionsConfig.java、enchant/MoneyMendingConfig.java。

## 五、经济命令、WebUI 与未接通防滥用代码

- 普通玩家没有聊天版 /balance、直接转账或手动卖矿命令；钱包查询依赖 WebUI 的 player.wallet 或 economy.status。
- 重置收费、每日重置次数和重入门目前属于“定义与测试存在、玩法未执行”。不能把这些数值写成现服强制规则。
- 防滥用 Map 在玩家重新登录时仍可能保留，但服务器进程重启会清空；AFK、重入和部分危险度状态因此不是可靠的跨重启数据。

:::table{mono="0"}
| 入口或定义 | 权限与行为 | 判定 |
| --- | --- | --- |
| /economy grant <target> <credit>=1+ <azure>=1+ | 权限等级 2；CREDIT 与 AZURE 原子 bundle 发放并记录审计日志。 | 已接线的运维入口。 |
| economy.status | 返回余额和经济可用状态。 | 已注册。 |
| economy.today | 返回当日 faucet 计数。 | 已注册。 |
| economy.priceTable | 返回矿物基础价格。 | 已注册。 |
| admin.economy.balance | 仅 OP，按在线玩家名查询。 | 已注册。 |
| admin.economy.set | 仅 OP；把 CREDIT 或 AZURE 设为 0 至 9,007,199,254,740,991，按差额调用账本。 | 已注册。 |
| checkAndChargeReset | 定义了 6,000 tick、2 钻石、每实例每天 8 次、UTC 日界。 | 生产代码没有调用点。 |
| checkReentryGate | 定义 1,200 tick 冷却、返还率 0.8；死亡重入 1,200 tick。 | 生产代码没有调用点。 |
| PlayerAbuseState.save/load | 可序列化危险度、冷却等状态。 | 没有生产调用；当前只在进程 Map 中。 |
:::

> 证据：economy/EconomyCommands.java:16-35、EconomyAdminWebUiActions.java、AbuseGuard.java、PlayerAbuseState.java；全库调用点检索没有发现上述三个持久化或扣费守卫进入生产流程。

## 六、跳蚤市场的上架与成交闭环

1. 卖家调用 market.place，提交背包槽、数量、单价和 CREDIT；服务端复核数量、物品、塔罗限制与 P2P 日上限。
2. 服务端以基础价值和挂牌单价计算上架费，先从卖家钱包销毁费用，再序列化 ItemStack 并插入 ACTIVE 托管行，最后缩减玩家背包。
3. 买家调用 market.buy；不能购买自己的订单，count 小于等于 0 表示全买，也可以部分成交。
4. SQLite 事务内完成买家扣款、订单数量或 SOLD 状态、成交记录，以及在线卖家入账或离线 pending_payout。
5. 事务提交后把物品放入买家背包；背包放不下时掉在脚边。卖家下次登录时事务性领取离线款。
6. 卖家可对自己的 ACTIVE 订单调用 market.cancel，托管物品返还背包或掉落；上架费不退。

- 市场只接受 CREDIT。分页默认 20、最大 100；历史接口带 total。transactions 记录 item_id、数量和价格，但不保留成交物的 NBT 变体。
- 上架费前置且取消、过期或未售出均不返还；这是市场的主要货币 sink。
- MarketSubsystem 启动日志仍写“12 + 2 + 7”动作计数，当前真实注册是 13 个 market、2 个 market admin、8 个 player action，日志已经过期。

## 七、市场定价、分类与交易限制

:::table{mono="2"}
| 规则 | 精确行为 | 来源 |
| --- | --- | --- |
| 上架费公式 | round(max(V0, VR) × count × (0.20 + 0.04 × ln(VR / V0)²))；锚值最低按 1，无上限。 | market/MarketFee.java；MarketConstants.java |
| 默认 V0：diamond | 500 CREDIT | market/DefaultBaseValues.java |
| 默认 V0：gold_ingot | 120 CREDIT | market/DefaultBaseValues.java |
| 默认 V0：netherite_scrap | 4,500 CREDIT | market/DefaultBaseValues.java |
| 默认 V0：miningdim:farmer_wheat | 1 CREDIT | market/DefaultBaseValues.java |
| V0 解析 | 管理员覆盖优先，其次仅有上述四个默认值；没有设计文档曾提到的成交中位数层。 | market/BaseValueResolver.java |
| 铜铁 P2P 日上限 | 512 件；ACTIVE 挂单总量加服务器本地日期内 SOLD 数量。 | market/MarketConstants.java；MarketEngine.java:523-537 |
| 受限铜铁 ID | copper_ore、raw_copper、copper_ingot、iron_ore、raw_iron、iron_ingot。 | market/MarketConstants.java |
| 塔罗 | 只允许品质 R；SR、SSR、UR、Shiny 以及 NBT 畸形卡均拒绝。 | market/MarketTradeWhitelist.java |
| 容器递归 | 检查 BlockEntityTag.Items 一层，阻止在容器内夹带禁售塔罗。 | market/MarketTradeWhitelist.java |
| 其他物品 | 默认允许；婚戒和其他带绑定 NBT 的装备没有被市场白名单显式阻止。 | market/MarketTradeWhitelist.java |
| 分类树 | 顶层 ores、weapons、ammo、gear、food、other；ores 下有 ore、ingot、gem。 | market/MarketCategoryTree.java |
:::

> P2P 上限按服务器本地午夜重置，经济 faucet 和任务则按 UTC。这会让同一天在管理界面出现两个不同的换日时刻。

## 八、市场 action 合同

:::table{mono="1"}
| 分组 | 动作 ID | 用途 |
| --- | --- | --- |
| 浏览与订单 | market.list / market.mine / market.history | 公开列表、我的挂单、历史成交。 |
| 交易 | market.place / market.buy / market.cancel | 上架、购买、撤单。 |
| 估值与规则 | market.baseValue / market.feePreview / market.p2pCap / market.tradable | 基础值、费用预览、铜铁额度、可交易性。 |
| 分类 | market.categories / market.categoryItems | 分类骨架与指定叶分类的分页物品。 |
| 离线款 | market.pendingPayout | 查询待领取款。 |
| 管理员 | admin.setBaseValue / admin.listItems | OP 调基础值和枚举物品。 |
| 玩家通用 | player.inventory / player.wallet / player.isOp / player.itemDetail | 主背包前 36 格、钱包、权限、物品详情。 |
| 玩家通用 | player.profile / player.prefs.get / player.prefs.set / player.roster | 档案、UI 偏好和最多 200 名在线名单。 |
:::

## 九、市场已确认缺陷与原子性边界

| 严重度 | 缺陷 | 实际后果 |
| --- | --- | --- |
| Major | 极低总值的挂牌费 round 后为 0，但账本 tryCharge 要求正数。 | 总价 1 或 2、且 20% 基础费四舍五入为 0 的最便宜挂单会以 ILLEGAL_AMOUNT 失败。 |
| Major | 上架费扣款、listing 插入和背包 shrink 不在一个事务。 | 插入失败可能只损失费用；插入成功后到缩减背包前硬崩溃存在复制窗口。 |
| Major | 购买事务先提交，之后才交付物品。 | 普通背包失败会改为脚边掉落，但提交后、交付前硬崩溃仍可能让买家付钱却丢物。 |
| Major | Java 新合同把 market.categories 改成只返回带 leafCount 的分支骨架。 | 真实叶项改由 market.categoryItems 分页返回，但 webui/src/lib/actions.ts 未声明该动作，BrowsePage 仍按旧递归叶结构渲染，分类分支没有可选叶。 |
| Minor | 握手兼容检查只把“前端声明但服务端缺少”视为不兼容。 | market.categoryItems 是服务端额外动作，只写 console 信息，不会阻止旧前端继续启动，因此合同漂移被放过。 |

> 证据集中在 market/MarketEngine.java、MarketActions.java、MarketTradeWhitelist.java，以及 webui/src/lib/actions.ts 和 webui/src/pages/market/BrowsePage.tsx。

## 十、系统商店的真实边界

- 当前 Java 服务端没有 shop.* action，也没有把 WOK-ChestShop 作为 Wok-Project 的 Gradle 依赖；miningdim 发布 JAR 内不存在该独立插件的功能。
- webui/src/mock/planned.ts 只列 planned 的 shop.catalog 与 shop.detail。生产 callMock 会返回 NOT_WIRED，ShopPage 因此不是可用的远程商店。
- hub.panels 仍把 shop 标记为 enabled，会把玩家引导到一个尚未接线的页面。这是状态声明缺陷，不应在正式 Wiki 写成已上线商店。
- D:/Repo/WOK-ChestShop 是另一个仓库和独立 mod。其木牌或箱子交互只能作为外部服务器组件单独部署、单独审计，不能归入 miningdim-1.20.1-1.0.19-all.jar。

## 十一、任务板配置与刷新周期

| 项目 | 默认值 | 说明 |
| --- | ---: | --- |
| 开关 | enabled=true | 配置文件 miningdim-quest.toml。 |
| 日常槽 | 4 | 固定 3 个 easy 加 1 个 hard。 |
| 周常槽 | 1 | 从周常池抽取。 |
| 同时激活特殊任务 | 最多 2 | 村民交易触发特殊任务链。 |
| 日常刷新费 | 500 CREDIT | 刷新指定槽。 |
| 周常刷新费 | 2,500 CREDIT | 刷新指定槽。 |
| 日常基础 CREDIT | 2,000 × difficulty | easy 为 2,000；d2 为 4,000；d3 为 6,000。 |
| 周常基础 CREDIT | 6,000 × difficulty | d2 为 12,000；d3 为 18,000。 |
| 特殊基础 CREDIT | 800 × difficulty | 当前池为 800 或 1,600。 |
| 隐藏基础 CREDIT | 4,000 × difficulty | 当前池为 4,000、8,000 或 12,000。 |
| 村民特殊任务概率 | 15% | 每次合资格交易触发；同玩家 6,000 tick 冷却。 |
| 村民扫描 | 每 40 tick | 为特殊任务事件路径服务。 |
| 矿区撤离最短停留 | 6,000 tick | 约 5 分钟。 |
| TaCZ 背包链扫描 | 每 100 tick | 用于发现狙击枪并解锁隐藏任务。 |

> 日常以 UTC 日期刷新，周常以 UTC 的 ISO 周一刷新。配置与奖励真源：quest/QuestConfig.java、QuestClock.java、QuestRewards.java。

## 十二、内置日常任务池

:::table{mono="1"}
| 池 | 任务 ID 与精确目标 | difficulty |
| --- | --- | --- |
| easy 击杀 | daily.kill.zombie 15；daily.kill.skeleton 12；daily.kill.spider 12 | 1 |
| easy 采矿 | daily.mine.coal 32；daily.mine.copper 24；daily.mine.iron 24 | 1 |
| easy 撤离 | daily.extract.any 1 | 1 |
| easy 上交 | daily.turnin.rotten 64；daily.turnin.bone 32 | 1 |
| easy 弹药 | daily.ammo.any 60 发 | 1 |
| hard 击杀 | daily.kill.creeper 8；daily.kill.pillager 10；daily.kill.drowned 10 | 2 |
| hard 采矿 | daily.mine.redstone 16；daily.mine.lapis 12；daily.mine.gold 12 | 2 |
| hard 上交 | daily.turnin.gunpowder 48 | 2 |
| hard 弹药 | daily.ammo.sniper 40 发 | 2 |
| hard 撤离 | daily.extract.medium 2 | 2 |
| hard 撤离 | daily.extract.hard 1 | 3 |
:::

## 十三、内置周常、特殊与隐藏任务池

:::table{mono="1"}
| 池 | 任务 ID 与精确目标 | difficulty |
| --- | --- | --- |
| 周常采矿 | weekly.mine.diamond 16；weekly.mine.emerald 8 | 3 |
| 周常采矿 | weekly.mine.iron 180 | 2 |
| 周常击杀 | weekly.kill.zombie 150 | 2 |
| 周常击杀 | weekly.kill.pillager 60 | 3 |
| 周常弹药 | weekly.ammo.any 800 发 | 2 |
| 周常撤离 | weekly.extract.hard 5 | 3 |
| 周常上交 | weekly.turnin.totem 8；weekly.turnin.netherstar 3 | 3 |
| 周常首领 | weekly.kill.enderdragon 1 | 3 |
| 周常特殊生物 | weekly.kill.specialmob.any 3；weekly.kill.chickenjockey 1 | 3 |
| 村庄特殊 | special.village.trade 1 | 1 |
| 村庄特殊 | special.village.bulk_trade 5；special.village.guard_pillager 5 | 2 |
| 隐藏狙击 | hidden.marksman.sniper_kills 5 | 1 |
| 隐藏狙击 | hidden.marksman.headshots 3 | 2 |
| 隐藏狙击 | hidden.marksman.long_headshots 2，距离至少 50 格 | 3 |
| 隐藏狙击 | hidden.marksman.extreme_headshot 1，距离至少 80 格 | 3 |
:::

> 任务定义真源是 quest/QuestPool.java:237-324。隐藏狙击链只有 TaCZ 已加载且玩家携带狙击枪时才解锁。

## 十四、任务物品奖励池

- 每次领奖保证抽取一份带权重的材料或装备；附魔书是独立的额外抽取，不替代保证奖励。
- 日常和特殊的附魔书额外概率均为 4%；周常和隐藏均为 30%。

| 奖励池 | 物品、数量与权重 |
| --- | --- |
| 日常与特殊：资源 | 煤 8-16 w12；铜锭 6-12 w12；铁锭 4-8 w10；小麦、胡萝卜、马铃薯各 12-24 w10；甜菜根 8-16 w8；南瓜 4-8 w6；西瓜片 8-16 w6。 |
| 日常与特殊：装备 | 铁镐、铁剑各 1 w4；铁锹、铁头盔、铁靴各 1 w3；铁胸甲、铁护腿各 1 w2。 |
| 周常与隐藏：资源 | 金锭 8-16 w12；红石 16-32 w12；青金石 12-24 w10；绿宝石 4-8 w8；钻石 2-5 w6；下界疣 8-16 w8；可可豆、甜浆果各 12-24 w8；闪烁的西瓜片 4-8 w6。 |
| 周常与隐藏：装备 | 钻石镐、钻石剑各 1 w4；钻石锹、头盔、护腿、靴各 1 w3；钻石胸甲 1 w2。 |
| 附魔书常见 | 经验修补 I w15；金钱修补 I w15。 |
| 附魔书稀有 | 时运 III w3；抢夺 III w3。 |
| 附魔书其余 | 效率 IV、耐久 III、精准采集 I、保护 IV、摔落缓冲 IV、爆炸保护 IV、火焰保护 IV、弹射物保护 IV、水下速掘 I、水下呼吸 III、深海探索者 III、锋利 IV、荆棘 III、迅捷潜行 III，均 w6。 |

> 证据：quest/QuestItemRewards.java。w 表示该条目在对应权重池中的整数权重。

## 十五、任务操作、进度边界与缺陷

- Major：QuestPool.builtin() 无条件加入 daily.ammo.any、daily.ammo.sniper 和 weekly.ammo.any；TaCZ 事件钩子却只在 TaCZ 已加载时注册。无 TaCZ 服务器仍能抽到无法推进的弹药任务，只能付费刷新逃离。隐藏链则会正确保持未解锁。
- Major：任务状态在 SavedData、CREDIT 在 SQLite，领奖没有跨存储原子事务。源码明确记录硬崩溃窗口，可能在钱已入账而任务仍可再次领取时产生双领。
- Minor：撤离只看维度切换，命令传送或其他 mod 把玩家移出矿业维度也会算合法撤离。
- Minor：AFK 判定复用经济系统的进程状态，因此服务器重启会重置这一防刷上下文。

| 主题 | 当前实现 |
| --- | --- |
| 命令 | /quest list；/quest claim <id>；/quest turnin <id>；/quest refresh daily <1-based slot>；/quest refresh weekly <1-based slot>。 |
| WebUI action | quest.board；quest.claim；quest.turnIn；quest.refresh。 |
| 上交范围 | 从主背包和副手移除精确物品，不扫描护甲槽。 |
| 撤离判定 | 停留达标后，只要从矿业维度切换到任意其他维度且期间未死亡就计数；不要求走官方出口。 |
| 放置方块防刷 | 进程内 4,096 项 LRU；玩家放置的任务矿只消费一次，但服务器重启会丢失集合。 |
| 领奖顺序 | 先发 CREDIT，再变更任务链或移除任务，之后抽取物品并放入背包或掉落。 |

> 证据：quest/QuestService.java:107-113、QuestEventHooks.java:54-68、QuestTaczHooks.java、QuestPlacedBlocks.java。

## 十六、婚姻配置与生命周期

- 婚礼成功后 MarriageRegistry 写世界存档，双方订婚戒各替换为婚戒，同时更新玩家 capability 的婚姻指针。
- 婚戒 NBT 包含 SpouseUUID、MarriageId、HolderName、SpouseName、WeddingDay；OfficiantUUID 可选。当前命令与 WebUI 都传 null，因此普通流程没有主持人。
- first_marriage 只写里程碑标志，没有查到任何物品或货币奖励发放。
- 婚礼的两次扣款与 NBT、世界存档变更不构成统一事务。伴侣扣款失败会返还发起者，但随后硬崩溃或异常仍可能留下部分状态。

| 阶段 | 默认规则 | 入口或状态 |
| --- | --- | --- |
| 求婚 | 不能对自己；每人只有一个 outgoing，新求婚覆盖旧 outgoing；提案不按时间过期。 | /marriage propose <target> 或 marriage.propose。 |
| 接受或拒绝 | 目标必须在线并匹配提案。 | /marriage accept <proposer>、/marriage reject <proposer> 或 marriage.respond。 |
| 撤回 | 发起人撤回自己的 outgoing。 | /marriage withdraw；WebUI 没有单独动作。 |
| 购买戒指 | 5,000 CREDIT，向主背包发 engagement ring。 | /marriage buyring 或 marriage.buyRing。 |
| 结婚 | 双方在线、未婚、无再婚冷却、各持一枚主背包订婚戒、提案已接受。 | /marriage wed <partner> 或 marriage.wed。 |
| 婚礼收费 | 总价 20,000 CREDIT，发起者 ceil(total/2)，伴侣 floor(total/2)。 | 两次钱包扣款，不是一个跨玩家 SQL 事务。 |
| 退出清理 | 玩家下线时清除所有涉及该玩家的内存提案。 | 重启也会清空全部提案。 |

## 十七、共享背包与婚戒传送

- 传送没有配偶确认按钮。配偶在读条期间保持静止即被视为被动同意。
- 传送冷却只存在内存中，服务器重启会清除。
- 背包距离、槽位、读条与冷却配置来自 miningdim-server.toml；实现见 marriage/MarriageBackpackContainer.java、SharedBackpackWhitelist.java 和 MarriageTeleport.java。

| 能力 | 精确规则 |
| --- | --- |
| 成长等级 | 服务器运行日达到 0、3、7、14、30 日时升到 1-5 级。一天按 1,728,000 server gameTime tick。 |
| 背包槽位 | 等级 1-5 分别开放 9、18、27、45、54 格；容器物理容量始终是 54。 |
| 开启方式 | 主手持婚戒并潜行右键；配偶在线、同维度、距离不超过 64 格，且婚姻不处于待离婚。 |
| 槽位归属 | 空槽第一次放入时记录存入者；向已有堆叠补货不会夺走原归属。 |
| 禁放高价值原料 | 钻石、绿宝石、下界合金锭或碎片、远古残骸、钻石块、绿宝石块，以及对应钻石矿、绿宝石矿、深层变体和远古残骸 BlockItem。 |
| 禁放绑定物 | tacz、cgm、timeless 的皮肤 ID，以及含 OwnerUUID、SpouseUUID、MarriageId NBT 的物品；容器只递归检查一层。 |
| 传送方式 | 主手婚戒、非潜行右键；配偶在线且同维度，双方均不得处于矿业维度。 |
| 传送读条 | 等级 1-5 分别为 8、7、6、5、4 秒；双方须保持距起点 0.35 格内、不潜行、不受伤、婚姻仍有效。 |
| 传送冷却 | 等级 1-5 分别为 300、240、180、120、60 秒；只施加给发起者。 |

## 十八、离婚、财产返还与已确认缺陷

1. 任一方通过 /marriage divorce 或 marriage.divorce 发起，发起者支付默认 10,000 CREDIT；重复发起保持幂等。
2. 进入 24 小时 server gameTime 托管期，待离婚期间共享背包被冻结且现有容器会关闭。
3. 发起者可用 /marriage divorce cancel 取消并退款；非发起配偶可用 /marriage divorce confirm 提前确认。WebUI 只支持发起，不支持取消或确认。
4. 系统每 100 tick 扫描到期记录并完成离婚。共享背包按槽位 depositor 返还；未知归属采用偶数槽给 A、奇数槽给 B，背包满则形成可持久领取物或掉落。
5. 双方 divorceCount 先加一，再按 7 天 × (1 + 新 divorceCount) 计算再婚冷却；因此第一次离婚后的实际冷却是 14 个服务器运行日，第二次是 21 日。

- 在线一方的婚戒在 finalizeParty 中回收成订婚戒。离线配偶登录时只做婚姻指针对账与财产领取，没有调用 recycleRings。
- Major：离婚时离线的一方会保留旧婚戒 NBT；其后登录仍拿着外观有效但 registry 已不存在的戒指，交互失败，也不会自动回收。
- 再婚“日”同样按每 1,728,000 server gameTime tick 计算，不是现实 UTC 天。24 小时托管则按每小时 72,000 tick。

> 证据：marriage/MarriageDivorce.java、MarriageSystem.java、MarriageTuning.java、MarriageHistory.java。

## 十九、婚姻 action 与状态接口

:::table{mono="0"}
| 动作 ID | 用途 | 边界 |
| --- | --- | --- |
| marriage.state | 婚姻、费用、成长、冷却和提案状态。 | incoming 提案最多返回 32 条，并给 total 与 truncated。 |
| marriage.buyRing | 购买订婚戒。 | 扣 CREDIT 后交付物品。 |
| marriage.propose | 发起求婚。 | 内存提案。 |
| marriage.respond | 接受或拒绝。 | 按 payload 选择响应。 |
| marriage.wed | 举行婚礼。 | 无主持人参数入口。 |
| marriage.divorce | 发起离婚。 | 没有 WebUI cancel 或 confirm。 |
| marriage.sharedInv | 打开共享背包。 | 仍复核在线、同维度、距离与离婚状态。 |
:::

## 二十、实体堆叠默认配置与合并模型

- 合并要求实体类型、年龄阶段和变体一致；羊还要求颜色及有效 sheared 状态一致。
- 死亡的实体、精英怪、带玩家自定义名的实体、驯服实体、Boss、上鞍猪、拴绳或宽限中的实体不会合并。系统自己的“名称 xN”标签不视作玩家命名。
- 幸存实体保留自身属性和效果，被吸收实体直接 discard；名称显示为本地化实体名加 xN。
- 所有维度都会扫描，但候选先按同一个 ChunkPos 分桶。即使两只动物跨区块边界的实际距离小于半径，也永远不会互相合并。

| 配置 | 默认值 | 实际行为 |
| --- | ---: | --- |
| enabled | true | 启用新的扫描合并。 |
| 白名单 | 猪、鸡、羊、牛 | 硬编码四种原版被动生物。 |
| 扫描半径 | 水平 5 / 垂直 3 | 每 100 tick 扫描。 |
| 触发模式 | ON_MOVE | requireMoved=true；有新生物或移动生物才激活同块候选桶。 |
| 单堆上限 | 64 | 溢出创建新的堆。 |
| 死亡结算 | INSTANT_ALL | 一次死亡结算整堆。 |
| 掉落随机 | PER_INDIVIDUAL | 每个个体独立滚原版掉落。 |
| 经验倍增 | true | 只在合资格的玩家击杀时增加额外经验。 |
| 剪毛、挤奶、下蛋倍增 | true | 按堆大小处理。 |
| 排除 | 命名、驯服、Boss | 均默认 true；配置黑名单默认为空。 |
| 拴绳策略 | SPLIT_ONE | 默认剥离一个个体后给它上绳。 |
| 拆分宽限 | 600 tick | 拆出的实体暂时不能再次合并。 |

> 真源：stacking/StackingConfig.java、StackingSystem.java、StackMerge.java、StackMatchKey.java。

## 二十一、堆叠实体死亡、交互与缺陷

- Major：spawnBatchedDrops 注释声称合并相同 ItemStack，实际实现逐次生成 ItemEntity，只在单个堆超过最大堆叠数时切分；大堆死亡仍可能制造大量掉落实体。
- Minor：同一区块分桶使跨区块近邻永不合并，与配置的几何半径直觉不一致。
- Minor：enabled=false 只阻止新的扫描合并，既有堆的死亡结算、剪毛、挤奶、繁殖和拆分仍继续工作。
- 非白名单实体若携带陈旧 StackSize 数据，会在 EntityJoinLevelEvent 被清洗。系统无聊天命令、无 WebUI action。

| 场景 | 整堆行为 |
| --- | --- |
| INSTANT_ALL 玩家击杀 | 保留原版当前个体的一次掉落，再为 N-1 个体独立滚掉落；multiplyXp=true 时追加 N-1 份经验。 |
| INSTANT_ALL 环境死亡 | 结算 N 份掉落，但不追加经验。 |
| ONE_PER_KILL 可选模式 | 手工结算一份，堆大小减一、恢复生命并取消死亡，最后一个才按普通死亡。 |
| MULTIPLY_BASE 可选掉落模式 | 把基础掉落数量乘以堆大小，不做每个体独立随机。 |
| 剪羊毛 | 按 N 个体各滚 1-3 羊毛，只损耗一次剪刀耐久；用 ShearRegrowPending 账本跟踪后续长毛。 |
| 挤奶 | 最多消耗 min(空桶数, N)；创造模式只处理一份。 |
| 鸡蛋 | 按 N 倍吞吐调整产蛋计时。 |
| 喂食繁殖 | 整堆一次只生成一个幼崽，并设置 6,000 tick 繁殖冷却。 |
| 手动拆分 | 潜行空手交互拆一个；默认用拴绳也拆一个并拴上。新实体只复制类型、年龄和羊变体。 |

> 堆大小和宽限写在实体 Forge persistent data：miningdim:StackSize、miningdim:StackNoMergeUntil；羊另有 miningdim:ShearRegrowPending。

## 二十二、统一 SQLite 生命周期与 schema V4

:::table{mono="0"}
| 对象 | 结构或策略 | 职责 |
| --- | --- | --- |
| miningdim.db | 世界根目录单文件 | 市场、钱包、每日计数、开箱等共享。 |
| 连接 PRAGMA | journal_mode=WAL；synchronous=NORMAL；foreign_keys=ON；busy_timeout=5000 | SQLite JDBC 3.45.3.0 由 jarJar 打入 fat JAR。 |
| 迁移 | PRAGMA user_version，当前 V4；每次迁移在事务中执行 | 遇到比程序更新的 schema 会拒绝启动，而非盲目降级。 |
| 并发模型 | 共享 Connection，服务端主线程单写者 | MiningStore 提供事务边界。 |
| 旧市场导入 | miningdim_market.db | LegacyStoreImport 导入后保留原文件，并在 meta 写幂等标记。 |
| 旧开箱导入 | miningdim_cases.db | 同样迁移进统一库并保留源文件。 |
| 旧钱包导入 | EconomyWalletData SavedData | EconomyLedgerBootstrap 校验总量后迁到 SQLite，保留旧 .dat。 |
| bundle 清理 | 终态记录保留 30 天 | EconomySystem 周期回收已完成或已退款的幂等凭证。 |
:::

> 证据：store/MiningDb.java、MiningStore.java、MiningSchema.java、LegacyStoreImport.java、economy/EconomyLedgerBootstrap.java。

## 二十三、SQLite 表清单

:::table{mono="1,2"}
| 版本 | 表 | 关键字段与用途 |
| --- | --- | --- |
| V1 | meta | key/value；迁移与导入标记。 |
| V1 | listings | id, seller_uuid, seller_name, item_id, item_nbt, count, unit_price, currency, created_at, status。 |
| V1 | transactions | id, listing_id, buyer_uuid, seller_uuid, item_id, count, unit_price, total, fee, created_at。 |
| V1 | pending_payout | id, seller_uuid, amount, currency, created_at。 |
| V1 | base_values | item_id, v0, updated_by, updated_at。 |
| V1-V3 | case_openings / skin_assets | 开箱阶段与皮肤资产；V3 新增 case_openings.economy_settled。 |
| V2 | wallets | player_id 主键，credit, azure。 |
| V2 | bundle_operations | operation_id, domain, player_id, credit_amount, azure_amount, status, created_at。 |
| V2 | daily_counters | player_id, counter_key, kind, amount, day_stamp, credit_carry；前三列为复合主键。 |
| V4 | pending_payout seller index | 为离线卖家登录结算增加索引。 |
:::

## 二十四、非 SQLite 持久化矩阵

:::table{mono="1"}
| 载体 | 键或对象 | 持久内容 |
| --- | --- | --- |
| 矿业维度 SavedData | miningdim_instances | 实例注册表、next id、global seed、reset generation、占用 bitmap/frontier、固定难度 ID、retired regions 和 GC cursor。 |
| 主世界 SavedData | miningdim_quest | 任务板、玩家任务与进度、刷新周期等。 |
| 主世界 SavedData | miningdim_marriages | 有效婚姻、共享背包、待离婚等。 |
| 主世界 SavedData | miningdim_marriage_history | 离婚次数、再婚冷却、财产领取和里程碑。 |
| 玩家 capability / player.dat | MiningPlayerData | 返程位置与维度、游戏模式、当前实例和危险度、婚姻指针、各职业进度、UI 偏好、矿工冷却。死亡克隆与维度切换保留。 |
| 实体 Forge persistent data | StackSize / StackNoMergeUntil / ShearRegrowPending | 堆大小、拆分宽限和羊剪毛再生账本。 |
| 仅进程内存 | PlayerAbuseState | AFK、重入等防滥用上下文；服务器重启丢失。 |
| 仅进程内存 | MarriageProposals / MarriageTeleport cooldown | 求婚与婚戒传送冷却；下线或重启按各自规则清除。 |
| 仅进程内存 | QuestPlacedBlocks LRU | 最多 4,096 个已放置任务方块标记；重启丢失。 |
:::

## 二十五、网络协议与网关防护

:::table{mono="1"}
| 项目 | 值或行为 |
| --- | --- |
| SimpleChannel | miningdim:main，协议字符串 "2"。 |
| packet 0 | DangerSyncS2C。 |
| packet 1 | TeleportResultS2C。 |
| packet 2 | InstanceStatusS2C。 |
| packet 3 | JobSyncS2C。 |
| packet 4 | C2SWebUiRequest。 |
| packet 5 | S2CWebUiResponse。 |
| packet 6 | S2CWebUiEvent。 |
| packet 7 | ChampionSizeS2C。 |
| C2S 身份 | 请求只带 requestId、action、payload；玩家身份由 NetworkEvent.Context 的 sender 决定，客户端不能自报身份。 |
| 长度 | action 最长 64；payload 默认最大 32,767；超大响应改回 RESPONSE_TOO_LARGE。 |
| 限流 | 每玩家 token bucket：burst 120，回填 30 token/秒。 |
| 重放保护 | 保存 256 个 requestId；进入处理器前就标记，失败请求也不能用相同 ID 重试；登录和退出会清理。 |
| system.batch | 每批最多 24 次，只允许 41 个只读 action；每项独立报错并受总响应大小保护。 |
:::

> 证据：network/MiningNetwork.java、C2SWebUiRequest.java、webui/server/WebUiServerDispatcher.java、WebUiRateLimiter.java、WebUiBatchAction.java。

## 二十六、服务端 WebUI action 全量分组

- 逐字面 register 调用可数到 69 个；system.batch 通过常量注册，加入后真实握手集合为 70 个。
- hub.panels 返回 home、market、shop、jobs、mining、quests、codex、marriage、case、settings、admin。仅 admin 受 OP 锁，quests 在配置关闭时锁；shop 当前仍错误显示可用。

:::table{mono="1"}
| 域 | 已注册动作 ID |
| --- | --- |
| system | system.batch；system.echo；system.handshake；system.serverStatus |
| hub | hub.panels |
| player | player.inventory；player.wallet；player.isOp；player.itemDetail；player.profile；player.prefs.get；player.prefs.set；player.roster |
| economy | economy.status；economy.today；economy.priceTable；admin.economy.balance；admin.economy.set |
| market | market.list；market.place；market.buy；market.cancel；market.mine；market.history；market.baseValue；market.categories；market.categoryItems；market.feePreview；market.p2pCap；market.pendingPayout；market.tradable；admin.setBaseValue；admin.listItems |
| quest | quest.board；quest.claim；quest.turnIn；quest.refresh |
| marriage | marriage.state；marriage.buyRing；marriage.propose；marriage.respond；marriage.wed；marriage.divorce；marriage.sharedInv |
| mining | mining.enter；mining.leave；mining.myStatus；mining.overview；admin.mining.reset |
| case | case.apply；case.open；case.state |
| champion | champion.codex；champion.inspect |
| jobs | job.progress；job.miner.scan；job.miner.state；job.farmer.sell；job.farmer.state；job.chef.state；job.brewer.state；job.agent.scan；job.agent.seal；job.agent.state；job.munitions.state；job.blueprints；job.engineer.state；job.tarot.buyPack；job.tarot.state；admin.job.setLevel |
:::

## 二十七、MCEF 客户端和平板前端边界

- 根 Gradle 只打包 src/main/resources 与 generated resources，没有接入 webui/dist。发布 JAR 不包含 Vite 的 index.html、JS 和 CSS，因此主平板是外部网站，不是内嵌前端。
- 例外是 assets/miningdim/web/case-opening.html：它确实进入 JAR，并由 WebUiClient.CASE_PAGE_RESOURCE 为 /wokcase 提供独立开箱页面。不能笼统说 JAR 内完全没有 HTML。
- Claude 运维记忆记录 2026-08-17 曾把 React 平板部署到 https://home.shinoyuki.cn:8443/ui/。这只能证明一次外部部署，不是 main JAR 的构建证据；源码默认 URL 尚未改，新客户端若不手工配置仍会访问 localhost。
- webui/src/lib/actions.ts 当前列 69 个服务器动作和 6 个本地动作，漏掉服务端新增的 market.categoryItems。pnpm check:contract 的 11 项检查全部通过，但该脚本没有校验 Java 与 TypeScript 的全量动作集合，所以未捕获这次漂移。

| 项目 | 当前实现 |
| --- | --- |
| 打开入口 | 默认按键 G；/miningdim-webui-dev 打开通用平板；/wokcase 打开内置开箱页。 |
| 默认 URL | miningdim-client.toml 的 webUiUrl 仍为 http://localhost:5173；缩放默认 125，范围 50-300；屏幕覆盖默认 70，范围 30-100。 |
| 浏览器生命周期 | 单个 MCEF browser 复用；只信任标准化后与配置完全相同的顶层 URL。 |
| 请求超时 | 30 秒。 |
| 客户端本地 action | client.i18n；client.playCaseSound；client.closePanel；client.textFocus；client.display.get；client.display.set。它们不走服务器握手。 |
| 前端路由 | /、/market、/market/sell、/market/mine、/market/history、/market/inbox、/shop、/jobs、/jobs/:id、/mining、/quests、/codex、/marriage、/case、/settings、/admin、/components。 |
| 浏览器基线 | 外部前端为 React 19、Vite 7、Tailwind CSS 4；MCEF 对应 Chromium 116 能力基线。 |

> 证据：client/webui/WebUiClient.java、WebUiBridge.java、WebUiScreen.java、config/MiningClientConfig.java、webui/src/lib/actions.ts、build.gradle。

## 二十八、死代码、测试代码与外部边界总表

| 对象 | 物理状态 | 审计结论 |
| --- | --- | --- |
| economy reset/reentry 守卫 | 类和 GameTest 随 JAR 入包。 | 没有生产调用，不应宣传每日 8 次重置扣费或重入冷却已生效。 |
| PlayerAbuseState.save/load | 方法随 JAR 入包。 | 未接生产持久化，服务重启会丢状态。 |
| 各子系统 GameTests | 位于 src/main/java，因而随发布 JAR 编译。 | 只算验证代码，不是命令、事件、配方或 UI 入口。 |
| MCEF | 可选客户端依赖，不在 mod 内捆绑。 | 装 MCEF 并配置可访问 URL 后平板才可用。 |
| TaCZ | 可选 BOTH 依赖。 | 隐藏狙击链和枪械事件依赖它；无 TaCZ 时部分常规任务仍会错误抽到。 |
| React 平板 | 位于仓库 webui/src，根 Gradle 不打 dist。 | 外部部署资产；JAR 只有桥接 Java 和独立 case-opening.html。 |
| WOK-ChestShop | 独立仓库、独立构建。 | 不属于 miningdim 主 JAR；shop 页当前 NOT_WIRED。 |

## 二十九、缺陷优先级汇总

| 优先级 | 问题 | 建议验收点 |
| --- | --- | --- |
| P0 数据一致性 | 市场上架跨钱包、数据库、背包三段非原子；购买提交后才交货；任务领奖跨 SQLite 与 SavedData 非原子。 | 加入崩溃恢复凭证，覆盖每个提交窗口的重启测试。 |
| P1 可达性 | 前端缺 market.categoryItems，分类浏览坏；shop 面板显示 enabled 但生产请求 NOT_WIRED。 | 全量比较 Java handshake 与 TypeScript SERVER_ACTIONS，并让面板状态来自真实动作能力。 |
| P1 任务 | 无 TaCZ 时仍能抽到 daily/weekly ammo 目标。 | 生成任务池时按 ModList 过滤所有 TaCZ objective。 |
| P1 经济规则 | 重置费、每日 8 次与重入冷却只有定义，没有接入。 | 明确产品决策：接入入口事务，或从配置与面向玩家文档删除。 |
| P1 婚姻 | 离婚时离线配偶的旧婚戒登录后不回收。 | 登录 reconcile 增加幂等戒指回收，并覆盖离线离婚测试。 |
| P2 堆叠 | 掉落“批处理”没有合并相同 ItemStack；跨区块半径失效。 | 聚合相同物品后再生成实体；扫描候选覆盖相邻区块。 |
| P2 客户端 | 默认 URL 保持 localhost，与记录的公网部署不一致。 | 发布配置、服务器下发或安装文档必须明确唯一真源。 |
| P2 时间口径 | UTC faucet、服务器本地市场日、server gameTime 婚姻日并存。 | 所有 UI 明示各自日界线，避免玩家误判额度与冷却。 |

## 三十、关键源码索引

- 装配：src/main/java/com/miningdim/MiningDim.java；META-INF/mods.toml；build.gradle。
- 经济：src/main/java/com/miningdim/economy/Currency.java、EconomyConstants.java、ShopPriceTable.java、AbuseGuard.java、EconomyService.java、EconomySystem.java、EconomyCommands.java。
- 市场：src/main/java/com/miningdim/market/MarketEngine.java、MarketFee.java、MarketConstants.java、BaseValueResolver.java、DefaultBaseValues.java、MarketTradeWhitelist.java、MarketActions.java、MarketCategoryTree.java。
- 任务：src/main/java/com/miningdim/quest/QuestConfig.java、QuestPool.java、QuestService.java、QuestRewards.java、QuestItemRewards.java、QuestEventHooks.java、QuestTaczHooks.java、QuestSavedData.java。
- 婚姻：src/main/java/com/miningdim/marriage/MarriageEngine.java、MarriageRegistry.java、MarriageProposals.java、MarriageBackpackContainer.java、MarriageTeleport.java、MarriageDivorce.java、MarriageHistory.java、MarriageWebUiActions.java。
- 堆叠：src/main/java/com/miningdim/stacking/StackingConfig.java、StackingSystem.java、StackMerge.java、StackDeath.java、StackPassive.java、StackBreed.java、StackSplit.java。
- 存储：src/main/java/com/miningdim/store/MiningDb.java、MiningStore.java、MiningSchema.java、LegacyStoreImport.java，以及 economy/EconomyLedgerBootstrap.java。
- 网络与 WebUI：src/main/java/com/miningdim/network/MiningNetwork.java、C2SWebUiRequest.java、webui/server/WebUiServerDispatcher.java、WebUiBatchAction.java、client/webui/WebUiClient.java、WebUiBridge.java；前端合同为 webui/src/lib/actions.ts。
