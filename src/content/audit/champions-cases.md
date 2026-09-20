---
order: 50
name: 冠军、战斗与武器箱
en: Champions, combat and cases
group: 玩法
tagline: 核对 35 个冠军词缀、战斗红线、奖励、易伤、金钱修补与 TaCZ 武器箱的真实接线状态。
facts:
  - label: 审计快照
    value: main@701093bd8492 / 1.0.19
  - label: 冠军词缀
    value: 35/35 进入自然抽取白名单
  - label: 武器箱
    value: 1 箱、17 皮肤、17 套显示资源
  - label: 启动接线
    value: 冠军、战斗、开箱、附魔均由 MiningDim 装配
  - label: 条件依赖
    value: 开箱需 TaCZ 1.1.8 与资源导出成功
  - label: 审计方式
    value: 只读源码、注册链、资源、现有生产 JAR 与 GameTest 静态核验
---

本页记录 2026-08-18 对 Wok-Project main 的只读事实快照。所谓“已接线”至少要求代码进入 1.0.19-all.jar，并由主入口、事件总线、命令或 WebUI 动作装配；“条件可用”表示还受外部 mod、配置或运行时资源导出门控；“部分实现”表示玩家能够触发，但实际行为少于词缀定义或旧注释宣称的效果。旧 Champions 数据包和外置部署文件单列，不把它们算作当前自研冠军系统。

## 入口、门控与玩家可达性

:::table
| 子系统 | 启动与玩家入口 | 运行时条件 | 审计状态 |
| --- | --- | --- | --- |
| 冠军 | MiningDim 无条件注册 ChampionSystem；MobPressureSystem 经 ChampionSpawnSeam 自然晋升；OP 2 命令 /mchampion summon；WebUI 动作 champion.codex、champion.inspect | 自然生成无配置开关；命令需 OP 2；inspect 需同维度 entityId | 已编译、已装配、玩家可达 |
| 战斗减伤 | MiningDim 无条件注册 CombatSystem，LOWEST 阶段处理玩家受伤 | 各减伤源自行判断职业、塔罗窗口、饮酒层数或矿脉区域 | 已编译、已装配 |
| 易伤效果 | JobFrameworkSystem 注册 miningdim:vulnerability 与受伤处理器 | 由撕裂、塔罗等来源施加 | 已编译、已装配 |
| 金钱修补 | MiningDim 无条件注册 EnchantmentSystem；任务附魔书池可发放 | 受 miningdim-money-mending.toml 与账户余额限制 | 已编译、已装配、条件可用 |
| 武器箱 | MiningDim 无条件注册 CaseOpeningSystem；WebUI 动作 case.state、case.open、case.apply | enabled=true、TaCZ 已加载、反射注册武器包成功三项同时成立 | 已编译、条件可用 |
:::

> 核心入口见 src/main/java/com/miningdim/MiningDim.java、champion/ChampionSystem.java、caseopening/CaseOpeningSystem.java、combat/CombatSystem.java、enchant/EnchantmentSystem.java 与 job/JobFrameworkSystem.java。

## 冠军生成与人工入口

- MobPressureSystem 每次成功生成受压怪物后调用 ChampionSpawnSeam.promote。EASY 有 6% 概率晋升，星级在 1 至 3 中均匀抽取；MEDIUM 为 10%、3 至 6；HARD 为 15%、5 至 10。概率和区间硬编码在 ChampionSpawnPolicy，没有冠军专用配置文件。
- 冠军能力 ID 为 miningdim:champion_data，附加到所有 Mob；star 大于等于 1 才被视为冠军。能力持久化星级、词缀品质、有效生命、当前生命和支援召唤标记。
- /mchampion summon <entity> <star> [affixes] 需要 OP 2。省略 affixes 时走正常点数、品质、互斥和体型白名单；显式给出词缀时绕过预算、互斥和体型资格检查，并使用默认品质。命令兼容历史 champions: 前缀。
- ChampionSystem 向 Forge 总线装配 24 个具体运行时处理器，再注册自身生命周期处理，共 25 个实例；自然晋升、血池、首领条、攻击、持续伤害、粒子、位移、十项技能、奖励和清理链均有入口。
- 体型词缀自然抽取只允许 13 种原版人形怪：minecraft:zombie、husk、drowned、zombified_piglin、skeleton、stray、wither_skeleton、vindicator、pillager、evoker、witch、piglin、piglin_brute。

## 星级预算与伤害基线

:::table{caption="预算来自 StarRank；“普通攻击上限”是单次对玩家最大生命值的比例。"}
| 星级 | 生存点 | 战斗点 | 机动点 | 技能点 | 词缀上限 | 技能上限 | 最高品质 | 基础有效生命 | 普通攻击上限 |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | ---: | --- |
| 1 | 10 | 8 | 0 | 0 | 1 | 0 | 普通 | 135 | 4% |
| 2 | 20 | 14 | 4 | 0 | 2 | 0 | 普通 | 225 | 5% |
| 3 | 35 | 24 | 8 | 15 | 3 | 1 | 中级 | 360 | 6% |
| 4 | 55 | 36 | 12 | 25 | 4 | 1 | 中级 | 540 | 8% |
| 5 | 80 | 55 | 20 | 45 | 5 | 1 | 高级 | 765 | 10% |
| 6 | 120 | 80 | 30 | 70 | 6 | 2 | 高级 | 2700 | 12% |
| 7 | 165 | 110 | 45 | 110 | 7 | 2 | 超凡 | 6000 | 14% |
| 8 | 240 | 160 | 75 | 180 | 9 | 3 | 超凡 | 27000 | 16% |
| 9 | 330 | 230 | 115 | 260 | 11 | 3 | 闪耀 | 45000 | 18% |
| 10 | 440 | 310 | 155 | 360 | 13 | 4 | 闪耀 | 73000 | 20% |
:::

## 品质、成本与抽取算法

- 词缀实际点耗为 ceil(基础成本 x 品质系数)。以下数值均按 普通/中级/高级/超凡/闪耀 顺序；前导 0 表示该品质不可用，不会抽出零效果档。
- AffixRoller.IMPLEMENTED_AFFIXES 包含 AffixDef 的全部 35 项。抽取依次处理生存、战斗、机动、技能池，在剩余预算内随机贪心选取，最后重新校验点数、词缀数、技能数、互斥和体型资格。
- 互斥规则：高速与超速二选一；巨大化与缩小化二选一；双倍与四倍二选一；命定之死与反击单元二选一；闪光、战术传送、灵体移动、凯撒、利刃五个传送源全局最多两个。重型护甲排斥全部机动、偏斜和刚毅；巨大化排斥全部机动；缩小化会原子附带一个最低档机动词缀。

:::table
| 品质 | 成本系数 | 颜色 RGB | 星级上限 |
| --- | --- | --- | --- |
| 普通 COMMON | 1.0 | C8C8C8 | 1 至 2 |
| 中级 UNCOMMON | 1.6 | 55C040 | 3 至 4 |
| 高级 RARE | 2.5 | 3070E0 | 5 至 6 |
| 超凡 EPIC | 4.0 | 9B30E0 | 7 至 8 |
| 闪耀 LEGENDARY | 6.5 | E0B020 | 9 至 10 |
:::

> 词缀数据入口为 src/main/java/com/miningdim/champion/AffixDef.java、AffixQuality.java、AffixRoller.java 与 PointBudget.java。

## 35 词缀清单一：生存池 10 项

:::table{mono="0"}
| ID / 中文名 | 基础成本 / 最低星级 | 品质数值与真实机制 | 状态 |
| --- | --- | --- | --- |
| COMPOSITE_ARMOR / 复合装甲 | 8 / 1 | 同类伤害 5 次爬升至 35/45/55/65/75% 减伤；子弹、近战、爆炸、其它分桶；换类别清空其它桶，3 秒无伤重置 | 已接线 |
| UHMWPE_ARMOR / 超高分子聚乙烯护甲层 | 7 / 1 | TaCZ 子弹减伤 10/15/22/30/40%；仅识别 namespace=tacz 且 path 以 bullet 开头的伤害类型 | 条件可用；无 TaCZ 仍会抽到但无子弹收益 |
| HEAVY_ARMOR / 重型护甲 | 26 / 7 | 高级/超凡/闪耀子弹减伤 35/42/49%；近战或爆炸净伤低于 8/14/22 HP 时免疫 | 已接线；子弹部分依赖 TaCZ |
| REGEN_TISSUE / 再生组织 | 6 / 1 | 脱战回复 3/4/5/6/8% 有效最大生命每秒；受伤后等待 5 秒；每秒结算 | 已接线 |
| FLAMMABLE_REGEN / 易燃再生 | 10 / 3 | 固定回复 8/15/30/60/90 HP 每秒；受伤暂停 1.5 秒 | 已接线 |
| DEFLECTOR_SHIELD / 偏斜护盾 | 10 / 2 | TaCZ 子弹按期望值减伤 8/12/18/25/35%，不是随机闪避；不处理 AOE | 条件可用；无 TaCZ 可成为空收益词缀 |
| FORTITUDE_SHIELD / 刚毅护盾 | 22 / 6 | 仅高级/超凡/闪耀可用；比例减伤后把单击封顶为 120/80/50 HP | 已接线 |
| THORNS / 反震 | 9 / 2 | 实际只对攻击者为玩家时反射其最大生命 2/3.5/5/7/10%，内部冷却 3 秒并进入全局反伤红线 | 部分实现；定义所写范围反伤与击退未接线 |
| GIGANTISM / 巨大化 | 12 / 3 | 最大生命 +30/50/80/120/180%；模型缩放 1.25/1.40/1.60/1.85/2.20；移速另加 10/20/30/40/50% | 已接线；受体型白名单约束 |
| MINIATURIZATION / 缩小化 | 10 / 3 | 最大生命 -25/32/40/48/58%；模型缩放 0.85/0.75/0.65/0.55/0.45；比例减伤 7.5/12.5/17.5/22.5/27.5% | 已接线；强制附带最低档机动 |
:::

## 35 词缀清单二：战斗池 10 项

:::table{mono="0"}
| ID / 中文名 | 基础成本 / 最低星级 | 品质数值与真实机制 | 状态 |
| --- | --- | --- | --- |
| BURNING / 燃烧 | 8 / 1 | 每层每秒 1/1.5/2/3/4% 玩家最大生命，最多 5 层，存续 3 秒；同一冠军对同一玩家每秒最多刷新一次 | 已接线 |
| ARMOR_PIERCING / 穿甲 | 10 / 2 | 额外造成 4/6/9/13/18% 玩家最大生命；普通伤害与穿甲合计仍受 40% 单击上限 | 已接线 |
| REND / 撕裂 | 12 / 3 | 每层增加 5/8/12/16/20% 易伤，最多 100%，存续 3 秒；向下映射为共享易伤 I 至 V 的 20/35/50/70/100% | 已接线；低于 20% 的累计值暂不生效 |
| HEAVY_CANNON / 重炮 | 10 / 2 | 实际只放大本次伤害 30/47.5/65/82.5/100% | 部分实现；攻速惩罚与可见前摇未接线 |
| CORROSIVE / 强酸 | 8 / 3 | 每次命中额外损耗玩家护甲 2/4/6/10/15 点耐久 | 已接线 |
| DOUBLE_STRIKE / 双倍打击 | 9 / 3 | 2 跳，每跳为完整命中的 60%，整套 1.2 倍；相隔 3 tick，距离超过 6 格终止 | 已接线 |
| QUADRUPLE_STRIKE / 四倍痛处 | 16 / 5 | 4 跳，每跳为完整命中的 35%，整套 1.4 倍；相隔 3 tick，距离超过 6 格终止 | 已接线 |
| BLOODLUST / 嗜血 | 10 / 2 | 冠军生命不高于 35% 时，实际伤害增加 15/25/35/50/60% | 部分实现；攻速增益未接线 |
| CHAOS_STRIKE / 混沌重击 | 11 / 4 | 水平推力 1.5、垂直推力 1.0，预测落点 12 格；2 秒内部冷却，接入 7 秒控制预算和 2 秒落地保护 | 已接线 |
| FROST / 寒霜 | 10 / 2 | 每层每秒 0.8/1.2/1.8/2.5/3.5% 最大生命，并减速 4/6/8/10/12%；最多 5 层、3 秒 | 已接线 |
:::

> ChampionAttackHandler 的实际条件是“受害者为玩家且伤害来源实体是冠军”，并未限制近战。因此冠军骷髅等来源实体仍为冠军的投射物也会触发燃烧、撕裂、多段和混沌重击；类注释称“近战攻击”与运行时不一致。

## 35 词缀清单三：机动池 5 项

:::table{mono="0"}
| ID / 中文名 | 基础成本 / 最低星级 | 品质数值与真实机制 | 状态 |
| --- | --- | --- | --- |
| SPRINT / 高速移动 | 6 / 1 | 移动速度增加 10/15/22/30/40% | 部分实现；“不超过玩家疾跑速度”的结果钳制未接线 |
| OVERDRIVE / 超速移动 | 10 / 3 | 加速 4 秒，速度 +100/130/160/200/250%；力竭 5 秒 -50%；正常 3 秒，总周期 12 秒 | 已接线；失去目标最多保留当前相位 10 秒 |
| BLINK / 闪光 | 8 / 2 | 周期 9/8/7/5.5/4 秒；24 格内有目标才计时；0.5 秒预兆，优先落在目标身后 2.5 格 | 已接线；每秒扫描使 5.5 秒档实际最早约 6 秒 |
| TACTICAL_BLINK / 战术传送 | 8 / 2 | 周期 8/7/6/5/4 秒；24 格目标；向外尝试 8 至 4 格与 0、正负 30 度安全点；受击可在半冷却后触发 | 已接线 |
| PHASE_WALK / 灵体移动 | 12 / 4 | 穿墙 2/2.5/3/3.5/4 秒；周期 15/13/11.5/9.5/8 秒；每 tick 朝目标眼位移动 0.25 格 | 已接线；失败回退安全环、最后安全点，再强制定点并附缓慢 V 2 秒 |
:::

## 35 词缀清单四：技能池 10 项

:::table{mono="0"}
| ID / 中文名 | 基础成本 / 最低星级 | 品质数值与真实机制 | 状态 |
| --- | --- | --- | --- |
| ELECTRO_CHARGE / 电磁蓄力 | 14 / 4 | 2 秒锁定预警，半径 3.5；伤害为目标最大生命 18/26/36/46/55%；周期 14/13/12/11/10 秒 | 已接线；伤害类型 champion_skill_aoe，可由护甲减免 |
| THUNDER / 天雷 | 18 / 5 | 1.5 秒预警；2/3/4/5/6 个落点，每点 12/17/22/27/32% 最大生命，半径 2.5；落点距目标 3 至 8 格且彼此至少 5 格；周期 16/15/14/13/12 秒 | 已接线；每点最多尝试 8 次，可能少于名义点数 |
| LITTLE_BOY / 小男孩 | 28 / 7 | 仅超凡/闪耀；生命首次不高于 60% 时消耗一次，蓄力 5 秒；中心 70/85%，到 8 格边缘衰减为中心伤害的 50%；打断门槛为 max(1, 16 格内存活玩家数) x 120 伤害 | 已接线；开始蓄力即消耗，打断后不再触发 |
| DEATH_MARK / 命定之死 | 30 / 8 | 仅超凡/闪耀；选近 10 秒贡献最高的存活玩家，按实际采样跨度钳在 2 至 10 秒计算 DPS；8 秒内需打出 DPS x 8 x 1.6；对冠军伤害乘 0.7，结束后冷却 45 秒 | 已接线；失败处决仍可被部分玩家减伤源削减 |
| VISUAL_DISRUPTION / 视觉干扰 | 12 / 4 | 全品质失明 3 秒；施放周期 12/10.5/9/8/7 秒；进入 7 秒控制聚合预算 | 已接线；每秒扫描使 10.5 秒档实际最早约 11 秒 |
| SELF_REPAIR / 自我修复单元 | 14 / 4 | 生命不高于 50% 时定身引导 6 秒，每秒回复 40/空档/80/150/300 HP，期间减伤 90%；完整或中断后冷却 25 秒 | 已接线；只有近战命中会中断，中级品质向下回退普通 |
| COUNTER_UNIT / 反击单元 | 12 / 3 | 每 15 秒锁定当前目标 5 秒；反射 40/55/70/85/100%，同窗连续命中倍率从 1 倍增至最多 3 倍 | 已接线；另受每秒和 5 秒反伤上限 |
| CAESAR_SWAP / 凯撒实验型转换器 | 14 / 5 | 冷却 20/17/14/12/10 秒；24 格目标，预警 1 秒；双方落点安全且目标不在 2 秒落地保护时换位 | 已接线 |
| BLADE_WALTZ / 利刃华尔兹 | 16 / 5 | 预警 1.5 秒，3/4/5/6/7 次突袭，每 0.5 秒一次；整套最多 60% 最大生命；冷却 30 秒 | 已接线；目标超过 12 格中止 |
| SUMMON_SUPPORT / 支援 | 16 / 4 | 每次召唤 1/2/2/3/3，只数上限 2/3/4/5/6，冷却 30/26/22/18/14 秒；同种怪、24 格拴绳 | 已接线；召唤物星级为主人减 2 后钳在 1 至 4，剥除全部技能和支援词缀 |
:::

## 生命池、首领条与全局红线

- 剩余生存点只换算生命：hpFraction = 0.35 + 0.65 x (剩余生存点 / 生存预算)^1.5；体型词缀自身成本不扣这部分生命；最终有效生命 = 星级基础有效生命 x hpFraction x 体型生命倍率。PointBudget 文档宣称剩余战斗点换伤害、剩余机动点换速度，但 ChampionHpConversion 实际只消费生存点，战斗、机动与技能余点没有转化链。
- 6 星以上必用双精度自研血池；低星有效生命超过 1024 时也启用。血池保存当前值和最大值，实体加入世界时恢复，死亡时清除；原版生命值只作为镜像。
- 普通单击硬上限：1 至 5 星为目标最大生命 40%，6 至 7 星 50%，8 至 10 星 60%。可躲单段技能不高于 90%，连段整套不高于 60%，AOE 命中后有 2 秒免疫缓冲。
- 冠军比例减伤合并后最多 75%；重型护甲的固定门槛和刚毅的固定封顶在比例结算后仍可继续压低伤害。虚空、管理员击杀等 bypasses_invulnerability 来源绕过冠军血池减伤。
- 持续伤害聚合不高于玩家最大生命 15% 每秒，同一来源每秒最多刷新一次；减速不高于 50%；任意 7 秒窗口受控不高于 50%，且至少留出 2 秒自由窗口。
- 反伤全局不高于攻击者最大生命 30% 每秒、40% 每 5 秒；反击单元另有 20% 每秒私有限制。混沌重击、凯撒和华尔兹共享 2 秒落地保护。
- 首领条扫描半径 48 格、每 10 tick 刷新；标题包含实体名、星级和词缀，颜色取最接近星级 RGB 的原版条色，6 至 7 星用六段样式，8 至 10 星用十段样式。35 个词缀都有原版粒子映射，每 5 tick 每词缀发 2 粒子。

## 冠军奖励与伤害归属

:::table
| 项目 | 精确规则 | 接线状态 |
| --- | --- | --- |
| CREDIT 总池 | 固定为星级 x 600，即 600 至 6000；先经全局每日货币水龙头 | 已接线 |
| AZURE 总池 | 1 至 5 星为 0；6/7/8/9/10 星为 2/4/6/8/10；再经每日上限 | 已接线 |
| 资格门槛 | 结算时在线，且伤害至少为首领有效最大生命 0.5%，或至少为队伍平均伤害 15%；平均值只统计正伤害玩家 | 已接线 |
| 分配 | 合格玩家按有效伤害权重分配，最后一人吸收整数舍入差 | 已接线 |
| 支援召唤物 | 不记录贡献；LivingDropsEvent 清空掉落，LivingExperienceDropEvent 清零经验 | 已接线 |
| TaCZ 枪击 | TaCZ 1.1.8 bullet DamageSource 的 causing entity 为射手，ContributionTracker 能归属到玩家 | 已接线 |
:::

> ContributionTracker 在 LivingDamageEvent.LOWEST 记录事件名义伤害；高星血池随后取消原版扣血并自行结算，因此高星贡献值是经过前序修正的输出指标，不保证等于血池实际减少量。离线玩家不分奖励。

## Champions 与 TaCZ 联动边界

- JAR 内的 16 个旧词缀文件为 adaptable、arctic、dampening、desecrating、enkindling、hasty、infested、knocking、lively、magnetic、molten、paralyzing、plagued、reflective、shielding、wounding。
- affix.champions.* 只是 MiningDim 自己语言文件里的历史键名，中英文 35 项齐全，不代表运行时调用 Champions。

:::table
| 对象 | main 中的事实 | 判定 |
| --- | --- | --- |
| Champions Java API | 源码中 top.theillusivec4.champions 导入为 0，运行时 ModList.isLoaded("champions") 门控为 0；ChampionSystem 与 AgentSystem 均自行装配 | 当前冠军与特工联动不依赖 Champions |
| Champions 元数据 | mods.toml 仍声明可选依赖范围 [1.20.1-2.1.10.2,1.20.1-2.1.11)，build.gradle 仍有 compileOnly | 陈旧声明；装了不兼容版本时仍可能阻止加载 |
| 旧 Champions 数据 | JAR 仍含 data/champions/affix_setting 下 16 个旧 JSON；deploy/champions-ranks.toml 不在 JAR | 未被自研 AffixRoller 读取，不算当前 35 词缀 |
| TaCZ 伤害 | UHMWPE、偏斜、重型护甲的子弹分支按 tacz:bullet* 分类；贡献可从 causing entity 取到射手 | 条件联动 |
| TaCZ 武器箱 | mods.toml 可选范围 [1.1.8,1.1.9)，build.gradle compileOnly 1.1.8-hotfix | 开箱实际硬门控 TaCZ 与资源导出 |
:::

## 武器箱配置、抽取与回执

:::table
| 项目 | 默认值 | 约束或行为 |
| --- | --- | --- |
| 箱体 | founders / 创始武器箱 | CaseCatalog 当前唯一箱体 |
| 单次成本 | 50000 CREDIT 与 10 AZURE | 两种货币同时扣除，最小配置值均为 1 |
| 新开箱冷却 | 20 tick | 配置范围 1 至 1200；同一 openingId 重放不算新开箱 |
| 归属检查周期 | 20 tick | 配置范围 1 至 200 |
| 权重总数 | 100000 | 蓝 79110、紫 15500、粉 4000、红 990、金 400；每项必须大于 0 且总和固定 |
| 稀有度概率 | 蓝 79.11%、紫 15.5%、粉 4%、红 0.99%、金 0.4% | 先用安全随机整数抽稀有度，再在该稀有度皮肤中均匀抽取 |
| 动画转盘 | 40 项，stopIndex=35 | 胜者和完整转盘先落库，随后才交给客户端播放 |
| case.state | 配置、钱包、权重、17 项目录、最新 60 件资产与总数 | 仅回执截 60，数据库查询仍读取全部资产 |
| case.open | openingId，caseId 可省略为 founders | 返回 replayed、stopIndex、钱包、结果与 40 项转盘 |
| case.apply | assetId | 返回 applied、assetId、skinId、gunId、displayId |
:::

> 服务器配置文件为 miningdim-case-opening.toml；实现入口为 caseopening/CaseOpeningConfig.java、CaseWeights.java、CaseRoller.java、CaseOpeningService.java 与 CaseWebUiActions.java。

## 武器箱 17 款皮肤目录

:::table{caption="每款显示 ID 均为 miningdim:case_<skinId>_display。单款概率为默认权重下的精确边际概率。" mono="1,2"}
| 稀有度 | skinId / 中文名 | 限定枪械 ID | 单款概率 |
| --- | --- | --- | --- |
| 蓝 | arctic_grid / 极地网格 | tacz:m4a1 | 11.3014285714% |
| 蓝 | copper_wasp / 赤铜胡蜂 | tacz:ak47 | 11.3014285714% |
| 蓝 | midnight_tide / 午夜潮汐 | tacz:glock_17 | 11.3014285714% |
| 蓝 | desert_signal / 荒漠信号 | tacz:hk_mp5a5 | 11.3014285714% |
| 蓝 | jade_circuit / 翡翠回路 | tacz:scar_l | 11.3014285714% |
| 蓝 | urban_rain / 都市骤雨 | tacz:m1014 | 11.3014285714% |
| 蓝 | ember_trace / 余烬轨迹 | tacz:p90 | 11.3014285714% |
| 紫 | violet_reactor / 紫晶反应堆 | tacz:aug | 3.875% |
| 紫 | crimson_current / 绯红电流 | tacz:deagle | 3.875% |
| 紫 | cobalt_fang / 钴蓝獠牙 | tacz:ai_awp | 3.875% |
| 紫 | neon_rift / 霓虹裂隙 | tacz:vector45 | 3.875% |
| 粉 | aurora_protocol / 极光协议 | tacz:hk416d | 1.3333333333% |
| 粉 | dragon_glass / 龙息琉璃 | tacz:ak47 | 1.3333333333% |
| 粉 | eclipse_bloom / 蚀日花火 | tacz:m4a1 | 1.3333333333% |
| 红 | vermilion_sovereign / 朱雀君临 | tacz:ai_awp | 0.495% |
| 红 | obsidian_crown / 黑曜王冠 | tacz:deagle | 0.495% |
| 金 | gilded_omen / 鎏金神谕 | tacz:timeless50 | 0.4% |
:::

## 武器箱资产、恢复与 TaCZ 强制归属

- TaCZ 资源通过反射调用 com.tacz.guns.api.resource.ResourceManager.registerExportResource(Class,String)，导出 assets/miningdim/custom/miningdim_cases。类、方法或资源注册任一失败都会把系统标成不可用，拒绝发生在扣款前。
- JAR 内含 gunpack.meta.json、17 个 display/guns JSON、17 张 textures/gun/uv PNG、内置 WebUI assets/miningdim/web/case-opening.html，以及 case_unlock、case_open、case_tick、五种稀有度揭示共 8 个 OGG 和 sounds.json 注册。
- 每次开箱创建唯一 SkinAssetRow，重复皮肤仍会产生不同 assetId；tradeLockedUntil 当前总为 0。SQLite 与经济账本共用 miningdim.db，开箱状态为 RESERVED、DEBITED、COMMITTED、REFUNDED、QUARANTINED。
- openingId 提供幂等重放。结果、转盘、费用先持久化；双币扣款、资产写入、终态推进和永久 economy_settled 锚在同一事务内完成。启动期与玩家登录期会恢复中断事务，账本与资产矛盾时隔离，结算锚不受经济账本 30 天清理影响。
- apply 要求玩家主手正拿着 asset.gunId 完全匹配的 TaCZ 枪，写入 MiningDimCaseAssetId、MiningDimCaseOwnerId 与 GunDisplayId。登录、周期主手检查、GunDraw，以及 GunFire/GunShoot 前都会移除无授权显示；开火边界若发生移除会取消本次射击。
- 归属缓存只缓存授权成功结果，玩家登出和服务重置时清除，未授权结果每次回落 SQLite，避免伪造资产长期命中。

## 玩家战斗减伤

:::table{caption="多个来源按 keep=max(各来源 (1-r) 的乘积, 0.15) 合并，总减伤上限 85%。只处理玩家受伤。" mono="0"}
| ReductionSource.name() | 适用伤害 | 精确数值 | 状态 |
| --- | --- | --- | --- |
| 矿脉抗性 | 仅矿脉区域内的落石、钟乳石、铁砧、岩浆、火焰、热地板和非玩家爆炸；不含玩家爆炸与普通战斗 | 职业等级 5 至 10 为 10/15/20/25/30/35% | 已接线 |
| tarot_premonition | 正位女祭司窗口内第一击 | 20/25/30/35%，命中后消耗窗口 | 已接线 |
| 凝脂 | explosion 与 player_explosion | 30/45/60%，持续 120 秒 | 已接线 |
| 烈酒钝感 | 全部伤害 | 每层永久伏特加 5%，最多 5 层即 25% | 已接线 |
:::

> CombatSystem 当前没有中央配置，四种生产来源硬接在 PlayerDamageReduction 中；CombatConstants 仍有冠军 49% 旧注释，与当前 ChampionRedlines 的 75% 不一致。

## 易伤效果

- 唯一通用效果为 miningdim:vulnerability，中文名“易伤”，英文名 Vulnerability，类型 HARMFUL、深红色；资源为 assets/miningdim/textures/mob_effect/vulnerability.png。
- 效果 I 至 V 分别使最终伤害增加 20%、35%、50%、70%、100%，更高等级钳到 V。它在 LivingHurtEvent 处理，位于护甲、附魔和抗性之后、吸收之前，适用于全部伤害来源。
- 同一原版 MobEffect 只能保留最高实例，多个来源不会相乘。冠军撕裂向下映射到这五档；塔罗逆位女祭司也会施加，塔罗免疫窗口可以直接绕过易伤。

> 源码为 effect/ModJobEffects.java、VulnerabilityEffect.java 与 VulnerabilityHurtHandler.java。没有单独效果 GameTest 文件，但冠军攻击与塔罗测试覆盖了调用链。

## 金钱修补附魔

:::table
| 项目 | 真实规则 |
| --- | --- |
| ID 与属性 | miningdim:money_mending / 金钱修补；VERY_RARE、BREAKABLE、最高 1 级、附魔成本 25 至 75、宝藏附魔 |
| 获取限制 | 不可普通发现、不可村民交易，与原版 minecraft:mending 互斥；任务附魔书池是实际发放入口 |
| 支持装备 | 铁、金、钻石、下界合金材质的剑、锄、镐、斧、铲与四件护甲；木、石、皮革、锁链、海龟壳、所有 mod 物品、TaCZ 枪和独立护甲师装备均不支持 |
| 修理循环 | 每 20 tick 扫描主手、副手与四个护甲槽；默认每件每秒最多修 10 点耐久；余额不足时只修买得起的部分，先扣款后修复，不负债 |
| 定价公式 | ceil(材质总价值 / 物品最大耐久 x 2.0)，每点至少 1 CREDIT；倍率配置范围 1.01 至 100 |
| 材质单价 | 铁 60、金 120、钻石 500、下界合金碎片 4500、下界合金锭 18480；锭价按 4 碎片加 4 金 |
| 材质数量 | 头盔 5、胸甲 8、护腿 7、靴子 4；镐与斧 3、剑与锄 2、铲 1；下界合金价为对应钻石装备材料总价再加 1 个下界合金锭 |
| 任务书概率 | 附魔池权重 15/120=12.5%；每日与特殊任务 4% 出附魔书，综合 0.5%；每周与隐藏任务 30%，综合 3.75% |
:::

> 服务器配置文件为 miningdim-money-mending.toml；源码为 enchant/MoneyMendingEnchantment.java、MoneyMendingHandler.java、RepairPricing.java，以及 quest 奖励池。

## 明确缺陷、半实现与未接线项

:::table
| 严重度 | 项目 | 审计结论 | 源码依据 |
| --- | --- | --- | --- |
| Major | 剩余点数转化 | PointBudget 文档承诺战斗余点转伤害、机动余点转速度；运行时只有生存余点转生命，另外三池余点被丢弃 | champion/PointBudget.java、ChampionHpConversion.java |
| Major | 重炮 | 伤害增幅可达，但攻速惩罚与明显前摇没有调用链 | champion/ChampionAttackValues.java、integration/ChampionAttackHandler.java |
| Major | 嗜血 | 低血伤害增幅可达，攻速增益没有调用链 | champion/ChampionAttackValues.java |
| Major | 反震 | 实际只反射给直接归属为玩家的攻击者；AffixDef 所述周围 AOE 与击退没有实现 | champion/integration/ChampionSelfEffectHandler.java |
| Major | 武器箱资产占用 | apply 不消费、不绑定也不记录装备槽；同一 assetId 可以反复应用到任意数量的同款枪，重复同皮肤资产当前只有计数差异 | caseopening/CaseOpeningService.java、CaseTaczBridge.java、store/SkinAssetRow.java |
| Major | 武器箱交易 | 没有转移、交易或 owner 更新入口；tradeLockedUntil 固定为 0，字段当前无玩法作用 | caseopening/store/SkinAssetRow.java、CaseDao.java、CaseWebUiActions.java |
| Major | Champions 依赖漂移 | 当前代码不使用 Champions，但 mods.toml 仍限制可选版本；安装范围外版本仍可能导致加载拒绝，16 个旧词缀 JSON 也继续入包 | src/main/resources/META-INF/mods.toml、build.gradle、data/champions/affix_setting |
| Minor | 高速移动钳制 | 移速加成已生效，但“不超过玩家疾跑”的结果上限未实现 | champion/ChampionSelfBuffValues.java、integration/ChampionSelfEffectHandler.java |
| Minor | 子弹专属词缀 | 自然抽取不检查 TaCZ；无 TaCZ 时 UHMWPE 与偏斜可被抽中但没有可识别子弹收益 | champion/AffixRoller.java、ChampionDamageReduction.java |
| Minor | 冠军攻击触发面 | 处理器注释称近战，实际所有 causing entity 为冠军的伤害都会触发攻击词缀，包括部分投射物 | champion/integration/ChampionAttackHandler.java |
| Minor | 命定处决旁路 | champion_execution 绕过护甲与附魔但未绕过 CombatSystem 的玩家减伤聚合，100% 名义伤害不等于保证死亡 | champion/ChampionDamageTypes.java、combat/PlayerDamageReduction.java |
| Minor | 支援召唤物重载 | summonedByAffix 会持久化，但主人 UUID 关联只在内存；服务重启或区块重载后召唤物转为独立活动，仍保留无贡献、无经济掉落标记 | champion/integration/ChampionSummonHandler.java、MiningChampionData.java |
| Minor | 实时检视 UI | 服务器 champion.inspect 可用，但 CodexPage 正常入口无法取得网络 entityId，只有 mock 流能展示实时目标 | champion/ChampionWebUiActions.java、webui/src/pages/CodexPage.tsx |
| Minor | 资产列表扩展性 | case.state 只回传最新 60 项，但 ownedAssets 先从 SQLite 读取全部资产再截断 | caseopening/CaseOpeningService.java、CaseWebUiActions.java |
:::

## 编译产物、资源与测试证据

:::table
| 证据 | 结果 | 解释 |
| --- | --- | --- |
| 生产 JAR | build/libs/miningdim-1.20.1-1.0.19-all.jar；32,305,962 字节；SHA-256 B4A30F5D6C4A935EB11E8A438C2F58108F55C91611F8ABBDE0D52224F47CD255 | 构建时间晚于 701093b 提交约 47 秒，Manifest 版本 1.0.19 |
| JAR 类计数 | champion 194、caseopening 40、combat 7、effect 3、enchant 9 | 五个审计子系统均有字节码入包 |
| 冠军资源 | 3 个自定义伤害类型 JSON、bypasses_armor 与 bypasses_enchantments 标签、35 项中英文翻译、易伤贴图 | 伤害源、名称和效果图标齐全 |
| 武器箱资源 | 17 display JSON、17 PNG、gunpack.meta.json、8 OGG、sounds.json 与内置 case-opening.html | 目录与 CaseCatalog 17 项一一对应 |
| 冠军 GameTest | 37 个文件、336 个 @GameTest 方法 | 覆盖基础、词缀、红线、血池、技能、奖励、WebUI 与边界 |
| 武器箱 GameTest | 1 个文件、24 个 @GameTest 方法 | 覆盖权重、转盘、事务、恢复、归属与 TaCZ 桥 |
| 战斗 GameTest | 1 个文件、5 个 @GameTest 方法 | 覆盖乘法聚合、85% 上限和来源边界 |
| 金钱修补 GameTest | 1 个文件、9 个 @GameTest 方法 | 另有任务奖励测试覆盖附魔书入口 |
| 本轮执行 | 未重新运行 Gradle 或 GameTest | 遵守 Wok-Project 只读审计；结论基于源码、注册链、资源与现有生产 JAR |
:::

> GameTest 源文件位于 src/main/java，测试 class 也随发布 JAR 入包；它们是验证证据，不是玩家玩法入口。完整运行时仍应在带 TaCZ 1.1.8 的专用测试服验证资源反射导出、WebUI 和数据库恢复。
