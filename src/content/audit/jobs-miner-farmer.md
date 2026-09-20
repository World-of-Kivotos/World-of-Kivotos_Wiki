---
order: 70
name: 矿工与农夫职业审计
en: Miner and Farmer jobs
group: 职业
tagline: 核对矿工与农夫从职业框架、注册物、数值和交互入口到跨模块联动的实际接线状态。
facts:
  - label: 审计快照
    value: main@701093bd / 1.0.19
  - label: 职业 ID
    value: miner / farmer
  - label: 总体状态
    value: 已入包、已装配、玩家可达
  - label: 等级范围
    value: L1-L10，共享累计经验曲线
  - label: 配置状态
    value: 职业数值均为源码硬值，尚无 miner.* / farmer.* 服务端配置
---

本页只记录 Wok-Project 当前 main 的真实行为。矿工和农夫都不是“选一个职业”后才激活：玩家能力会为每个 JobId 懒建 L1、0 经验的进度，两个职业可以同时成长。两者的类与资源均已进入 miningdim-1.20.1-1.0.19-all.jar，并由主模组构造链装配；下文另外标出需要矿业维度、可选前置或客户端配置的条件入口，以及已经入包但只服务于测试的内容。

## 启动接线与可达性结论

:::table{mono="0,1"}
| 链路 | 当前 main 的实际接线 | 结论 |
| --- | --- | --- |
| MiningDim | registerSubsystems() 加入 JobFrameworkSystem、CombatSystem、MinerSystem、FarmerSystem；构造器逐个调用 register(modBus, forgeBus) | 四个子系统启动时都会装配 |
| JobFrameworkSystem | 注入 JobServices、注册玩家职业能力与同步、/job、job.progress、admin.job.setLevel | 共享等级、经验、命令和 WebUI 服务可达 |
| MinerSystem | 订阅 Forge 事件，注册矿工网络、HUD 状态与 job.miner.state / job.miner.scan | 在矿业维度实例区域内可实际游玩 |
| FarmerSystem | 注册方块、物品、创造页、全局战利品修改器、事件、/farmer 与两个 WebUI action | 配方、种植、收获和出售均有玩家入口 |
| EntryGateway | 进入 Easy / Medium / Hard 时读取 JobId.MINER，门槛分别为 L1 / L4 / L8 | MinerLevelGate 已被真实入口与 WebUI 入口共用 |
:::

> 核心证据：src/main/java/com/miningdim/MiningDim.java、job/JobFrameworkSystem.java、job/miner/MinerSystem.java、job/farmer/FarmerSystem.java、entry/EntryGateway.java。MinerLevelGate.java 顶部“未来再接入口”的注释已过期。

## 共享等级、存档与经验

- JobId 的精确小写 ID 是 miner 与 farmer；没有当前激活职业字段，所有玩家可同时拥有全部职业进度。
- 进度存在 MiningPlayerData 能力的 jobs NBT 下；矿工主动技能冷却另存 minerCooldowns，死亡复制玩家能力。
- 每日经验按 UTC 日分别累计。矿工走共享有效 XP 段：[0,2000) ×1、[2000,2800) ×0.4、[2800,3400) ×0.2、[3400,3800) ×0.08、3800 后 ×0.02。
- 农夫走独立有效 XP 段：[0,1500) ×1、[1500,1800) ×0.30、[1800,2000) ×0.10、[2000,2150) ×0.03、2150 后 ×0.005。边界位于当日有效 XP 轴，框架用 double 跨段累计。
- 源码把 setLevel 设置为该等级的累计 XP 断点。/job set <target> <job> <level> 与 admin.job.setLevel 都要求管理权限并限制 1-10。
- 普通命令为 /job list、/job info <job>、/job wallet；wallet 在源码中仍被标作临时调试入口。
- job.progress 恒返回 8 条职业记录，每条为 {jobId,level,totalXp,levelXp,nextLevelXp,dailyXp,dailyRemaining}；admin.job.setLevel 只接受在线玩家及 {playerName,jobId,level}。
- 进度内部以 double 保存。矿工等职业在读出时 floor，农夫在读出、派生等级与显示当日 XP 时 Math.round；系统没有自动等级奖励物品或升级仪式。

:::table
| 等级 | 达到本级的累计有效 XP | 从本级升下一级 |
| ---: | ---: | ---: |
| 1 | 0 | 3300 |
| 2 | 3300 | 3800 |
| 3 | 7100 | 4500 |
| 4 | 11600 | 5300 |
| 5 | 16900 | 6300 |
| 6 | 23200 | 7400 |
| 7 | 30600 | 8800 |
| 8 | 39400 | 10300 |
| 9 | 49700 | 12200 |
| 10 | 61900 | 满级 |
:::

> 权威源：job/JobId.java、JobXpCurve.java、JobXpPolicies.java、JobProgress.java、entry/MiningPlayerData.java。FarmerConstants.java 仍声称农夫使用共享 2000 系衰减，但运行期 JobXpPolicies 明确路由到 farmer/FarmerXpCurve.java 的 1500 系；这是文档与实现漂移。

## 农夫注册物与资源 ID

- 方块状态、作物 age0-age7 模型、物品模型、纹理、战利品表、配方、方块标签及 global_loot_modifiers.json 均进入生产 JAR。
- farmer_seed 与 farmer_wheat 的物品模型直接复用原版 wheat_seeds 与 wheat 外观；它们仍是独立注册物。
- 五个 FarmerFarmlandItem 的提示文本从实时档位表生成，显示解锁等级、成长分钟、原生小麦产量/小时、兼容作物倍率及副产物不放大的说明。
- 农夫没有独立容器菜单；主要入口是世界方块、物品、命令与远程 WebUI 面板。

:::table{mono="1"}
| 类别 | 精确 ID | 玩家用途 |
| --- | --- | --- |
| 作物方块 | miningdim:farmer_crop | 种在五档农夫耕地上的原生作物，年龄 0-7 |
| 种子 | miningdim:farmer_seed | 种植 farmer_crop |
| 收获物 | miningdim:farmer_wheat | 出售、市场估值、酿酒原料与熔炼原料 |
| 低级耕地 | miningdim:farmer_farmland_low | L1 档耕地及同 ID BlockItem |
| 中级耕地 | miningdim:farmer_farmland_medium | L3 档耕地及同 ID BlockItem |
| 高级耕地 | miningdim:farmer_farmland_high | L5 档耕地及同 ID BlockItem |
| 极品耕地 | miningdim:farmer_farmland_premium | L7 档耕地及同 ID BlockItem |
| 超凡耕地 | miningdim:farmer_farmland_supreme | L9 档耕地及同 ID BlockItem |
| 创造页 | miningdim:farmer | 展示种子、小麦与五档耕地 |
| 战利品修改器 | miningdim:farmer_crop_yield | 放大兼容作物的指定主产物 |
| 方块标签 | #miningdim:farmer_farmland | 原生作物可存活的五档土壤集合 |
:::

> 注册证据：job/farmer/block/FarmerBlocks.java、job/farmer/item/FarmerItems.java、FarmerCreativeTab.java、FarmerLootModifiers.java；资源位于 src/main/resources/assets/miningdim 与 data/miningdim。

## 农夫等级、耕地上限与产量

:::table
| 等级 | 本级最高已解锁档 | 全服跨维度放置上限 |
| ---: | --- | ---: |
| 1 | low | 9 |
| 2 | low | 12 |
| 3 | medium | 16 |
| 4 | medium | 20 |
| 5 | high | 25 |
| 6 | high | 30 |
| 7 | premium | 36 |
| 8 | premium | 42 |
| 9 | supreme | 48 |
| 10 | supreme | 64 |
:::

> 上限不是每区块或每领地，而是按玩家 UUID 统计所有维度的已认领农夫耕地坐标。权威源：FarmerConstants.FARMLAND_CAP_PER_LEVEL、FarmerSavedData、FarmlandPlacementGuard。

## 五档农夫耕地实测数值

- 原始 XP 公式为 SINGLE_CROP_XP 2 × 玩家对该档实际可用的产量。玩家未解锁脚下档位时，产量和 XP 退化到 1 倍与 2 XP。
- 成长由 random tick 概率推进七个阶段，目标是命中表中的期望成熟时间；randomTickSpeed 为 0 时完全停止。
- 农夫作物没有光照门槛，骨粉被完全取消且不消耗；兼容作物种在农夫土上时，骨粉事件同样被取消。
- 农夫耕地是普通 Block 而不是原版 FarmBlock：没有含水状态，也不会被踩坏；活塞反应为 BLOCK。
- 耕地支持 Forge PlantType.CROP，另显式允许 farmersdelight:rice；原生 farmer_crop 只能在 #miningdim:farmer_farmland 上存活。

:::table{mono="0"}
| tierId | 解锁 | 期望成熟时间 | 成熟产量倍率 | 每块每小时 | 每块 6 小时 | 成熟破坏原始 XP |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| low | L1 | 10 分钟 | 2 | 12 | 72 | 4 |
| medium | L3 | 8 分钟 | 3 | 22.5 | 135 | 6 |
| high | L5 | 6 分钟 | 4 | 40 | 240 | 8 |
| premium | L7 | 5 分钟 | 5 | 60 | 360 | 10 |
| supreme | L9 | 4 分钟 | 6 | 90 | 540 | 12 |
:::

> 权威源：FarmerTier.java、FarmerCropTable.java、FarmerCropBlock.java、block/FarmerFarmlandBlock.java、FarmerSystem.java。

## 农夫实际操作流程

1. 用 1 个 minecraft:wheat_seeds 无序合成 1 个 miningdim:farmer_seed。
2. 用 dirt 与 farmer_seed 合成 low 耕地；以后依次用铜锭、铁锭、金锭、钻石把上一档耕地升级到 medium、high、premium、supreme。
3. 达到对应农夫等级后放置耕地。玩家放置事件会先检查档位解锁，再检查本人全局上限，成功后把维度与坐标登记到主世界 SavedData。
4. 种植原生种子，或在该土壤上种受支持的原版、Farmer’s Delight 作物，等待自然随机刻成熟。
5. 破坏成熟作物获得原始职业 XP。原生作物额外由事件弹出 farmer_wheat；兼容作物由全局战利品修改器放大指定主产物。
6. 达到农夫 L2 后可用 /farmer sell <amount> 或 job.farmer.sell 出售背包中的 farmer_wheat。

## 农夫配方清单

- 配方本身不检查职业等级；高档耕地可以先合成或转交，但低于解锁等级的玩家放置时会被回滚。
- farmer_wheat 没有普通合成配方，只能从成熟原生农夫作物收获或由管理手段获得。

:::table{mono="0,1"}
| 结果 | 无序配方输入 |
| --- | --- |
| miningdim:farmer_seed ×1 | minecraft:wheat_seeds ×1 |
| miningdim:farmer_farmland_low ×1 | minecraft:dirt ×1 + miningdim:farmer_seed ×1 |
| miningdim:farmer_farmland_medium ×1 | miningdim:farmer_farmland_low ×1 + minecraft:copper_ingot ×1 |
| miningdim:farmer_farmland_high ×1 | miningdim:farmer_farmland_medium ×1 + minecraft:iron_ingot ×1 |
| miningdim:farmer_farmland_premium ×1 | miningdim:farmer_farmland_high ×1 + minecraft:gold_ingot ×1 |
| miningdim:farmer_farmland_supreme ×1 | miningdim:farmer_farmland_premium ×1 + minecraft:diamond ×1 |
:::

> 权威资源：src/main/resources/data/miningdim/recipes/farmer/*.json。

## 原生作物、兼容作物与 Farmer’s Delight

- 战利品修改器只放大表中的主产物堆叠，种子、稻草和稀有副产物不变；真实 ServerPlayer 才触发，FakePlayer 和非玩家破坏不触发。
- 稻与番茄竖向作物会向下最多查 4 格寻找农夫耕地。玩家未解锁该土壤档位时，兼容作物保持 1 倍。
- 成熟 Farmer’s Delight 番茄右键收获被本模组接管：原生 1-2 番茄数量乘以档位产量，另保留 5% rotten_tomato，重置 AGE_3 为 0 并结算 2×产量原始 XP。
- 原生 farmer_crop 的战利品表总会返还 1 粒 farmer_seed；成熟时另有一条受 Fortune 影响的种子项。farmer_wheat 不在该 loot table，而由 BreakEvent 单独生成。
- Farmer’s Delight 是 BOTH 侧可选依赖，版本范围 [1.20.1-1.2.0,)；未安装时注册 ID 比较不会阻止 MiningDim 启动。

:::table{mono="0,1"}
| 作物方块 ID | 会被倍率放大的产物 ID |
| --- | --- |
| minecraft:wheat | minecraft:wheat |
| minecraft:carrots | minecraft:carrot |
| minecraft:potatoes | minecraft:potato |
| minecraft:beetroots | minecraft:beetroot |
| farmersdelight:cabbages | farmersdelight:cabbage |
| farmersdelight:onions | farmersdelight:onion |
| farmersdelight:tomatoes | farmersdelight:tomato |
| farmersdelight:tomatoes_on_rope | farmersdelight:tomato |
| farmersdelight:rice_panicles | farmersdelight:rice + farmersdelight:rice_panicle |
:::

> 权威源：FarmerHarvests.java、FarmerHarvestLootModifier.java、FarmerSystem.onTomatoRightClick、data/miningdim/loot_modifiers/farmer_crop_yield.json、META-INF/mods.toml。

## 农夫出售、命令、WebUI 与经济联动

- 收购基础价为 1 信用点/株，前 2160 株/UTC 日按全价；之后公式为 floor(1 × max(0.01, 0.97^(n-2160)))。由于基础价仅 1，实际从第 2161 株起单价立即 floor 为 0，物品仍会被移除。
- 得到的毛额再进入全服共享 credit_faucet：每 60000 信用点一档、下一档乘 0.6、最终 1% 地板。农夫卖菜与矿工卖矿共用同一玩家每日主闸。
- 经济服务离线时不移除物品；若发款抛错，服务会把已移除的小麦退回背包，装不下则掉在玩家脚下，然后继续抛出异常。
- 每 UTC 日出售量与耕地所有权存于主世界 SavedData miningdim_farmer；NBT 包含 wheatSold、wheatSoldDay、farmlandOwners 和迁移用 legacyOverflow。
- 前端 FarmerPanel 已接 job.farmer.*，但源码注释错误地宣称没有出售等级门，L1 页面不会预先禁用出售。types.ts 的错误码联合也漏了 SELL_LEVEL_TOO_LOW；生产环境最终仍会显示服务端中文拒绝信息。
- 前端 mock 仍把 priceFloorRatio 写为 0.25，服务端真实值为 0.01。生产 bridge 会调用服务端，所以线上真实值不受 mock 影响。
- 出售 action 的业务拒绝码为 ECONOMY_OFFLINE、SELL_LEVEL_TOO_LOW、NOTHING_TO_SELL；字段形状错误走公共 INVALID_REQUEST。/farmer sell 的成功与失败反馈仍是硬编码英文。

:::table{mono="0"}
| 入口或字段 | 实际行为 |
| --- | --- |
| /farmer crops | 显示五档解锁、成长、产量与兼容提示 |
| /farmer sell <amount> | amount 最小 1；需 Farmer L2；只读取玩家背包中的 farmer_wheat |
| /farmer admin legacy <target> | 权限等级 2；查询旧存档迁移占用、总占用与当前上限 |
| /farmer admin recount <target> | 权限等级 2；清除目标的 legacyOverflow 迁移占用 |
| job.farmer.state | 返回 level、crop、soldToday、dailySoftCap、basePrice、priceFloorRatio、nextUnitPrice 和五档表 |
| job.farmer.sell | 输入 {count}；返回 soldCount、credited、soldToday、nextUnitPrice |
:::

> 权威源：FarmerWheatBuyback.java、FarmerWheatSellService.java、FarmerWebUiActions.java、FarmerSavedData.java、economy/EconomyConstants.java、webui/src/pages/jobs/panels/FarmerPanel.tsx、webui/src/lib/types.ts、webui/src/mock/bridge.mock.ts。

## 农夫跨模块消耗链

:::table{mono="0"}
| 模块 | 接线内容 |
| --- | --- |
| market | DefaultBaseValues 内置 miningdim:farmer_wheat 的 V0=1 |
| minecraft:smelting | farmer_wheat -> miningdim:dried_wheat，经验 0.1，cookingtime 100 |
| BRANDY | farmer_wheat 16 + apple 4 |
| VODKA | farmer_wheat 32 |
| GIN | farmer_wheat 16 + sugar 4 |
| RUM | sugar_cane 8 + farmer_wheat 16 |
| TEQUILA | carrot 8 + farmer_wheat 16 |
| MAOTAI | farmer_wheat 16 + wheat_seeds 8 |
| WHISKEY | farmer_wheat 24 |
| CHAMPAGNE | farmer_wheat 16 + sugar 4 + apple 2 |
| MOONSHINE | farmer_wheat 24 + sugar 8 |
:::

> 酿酒配方要求精确物品集合与计数，九种酒全部使用 mod 小麦而不是 minecraft:wheat。权威源：market/DefaultBaseValues.java、job/brewer/station/BrewRecipes.java、data/miningdim/recipes/brewer/dried_wheat.json。

## 矿工定位、经验与矿洞入口

- 矿工没有专属方块、物品、配方、创造页或容器菜单；玩法依附矿业维度、矿石、陷阱、压力、经济、按键、世界高亮与 HUD。
- 玩家在 miningdim:mining 内且 X/Z 命中一个 InstanceState 区域时，手动 BlockEvent.BreakEvent 每次发 10 原始 XP。当前实现不检查方块类型，石头和玩家放置的方块也给经验。
- Easy 需要矿工 L1，Medium 需要 L4，Hard 需要 L8；命令/方块入口与 WebUI overview/enter 均调用同一 MinerLevelGate。
- 玩家被 AFK 冻结时不发挖掘 XP，也不执行连锁和耐久节省。连锁与隧道额外破坏的方块不会重复发矿工 XP。
- MinerSystem 的 BreakEvent 处理器没有 isCanceled 检查，也不是 LOWEST。保护模组若在更低优先级才取消，玩家仍可能先拿到 XP，并能对同一受保护方块重试。

> 权威源：job/miner/MinerSystem.java、MinerLevelGate.java、entry/EntryGateway.java、entry/MiningWebUiActions.java。

## 矿工逐级里程碑

:::table
| 等级 | 新增或扩展能力 |
| ---: | --- |
| 1 | 挖速加成、省耐久、Easy 入口 |
| 2 | 连锁挖矿、自动入包 |
| 3 | 矿物探测；铁、煤、铝土 |
| 4 | Medium 入口、挖掘疲劳免疫、矿脉时运、耐压 |
| 5 | 陷阱探测、矿脉抗性；仅非致死陷阱 |
| 6 | 自动熔炼铁/铜；探矿加入钻石、硼砂、锡、银 |
| 7 | 脱险归途 |
| 8 | Hard 入口、自动熔炼金；致死陷阱；探矿加入金、远古残骸、镍、铬、钨 |
| 9 | 3×3×4 隧道挖、声东击西 |
| 10 | 各线性成长数值达到封顶 |
:::

## 矿工被动数值表

- 表中循环小数显示到 6 位；运行期用解锁等级到 L10 的 double 线性插值，不按表格显示值回写。
- 挖速只在矿业维度实例区域内乘到 BreakSpeed；L4 起检测到 DIG_SLOWDOWN 时先恢复至少原速度，再乘职业倍率。
- 省耐久通过同一服务端 tick 的主手物品伤害快照恢复实现，可与 Unbreaking 共存。
- 矿脉时运只用于连锁和隧道的额外方块，不影响普通单块和起始方块。它按每个非空掉落堆叠掷一次，成功时复制整个堆叠，并不再次核对矿物 ID。
- 耐压只缩放 Danger 的时间项。当前生产调用总是 activeInRegion=true，实际只减慢压力累积，不改变 zoneTerm。
- 矿脉抗性只减 FALLING_BLOCK、FALLING_STALACTITE、FALLING_ANVIL、LAVA、IN_FIRE、ON_FIRE、HOT_FLOOR 及非玩家爆炸；不减 PLAYER_EXPLOSION、怪物、玩家、弹射物和普通摔伤。

:::table
| L | 挖速倍率 | 省耐久 | 矿脉时运额外期望 | Danger 时间系数 | 陷阱减伤 |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 1.150 | 5% | 未解锁 | 1.000 | 未解锁 |
| 2 | 1.255556 | 7.777778% | 未解锁 | 1.000 | 未解锁 |
| 3 | 1.361111 | 10.555556% | 未解锁 | 1.000 | 未解锁 |
| 4 | 1.466667 | 13.333333% | 8% | 0.850000 | 未解锁 |
| 5 | 1.572222 | 16.111111% | 15% | 0.808333 | 10% |
| 6 | 1.677778 | 18.888889% | 22% | 0.766667 | 15% |
| 7 | 1.783333 | 21.666667% | 29% | 0.725000 | 20% |
| 8 | 1.888889 | 24.444444% | 36% | 0.683333 | 25% |
| 9 | 1.994444 | 27.222222% | 43% | 0.641667 | 30% |
| 10 | 2.100 | 30% | 50% | 0.600000 | 35% |
:::

> 权威源：MinerConstants.java、MinerSkills.java、MinerSurvival.java、combat/PlayerDamageReduction.java、danger/Danger.java、pressure/MobPressureSystem.java。

## 矿工主动技能精确数值

- 20 tick = 1 秒。矿物/陷阱高亮脉冲为 160 tick，二者单次最多返回 64 个坐标。
- 脱险归途读条 60 tick；离起点位移平方超过 0.36 或读条中受伤就中断且不进 CD。
- 声东击西把本实例 spawnFreezeUntil 推后 100 tick，即 5 秒。
- 连锁按住心跳每 20 tick 上报，服务端宽限 30 tick；预览最多每 10 tick 请求一次，结果 15 tick 过期。

:::table{mono="1,2,3,4,5,6"}
| L | 连锁池 / 整池回满 | 矿探半径 / CD | 陷阱探测半径 / CD | 归途 CD | 隧道 CD | 声东击西 CD |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | - | - | - | - | - | - |
| 2 | 16 / 6000t | - | - | - | - | - |
| 3 | 20 / 5775t | 6 / 6000t | - | - | - | - |
| 4 | 24 / 5550t | 7 / 5657t | - | - | - | - |
| 5 | 28 / 5325t | 9 / 5314t | 6 / 4800t | - | - | - |
| 6 | 32 / 5100t | 10 / 4971t | 7 / 4440t | - | - | - |
| 7 | 36 / 4875t | 12 / 4629t | 8 / 4080t | 9600t | - | - |
| 8 | 40 / 4650t | 13 / 4286t | 10 / 3720t | 8400t | - | - |
| 9 | 44 / 4425t | 15 / 3943t | 11 / 3360t | 7200t | 600t | 6000t |
| 10 | 48 / 4200t | 16 / 3600t | 12 / 3000t | 6000t | 400t | 4200t |
:::

> 所有整型插值最终使用 Java Math.round。权威源：MinerConstants.java 与 MinerSkills.java。

## 矿工按键、网络、HUD 与 WebUI

- 八个矿工按键默认全部是 GLFW_KEY_UNKNOWN，即未绑定；普通玩家第一次使用前必须在控制设置中绑定。没有 /miner 命令。
- 原生 HUD 只在矿业维度显示，F1 隐藏；左上角展示充能、连锁按住状态、自动入包/熔炼以及矿探/陷阱探测的就绪、CD 或锁定状态。服务端每 10 tick 推一次状态。
- 世界高亮颜色为矿物绿色、陷阱红色、连锁预览青色。探测脉冲和连锁预览是两套独立槽。
- job.miner.state 返回 level、charge、chargeMax、miningFatigueImmune、三个 toggle、矿探半径/CD 与六项 passive；job.miner.scan 返回矿物 ID、描述键、坐标、半径、脉冲和剩余 CD。
- 三个 toggle ID 是 chain、auto_collect、auto_smelt；六个 passive ID 是 dig_speed、durability_save、fortune_extra、danger_time_factor、trap_damage_reduction、chain_refill_full。探矿拒绝码为 SKILL_LOCKED 与 SKILL_ON_COOLDOWN。
- WebUI 只提供状态与矿物探测；陷阱探测、隧道、归途、声东击西及三个开关仍必须靠按键。
- MCEF 是客户端可选依赖 [2.1.6,)；未安装时职业服务器逻辑和原生 HUD/按键仍可用，但远程 WebUI 不可用。client 配置 webui.url 默认 http://localhost:5173/，生产客户端必须改成实际托管地址。

:::table{mono="0,1"}
| 入口 | 精确 ID 或契约 |
| --- | --- |
| 按键 | key.miningdim.miner.ore_scan / trap_scan / tunnel / evacuate / decoy / chain / auto_collect / auto_smelt |
| 网络频道 | miningdim:miner，协议 1 |
| 包 0 | MinerToggleC2S |
| 包 1 | MinerHighlightS2C |
| 包 2 | MinerStatusS2C |
| 包 3 | MinerChainHoldC2S |
| 包 4 | MinerChainPreviewC2S |
| 包 5 | MinerChainPreviewS2C |
| WebUI 读状态 | job.miner.state |
| WebUI 探矿 | job.miner.scan，空 payload |
:::

> 权威源：MinerKeyMappings.java、MinerNetwork.java、client/MinerHudOverlay.java、client/MinerHighlightRenderer.java、MinerWebUiActions.java、config/MiningClientConfig.java、META-INF/mods.toml。MinerNetwork 的“三个包”注释已过期，注册表实际有六个包。

## 连锁、隧道、探测与便利技能的真实边界

- 连锁从起始块做六方向 BFS，只扩展到同一个 Block 实例；额外块数上限等于当前充能。要求 #minecraft:mineable/pickaxe、工具能正确掉落、destroySpeed 非负且无 BlockEntity。
- 连锁充能新状态从 0 开始，首次 tickRecharge 只建立时间锚点；只给矿业维度在线玩家回充。离开矿业维度、死亡或重新登录都会把充能和开关清零。
- 已被该玩家探明的陷阱不会进入连锁；未探明陷阱仍显示为普通预览，执行时触发陷阱且不掉落、不发 XP、不扣连锁充能，避免预览泄露陷阱。
- 隧道沿玩家水平朝向处理 3×3 横截面、深 4，最多 36 个位置；不要求和起始块同类型，也不消耗连锁充能。即使最终破坏 0 个块也会开始 CD。
- 自动入包 L2 起只作用于连锁/隧道额外掉落；背包装不下时掉在脚下。自动熔炼被嵌套在自动入包路径里，关闭自动入包时自动熔炼没有效果。
- 自动熔炼 L6 允许 iron_ingot 与 copper_ingot，L8 再允许 gold_ingot；先查原版 smelting recipe，再以结果白名单做 1:1 转换。普通手挖掉落不受影响。
- 连锁/隧道的每块掉落在时运后按实际物品数回放到 EconomyServices.recordMinedOreDrops；高价矿与普通手挖共用隐藏每日矿物计数，普通块、AFK 冻结或零产出由经济门面忽略。
- 脱险归途成功后返回进入前保存的维度和坐标，缺失时回主世界出生点，并退出实例、清理矿业状态后开始 CD；再次按键可主动取消读条。
- 主动技能 CD 使用能力里的枚举名持久化，退出和死亡后保留；瞬态充能、按住态、开关和读条不保留。

> 权威源：ChainMiningEngine.java、MinerActions.java、MinerChargeState.java、AutoCollectSmelt.java、MinerSystem.java。

## 矿物与陷阱探测清单

- 矿探在球形半径内读取真实、已加载的服务端方块；一次只返回优先序中第一个有命中的矿种，未加载区块不会被强制加载。
- 虽然 OreType 还定义铜、红石、青金石和绿宝石，allowedOres 没有把它们加入任何矿工等级，因此矿工探测不到这些矿。
- 矿物探测明确检查 miningdim:mining 与实例区域；无命中也会消耗 CD。
- 陷阱探测只读取 TrapRegistry 的静态陷阱并为当前玩家标记 revealed；动态陷阱不在结果里。该路径缺少显式维度检查，只按 X/Z 查实例区域后扫描玩家当前 ServerLevel，并同样会消耗 CD。

:::table{mono="1"}
| 解锁档 | 单次选择优先序与精确方块范围 |
| --- | --- |
| L3 | minecraft:iron_ore / minecraft:deepslate_iron_ore -> minecraft:coal_ore / minecraft:deepslate_coal_ore -> miningdim:bauxite_ore / miningdim:deepslate_bauxite_ore |
| L6 追加 | minecraft:diamond_ore / minecraft:deepslate_diamond_ore -> miningdim:borax_ore / miningdim:deepslate_borax_ore -> miningdim:tin_ore / miningdim:deepslate_tin_ore -> miningdim:silver_ore / miningdim:deepslate_silver_ore |
| L8 追加 | minecraft:gold_ore / minecraft:deepslate_gold_ore -> minecraft:ancient_debris -> miningdim:nickel_ore / miningdim:deepslate_nickel_ore -> miningdim:chromium_ore / miningdim:deepslate_chromium_ore -> miningdim:tungsten_ore / miningdim:deepslate_tungsten_ore |
| 陷阱 L5-L7 | collapsing_tunnel、fake_ore |
| 陷阱 L8-L10 | 再加入 tnt_vein、lava_pocket |
:::

> 权威源：OreScanService.java、ore/OreType.java、TrapScanService.java、trap/TrapRegistry.java。

## 已确认缺陷、绕过面与接口漂移

:::table
| 级别 | 对象 | 当前事实 |
| --- | --- | --- |
| Major | 农夫出售 | 基础价 1 与 floor 后取整叠加，超过 2160 株后仍删物品但每株入账 0 |
| Major | 农夫放置 | 非 ServerPlayer 放置直接绕过等级、上限和所有权登记；自动化或管理工具可生成无限未认领耕地 |
| Major | 农夫自动化 | 收获事件和番茄右键只检查 ServerPlayer，FakePlayer 是其子类，仍可触发原生 farmer_wheat 与 XP；只有兼容作物的战利品倍率显式排除了 FakePlayer |
| Major | 农夫所有权 | 所有权只用于计数，没有内置禁止他人破坏或收获；需外部领地保护 |
| Major | 矿工 XP | 任意实例区域方块都给 10 原始 XP，FakePlayer 同样满足 ServerPlayer 判定，且处理器可能早于保护模组取消事件 |
| Major | 连锁/隧道破坏 | 额外块走 ServerLevel.destroyBlock 与手动掉落，不触发逐块 Forge BreakEvent，也不消耗手持工具耐久 |
| Major | 连锁预览 | C2S 直接信任客户端 BlockPos；服务端没有射线、触及距离、同区块或加载距离校验，可远程请求 BFS 预览并造成读块/X-ray 风险 |
| Major | 陷阱探测 | 缺少矿业维度门；X/Z 恰好落入实例盒时可能在玩家当前维度扫描 TrapRegistry 坐标 |
| Minor | 矿工 WebUI | state 报的是 MinerSkill.CHAIN toggle，但真实按住状态是 chainHeldActive；生产代码从不设置该 toggle，面板始终显示 false，原生 HUD 正常 |
| Minor | 农夫 WebUI | 前端漏 L2 出售门和 SELL_LEVEL_TOO_LOW 类型，mock 价格地板 0.25 与服务端 0.01 不一致 |
| Minor | 配置 | 所有 MinerConstants、FarmerTier、放置上限及收购参数均为硬编码；中央 MiningServerConfig 没有 miner.* 或 farmer.* |
| Minor | 过期注释 | 农夫经验 2000 系、MinerLevelGate 未接线、MinerNetwork 三包、矿工状态全瞬态等注释均与运行期不符 |
:::

## 入包但不应算作玩家功能

- FarmerGameTests 40 条、FarmerWebUiGameTests 10 条、MinerGameTests 29 条、MinerWebUiGameTests 14 条、OreScanPassGameTests 4 条，共 97 条 GameTest。它们位于 src/main/java，因此测试类及辅助内部类也进入生产全量 JAR。
- data/miningdim/structures/empty.nbt 是 GameTest 模板资源，随 JAR 入包，但不是自然生成结构或正式玩法入口。
- MinerSurvival.reducedDamage 只有测试调用；生产减伤经 PlayerDamageReduction 注册的“矿脉抗性”来源结算。
- MinerChargeState.setCharge 只有测试调用；生产没有初始满充注入，首次进入从 0 充能。
- /job wallet 物理可达，但源码明确把它标作临时调试命令，不应包装成正式职业机制。

> JAR 证据：build/libs/miningdim-1.20.1-1.0.19-all.jar 中存在 com/miningdim/job/farmer、job/miner 的生产类、GameTests 类与 data/miningdim/structures/empty.nbt。

## 源码复核索引

:::table{mono="1"}
| 主题 | 关键路径 |
| --- | --- |
| 主注册链 | src/main/java/com/miningdim/MiningDim.java |
| 共享职业 | src/main/java/com/miningdim/job/JobFrameworkSystem.java、JobProgress.java、JobXpCurve.java、JobXpPolicies.java |
| 农夫总入口 | src/main/java/com/miningdim/job/farmer/FarmerSystem.java |
| 农夫注册物 | job/farmer/block/FarmerBlocks.java、FarmerCropBlock.java、FarmerFarmlandBlock.java、item/FarmerItems.java |
| 农夫收益 | job/farmer/FarmerTier.java、FarmerXpCurve.java、FarmerWheatBuyback.java、FarmerWheatSellService.java |
| 农夫联动 | job/farmer/FarmerHarvests.java、FarmerHarvestLootModifier.java、job/brewer/station/BrewRecipes.java |
| 矿工总入口 | src/main/java/com/miningdim/job/miner/MinerSystem.java、MinerActions.java |
| 矿工数值 | job/miner/MinerConstants.java、MinerSkills.java、MinerLevelGate.java |
| 矿工破坏 | job/miner/ChainMiningEngine.java、MinerFortune.java、AutoCollectSmelt.java |
| 矿工探测 | job/miner/OreScanService.java、TrapScanService.java、ore/OreType.java |
| 矿工客户端 | job/miner/client/MinerKeyMappings.java、MinerHudOverlay.java、MinerHighlightRenderer.java |
| 职业 WebUI | job/farmer/FarmerWebUiActions.java、job/miner/MinerWebUiActions.java、webui/src/pages/jobs/panels |
:::
