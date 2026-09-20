---
order: 30
name: 矿洞玩法与运行链路
en: Mining gameplay audit
group: 玩法
tagline: 从入口、实例与世界生成一路核到矿物、陷阱、压力、撤离、重置和边界规则，并区分真实可达链与入包死代码。
facts:
  - label: 审计快照
    value: main@701093bd8492
  - label: 维度 ID
    value: miningdim:mining
  - label: 实例模型
    value: 每难度 1 个永久共享区域
  - label: 区域默认尺寸
    value: 256 x 192 x 256
  - label: 实际生成器
    value: minecraft:noise
  - label: 动态陷阱
    value: 已入包但调度不可达
---

当前 main 的真实矿洞不是“为每名玩家离线生成一张私有地图”，而是一座静态数据包维度：Easy、Medium、Hard 各有一个全服共享的常驻区域，原版 noise 生成器在区块被加载时按需雕洞、铺矿和布静态陷阱。玩家通过三种入口方块、/mining enter 或 WebUI 进入，采掘期间由独立压力系统主动刷怪，最后主动撤离或由重置流程清场。本页同时保留已确认的不可达链和缺陷，不能把入包类、旧注释或 Claude 工作区里的规划直接当成现行玩法。

## 玩家实际可走的完整循环

1. 在主世界右键或踩上 miningdim:entrance_easy、miningdim:entrance_medium、miningdim:entrance_hard，或者执行 /mining enter <easy|medium|hard>；WebUI 的 mining.enter 也汇入同一个 EntryGateway。
2. 服务端检查矿工职业等级与该难度的 CREDIT 入场费。默认三档费用均为 0；门槛分别为矿工 L1、L4、L8。
3. InstanceManager 把请求路由到该难度唯一的永久共享实例，不创建个人副本，也不按队伍分配新图。
4. EntryGateway 最多等待实例就绪 200 tick，再强加载区域中心 3 x 3 区块并最多等待 FULL 状态 200 tick。
5. SpawnSystem 从安全点池选点；池不足时在 Y=49 附近建 3 x 3 石头平台并清理头顶空间。入场后有 200 tick 出生压力冻结。
6. 区块按玩家位置维持默认 9 x 9 加载窗，其中 5 x 5 为 ticking；窗口始终裁在所属 region 内。
7. 玩家挖原版矿和能源矿；静态伪装矿可能触发爆炸、岩浆或落砂。压力 danger 随难度与停留时间上升，显式刷怪链仍可运行。
8. 执行 /mining leave 或 WebUI mining.leave 回到进入前记录的维度与方块坐标。强制重置会先撤离在场玩家。
9. 重置不会在原地清空重生，而是把该难度的 region 横向滑到未生成过的新坐标；新区块之后仍由 minecraft:noise 按需生成，旧区块进入分批磁盘回收队列。

> “动态陷阱”和“定时自动重置”虽然都有完整业务类，但当前调度器存在 Long.MIN_VALUE 溢出，实际首轮永远不能通过；不能写成玩家可用功能。

## 启动接线与单一权威链

com.miningdim.command.CommandSystem 没有加入 MiningDim.registerSubsystems，因此同名旧命令树虽在 JAR 中却不会注册。当前唯一有效命令树是 com.miningdim.entry.MiningCommands。

自定义 ChunkGenerator、OfflineCaveGenerator 和 GenerationScheduler 已下线。WorldgenSystem 只注册 BiomeSource Codec，不启动离线生成线程。

:::table{mono="1"}
| 顺序 | 子系统 | 当前职责与可达性 |
| --- | --- | --- |
| 3 | WorldgenSystem | 注册 miningdim:mining_biome_source Codec；维度本体由数据包加载 |
| 4 | InstanceSystem | 重建 MiningSavedData，并保证三难度各一个固定实例 |
| 5 | ChunkSystem | 强加载窗口、空置降级与 300 秒后撤票 |
| 6 | ResetSystem | 手动重置、滑区和退役区块回收；自动调度当前失效 |
| 7 | SpawnSystem | 安全点池和兜底平台 |
| 8 | OreSystem | 完成注册，但旧离线铺矿表没有生产调用方 |
| 9 | TrapSystem | 静态陷阱转换与触发可达；动态陷阱评估被首轮节流缺陷锁死 |
| 10 | PressureSystem | danger、S2C 同步和主动刷怪可达，并把读取器注入陷阱引擎；可视 HUD 消费端缺失 |
| 12 | RulesSystem | 放置白名单、重生点禁令、Hard 死亡背包转掉落 |
| 13 | ErrorSystem | 启动时记录维度是否加载；多数旧生成兜底 helper 无调用方 |
| 14 | EntrySystem | 唯一有效的 /mining 命令树、Capability、进入/离开/登录恢复和 WebUI action |
| 15 | EntranceSystem | 入口方块实体与创造栏；入口方块本身由基础 registry 注册 |
:::

## 维度与数据包注册链

- 维度范围为 Y=-64..127，height=192，logical_height=192；无天光、有顶棚、床和重生锚均不可用、非自然维度、坐标缩放 1.0。
- 默认方块是 minecraft:stone，默认流体是 minecraft:air；final_density=1 先形成实心体，再由 cave、cave_extra_underground 和 canyon 雕刻。
- 海平面为 -65，aquifers_enabled=false，ore_veins_enabled=false；不会生成原版含水层或大矿脉系统。
- 底部 0..5 格与顶部 5..0 格使用随机基岩渐变；mining_wall 整列由 surface rule 替换为基岩且没有 carver 或 feature。
- Hard 整列基材为深板岩；Medium 在绝对 Y<=24 为深板岩、Y>=40 为石头，中间 24..40 随机过渡；Easy 保持石头。

:::table{mono="1,2"}
| 对象 | 注册 ID / 值 | 证据路径 |
| --- | --- | --- |
| Level 与 DimensionType | miningdim:mining | data/miningdim/dimension/mining.json；dimension_type/mining.json |
| 生成器 | minecraft:noise | data/miningdim/dimension/mining.json |
| Noise settings | miningdim:mining | data/miningdim/worldgen/noise_settings/mining.json |
| BiomeSource Codec | miningdim:mining_biome_source | registry/ModRegistration.java；worldgen/MiningBiomeSource.java |
| 难度群系 | miningdim:mining_easy / mining_medium / mining_hard | data/miningdim/worldgen/biome/mining_*.json |
| 墙体群系 | miningdim:mining_wall | data/miningdim/worldgen/biome/mining_wall.json |
| 生成资源并包 | sourceSets.main.resources += src/generated/resources | build.gradle:78 |
:::

## 默认 region 几何与边界

- 默认 regionSizeChunks=16，即 256 格边长；bufferChunks=2，即相邻初始区域间有 32 格实心基岩带，stride=288。
- RegionBox 的 XZ 范围是左闭右开；regionAt 不检查 Y，也不检查维度，调用方必须先核维度。
- 没有独立 WorldBorder、移动事件或传送事件把玩家钳回 region。正常生存依靠基岩墙封闭；若借外部传送越界，Capability 仍可能把玩家记在原实例。
- 重置共用单向 X 游标。新存档首个滑区原点默认 X=1856，之后每次推进 256+1024=1280 格；硬上限为 X=25,000,000。

:::table{mono="5"}
| 区域 | 难度序号 | 初始 X | 初始 Z | Y | 群系 |
| --- | ---: | --- | --- | --- | --- |
| Easy | 0 | 0..255 | 0..255 | -64..127 | miningdim:mining_easy |
| Medium | 1 | 288..543 | 0..255 | -64..127 | miningdim:mining_medium |
| Hard | 2 | 576..831 | 0..255 | -64..127 | miningdim:mining_hard |
| 缓冲带/其余坐标 | - | region 外 | region 外 | -64..127 | miningdim:mining_wall |
:::

## 三档地形与资源构成

- 六种共有杂项依次为 miningdim:misc_andesite、misc_granite、misc_diorite、misc_tuff、misc_dirt、misc_gravel，排在矿石之前。
- 安山岩、花岗岩、闪长岩各 2 次/区块，统一 Y=above_bottom 8..below_top 8；泥土 4 次，沙砾 8 次，范围相同。凝灰岩 2 次，Y=above_bottom 0..64。
- 紫水晶洞为 1/24 区块，Y=above_bottom 8..below_top 16，仅 Medium/Hard；Hard 岩浆泉为 12 次/区块，同一高度范围。
- 四个 biome 的自然 spawner 列表全部为空。怪物房仍能带刷怪笼，压力系统另行显式生成怪物。
- Hard 当前没有 deep_dark 群系、sculk feature、ancient_city 或 Warden 注册；Claude 记忆中的深暗玩法是规划，不是 main 现状。

:::table{mono="2,3,4"}
| 难度 | 地下结构与杂项 | 原版矿 placed feature | 自定义矿 | 静态陷阱 |
| --- | --- | --- | --- | --- |
| Easy | monster_room；monster_room_deep；六种杂石 | ore_coal_upper；ore_coal_lower；ore_iron_upper；ore_iron_middle；ore_iron_small；ore_copper | ore_bauxite_easy | trap_fake_ore；trap_collapsing_tunnel |
| Medium | misc_amethyst_geode；两个 monster_room；六种杂石 | ore_coal_lower；ore_iron_middle；ore_iron_small；ore_copper_large；ore_gold；ore_redstone；ore_lapis | ore_bauxite_medium；ore_borax_medium；ore_tin_medium；ore_silver_medium | 四类全部 |
| Hard | misc_amethyst_geode；两个 monster_room；六种杂石；misc_spring_lava | ore_iron_middle；ore_gold；ore_gold_lower；ore_redstone_lower；ore_lapis_buried；三种 diamond | ore_ancient_debris；ore_emerald；七种能源矿 hard | 四类全部 |
:::

## 原版矿物的真实参数

:::table{mono="0"}
| placed feature | 使用难度 | 矿脉与暴露丢弃 | 频率 | 高度分布 |
| --- | --- | --- | --- | --- |
| minecraft:ore_coal_upper | Easy | size 17；discard 0 | 30/区块 | uniform absolute 136..top |
| minecraft:ore_coal_lower | Easy/Medium | size 17；discard 0.5 | 20/区块 | triangle absolute 0..192 |
| minecraft:ore_iron_upper | Easy | size 9；discard 0 | 90/区块 | triangle absolute 80..384 |
| minecraft:ore_iron_middle | 三档 | size 9；discard 0 | 10/区块 | triangle absolute -24..56 |
| minecraft:ore_iron_small | Easy/Medium | size 4；discard 0 | 10/区块 | uniform bottom..72 |
| minecraft:ore_copper | Easy | size 10；discard 0 | 16/区块 | triangle absolute -16..112 |
| minecraft:ore_copper_large | Medium | size 20；discard 0 | 16/区块 | triangle absolute -16..112 |
| minecraft:ore_gold | Medium/Hard | size 9；discard 0.5 | 4/区块 | triangle absolute -64..32 |
| minecraft:ore_gold_lower | Hard | size 9；discard 0.5 | count uniform 0..1 | uniform absolute -64..-48 |
| minecraft:ore_redstone | Medium | size 8；discard 0 | 4/区块 | uniform bottom..15 |
| minecraft:ore_redstone_lower | Hard | size 8；discard 0 | 8/区块 | triangle above_bottom -32..32，即 Y=-96..-32 |
| minecraft:ore_lapis | Medium | size 7；discard 0 | 2/区块 | triangle absolute -32..32 |
| minecraft:ore_lapis_buried | Hard | size 7；discard 1.0 | 4/区块 | uniform bottom..64 |
| minecraft:ore_diamond | Hard | size 4；discard 0.5 | 7/区块 | triangle above_bottom -80..80，即 Y=-144..16 |
| minecraft:ore_diamond_large | Hard | size 12；discard 0.7 | 1/9 区块 | 同 Y=-144..16 |
| minecraft:ore_diamond_buried | Hard | size 8；discard 1.0 | 4/区块 | 同 Y=-144..16 |
:::

> 维度顶部只有 Y=127，但 Easy 仍引用 136..top 的 coal_upper，实际采样点在建筑高度外；iron_upper 大量采样也高于顶部。Hard 的 redstone_lower 与 diamond 三项又有大量采样低于 Y=-64。它们不是按本维度 192 高重新标定的分布。

## 自定义矿物与相对高度

七种能源矿统一用 uniform above_bottom 8..below_top 8，即本维度约 Y=-56..119，并带 in_square 与 biome filter。生成 JSON 位于 src/generated/resources，build.gradle 已把该目录并入生产资源。

当前世界中的矿物密度完全由这些数据包 placed feature 和所引用的原版 placed feature 决定。OreSystem、OreGenerator、OrePlacement 是旧离线体素表，注册后没有生产调用方。

:::table{mono="0,1,3"}
| configured feature | 方块 ID | size / discard | placed feature 与次数 |
| --- | --- | --- | --- |
| miningdim:ore_bauxite | bauxite_ore / deepslate_bauxite_ore | 9 / 0 | easy 10；medium 6；hard 3 |
| miningdim:ore_borax | borax_ore / deepslate_borax_ore | 5 / 0 | medium 4；hard 3 |
| miningdim:ore_tin | tin_ore / deepslate_tin_ore | 8 / 0 | medium 5；hard 3 |
| miningdim:ore_silver | silver_ore / deepslate_silver_ore | 5 / 0 | medium 3；hard 5 |
| miningdim:ore_nickel | nickel_ore / deepslate_nickel_ore | 6 / 0 | hard 4 |
| miningdim:ore_chromium | chromium_ore / deepslate_chromium_ore | 4 / 0 | hard 3 |
| miningdim:ore_tungsten | tungsten_ore / deepslate_tungsten_ore | 3 / 0 | hard 2 |
| miningdim:ore_ancient_debris | minecraft:ancient_debris | scattered size 2 / 1.0 | hard 1；trapezoid above_bottom 6..48 |
| miningdim:ore_emerald | emerald_ore / deepslate_emerald_ore | 3 / 0 | hard 4；trapezoid above_bottom 8..below_top 16 |
:::

## 入场门、费用与入口方块

- 入口块右键和 stepOn 均只在服务端触发；同一方块实体有 20 tick 冷却。浮空字是方块上方 1.4 格的原版 text_display，billboard=center、NoGravity=true。
- 费用在请求时拍快照，先查余额；区块与安全点就绪后再按该快照 tryCharge。扣款失败就撤票并取消传送，费用是纯 sink。
- EntryGateway 不执行死亡再入冷却闸门，也不恢复离开前 danger；相关 AbuseGuard 方法没有调用方。
- /mining enter <difficulty> reseed 只把布尔值写进 debug 日志，不换 seed、不重置区域，也不改变分配结果。

:::table{mono="1"}
| 难度 | 入口方块 | 矿工等级 | 默认费用 | 默认浮空字 |
| --- | --- | ---: | ---: | --- |
| Easy | miningdim:entrance_easy | 1 | 0 CREDIT | Easy 矿洞 / 右键进入 |
| Medium | miningdim:entrance_medium | 4 | 0 CREDIT | Medium 矿洞 / 右键进入 |
| Hard | miningdim:entrance_hard | 8 | 0 CREDIT | Hard 矿洞 / 右键进入 |
:::

## 实例、加载窗与出生点

| 机制 | 当前精确行为 | 状态 |
| --- | --- | --- |
| 实例数量 | 开服保证 Easy/Medium/Hard 各 1 个，shared=true，固定实例不进 GC | 已接线 |
| 分配 | 任意玩家按难度复用同一 instanceId；无个人或队伍实例 | 已接线 |
| 入场预载 | region 中心半径 1 区块，即 3 x 3 ticking；READY 与 FULL 各最多等 200 tick | 已接线 |
| 活动窗口 | loadRadiusChunks=4 得 9 x 9；tickRadius=2 得 5 x 5；每 10 tick 刷新 | 已接线 |
| 空置处理 | 先把 ticking ticket 降为 load-only，emptyInstanceTtlSeconds=300 后全部释放 | 已接线 |
| 出生池 | 中心向外扫描半径 16 列，最多检查 40,000 次，目标至少 8 点，点间 Chebyshev 距离至少 4 | 已接线 |
| 出生安全 | 默认头顶 2 格空气、实心地板、3 格内无岩浆；占用 TTL 220 tick | 已接线 |
| 出生兜底 | 最多 4 圈、每圈步长 4，失败后在 Y=49 建 3 x 3 石头平台并清 3 x 3 头顶空间 | 已接线 |

> spawn.avoidTrapZones=true 与 spawn.mustBeMainComponent=true 都没有代码读取；安全点没有查询 TrapRegistry，也没有连通分量数据，因此配置名表达的两项保护并未生效。

## 静态伪装陷阱

- 四项都是 size=1、discard=0 的 minecraft:ore configured feature，高度 uniform above_bottom 8..below_top 16，约 Y=-56..111。
- 区块加载时 TrapDisguiseConverter 把 miningdim:trap_ore 立即换成真正的原版矿石，把坐标和种类写进持久 TrapRegistry；玩家、Jade 与普通矿透不会看到 trap_ore。
- 伪装池按矿种均匀抽取：Easy 为煤/铁/铜；Medium 为煤/铁/铜/金/红石/青金石；Hard 为铁/金/红石/青金石/钻石/绿宝石。
- 伪装的石头或深板岩变体优先采样上下邻块；采样不定时 Easy 恒石头、Hard 恒深板岩、Medium 以 Y<32 判深板岩。
- BreakEvent 以 HIGHEST 优先级取消，陷阱矿不进矿工经验与经济结算。注册表幽灵条目会被移除并放行普通破坏。
- TrapType 把 fake_ore 标为 lethal=false，但它实际产生 power=2.0 爆炸；旧 difficultyFactor、致死上限和间距表没有接到数据包布点。

:::table{mono="0"}
| ID | 次数/区块 | 难度 | 反应窗口 | 实际效果 |
| --- | --- | --- | --- | --- |
| miningdim:trap_fake_ore | 4 | 三档 | 0 tick | 非玩家爆炸，power=2.0；无掉落 |
| miningdim:trap_collapsing_tunnel | 3 | 三档 | 10 tick | 上方 1..5 格首个实心非流体块被替换成落下的砂砾；damage=2，cap=6 |
| miningdim:trap_tnt_vein | 2 | Medium/Hard | 30 tick | 非玩家爆炸，power=3.0；无掉落 |
| miningdim:trap_lava_pocket | 2 | Medium/Hard | 0 tick | 挖空位置放 1 格永久岩浆源 |
:::

## 动态陷阱代码与真实可达性

TrapSystem.lastEvalTick 初值为 Long.MIN_VALUE，却直接判断 gameTime - lastEvalTick < evalInterval。Java long 在首次相减时溢出为负数，条件永久成立，lastEvalTick 永远没有机会更新，因此 DynamicTrapEngine.evaluateInstance 从未被调用。

静态陷阱仍然可用：到期 delayed task 在同一个 tick handler 中先于错误节流判断执行。trap.dynamicEnabled=true 只控制 DynamicTrapEngine 内部，无法绕过外层不可达。

| 类型 | 代码门槛与冷却 | 代码效果 | main 实际状态 |
| --- | --- | --- | --- |
| 岩浆喷发 | danger>=0.70；实例冷却 300 tick；Easy 禁用 | 预警 20 tick，放 1 格岩浆，5 tick 后回收 | 不可达：TrapSystem 首轮评估被溢出锁死 |
| 局部坍塌 | danger>=0.55；每玩家冷却 200 tick | 半径 6 内随机 1..3 列，预警 10 tick，落块总伤害 cap=6 | 不可达：同上 |
| 身后苦力怕 | danger>=0.50；每玩家冷却 100 tick；Easy 禁用 | 8..20 格、70 度视锥外，最多 12 次选点 | 不可达：同上 |

## danger 公式与压力档位

默认公式为 danger=clamp(1.0 x zone + 0.5 x (1-exp(-tWin/1200)) + 0.3 x oreRichness, 0, 1)。tWin 每 20 tick 评估增加 20，并可被矿工耐压系数缩到最低 0.60；oreRichness 当前硬编码为 0。

zone 分别为 Easy 0.09、Medium 0.29、Hard 0.40，因此只靠时间的渐近上限分别为 0.59、0.79、0.90。出生冻结 200 tick 内只把显示 danger 钳到 0.15，tWin 仍继续累积。

- 默认上限为每玩家周边 8 只、每实例 30 只，生成半径 24 格；只统计带 MobInstanceTag 的压力怪。
- mob.spawnIntervalTicks=100 没有被读取，真实节奏来自 SpawnTier 写死的 400/280/180/120 tick。
- mob.maxPerPlayer 允许配置为 0，但业务层 Math.max(1, value) 使其最低仍为 1；mob.maxPerInstance=0 则能阻止整实例压力刷怪。
- 压力怪进入/离开世界时登记和销账，覆盖死亡、despawn、discard、区块卸载与重载；生成后还会通过 ChampionSpawnSeam 尝试升格。

:::table{mono="4"}
| 档位 | danger | 间隔 | 波次 | 怪物池 | 压暗系数 |
| --- | --- | --- | --- | --- | --- |
| SAFE | [0,0.20) | 不刷 | 0 | - | 0 |
| LIGHT | [0.20,0.40) | 400 tick | 1 | zombie；spider | 0 |
| MEDIUM | [0.40,0.60) | 280 tick | 1..2 | + skeleton | 0.33 |
| HIGH | [0.60,0.80) | 180 tick | 2..3 | + creeper | 0.66 |
| EXTREME | [0.80,1.00] | 120 tick | 3..4 | + cave_spider；witch | 1.0 |
:::

## 压力刷怪的独立首轮缺陷

MobPressureSystem 的 behindCooldown 默认同样取 Long.MIN_VALUE，判断却是 now - last < 100。首次相减溢出后永远小于 100，时间戳又只会在成功生成后写入，形成永久死锁。

Creeper 被强制走 behind 路径，所以 HIGH/EXTREME 怪池即使抽到 creeper 也总会跳过。其他怪在 HIGH/EXTREME 按默认 0.5 概率选为 behind 时也会跳过；未选 behind 的僵尸、蜘蛛、骷髅、洞穴蜘蛛和女巫仍可正常生成。

> DynamicTrapEngine 自己已有 cooldownAllows(Long.MIN_VALUE, ...) 的正确哨兵处理和回归测试，但 TrapSystem 外层、AutoResetScheduler 与 MobPressureSystem 没有复用该判据。

## 主动撤离、断线与死亡

- EconomyConstants.DEATH_DROP_MODE 当前为 KEEP_IN_PLACE；Hard 转出的掉落保留在死亡点。
- 死亡会把 PlayerAbuseState.deathReentryUntilTick 设为当前时间+1200 tick，但 EntryGateway 从不调用 checkReentryGate，1 分钟死亡再入冷却实际无效。
- 离开时 danger 没有接到 AbuseGuard.recordLeave，重入也不调用 computeReentryDanger；PressureSystem 每次重建状态为 0，主动离开再进入可清空压力。
- Hard 掉落规则按死亡坐标 regionAt 判断。通过外部手段离开 Hard 盒但仍留在 miningdim 维度时，不会触发 Hard 强制掉落。

| 路径 | 当前行为 | 限制或缺口 |
| --- | --- | --- |
| /mining leave / mining.leave | 传送到 Capability 保存的进入前维度与整数方块坐标；清运行态并从实例移除 | 不做安全落点复核；失效维度才降级主世界出生点 |
| 主动换维度 | PlayerChangedDimensionEvent 清实例引用和 Capability 运行态 | 外部传送可作为撤离路径 |
| 断线 | 从 playerSet 移除，但保留 Capability 回退态 | 重连且仍在有效 region 时重新登记；否则回退 |
| 强制重置 | 在线玩家先回退；离线 UUID 写入瞬态 PendingEvacuations | PendingEvacuations 不持久化，服务进程重启会丢 |
| Easy/Medium 死亡 | 依赖全局 keepInventory=true 才保留原版背包 | mod 只在 keepInventory=false 时记警告，不代设 gamerule |
| Hard region 内死亡 | 把原版 Inventory 所有非消失诅咒物品转成死亡点掉落 | 第三方饰品/额外槽不在原版 Inventory 路径内 |
| 死亡后重生 | EntrySystem 仅在重生点不在原实例时执行 leaveCurrentInstance | 没有传送回进入前坐标，尽管消息文本声称已经送回 |

## 手动重置与滑区

- 只有 READY、READY_FALLBACK 或 FAILED 可重置；reset.requireEmpty=true 默认要求先清场，reset.kickOnForceReset=true 让单实例命令与管理 WebUI 先撤离。
- SAME_SEED 与 NEW_SEED 都一定滑到新的绝对坐标。minecraft:noise 使用世界种子和绝对坐标，不读取 InstanceState.seed；因此 SAME_SEED 不能复刻原图，NEW_SEED 也不是靠目标 seed 改地形。目标 seed目前只影响出生池确定性选点和无调用方的旧 OreSystem。
- /mining reset all 直接给所有可进入实例逐个入队，但 ResetSystem 在同一 tick 遍历全部 activeJobs；实际是并行推进三份状态机，不是注释声称的串行队列。
- RetiredRegionGc 把区域大小写死为 MiningConstants 的 16 x 16。若允许的 regionSizeChunks 配置改成非 16，回收数量与行宽都会错误。

| 阶段 | 实际工作 | 耗时/结果 |
| --- | --- | --- |
| UNLOAD | 撤离、释放全部 ticket、计算目标 instance seed、清旧 region 的 TrapRegistry | 1 tick |
| REGEN | 调用 slideRegion：登记旧区、换新坐标、更新 RegionLayout、广播缓存失效、直接置 READY | 通常 1 tick；没有离线重生成 |
| SETTLE | 清 liveMobs | 至少 2 tick |
| 退役区 GC | 每 100 tick 最多清 16 个地形区块；默认一块 16 x 16=256 区块 | 最快 80 秒；不清 entities 与 POI 存储 |

## 定时自动重置当前不可达

默认配置宣称 Easy 每 6 小时、Medium 每 4 小时、Hard 每 2 小时自动刷新，提前 60 秒广播并撤离，最终用 NEW_SEED 重置。WebUI overview 也会按这些数值计算下一次刷新时间。

但 AutoResetScheduler.lastCheckTick 初值是 Long.MIN_VALUE，tick 首行直接计算 now - lastCheckTick < 20。首次相减溢出为负数后每次都 return，lastCheckTick 永远不更新，三档倒计时与自动重置实际从不启动。

> 这是运行可达性缺陷，不是“服务器尚未等够 2/4/6 小时”。页面若展示 nextResetGameTime，只能视作配置推算，不能视作调度器会兑现的承诺。

## 维度内规则与隔离范围

- 白名单为空时会拒绝所有实体放置；无效 ID 被跳过并记警告。每次放置都实时重解析配置。
- 规则只监听实体放置事件，不是所有世界写的总拦截器；生成、命令 setblock、流体、活塞或其他 mod 的直接 setBlock 不一定经过该门。
- 默认白名单不含入口、箱子、火把或本 mod 机器。正常玩家在矿洞里只能放脚手架。

:::table{mono="1"}
| 规则 | 默认值/判据 | 覆盖范围 |
| --- | --- | --- |
| 放置白名单 | rules.placeWhitelist=[minecraft:scaffolding] | 整个 miningdim:mining；EntityPlaceEvent 与 EntityMultiPlaceEvent |
| 重生点 | PlayerSetSpawnEvent 目标维度为 miningdim:mining 即取消 | 不看玩家当前维度；清除已有重生点不拦 |
| 床/重生锚 | bed_works=false；respawn_anchor_works=false | DimensionType 原生规则 |
| region 边界 | region 外返回 mining_wall，纯基岩、无 carver、无 feature | 新生成区块；没有运行期位置钳制 |
| 压力与经济 | 必须按坐标命中当前 region | 玩家到了缓冲带会清压力且挖矿不结算，但实例 Capability 不自动清 |
:::

## 当前有效的 /mining 命令

:::table{mono="0"}
| 命令 | 权限 | 真实行为 |
| --- | --- | --- |
| /mining enter <easy\|medium\|hard> | 玩家 | 进入唯一固定共享区域 |
| /mining enter <difficulty> reseed | 玩家 | 与普通 enter 相同；reseed 参数无业务效果 |
| /mining leave | 玩家 | 回进入前坐标并清实例态 |
| /mining info | 玩家 | 查看自己 Capability 指向的实例 |
| /mining info <instanceId> | 玩家 | 查看任意实例的难度、GenState 与 refCount |
| /mining reset <instanceId> | OP level 2 | SAME_SEED 模式；默认按配置先撤离 |
| /mining reset <instanceId> reseed | OP level 2 | NEW_SEED 模式；仍是滑区 |
| /mining reset all | OP level 2 | 所有可重置实例 NEW_SEED 入队 |
:::

> 有效命令没有二次确认，也没有执行 reset.cooldownSeconds=300 或 confirmationWindowSeconds=15。破坏性重置的服务端确认与冷却只存在于未装配旧命令树。

## 有效 WebUI action 与未装配旧命令

:::table{mono="0"}
| 入口 | 状态 | 说明 |
| --- | --- | --- |
| mining.overview | 已接线 | 返回三固定区域、矿工等级、费用和按配置推算的刷新时刻 |
| mining.myStatus | 已接线 | 返回几何 region、Capability instanceId 与出生冻结剩余 tick |
| mining.enter | 已接线 | 异步委派 EntryGateway；accepted 只表示同步门已通过 |
| mining.leave | 已接线 | 委派统一撤离链 |
| admin.mining.reset | 条件可用 | 服务端重判 OP；默认 NEW_SEED，reseed=false 才是 SAME_SEED；确认框只在前端 |
| 旧 /mining status/list/tp/kick | 未装配 | 位于 com.miningdim.command.MiningCommands |
| 旧 /mining trap place <kind> [skin] | 未装配 | 调试放陷阱代码在 JAR，但 CommandSystem 未注册 |
| 旧 /mining enter <difficulty> party | 未装配 | 旧实现只 allocate 不传送，且固定实例模型没有队伍副本 |
| 旧 /mining reset ... confirm | 未装配 | level 4、确认窗口与 ResetConfirmations 均不可达 |
:::

## 基础 registry：方块、物品与创造栏

:::table{mono="0"}
| 注册 ID | 类型/属性 | 物品与玩家入口 | 审计状态 |
| --- | --- | --- | --- |
| miningdim:mining_portal | 普通 Block，copy obsidian | 有 BlockItem，进基础创造栏 | 仅注册物；没有右键、碰撞或传送接线 |
| miningdim:fake_ore | 普通 Block，copy stone | 有 BlockItem，进基础创造栏 | 旧占位物；现行陷阱不使用它 |
| miningdim:trap_ore | TrapOreBlock，KIND 四值，noLootTable | 无 BlockItem，不进创造栏 | 数据包临时占位；区块加载时换成原版矿 |
| miningdim:entrance_easy | EntranceBlock，copy lodestone | 有 BlockItem，进基础创造栏 | 已接线 |
| miningdim:entrance_medium | EntranceBlock，copy lodestone | 有 BlockItem，进基础创造栏 | 已接线 |
| miningdim:entrance_hard | EntranceBlock，copy lodestone | 有 BlockItem，进基础创造栏 | 已接线 |
| miningdim:engagement_ring | RingItem | 普通 Item；不在该基础创造栏 | 已注册，婚姻玩法另页审计 |
| miningdim:wedding_ring | RingItem | 普通 Item；不在该基础创造栏 | 已注册，婚姻玩法另页审计 |
| miningdim:entrance | BlockEntityType | 三种入口块共用 | 已接线 |
| miningdim:miningdim | CreativeModeTab | 图标为 entrance_easy；只列三入口、portal、fake_ore | 已接线但不是“全部 mod 物品” |
:::

## 配置项实际生效矩阵

:::table{mono="1,2"}
| 配置组 | 确实生效 | 无效、部分生效或被缺陷阻断 |
| --- | --- | --- |
| instance | regionSizeChunks；bufferChunks | globalCap；overflowPolicy；sharedByDefault；maxPartySize；shareCap 均只服务旧动态实例链 |
| ore / difficulty | - | baseWeight；globalDensity；useDatapackDistribution；easy/medium/hardMultiplier 不控制数据包矿物 |
| trap | dynamicEnabled 在引擎内部有读取 | baseChance；localRiskMax；minSpacingBlocks 无生产读取；动态调度整体被溢出阻断 |
| danger | max；weightZone；weightTime；timeSoftCap；evalInterval | weightOre 乘到恒为 0 的 oreRichness；decay 分支实际不被在场主循环调用 |
| mob | maxPerPlayer；maxPerInstance；behindPlayerChance；spawnRadius | spawnIntervalTicks 无读取；behind 路径被首轮冷却溢出阻断 |
| spawn | headroomBlocks；requireSolidFloor；lavaAvoidRadius；poolSize | avoidTrapZones；mustBeMainComponent 无读取 |
| reset | requireEmpty；kickOnForceReset | cooldownSeconds；confirmationWindowSeconds 未接有效命令；autoResetHours 与 warnSeconds 被调度溢出阻断 |
| rules / entry | placeWhitelist；三档 label；三档 entryFee | - |
| perf | loadRadiusChunks；emptyInstanceTtlSeconds；gcScanIntervalTicks | gcGraceSeconds；maxGenWorkers 无读取；固定实例不受 instance GC |
:::

> ore.useDatapackDistribution=false 不会切换到旧内置表；现行世界生成仍照常读取 JAR 内数据包。不要把这些键当成在线调矿开关。

## 可达代码、死代码与缺失玩法

| 对象 | 物理状态 | 结论 |
| --- | --- | --- |
| minecraft:noise + MiningBiomeSource + 四 biome JSON | 入包并完成注册链 | 现行唯一地形生成路径 |
| 数据包矿物与静态陷阱 | 主资源/生成资源入包并被 biome 引用 | 玩家可达 |
| OreSystem / OreGenerator / OrePlacement | 类入包，OreSystem 也在主类注册 | 无生产调用方；缓存恒空 |
| MaterialPalette / BaseMaterial / Difficulty.palette | 类入包 | 自定义 ChunkGenerator 下线后无调用方 |
| DynamicTrapEngine | 类入包、danger seam 已注入 | 外层 TrapSystem 首轮节流永久 return |
| AutoResetScheduler | 类入包并在 ResetSystem 构造 | 首轮检查永久 return |
| 私有/队伍实例、共享容量与排队 | 旧方法仍在 InstanceManager | allocate 固定直达三常驻实例，旧分支不可达 |
| com.miningdim.command.CommandSystem | 类入包 | 未加入 MiningDim，整棵旧命令树不注册 |
| MiningErrors connectivity/retry/seed-broken helper | 类入包 | 旧离线生成链下线后无调用方 |
| 深暗、幽匿、远古城市、Warden | 未找到资源或注册链 | 当前 main 未实现 |
| 真正按 instance seed 重生地形 | ResetMode 与 seed 字段存在 | minecraft:noise 不读取 instance seed，未实现 |

## 已确认缺陷清单

| 严重度 | 缺陷 | 直接证据与影响 |
| --- | --- | --- |
| Critical | 动态陷阱永久不评估 | TrapSystem.lastEvalTick=Long.MIN_VALUE 后直接做 gameTime-lastEvalTick；溢出令 evaluateInstance 永不可达 |
| Critical | 定时自动重置永久不检查 | AutoResetScheduler 使用同一种溢出写法；默认 2/4/6 小时刷新均不会发生 |
| Major | 所有 behind 压力怪首轮永久冷却 | MobPressureSystem 默认 last=Long.MIN_VALUE 后直接相减；creeper 因强制 behind 完全不生成 |
| Major | 死亡再入冷却与 danger 防洗无效 | applyDeathPenalty 会写状态，但 EntryGateway 不调用 checkReentryGate；离开/进入也不接 recordLeave/computeReentryDanger |
| Major | 死亡回退消息与行为不符 | zh_cn 声称送回进入前坐标，PlayerRespawnEvent 实际只 leaveCurrentInstance，不传送 fallback |
| Major | ResetMode 不控制地形 seed | 两种模式均滑区；minecraft:noise 用世界 seed 与绝对坐标，不读 InstanceState.seed |
| Major | 原版矿高度未适配 192 高维度 | coal_upper 整段高于顶，iron_upper 大量高于顶，Hard redstone/diamond 大量低于底 |
| Major | 出生点不执行陷阱区与主连通分量检查 | 两个默认 true 配置没有调用点，SpawnSystem.isSafe 不读 TrapRegistry |
| Major | 非默认 regionSizeChunks 会错清退役区 | RetiredRegionGc 固定按 16 x 16 与 MiningConstants 行宽枚举 |
| Minor | 玩家级 mob 上限 0 被改成 1 | 配置允许 0，spawnWave 使用 Math.max(1, mobMaxPerPlayer) |
| Minor | reseed 入场参数是空操作 | EntryGateway 仅把 reseed 写 debug 日志 |
| Minor | 有效 reset 缺服务端确认与冷却 | 确认与 cooldown 只在未装配 command 包；entry 命令 OP2 可直接执行 |

## 复核源码入口

```text caption="相对 D:/Repo/Wok-Project 的关键证据路径"
src/main/java/com/miningdim/MiningDim.java
src/main/java/com/miningdim/core/MiningConstants.java
src/main/java/com/miningdim/core/RegionLayout.java
src/main/java/com/miningdim/registry/ModBlocks.java
src/main/java/com/miningdim/registry/ModItems.java
src/main/java/com/miningdim/worldgen/MiningBiomeSource.java
src/main/java/com/miningdim/instance/InstanceManager.java
src/main/java/com/miningdim/chunk/ChunkTicketManager.java
src/main/java/com/miningdim/reset/ResetSystem.java
src/main/java/com/miningdim/reset/ResetJob.java
src/main/java/com/miningdim/reset/AutoResetScheduler.java
src/main/java/com/miningdim/reset/RetiredRegionGc.java
src/main/java/com/miningdim/spawn/SpawnSystem.java
src/main/java/com/miningdim/ore/OreSystem.java
src/main/java/com/miningdim/trap/TrapSystem.java
src/main/java/com/miningdim/trap/StaticTrapTrigger.java
src/main/java/com/miningdim/trap/TrapDisguiseConverter.java
src/main/java/com/miningdim/pressure/Danger.java
src/main/java/com/miningdim/pressure/MobPressureSystem.java
src/main/java/com/miningdim/entry/EntryGateway.java
src/main/java/com/miningdim/entry/EntrySystem.java
src/main/java/com/miningdim/entry/MiningCommands.java
src/main/java/com/miningdim/rules/RulesSystem.java
src/main/java/com/miningdim/rules/MiningDeathRules.java
src/main/resources/data/miningdim/dimension/mining.json
src/main/resources/data/miningdim/dimension_type/mining.json
src/main/resources/data/miningdim/worldgen/noise_settings/mining.json
src/main/resources/data/miningdim/worldgen/biome/mining_easy.json
src/main/resources/data/miningdim/worldgen/biome/mining_medium.json
src/main/resources/data/miningdim/worldgen/biome/mining_hard.json
src/generated/resources/data/miningdim/worldgen/configured_feature
src/generated/resources/data/miningdim/worldgen/placed_feature
```
