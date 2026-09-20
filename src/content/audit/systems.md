---
order: 20
name: 全部装配功能与入口
en: Subsystem inventory
group: 证据
tagline: 按唯一 @Mod 入口反查 36 个已装配子系统，并汇总命令、WebUI 动作和配置边界。
facts:
  - label: 已装配子系统
    value: '36'
  - label: Subsystem 实现
    value: '37'
  - label: 静态 WebUI 动作
    value: '70'
  - label: Forge 配置文件
    value: '12'
  - label: 主包 class
    value: '1444'
---

下表不是按目录名猜功能，而是从 MiningDim.registerSubsystems() 的实际装配顺序反向核对。除特别标注外，列出的系统都会在 miningdim 启动时注册；是否能被普通玩家使用，还要继续看配置门、外部前置与发放入口。

## 36 个已装配子系统

:::table{mono="1"}
| 序 | 子系统 | 负责内容 | 状态 |
| ---: | --- | --- | --- |
| 1 | MiningStoreSubsystem | 统一 SQLite 连接、事务边界与 schema 迁移 | 已接线 |
| 2 | ConfigSystem | 中央服务端/客户端配置与一致性校验 | 已接线 |
| 3 | NetworkSystem | 主网络频道、职业/危险度/WebUI 数据包 | 已接线 |
| 4 | WorldgenSystem | 矿洞维度 BiomeSource codec 与数据包世界生成 | 已接线 |
| 5 | InstanceSystem | 实例网格、SavedData、生命周期与垃圾回收 | 已接线 |
| 6 | ChunkSystem | 活跃实例区块票据与强加载窗口 | 已接线 |
| 7 | ResetSystem | 手动/定时重置、二次确认与撤离 | 已接线 |
| 8 | SpawnSystem | 安全出生点扫描与进入落点 | 已接线 |
| 9 | OreSystem | 矿物表、离线铺设与掉落统计接缝 | 已接线 |
| 10 | TrapSystem | 静态假矿与动态塌方、熔岩、背后苦力怕 | 已接线 |
| 11 | PressureSystem | 危险度计算、刷怪压力与客户端同步 | 已接线/有已知缺口 |
| 12 | EconomySystem | 双货币钱包、每日闸门、矿物出售与账本 | 已接线 |
| 13 | RulesSystem | 矿洞维度方块放置白名单 | 已接线 |
| 14 | ErrorSystem | 边界兜底、维度自检与错误提示 | 已接线 |
| 15 | EntrySystem | 玩家能力、/mining、进入/离开/登录恢复 | 已接线 |
| 16 | EntranceSystem | 三难度入口方块、方块实体与创造页 | 已接线 |
| 17 | PowerSystem | 能源矿物、线缆、发电机、机器与压力容器 | 已接线/有已知缺口 |
| 18 | JobFrameworkSystem | 8 职业进度、等级经验、共享效果与 /job | 已接线 |
| 19 | CombatSystem | 玩家减伤源的统一乘法结算 | 已接线 |
| 20 | MinerSystem | 矿工挖掘、探矿、连锁与技能 | 已接线 |
| 21 | FarmerSystem | 农夫耕地、作物、成长与出售 | 已接线 |
| 22 | EngineerSystem | 铸甲师生产台、纳米板、板甲与等离子盾 | 已接线/部分生存不可达 |
| 23 | TarotSystem | 塔罗数据包、抽包、合成、打出牌与牌效 | 已接线 |
| 24 | ChefSystem | 调味台 QTE、品质、菜肴 NBT 与效果 | 已接线/有已知缺口 |
| 25 | MunitionsSystem | 军火台、制弹与默认关闭的枪匠线 | 已接线/部分不可达 |
| 26 | ChampionSystem | 自研 1–10 星精英、35 词缀、血池与奖励 | 已接线 |
| 27 | AgentSystem | 特勤扫描、封印、增伤与贡献奖励 | 已接线/依赖 WebUI 入口 |
| 28 | BrewerSystem | 酿酒台、酒窖、陈酿、饮酒与永久增益 | 已接线 |
| 29 | MarriageSystem | 订婚、婚礼、共享背包、传送、离婚 | 已接线 |
| 30 | StackingSystem | 同类实体堆叠、持久化与产出倍增 | 已接线 |
| 31 | WebUiServerSubsystem | 服务端权威 WebUI 网关、握手、批处理与 hub | 已接线 |
| 32 | CaseOpeningSystem | 双币开箱、SQLite Saga、皮肤归属与应用 | 条件可用：TaCZ |
| 33 | MarketSubsystem | P2P 挂单、托管成交、手续费与离线待结 | 已接线 |
| 34 | QuestSystem | 每日、每周、特殊、隐藏任务与领奖 | 已接线；枪械事实需 TaCZ |
| 35 | EnchantmentSystem | 金钱修补附魔与信用点自动维修 | 已接线 |
| 36 | WebUiClientSubsystem | MCEF 浏览器宿主、G 键入口与客户端桥 | 条件可用：MCEF |
:::

## 当前有效命令入口

:::table{mono="0,1"}
| 根命令 | 主要子命令 | 边界 |
| --- | --- | --- |
| /mining | enter, leave, info, reset | 唯一权威矿洞命令树；旧 command 包未装配 |
| /economy | grant | OP 经济调试/管理入口 |
| /job | list, info, wallet, set | set 需要权限等级 2 |
| /mchampion | summon | 精英怪管理/测试入口 |
| /farmer | crops, sell, admin | 农夫作物与出售入口 |
| /tarot | consent, exchange, pack | 同意、卡牌交换与卡包购买 |
| /marriage | buyring, propose, accept, reject, withdraw, wed, divorce | 婚姻完整流程 |
| /quest | list, claim, turnin, refresh | 任务板的命令替代入口 |
| /miningdim-webui-dev | - | 客户端开发页；需 MCEF |
| /wokcase | - | 客户端打开内置开箱页；需 MCEF |
:::

> com.miningdim.command.CommandSystem 的另一套 /mining 虽然物理入包，但没有加入主类，不能按其中的 party/status/list/tp/kick/trap 子命令编写玩家教程。

## WebUI 服务端动作

:::table{mono="2"}
| 域 | 数量 | 动作 |
| --- | ---: | --- |
| 系统与 hub | 5 | system.echo, system.handshake, system.serverStatus, system.batch, hub.panels |
| 矿洞与管理 | 5 | mining.overview, mining.myStatus, mining.enter, mining.leave, admin.mining.reset |
| 职业与管理 | 17 | job.progress；miner 2；farmer 2；engineer 1；tarot 2；chef 1；munitions 2；agent 3；brewer 1；admin.job.setLevel |
| 经济与玩家 | 13 | economy 3；player 8；admin.economy 2 |
| 市场与管理 | 15 | market 13；admin.setBaseValue；admin.listItems |
| 婚姻 | 7 | marriage.state, buyRing, propose, respond, wed, divorce, sharedInv |
| 任务 | 4 | quest.board, quest.claim, quest.turnIn, quest.refresh |
| 精英怪 | 2 | champion.codex, champion.inspect |
| 开箱 | 3 | case.state, case.open, case.apply |
:::

> 动作总数是静态注册表口径。外部 React 前端是否调用到每一个动作是另一层契约，不能用“后端有 action”替代端到端可玩性。

## 游戏内 WebUI 的真实边界

- 客户端默认按 G 打开单例 WebUI；MCEF 未安装时只显示不可用提示，不影响服务端玩法。
- 客户端配置 webui.url 默认是 http://localhost:5173/，生产整合包必须覆盖成实际托管地址。
- webui/src 与 webui/dist 不在根 Gradle sourceSet，React 页面不会随 miningdim JAR 打包。
- JAR 内唯一完整 HTML 是 assets/miningdim/web/case-opening.html，用于每次重播的开箱动画。
- 服务端 C2S/S2C 网关、鉴权、动作白名单和 70 个动作会入包；页面展示层属于外部部署。

## 实际注册的配置文件

:::table{mono="0"}
| 文件 | 范围 |
| --- | --- |
| miningdim-server.toml | 实例、矿物、难度、陷阱、压力、刷怪、入口、重置、婚姻、性能 |
| miningdim-client.toml | 危险度显示、实例 HUD、WebUI URL/缩放/覆盖率 |
| miningdim-case-opening.toml | 开箱价格、幂等与展示节奏 |
| miningdim-money-mending.toml | 金钱修补频率与收费 |
| miningdim-power.toml | 发电、网络、机器与能源数值 |
| miningdim-quest.toml | 任务分配、重摇、奖励与限制 |
| miningdim-stacking.toml | 扫描周期、合并范围、排除项与倍增开关 |
| miningdim-brewer.toml | 酿造、陈酿、品质与饮酒效果 |
| miningdim-chef.toml | 调味台 QTE、品质、费用与效果 |
| miningdim-tarot.toml | 卡包、牌效、交换与冷却 |
| miningdim-munitions.toml | 制弹、军火台与默认关闭的 gunsmithEnabled |
| miningdim-engineer.toml | 生产台、纳米板、板甲与等离子盾 |
:::

## 物理入包但不应算玩家功能

- 全库 37 个 Subsystem 实现中，只有旧 CommandSystem 未装配。
- GameTest 与 testutil 位于 src/main/java，因而会进入发布 JAR；它们是验证设施，不是玩法入口。
- standalone/kivotos-armorer 是独立 Gradle 工程和独立 modId，不属于 miningdim。
- WOK-ChestShop 位于另一个仓库，是伴生 mod，不是主 JAR 自带商店。
- 空军、组队、Flux Networks 终局等只存在于设计或历史记忆，当前 main 不列为实现。
