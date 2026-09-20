---
order: 140
name: 已确认缺陷与复现索引
en: Known gaps and triage ledger
group: 边界
tagline: 把源码审计中已经证实的断线、持久化风险、不可达内容和展示缺口集中成一张排障清单。
facts:
  - label: 审计性质
    value: 只读静态核对
  - label: 最高级别
    value: Critical
  - label: 代码修复
    value: 本轮未修改 Mod
  - label: 对应快照
    value: main@701093bd8492
---

本页不是需求池，也不把尚未实现的设计当成 Bug。条目必须同时满足：代码已进入本轮生产 JAR，并能从当前注册链、数据流或资源引用中指出具体断点。严重度反映可能的数据损失、核心循环停摆或玩家误导程度；“需真服复现”表示静态证据已经成立，但仍应在隔离存档中记录实际表现和日志。

## Critical：优先隔离验证

:::table{mono="3"}
| 系统 | 触发条件 | 已确认结果 | 证据位置 | 复现建议 |
| --- | --- | --- | --- | --- |
| 酿酒师 | 干小麦槽保存、区块重载或菜单网络同步时数量超过 127 | 物品声明 6192 堆叠，但 1.20.1 ItemStack 的 Count 是单字节；数量会截断、变负或读成空栈 | BrewerItems / WineCellarBlockEntity | 分别用 127、128、255、256、6192 做 NBT 与菜单往返，保留原始存档副本 |
| 军火商 | 台主在线且军火台所在区块持续 tick | 未满一批时每 tick 都把 lastSettleTick 推到当前 tick，下一次 elapsed 永远约为 1；被动产线无法积累到完整批次 | MunitionsBenchBlockEntity.settleForOwner | 同时放两张同档台：一张持续加载，一张卸载后再加载，对比被动产物 |
| 特勤干员 | 封印期间服务端重启，或目标卸载超过 24000 tick | 词缀已从精英实体真实移除，但恢复快照只在内存中；恢复窗口丢失后会永久少词缀 | Agent seal snapshot / expiry runtime | 在隔离世界封印单词缀目标，分别执行重启和长时间卸载，复核实体 NBT 与词缀集 |
| 动态陷阱 | TrapSystem 第一次执行调度节流判断 | lastEvalTick 从 Long.MIN_VALUE 直接参与减法并溢出，首轮检查永远不能通过，动态陷阱不会评估 | TrapSystem.lastEvalTick | 进入新实例并跨越多个 evalInterval，确认只有静态陷阱，动态调度日志与方块均不出现 |
| 自动重置 | AutoResetScheduler 第一次执行每秒检查 | 同类 Long.MIN_VALUE 相减溢出让首轮永久被节流，默认 2、4、6 小时的三难度自动重置均不会触发 | AutoResetScheduler.lastCheckTick | 在隔离配置缩短周期后持续运行，比较手动 reset 与自动调度是否写入重置状态 |
| 跳蚤市场 | 上架费扣款、listing 插入、背包 shrink 之间硬崩溃，或购买事务提交后、交货前硬崩溃 | 跨钱包、SQLite 和玩家背包的操作不原子，存在只扣费、复制物品或买家付款后丢物的窗口 | MarketEngine listing / purchase flow | 为每个提交边界注入受控故障并重启，逐项核对钱包、listing、托管物和背包 |
| 任务领奖 | CREDIT 已写入 SQLite 后、SavedData 任务状态更新前硬崩溃 | 两种持久化没有跨存储事务，重启后任务可能仍可再次领取，形成双领窗口 | QuestService claim flow | 只在隔离账本使用单一已完成任务做故障注入，重启后核对余额和 claimed 状态 |
:::

> 这些条目涉及存档、核心生产或整条调度链。验证时不要使用生产玩家、唯一物品或不可回滚的真实区块。

## Major：玩法闭环与经济风险

:::table{mono="3"}
| 系统 | 缺口 | 玩家影响 | 证据位置 |
| --- | --- | --- | --- |
| 酿酒师 | 同 NBT 酒可堆叠 16，但酒窖按非空槽而非 stack count 计燃料 | 一槽 16 瓶会一起陈酿，却最多只收一瓶的燃料 | WineCellarBlockEntity bottle states |
| 酿酒师 | 酿酒台与酒窖没有 loot table，也没有拆除时释放库存 | 生存拆除可能既不掉机器，也直接吞掉内部材料、酒与燃料 | brewing_station / wine_cellar blocks |
| 酿酒师 | 登录重挂月光词条时无条件移除夜视 | 可能误删药水、命令或其他系统提供的夜视 | BrewPermanentBuffs / MoonshinePerk |
| 厨师 | SeasoningScreen 引用的 seasoning_table.png 不在源码或 JAR | 原生调味台 GUI 会显示缺失纹理 | SeasoningScreen |
| 厨师 | QTE 期间两个槽仍可移动，且未锁定食物和调料快照 | 启动者或旁观玩家可在结算前偷换材料，产物盖章的是结算瞬间物品 | SeasoningTableBlockEntity / SeasoningMenu |
| 铸甲师 | 54 件板甲与 18 个正式等离子盾没有配方、战利品、商店、任务或生产入口 | 机制和资源虽已注册，普通生存流程无法取得 | plate_armor_* / plasma_shield_* |
| 铸甲师 | 等离子盾只把 totalEnergy 转为当前护盾，全库没有补充 totalEnergy 的路径 | 即使管理员发放，电量耗尽后也会永久空载 | PlasmaShieldState / PlasmaShieldHandler |
| 铸甲师 | 高级生产台制作低级板时最低时间取机器档位，而不是所选板档位 | 越高级的台制作同一低级板反而越慢 | ProductionTableBlockEntity calibration.begin |
| 军火商 | 军火台 unlockLevel 元数据没有运行时消费者 | 玩家取得高档台后不校验最低职业等级，只钳制有效等级上限 | Munitions bench placement/use path |
| 军火商 | 枪匠默认关闭，冲压机、装配台、蓝图和零件又没有生存发放链 | 完整注册不等于普通玩家可玩；仅创造或管理员发放可进入 | miningdim-munitions.toml / gunsmithEnabled |
| 塔罗师 | R 牌允许进入玩家市场，但持有者绑定不会随成交转移 | 买家取得后仍绑定卖家，无法使用或参与合成 | Tarot ownership / market escrow |
| 动态压力 | 矿物富集度固定为 0，mob.spawnIntervalTicks 未被读取，离区又直接删除区域状态 | 富集贡献、刷怪间隔和 decay 配置与文案不一致或没有生产路径 | PressureSystem runtime/config consumers |
| 动态压力 | behind 刷怪冷却也从 Long.MIN_VALUE 直接相减 | 首次 behind 检查永久无法通过；苦力怕被强制走 behind 路径，因此不会由压力系统生成 | MobPressureSystem behindCooldown |
| 动态压力 | 矿工 L9 声东击西写 Entry capability，压力系统读取另一份内部状态 | 技能会走调用链，但实际压力不下降 | Miner feint / PressureSystem state |
| 精英怪 | 战斗池与机动池的未花完点数没有转换消费者 | 界面或设计中描述的余点转化不会实际发生 | Champion affix point allocation |
| 开箱 | 已拥有的 TaCZ 皮肤仍可再次抽中，没有交易或兑换出口 | 重复资产会继续落库，消费闭环没有去重补偿 | CaseOpening saga / skin ownership |
| 跳蚤市场 | 总价 1 或 2 的最便宜挂单把 20% 挂牌费 round 为 0，账本却拒绝非正数扣款 | 合法低价挂单会以 ILLEGAL_AMOUNT 失败 | MarketFee / Economy tryCharge |
| 市场 WebUI | 服务端注册 market.categoryItems，但当前 React 前端没有对应契约调用 | 按分类拉取的后端能力无法从现有页面到达 | WebUiServerDispatcher / webui actions |
| 系统商店 | hub.panels 把 shop 标为 enabled，但服务端没有 shop.* action，前端生产调用返回 NOT_WIRED | 玩家会被引导到一个声明可用但没有生产后端的页面 | HubPanelsAction / ShopPage |
| 任务系统 | 内置池无条件加入三类 ammo 目标，TaCZ 事件钩子却只在 TaCZ 存在时注册 | 无 TaCZ 服务器仍会抽到无法推进的日常或周常，只能付费刷新 | QuestPool / QuestTaczHooks |
| 婚姻 | 离婚结算只回收在线一方婚戒；离线方登录对账不调用 recycleRings | 离线配偶永久保留外观有效但登记关系已不存在的旧婚戒 | MarriageDivorce / login reconcile |
| 实体堆叠 | spawnBatchedDrops 没有按相同 ItemStack 聚合，只是逐次生成 ItemEntity | 大堆死亡仍可能瞬间制造大量掉落实体，与批处理文案不符 | Stacking death drop path |
| 农夫 | 当日小麦出售到第 2161 株后，衰减价格向下取整为 0，但出售流程仍删除作物 | 玩家继续出售会失去小麦且信用点不增加 | Farmer sell pricing / daily counter |
| 矿工 | 连锁挖掘和隧道挖掘的额外方块不逐块经过 BreakEvent，也不消耗工具耐久 | 可能绕过依赖逐块事件的保护或联动，并显著改变工具成本 | Miner chain / tunnel extra-block path |
| 矿工网络 | 预览 C2S 缺距离与射线校验，陷阱扫描请求缺维度门 | 恶意或异常客户端可请求正常交互范围之外的预览与扫描信息 | Miner preview / trap scan packets |
:::

## 展示、资源与运维缺口

| 范围 | 现状 | 影响 | 建议核法 |
| --- | --- | --- | --- |
| 压力客户端 | DangerSync 已发包，但 ClientDangerState 没有 HUD 或滤镜消费者 | 玩家收不到设计中的危险度视觉反馈 | 抓取 S2C 后同时检查 HUD、日志与客户端状态 |
| 发电机 GUI | 菜单同步 networkFault，GeneratorScreen 不显示；Jade provider 会显示 | 未安装 Jade 时难以从原生界面识别网络故障 | 对同一故障机分别查看原生 GUI 与 Jade 面板 |
| 纳米效果 | 中英文缺少 effect/stat 翻译键，物品提示也不显示抽到的 Nano NBT | WebUI 暴露原始 key，玩家几乎无法辨认效果 | 用管理员发放四类效果并对比物品提示与 WebUI |
| 遗留方块 | fake_ore 与 mining_portal 已注册但未接线，且缺 blockstate、方块模型和物品模型 | 管理员发放或遗留存档加载时会显示资源缺失 | 仅在隔离客户端用 /give 与放置测试 |
| 入口方块 | entrance_easy、entrance_medium、entrance_hard 均没有方块掉落表 | 生存拆除入口时不会按普通方块回收自身 | 在隔离区分别用正确工具拆除三种入口并记录掉落 |
| 陷阱矿石 | trap_ore 缺中英文方块翻译 | 物品或调试界面会显示原始语言键 | 切换 zh_cn 与 en_us 检查显示名 |
| 生产 JAR | 含 177 个 GameTest/testutil class、26 个 .cache 文件及额外嵌套 slf4j JAR | 不直接改变玩法，但扩大产物并混入测试与缓存内容 | 用固定 SHA-256 解包复核，不把这些条目计入玩家功能 |
| 游戏内 WebUI | MCEF 是软依赖，默认 webui.url 仍为 http://localhost:5173/ | 未安装 MCEF 或未覆盖生产 URL 时，特勤扫描封印等仅 WebUI 入口不可用 | 分别测试无 MCEF、默认 URL、生产 URL 三种客户端 |

## 回报 Bug 时附带的信息

1. 注明审计快照 main@701093bd8492、Mod 版本 1.0.19，以及使用的是 -all.jar 还是薄 JAR。
2. 写明是否安装 TaCZ、MCEF、Jade、JEI 等软依赖，并附实际版本与服务端配置门。
3. 记录维度、职业等级、物品完整 NBT、方块坐标、区块是否持续加载，以及重启或卸载经过的时间。
4. 把预期结果和实际结果分开，附最短复现步骤、服务端日志与客户端日志；涉及数据损失时另存测试世界副本。
5. 引用本区对应专题的注册 ID 和源码路径，避免把旧分支、设计文档或独立伴生 Mod 的行为混进主 JAR。

> 本轮只记录证据，没有修改 Wok-Project，也没有在生产服务器执行这些破坏性复现。
