---
order: 80
name: 厨师与铸甲师完整审计
en: Chef / Engineer audit
group: 职业
tagline: 核对两个职业的注册链、完整操作、物品与精确默认数值，并区分已接线玩法和仅注册内容。
facts:
  - label: 源码快照
    value: main@701093bd8492
  - label: 职业 ID
    value: chef / engineer
  - label: 注册方块
    value: 5 张调味台 + 6 张生产台
  - label: 工程师装备
    value: 6 修复板 + 54 板甲 + 21 等离子盾 ID
  - label: 审计状态
    value: 启动接线已证实；部分内容生存不可达
---

MiningDim.registerSubsystems() 在共享 JobFrameworkSystem 与 CombatSystem 之后实际构造 EngineerSystem 和 ChefSystem；两个系统的类、注册物、菜单、数据资源与测试类也进入 1.0.19 构建产物。因此本页不按文件名猜功能，而是继续检查注册、事件订阅、配方或发放入口。结论是：两套职业主循环已接线；厨师存在客户端缺纹理和烹饪中可换料问题；铸甲师的板甲与等离子盾虽然完整注册，却没有普通生存获取链。

## 共享职业等级、经验与命令

:::table{mono="1"}
| 项目 | 精确值 | 说明 |
| --- | --- | --- |
| 1–10 级累计经验 | 0 / 3300 / 7100 / 11600 / 16900 / 23200 / 30600 / 39400 / 49700 / 61900 | 两职业共用 |
| 当日原始 XP 0–1999 | x1.00 | 按 UTC 日期重置 |
| 当日原始 XP 2000–2799 | x0.40 | 分段衰减 |
| 当日原始 XP 2800–3399 | x0.20 | 分段衰减 |
| 当日原始 XP 3400–3799 | x0.08 | 分段衰减 |
| 当日原始 XP 3800+ | x0.02 | 分段衰减 |
| 玩家命令 | /job list；/job info <job>；/job wallet | 没有厨师或铸甲师独立命令 |
| 管理命令 | /job set <player> <job> <level> | 需要权限等级 2 |
:::

> 铸甲师稳定 ID 是 engineer，同时兼容 armorer 和“铸甲师”别名；EngineerSystem.name() 返回 ArmorerSystem 是遗留字符串，不是第三个职业。

## 厨师注册物与真实入口

- 两槽分别为任意具有 FoodProperties 的食物、可选的 #miningdim:seasonings 调料。没有 item capability，漏斗不能自动输入或取出。
- 调味台复制原版锻造台方块属性；五阶方块模型都复用原版 smithing_table 纹理。
- 五阶 blockstate、方块模型、物品模型、掉落表、语言和配方均存在。

:::table{mono="1"}
| 类型 | 注册 ID 或入口 | 状态 |
| --- | --- | --- |
| 调味台方块及 BlockItem | miningdim:seasoning_table_low / medium / high / extraordinary / radiant | 五项均注册 |
| 方块实体 | miningdim:seasoning_table | 同一个 BE 支持五阶方块 |
| 菜单 | miningdim:seasoning_table | 两槽原生容器 |
| 创造页 | miningdim:miningdim_chef | 包含五张调味台 |
| 网络频道 | miningdim:chef | C2S: START / HEAT_CLICK / SEASON_HIT |
| WebUI action | job.chef.state | 只读状态与配置；QTE 不在网页执行 |
| 配置文件 | miningdim-chef.toml | 服务端配置 |
:::

## 调味台升级配方

:::table{mono="0,1"}
| 产物 | 无序合成材料 |
| --- | --- |
| seasoning_table_low | minecraft:smithing_table + 2 minecraft:bowl |
| seasoning_table_medium | seasoning_table_low + 2 minecraft:iron_ingot |
| seasoning_table_high | seasoning_table_medium + 3 minecraft:gold_ingot |
| seasoning_table_extraordinary | seasoning_table_high + 3 minecraft:diamond |
| seasoning_table_radiant | seasoning_table_extraordinary + minecraft:netherite_ingot + minecraft:nether_star |
:::

## 厨师完整操作流程

1. 放入一份食物，可选放入一份属于 #miningdim:seasonings 的调料；开始后服务器记录操作员 UUID。
2. 火候阶段从 0 开始，每 tick 增加 2，最大 200；绿区固定为 120–160。点击一次锁定火候，超过 200 视为过火。
3. 调味阶段依次出现 4 个提示；每个有效 20 tick，提示之间间隔 25 tick。玩家可命中 0–4 次。
4. 综合分为 0.5 × 火候准确度 + 0.5 × 命中比例，再同时受调味台阶级和职业等级上限裁切。
5. 服务器结算时消耗一份食物和可选的一份调料，将品质、效果和厨师 UUID 写入 MiningChef NBT，并把成品送入启动者背包；背包满则掉落。

- 绿区中心准确度 1.0，绿区边缘 0.7；区外随距离下降，最低 0.5；过火为 0。
- 所有台阶默认每次收费 5 credit。经济服务未注册或配置费用不大于 0 时免费；余额不足会回到 idle 并保留材料。
- QTE 过程不持久化，服务器重启会回到 idle；容器内物品会持久化。

## 厨师品质判定与经验

| 品质 | 综合分门槛 | 等级上限 | 最多效果 | 允许失败效果 | 允许战斗效果 | 原始 XP |
| --- | --- | --- | --- | --- | --- | ---: |
| 低级 Low | < 0.35 | L1–2 | 1 | 是 | 否 | 50 |
| 中级 Medium | >= 0.35 | L3–4 | 1 | 是 | 否 | 80 |
| 高级 High | >= 0.55 | L5–6 | 2 | 是 | 是 | 130 |
| 非凡 Extraordinary | >= 0.75 | L7–8 | 2 | 否 | 是 | 220 |
| 光辉 Radiant | >= 0.90 | L9–10 | 3 | 否 | 是 | 400 |

> 最终品质取原始判定、台阶上限、等级上限三者最低值。效果数=min(品质最大数,max(1,命中数))，因此调味 0 命中仍会得到 1 个效果；效果不重复，战斗效果至多一个。

## 调料联动与抽取偏向

:::table{mono="1"}
| 风味 | 调料来源 | 权重提高到 3 的效果 |
| --- | --- | --- |
| 甜 | minecraft:sugar；minecraft:honey_bottle；flavor_immersed_daily 的 brownsugar / crystalsugar / whitesugarsyrup / concentratedsyrup | AMPLIFY、AFTERTASTE_SAT |
| 咸鲜 | farmersdelight:tomato_sauce；flavor_immersed_daily 的 salt / soy / pepperedsalt / thickbroadbeansauce / sweetflourasuve | ENDURANCE、NOURISH_FOOD、AMPLIFY |
| 油润 | flavor_immersed_daily:cookingoil / sesameoil / butter / cream | SHIELD、NOURISH_HEAL、GREASE |
| 酸 | flavor_immersed_daily:vinegar | PURIFY、STABLE_AIM |
| 辣 | flavor_immersed_daily:chillipowder / drysichuanpepper / chinesepicklyashpowder | NOURISH_HEAL、REFRESH |
| 香 | flavor_immersed_daily:ginger / garlic / garlicpowder / cumin / cuminpowder / onionpowder / sesamepowder | NIGHT_SIGHT、ENDURANCE |
| 复合 | flavor_immersed_daily:curry / spicy_hot_pot_base / pepper_hot_pot_base | 无额外偏向 |
:::

> Farmers Delight 与 Flavor Immersed Daily 条目在标签中均为 required:false；对应模组未安装时不会阻止数据包加载。未匹配效果的权重保持 1。

## 厨师正面效果精确默认值

- AMPLIFY 只处理该食物 FoodProperties 声明的药效，不延长玩家已有 buff；金苹果、附魔金苹果与 15 个 Flavor Immersed Daily 战斗效果在黑名单。
- ENDURANCE 实现并不直接减少 exhaustion，而是每 40 tick 增加 1.0 × rate 的饱和度；玩家 food level 必须大于 0，且不超过当前饥饿值。
- SHIELD 提升到目标吸收量而非叠加；GREASE 通过全局 PlayerDamageReduction 处理 explosion 与 player_explosion。
- STABLE_AIM 配置里有 Medium 50%，但该效果要求 L7+ 和战斗品质，而 Medium 不允许战斗效果，故 50% 档实际不可达。

| 效果 | 可出现条件 | Low / Medium / High / Extraordinary / Radiant |
| --- | --- | --- |
| AMPLIFY | 全等级 | 食物自身正面药效时长 x1.2 / x1.5 / x2 / x3 / x5 |
| NOURISH_FOOD | 全等级 | 食用后当前总饥饿值 x1.5 / x2 / x3 / x4 / x8，封顶 20 |
| AFTERTASTE_SAT | 全等级 | 食用后当前总饱和 x1.5 / x2 / x3 / x4 / x5，封顶当前饥饿值 |
| SATED_JUMP | 全等级 | Jump Boost I / II / III / IV / V，均 60 秒 |
| REFRESH | 全等级 | 清 Mining Fatigue 与 Slowness；Haste I–V，90 / 150 / 240 / 360 / 600 秒 |
| NIGHT_SIGHT | 全等级 | Night Vision I，60 / 120 / 240 / 480 / 900 秒 |
| ENDURANCE | L3+ | 15% / 30% / 50% / 70% / 90%，120 / 180 / 300 / 480 / 900 秒 |
| NOURISH_HEAL | L5+ 且战斗品质 | Low/Medium 无；High 7.5%、Extraordinary 10%、Radiant 100% 最大生命 |
| PURIFY | L5+ 且战斗品质 | High 清 3 个、Extraordinary 4 个、Radiant 全部有害效果 |
| SHIELD | L7+ 且战斗品质 | High/Extraordinary/Radiant：最大生命 4% / 6% / 8% 吸收，120 秒 |
| GREASE | L5+ 且战斗品质 | High/Extraordinary/Radiant：爆炸减伤 30% / 45% / 60%，120 秒 |
| AFTERTASTE_REGEN | L5+ 且战斗品质 | 30 秒共恢复最大生命 5% / 6% / 10%，每秒结算 |
| STABLE_AIM | L7+ 且战斗品质 | High/Extraordinary/Radiant：击退降低 70% / 85% / 100%，60 秒 |

## 厨师失败效果与生命周期

| 效果 | Low / Medium / High | 实际行为 |
| --- | --- | --- |
| UNDERDONE | 80% / 50% / 25%；12 / 8 / 6 秒 | 随机施加 Slowness、Mining Fatigue 或 Weakness I |
| SCORCHED | 最大生命 8% / 5% / 3% | 自伤，但不会把生命降到 1 以下 |
| NAUSEA | 8 / 6 / 4 秒 | 名称与实现不符：实际为 Poison II / Poison I / Poison I，另减 2 饥饿 |
| OVERSALT | 仅 Low、Medium | 当前饱和度减半 |
| SPOILED | 仅 Low | 反向扣回原食物的饥饿与饱和恢复，跳过其他效果 |

> 窗口效果均为内存态、刷新而不叠加；死亡、换维度、登出会清除，服务器重启也会丢失。

## 厨师已证实缺陷

| 严重度 | 问题 | 证据与影响 |
| --- | --- | --- |
| Major | 调味台 GUI 纹理缺失 | SeasoningScreen 引用 textures/gui/seasoning_table.png，但源码与构建产物均无该文件，客户端会显示缺失纹理。 |
| Major | 烹饪期间可换料或偷料 | 方块没有主人或锁；虽只有 operator UUID 可发 QTE 包，但菜单槽在 QTE 中仍可移动，结算使用当时槽内物品。 |
| Major | 0 命中仍必出效果 | 效果数公式硬性 max(1,hits)，失误不能得到零效果。 |
| Minor | Tooltip 不显示数值 | ChefTooltipHandler 只显示品质和效果名，没有配置中的倍率、百分比或持续时间。 |
| Minor | 文案与实现有偏差 | ENDURANCE 是定时补饱和而非直接减慢饥饿衰减；NAUSEA 实际施加 Poison。 |

## 铸甲师注册物与界面

:::table{mono="1"}
| 类型 | 注册 ID 或数量 | 玩家入口 |
| --- | --- | --- |
| 生产台方块及 BlockItem | miningdim:production_table_low / medium / high / superior / transcendent / radiant | 六阶配方与原生菜单 |
| 方块实体与菜单 | miningdim:production_table | 同一类型支持六阶 |
| 纳米修复板 | miningdim:nano_plate_low / medium / high / superior / transcendent / radiant | 生产台制造；每格 16 |
| 板甲胸甲 | 54 × miningdim:plate_armor_<variant> | 仅创造/admin，生存无发放链 |
| 正式等离子盾 | 18 × miningdim:plasma_shield_{nano\|standard\|quantum}_{i..vi} | 仅创造/admin，生存无发放链 |
| 旧等离子盾 ID | plasma_shield_nano / plasma_shield_light / plasma_shield_heavy_ion | 隐藏于创造页；旧存档/admin |
| 创造页 | miningdim:miningdim_engineer | 6 台、6 板、54 板甲、18 正式盾 |
| WebUI action | job.engineer.state | 只读职业/修复板/纳米效果；不含板甲和盾矩阵 |
| 配置文件 | miningdim-engineer.toml | 含生产、纳米效果、plateArmor、plasmaShield |
:::

## 生产台升级配方

:::table{mono="0,1"}
| 产物 | 有序合成 |
| --- | --- |
| production_table_low | 8 iron_ingot 围 smithing_table |
| production_table_medium | 8 gold_ingot 围 production_table_low |
| production_table_high | 8 diamond 围 production_table_medium |
| production_table_superior | 8 netherite_ingot 围 production_table_high |
| production_table_transcendent | BNB / NTN / BNB；B=netherite_block，N=netherite_ingot，T=superior |
| production_table_radiant | BSB / BTB / BBB；B=netherite_block，S=nether_star，T=transcendent |
:::

> 配方 JSON 实际位于 data/miningdim/recipes/production_table_*.json，不在 engineer 子目录。

## 修复板生产与修复数值

| 阶级 | 解锁等级 | 输入 | 基础产量 | 最低时间 | 原始 XP | 修复量 |
| --- | ---: | --- | ---: | ---: | ---: | --- |
| LOW | 1 | 4 iron_ingot | 1 | 100 tick / 5 秒 | 15 | 100 耐久 |
| MEDIUM | 3 | 5 gold_ingot | 1 | 120 / 6 秒 | 30 | 250 耐久 |
| HIGH | 5 | 3 diamond | 1 | 160 / 8 秒 | 60 | 600 耐久 |
| SUPERIOR | 7 | 1 netherite_ingot | 2 | 200 / 10 秒 | 110 | 最大耐久 30% |
| TRANSCENDENT | 9 | 1 netherite_ingot | 1 | 240 / 12 秒 | 200 | 最大耐久 65% |
| RADIANT | 10 | 2 netherite_ingot | 1，50% 成功 | 300 / 15 秒 | 200 | 完全修复；失败返 1 netherite_scrap |

## 铸甲师生产操作、权限与经验

1. 放置生产台时记录主人；主人可潜行空手切换锁。锁定后仅主人或权限等级 2 的管理员能打开。
2. 未锁时他人能开菜单并移动输入，但启动生产和取出产物仍要求主人或管理员。漏斗只接入输入槽，输出必须手取。
3. 服务器校验材料、职业等级、台阶上限、输出槽和 operator UUID 后开始校准。
4. 默认校准条宽 200、游标每 tick 移动 6、绿区宽 30；每个半程只可点击一次，命中加 20 进度与 1 qualityHit，未命中加 2，目标 100；每次触边重随机绿区。
5. 进度达到 100 且最低时间结束后产出；qualityHits 不少于 4 时独立有 50% 概率多出 1 个修复板。
6. 生产 XP 只在生产者取走输出时结算一次：原始 XP × (1+0.05×qualityHits) × 实际取出数量，再过共享日衰减。

> 代码用生产台自身阶级的 produceTicks，而不是所选修复板阶级；在高级台制造低阶板会被高级台更长的最低时间拖慢。

## 纳米修复流程与效果抽取

- 一手拿修复板、另一手拿明确的 damageable 目标；若另一手没有目标，则自动选择已穿护甲中损坏比例最高的一件。
- 拒绝等离子盾、带纳米 SHIELD 的护甲、Unbreakable、不可损坏物品与满耐久物品；只有 Radiant 可对满耐久普通 ArmorItem 重抽。
- 任意可损坏工具或模组装备都可修，但纳米效果只抽到普通 ArmorItem；工具和 PlateArmorItem 不抽效果，板甲修复时还会清除旧纳米效果。
- LOW/MEDIUM 清旧效果且不生成新效果；HIGH/SUPERIOR/TRANSCENDENT 以 min(1,0.20+0.05×qualityHits) 概率等概率抽一个；RADIANT 必定等概率抽一个。
- 效果写入 NBT 时移除 Mending；拾取经验也会剥离已装备或手持的纳米效果装备上的 Mending。铁砧中凡是会降低 damage 的操作都取消，只改名或附魔而不修理仍允许。
- 只有修复板 producer UUID 与修复者相同才给修复 XP：该阶原始 XP × 1.5，再过日衰减；他人制造的板仍能修理但不给经验。

## 四种纳米效果精确行为

| 效果 | 默认值 | 失效条件或边界 |
| --- | --- | --- |
| RESHAPE | 每 20 tick、每件修 2 耐久 | 已损耐久超过最大耐久 40% 后停止 |
| VITALITY | 每 20 tick 基础回 2% 最大生命；多件因子 100% / 50% / 25% / 12.5% | 单件剩余耐久低于 50% 停效；四件合计每秒 3.75% 最大生命 |
| SHIELD | 每件 5 充能，每 1200 tick 回 1；触发后本次及后续 40 tick 全免伤 | bypass tag 不挡；穿着功能正常的 PlateArmor 或 PlasmaShield 时，其他槽位纳米 SHIELD 也整体停用 |
| TOTEM | 取消死亡、回 50% 最大生命、40 tick 无敌并灭火 | 人物级共享冷却 36000 tick / 30 分钟；每件穿戴 TOTEM 装备损耗 floor(最大耐久 25%) |

> \#miningdim:bypasses_nano_shield 与等离子盾绕过标签均包含 #minecraft:bypasses_invulnerability、starve、drown、in_wall、cramming。

## 板甲伤害模型

- 54 件全部是胸甲。功能正常时中和原版 armor 与 toughness，改用 R（普通弹防护）、Q（穿甲弹防护）、G（通用物理防护）、T（压力容量）。
- TaCZ 普通弹 tacz:bullet 与 bullet_void：最终伤害 X×(1-R)；穿甲弹 bullet_ignore_armor 与 bullet_void_ignore_armor：X×(1-Q)。未知 TaCZ 伤害 ID 不进入该分支。
- 通用物理覆盖 mob/player attack、projectile、explosion、champion skill AOE；排除 bypass_armor、fire、magic、indirect_magic、wither、wither_skull、dragon_breath、thorns。最终伤害 X-min(X,T)×G。
- 每次命中磨损 max(1,floor(原始伤害/4))；物品自身 vanilla damageItem 返回 0，避免重复磨损。
- TaCZ 为 compileOnly 条件联动，仅 tacz 已加载时订阅；mods.toml 可选依赖范围 [1.1.8,1.1.9)。pre/post/kill ledger 用于避免多段伤害重复磨损。

## 板甲六级基础矩阵

| 等级 | R light / medium / heavy | Q light / medium / heavy | G light / medium / heavy | T light / medium / heavy |
| --- | --- | --- | --- | --- |
| I | .45 / .50 / .55 | 0 / 0 / 0 | .35 / .40 / .45 | 16 / 20 / 24 |
| II | .60 / .65 / .70 | .02 / .05 / .08 | .45 / .50 / .55 | 24 / 32 / 38 |
| III | .75 / .80 / .85 | .08 / .10 / .15 | .60 / .68 / .70 | 38 / 48 / 58 |
| IV | .85 / .88 / .90 | .15 / .20 / .25 | .70 / .76 / .78 | 58 / 72 / 84 |
| V | .90 / .92 / .94 | .25 / .35 / .45 | .78 / .84 / .86 | 84 / 96 / 112 |
| VI | .94 / .96 / .98 | .45 / .50 / .55 | .86 / .88 / .90 | 112 / 128 / 154 |

> 基础移动速度 light +10%、medium 0、heavy -12%。

## 板甲材料修正

| 材料 | 耐久 | R 泄漏乘数 | Q 泄漏乘数 | G 泄漏乘数 | T 乘数 | 额外移速惩罚 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| UHMWPE | 850 | .88 | 1.08 | .94 | 1.08 | 0 |
| ARAMID | 900 | .94 | 1.18 | 1.00 | .90 | 0 |
| ARMOR_STEEL | 760 | .88 | .88 | .88 | 1.15 | .03 |
| COMBINED | 610 | .94 | .94 | .94 | 1.08 | .01 |
| ALUMINUM | 580 | .98 | 1.00 | .98 | 1.00 | .015 |
| TITANIUM | 700 | .90 | .98 | .94 | 1.08 | .005 |
| CERAMIC | 420 | .94 | .88 | 1.00 | 1.15 | .005 |

> 最终 R/Q/G=max(0,1-(1-base)×泄漏乘数)，但基础值为 0 时强制为 0；最终 T=基础 T×材料乘数；最终移速=体型基础-材料惩罚。

## 54 件板甲注册清单

:::table{mono="1"}
| 等级 | 注册 ID 后缀（体型 / 材料） |
| --- | --- |
| I | jaypc_olive (light/UHMWPE)；jaypc_black (light/UHMWPE) |
| II | paca (light/ARAMID) |
| III | mbss (light/UHMWPE)；tv115 (light/UHMWPE)；6b23_1_digital_flora (medium/ARMOR_STEEL)；6b5_16 (medium/COMBINED)；kirasa_n_green (medium/COMBINED)；mf_untar (medium/ALUMINUM)；kora_kulon (medium/ARMOR_STEEL)；kora_kulon_digital (medium/ARMOR_STEEL) |
| IV | mmac_ranger_green (light/UHMWPE)；rbav_af_ranger_green (light/TITANIUM)；strandhogg_ranger_green (light/ALUMINUM)；strandhogg_black_multicam (light/ALUMINUM)；trooper_tfo_multicam (light/UHMWPE)；banshee_atacs_au (light/UHMWPE)；6b13_flora (medium/ARMOR_STEEL)；6b3tm_01m_khaki (medium/TITANIUM)；ana_m1_olive (medium/ARMOR_STEEL)；a18_skanda_multicam (medium/COMBINED)；avs_ranger_green (medium/COMBINED)；avs_multicam (medium/COMBINED)；thor_concealable (medium/COMBINED)；stich_profi_v2_black (medium/ARMOR_STEEL)；tv110_coyote (medium/ARMOR_STEEL)；6b23_2_mountain_flora (heavy/ARMOR_STEEL)；6b5_15_flora (heavy/COMBINED)；osprey_mk4a_assault (heavy/ALUMINUM) |
| V | tactec_ranger_green (light/UHMWPE)；cpc_mod1_atacs_fg (light/UHMWPE)；fcpc_v5 (light/UHMWPE)；gladiator_s_light_multicam (light/CERAMIC)；hexatac_hpc_black_multicam (light/UHMWPE)；6b45_general (medium/CERAMIC)；6b45_medic (medium/CERAMIC)；gzhel_k (medium/CERAMIC)；gladiator_s_gray (medium/CERAMIC)；gladiator_s_viking (medium/CERAMIC)；tt_mkiii_coyote (medium/COMBINED)；osprey_mk4a_protection (heavy/COMBINED)；defender_2_spot_camo (heavy/CERAMIC)；defender_2 (heavy/CERAMIC)；gladiator_s_deathless (heavy/CERAMIC)；redut_m (heavy/CERAMIC)；iotv_gen4_high_mobility (heavy/TITANIUM)；iotv_gen4_full_protection (heavy/TITANIUM)；iotv_gen4_assault (heavy/TITANIUM)；korund_vm_black (heavy/ARMOR_STEEL) |
| VI | hexgrid (light/UHMWPE)；slick (medium/ARMOR_STEEL)；stich_defense_mod2 (medium/UHMWPE)；6b43_zabralo_sh (heavy/CERAMIC)；thor_integrated (heavy/COMBINED) |
:::

> 每个完整 ID 都是 miningdim:plate_armor_<后缀>。54 套物品模型、物品贴图和 layer_1 纹理均存在；49 个 Java 模型类是因为部分换色款共享几何，映射已穷举 54 项。

## 等离子盾 18 型精确默认值

| 型号 | 当前盾容量 | 总电量 | 每伤害热量 | 每秒散热 | 每秒回盾 | 回盾延迟 tick | 移速 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| NANO I | 30 | 60 | .50 | 30 | 18 | 90 | 0 |
| NANO II | 45 | 84 | .44 | 34 | 22 | 88 | 0 |
| NANO III | 65 | 114 | .39 | 38 | 26 | 86 | 0 |
| NANO IV | 90 | 150 | .34 | 42 | 30 | 84 | 0 |
| NANO V | 120 | 192 | .30 | 46 | 34 | 82 | 0 |
| NANO VI | 155 | 240 | .26 | 50 | 38 | 80 | 0 |
| STANDARD I | 45 | 112 | 2.20 | 10 | 7 | 110 | 0 |
| STANDARD II | 70 | 160 | 2.00 | 11 | 8 | 108 | 0 |
| STANDARD III | 100 | 216 | 1.80 | 12 | 9 | 106 | 0 |
| STANDARD IV | 140 | 280 | 1.60 | 13 | 10 | 104 | 0 |
| STANDARD V | 190 | 360 | 1.40 | 14 | 11 | 102 | 0 |
| STANDARD VI | 250 | 448 | 1.20 | 15 | 12 | 100 | 0 |
| QUANTUM I | 65 | 240 | .65 | 5 | 3 | 130 | -12% |
| QUANTUM II | 100 | 336 | .58 | 5.6 | 3.5 | 128 | -11.4% |
| QUANTUM III | 150 | 444 | .52 | 6.2 | 4 | 126 | -10.8% |
| QUANTUM IV | 215 | 576 | .46 | 6.8 | 4.5 | 124 | -10.2% |
| QUANTUM V | 300 | 732 | .41 | 7.4 | 5 | 122 | -9.6% |
| QUANTUM VI | 400 | 912 | .36 | 8 | 5.5 | 120 | -9% |

> 旧 ID plasma_shield_nano、plasma_shield_light、plasma_shield_heavy_ion 分别复用 NANO I、STANDARD I、QUANTUM I 数值。

## 等离子盾运行模型

- 盾占胸甲槽，原版防御为 0，不发生耐久磨损，纳米修复板明确拒绝它。
- 符合条件的原始伤害按 1:1 同时消耗 current shield 与 totalEnergy；单次可吸收量取当前盾、总电量、热余量 (100-heat)/heatPerDamage 三者最小值。
- NBT 根为 MiningDimPlasmaShield。新物品与旧存档物品初始化满电；回盾只是把 reserve=totalEnergy-currentShield 转回当前盾，不会恢复 totalEnergy。
- 最大热量 100，过热后停机，降至 30 才重启。普通受击后 20 tick 才开始散热，过热紧急散热立即开始；默认每 5 tick 结算状态、每 40 tick 心跳同步。
- S2C 网络会同步 HUD；普通命中 overlay 10 tick，过载 14 tick。plasma_shield_hit、plasma_shield_overheat、plasma_shield_steam_vent 三个声音事件及五个 OGG 资源齐全。

## 铸甲师已证实边界与缺陷

| 严重度 | 项目 | 审计结论 |
| --- | --- | --- |
| Major | 54 板甲和 21 盾无生存获取链 | 配方、掉落、商店、任务和生产台均无 plate_armor_ 或 plasma_shield_ 发放；只能创造、/give 或旧存档获得。应标为“已注册，但生存不可达”。 |
| Major | 等离子盾无总电量补充入口 | 全库未找到恢复 totalEnergy 的物品、方块或服务；回盾只搬运剩余总电量，耗尽后永久为空。 |
| Major | 纳米效果展示缺口 | 后端返回 effect.miningdim.nano.<id>、.desc 与 stat.miningdim.engineer.<key>，但 zh_cn/en_us 无这些翻译；游戏物品 tooltip 也不显示纳米 NBT。 |
| Major | 高级台制造低级板更慢 | 最低时间取 machineTier().produceTicks()，不是所选配方阶级。 |
| Minor | WebUI 信息不完整 | job.engineer.state 只展示职业、修复板与纳米效果，不包含 54 板甲或 18 正式盾的数值。 |
| Minor | 命名遗留 | 职业 ID/注册链为 engineer，中文名铸甲师，但子系统 name() 仍返回 ArmorerSystem。 |

## WebUI、持久性与源码定位

- 厨师后端 job.chef.state 返回等级、品质上限、五品质、18 效果矩阵、当前与默认配置、费用；前端位于 webui/src/pages/jobs/panels/ChefPanel.tsx。
- 铸甲师后端 job.engineer.state 返回等级、解锁阶级、六修复板、四纳米效果、复活冷却、品质加产和自制板经验；前端位于 webui/src/pages/jobs/panels/EngineerPanel.tsx。
- WebUI 默认 URL 为 http://localhost:5173/，MCEF 为可选依赖；生产服必须覆盖 webui.url 指向远端前端。webui 源码并非 mod JAR 内置页面。
- 厨师关键源码：job/chef/ChefSystem.java、ChefConfig.java、block/SeasoningTableBlockEntity.java、effect/SeasoningEffectRoller.java、effect/ChefConsumeHandler.java、web/ChefWebUiActions.java。
- 铸甲师关键源码：job/engineer/EngineerSystem.java、EngineerConfig.java、block/ProductionTableBlockEntity.java、item/NanoRepair.java、effect/*、armor/PlateArmorVariant.java、armor/PlateArmorConfig.java、shield/PlasmaShieldConfig.java、shield/PlasmaShieldHandler.java、web/EngineerWebUiActions.java。

> ChefGameTests、ChefWebUiGameTests、EngineerGameTests、EngineerWebUiGameTests、PlateArmorGameTests、PlasmaShieldGameTests 的 class 已入构建物；本轮遵守只读要求，没有执行会写构建目录的测试，不能把“测试代码存在”写成“测试已通过”。
