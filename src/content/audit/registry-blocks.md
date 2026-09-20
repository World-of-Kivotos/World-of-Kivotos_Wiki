---
order: 110
name: 方块与注册表总账
en: Block and registry ledger
group: 内容
tagline: 逐项列出 1.0.19 生产 JAR 中已接入 modBus 的方块及其他非物品注册 ID。
facts:
  - label: 全部注册项
    value: '377'
  - label: 方块
    value: '71'
  - label: 其他注册项
    value: '82'
  - label: Blockstate
    value: 69 / 71
  - label: Blockstate 模型覆盖
    value: 69 / 71
---

口径为 main@701093bd 的 MiningDim 主入口和各子系统 register(modBus) 调用，并与 miningdim-1.20.1-1.0.19-all.jar 交叉核对。表内 ID 均带完整命名空间；GameTest 与 testutil 辅助类不计作玩家注册物。

## 按系统计数

:::table
| 系统 | 方块数 | 说明 |
| --- | ---: | --- |
| 核心/入口 | 6 | 传送门、真假矿石与三档入口 |
| 农夫 | 6 | 作物与五档农田 |
| 工程师 | 6 | 六档生产台 |
| 塔罗师 | 1 | 塔罗制作台 |
| 厨师 | 5 | 五档调味台 |
| 军火商 | 8 | 六档弹药台与两台枪械机器 |
| 酿酒师 | 2 | 酿酒台与酒窖 |
| 能源 | 37 | 发电、线缆、机器、矿石与橡胶树 |
| 合计 | 71 | 同一 registry 内无重复 ID |
:::

## 71 个方块注册 ID

:::table{caption="此表由静态 ID 数组展开，适合直接复制后与 Forge 注册表转储比对。" mono="2"}
| 所属系统 | 分类 | 注册 ID |
| --- | --- | --- |
| 核心/入口 | 传送与矿石 | miningdim:mining_portal |
| 核心/入口 | 传送与矿石 | miningdim:fake_ore |
| 核心/入口 | 传送与矿石 | miningdim:trap_ore |
| 核心/入口 | 难度入口 | miningdim:entrance_easy |
| 核心/入口 | 难度入口 | miningdim:entrance_medium |
| 核心/入口 | 难度入口 | miningdim:entrance_hard |
| 农夫 | 作物 | miningdim:farmer_crop |
| 农夫 | 农田 | miningdim:farmer_farmland_low |
| 农夫 | 农田 | miningdim:farmer_farmland_medium |
| 农夫 | 农田 | miningdim:farmer_farmland_high |
| 农夫 | 农田 | miningdim:farmer_farmland_premium |
| 农夫 | 农田 | miningdim:farmer_farmland_supreme |
| 工程师 | 生产台 | miningdim:production_table_low |
| 工程师 | 生产台 | miningdim:production_table_medium |
| 工程师 | 生产台 | miningdim:production_table_high |
| 工程师 | 生产台 | miningdim:production_table_superior |
| 工程师 | 生产台 | miningdim:production_table_transcendent |
| 工程师 | 生产台 | miningdim:production_table_radiant |
| 塔罗师 | 制作台 | miningdim:tarot_craft_table |
| 厨师 | 调味台 | miningdim:seasoning_table_low |
| 厨师 | 调味台 | miningdim:seasoning_table_medium |
| 厨师 | 调味台 | miningdim:seasoning_table_high |
| 厨师 | 调味台 | miningdim:seasoning_table_extraordinary |
| 厨师 | 调味台 | miningdim:seasoning_table_radiant |
| 军火商 | 弹药工作台 | miningdim:munitions_bench |
| 军火商 | 弹药工作台 | miningdim:munitions_bench_medium |
| 军火商 | 弹药工作台 | miningdim:munitions_bench_high |
| 军火商 | 弹药工作台 | miningdim:munitions_bench_superior |
| 军火商 | 弹药工作台 | miningdim:munitions_bench_transcendent |
| 军火商 | 弹药工作台 | miningdim:munitions_bench_radiant |
| 军火商 | 枪械加工 | miningdim:gunsmith_press |
| 军火商 | 枪械加工 | miningdim:gunsmith_assembly_bench |
| 酿酒师 | 酿造设施 | miningdim:brewing_station |
| 酿酒师 | 酿造设施 | miningdim:wine_cellar |
| 能源 | 发电与低温 | miningdim:industrial_generator |
| 能源 | 发电与低温 | miningdim:modern_generator |
| 能源 | 发电与低温 | miningdim:future_energy_generator |
| 能源 | 发电与低温 | miningdim:low_temperature_controller |
| 能源 | 导体线缆 | miningdim:iron_energy_cable |
| 能源 | 导体线缆 | miningdim:aluminum_energy_cable |
| 能源 | 导体线缆 | miningdim:copper_energy_cable |
| 能源 | 导体线缆 | miningdim:tinned_copper_energy_cable |
| 能源 | 导体线缆 | miningdim:ofc_copper_energy_cable |
| 能源 | 导体线缆 | miningdim:ofe_copper_energy_cable |
| 能源 | 导体线缆 | miningdim:silver_plated_copper_energy_cable |
| 能源 | 导体线缆 | miningdim:gold_energy_cable |
| 能源 | 导体线缆 | miningdim:silver_energy_cable |
| 能源 | 导体线缆 | miningdim:graphene_energy_cable |
| 能源 | 导体线缆 | miningdim:nbti_superconductor_energy_cable |
| 能源 | 导体线缆 | miningdim:ybco_superconductor_energy_cable |
| 能源 | 导体线缆 | miningdim:tungsten_heat_resistant_wire |
| 能源 | 加工机器 | miningdim:metallurgic_purifier |
| 能源 | 加工机器 | miningdim:air_separation_unit |
| 能源 | 矿石 | miningdim:bauxite_ore |
| 能源 | 矿石 | miningdim:deepslate_bauxite_ore |
| 能源 | 矿石 | miningdim:borax_ore |
| 能源 | 矿石 | miningdim:deepslate_borax_ore |
| 能源 | 矿石 | miningdim:silver_ore |
| 能源 | 矿石 | miningdim:deepslate_silver_ore |
| 能源 | 矿石 | miningdim:tin_ore |
| 能源 | 矿石 | miningdim:deepslate_tin_ore |
| 能源 | 矿石 | miningdim:nickel_ore |
| 能源 | 矿石 | miningdim:deepslate_nickel_ore |
| 能源 | 矿石 | miningdim:chromium_ore |
| 能源 | 矿石 | miningdim:deepslate_chromium_ore |
| 能源 | 矿石 | miningdim:tungsten_ore |
| 能源 | 矿石 | miningdim:deepslate_tungsten_ore |
| 能源 | 橡胶树 | miningdim:rubber_log |
| 能源 | 橡胶树 | miningdim:rubber_planks |
| 能源 | 橡胶树 | miningdim:rubber_leaves |
| 能源 | 橡胶树 | miningdim:rubber_tree_sapling |
:::

## 方块资源缺口

:::table{mono="0"}
| 注册 ID | Blockstate | Blockstate 可达模型 | BlockItem 模型 | 掉落表 | 语言键 |
| --- | --- | --- | --- | --- | --- |
| miningdim:mining_portal | 缺失 | 缺失 | 缺失 | 缺失 | 存在 |
| miningdim:fake_ore | 缺失 | 缺失 | 缺失 | 缺失 | 存在 |
| miningdim:trap_ore | 存在 | 存在 | 无 BlockItem | 代码明确 noLootTable | en_us 与 zh_cn 均缺失 |
| miningdim:entrance_easy | 存在 | 存在 | 存在 | 缺失 | 存在 |
| miningdim:entrance_medium | 存在 | 存在 | 存在 | 缺失 | 存在 |
| miningdim:entrance_hard | 存在 | 存在 | 存在 | 缺失 | 存在 |
| miningdim:brewing_station | 存在 | 存在 | 存在 | 缺失 | 存在 |
| miningdim:wine_cellar | 存在 | 存在 | 存在 | 缺失 | 存在 |
:::

> JAR 中没有孤立 blockstate 或方块掉落表。七个缺掉落表的方块若不是有意设为不可掉落，生存模式破坏后会丢失方块；trap_ore 的无掉落行为是源码显式配置。mining_portal 与 fake_ore 虽注册并进入主创造页，但生产引用只到注册和展示层，属于疑似阶段 0 遗留，不应当成可用的假矿陷阱玩法。

## 其他注册表计数

:::table
| Registry | 数量 |
| --- | ---: |
| 方块实体类型 | 16 |
| 菜单类型 | 14 |
| MobEffect | 1 |
| 附魔 | 1 |
| 配方类型 | 2 |
| 配方序列化器 | 2 |
| 创造模式页 | 9 |
| 声音事件 | 35 |
| 全局掉落修改器 Codec | 1 |
| BiomeSource Codec | 1 |
| 合计 | 82 |
:::

## 82 个其他注册 ID

:::table{mono="2"}
| Registry | 所属系统 | 注册 ID |
| --- | --- | --- |
| 方块实体 | 核心/入口 | miningdim:entrance |
| 方块实体 | 工程师 | miningdim:production_table |
| 方块实体 | 塔罗师 | miningdim:tarot_craft_table |
| 方块实体 | 厨师 | miningdim:seasoning_table |
| 方块实体 | 军火商 | miningdim:munitions_bench |
| 方块实体 | 军火商 | miningdim:gunsmith_press |
| 方块实体 | 军火商 | miningdim:gunsmith_assembly_bench |
| 方块实体 | 酿酒师 | miningdim:brewing_station |
| 方块实体 | 酿酒师 | miningdim:wine_cellar |
| 方块实体 | 能源 | miningdim:low_temperature_controller |
| 方块实体 | 能源 | miningdim:energy_cable |
| 方块实体 | 能源 | miningdim:generator_controller |
| 方块实体 | 能源 | miningdim:generator_port |
| 方块实体 | 能源 | miningdim:metallurgic_purifier |
| 方块实体 | 能源 | miningdim:air_separation_unit |
| 方块实体 | 能源 | miningdim:rubber_log |
| 菜单 | 工程师 | miningdim:production_table |
| 菜单 | 塔罗师 | miningdim:tarot_craft |
| 菜单 | 塔罗师 | miningdim:tarot_shiny_select |
| 菜单 | 厨师 | miningdim:seasoning_table |
| 菜单 | 军火商 | miningdim:munitions_bench |
| 菜单 | 军火商 | miningdim:gunsmith_press |
| 菜单 | 军火商 | miningdim:gunsmith_assembly_bench |
| 菜单 | 酿酒师 | miningdim:brewing_station |
| 菜单 | 酿酒师 | miningdim:wine_cellar |
| 菜单 | 能源 | miningdim:generator |
| 菜单 | 能源 | miningdim:low_temperature_controller |
| 菜单 | 能源 | miningdim:metallurgic_purifier |
| 菜单 | 能源 | miningdim:air_separation_unit |
| 菜单 | 婚姻 | miningdim:marriage_backpack |
| MobEffect | 职业框架 | miningdim:vulnerability |
| 附魔 | 附魔系统 | miningdim:money_mending |
| 配方类型 | 能源 | miningdim:metallurgic_purifying |
| 配方类型 | 能源 | miningdim:air_separating |
| 配方序列化器 | 能源 | miningdim:metallurgic_purifying |
| 配方序列化器 | 能源 | miningdim:air_separating |
| 创造模式页 | 核心/入口 | miningdim:miningdim |
| 创造模式页 | 农夫 | miningdim:farmer |
| 创造模式页 | 工程师 | miningdim:miningdim_engineer |
| 创造模式页 | 塔罗师 | miningdim:miningdim_tarot |
| 创造模式页 | 厨师 | miningdim:miningdim_chef |
| 创造模式页 | 军火商 | miningdim:miningdim_munitions |
| 创造模式页 | 军火商 | miningdim:miningdim_gunsmith |
| 创造模式页 | 酿酒师 | miningdim:miningdim_brewer |
| 创造模式页 | 能源 | miningdim:power |
| 声音事件 | 开箱 | miningdim:case_unlock |
| 声音事件 | 开箱 | miningdim:case_open |
| 声音事件 | 开箱 | miningdim:case_tick |
| 声音事件 | 开箱 | miningdim:case_reveal_blue |
| 声音事件 | 开箱 | miningdim:case_reveal_purple |
| 声音事件 | 开箱 | miningdim:case_reveal_pink |
| 声音事件 | 开箱 | miningdim:case_reveal_red |
| 声音事件 | 开箱 | miningdim:case_reveal_gold |
| 声音事件 | 工程师 | miningdim:plasma_shield_overheat |
| 声音事件 | 工程师 | miningdim:plasma_shield_steam_vent |
| 声音事件 | 工程师 | miningdim:plasma_shield_hit |
| 声音事件 | 塔罗师 | miningdim:tarot_cast_start |
| 声音事件 | 塔罗师 | miningdim:tarot_cast_reveal_r |
| 声音事件 | 塔罗师 | miningdim:tarot_cast_reveal_sr |
| 声音事件 | 塔罗师 | miningdim:tarot_cast_reveal_ssr |
| 声音事件 | 塔罗师 | miningdim:tarot_cast_reveal_ur |
| 声音事件 | 塔罗师 | miningdim:tarot_cast_reveal_shiny |
| 声音事件 | 塔罗师 | miningdim:tarot_cast_resolve_upright |
| 声音事件 | 塔罗师 | miningdim:tarot_cast_resolve_reversed |
| 声音事件 | 塔罗师 | miningdim:tarot_craft_charge |
| 声音事件 | 塔罗师 | miningdim:tarot_craft_success |
| 声音事件 | 塔罗师 | miningdim:tarot_craft_great_success |
| 声音事件 | 塔罗师 | miningdim:tarot_craft_reverse |
| 声音事件 | 塔罗师 | miningdim:tarot_craft_shatter |
| 声音事件 | 塔罗师 | miningdim:tarot_craft_big_shatter |
| 声音事件 | 塔罗师 | miningdim:tarot_pack_scan |
| 声音事件 | 塔罗师 | miningdim:tarot_pack_open |
| 声音事件 | 塔罗师 | miningdim:tarot_pack_reveal_r |
| 声音事件 | 塔罗师 | miningdim:tarot_pack_reveal_sr |
| 声音事件 | 塔罗师 | miningdim:tarot_pack_reveal_ssr |
| 声音事件 | 塔罗师 | miningdim:tarot_pack_reveal_ur |
| 声音事件 | 塔罗师 | miningdim:tarot_pack_reveal_shiny |
| 声音事件 | 塔罗师 | miningdim:tarot_pack_complete |
| 声音事件 | 军火商 | miningdim:munitions_bench_weld |
| 声音事件 | 军火商 | miningdim:gunsmith_press_hydraulic |
| 全局掉落修改器 Codec | 农夫 | miningdim:farmer_crop_yield |
| BiomeSource Codec | 矿业维度 | miningdim:mining_biome_source |
:::

> miningdim_gunsmith 创造页始终注册，但 gunsmithEnabled 为 false 时页内不填内容。配方 JSON 的 infusion.type 值是配方域参数，不是遗漏的 Forge RecipeType。

## 机器核查路径

```text
src/main/java/com/miningdim/MiningDim.java
src/main/java/com/miningdim/registry/
src/main/java/com/miningdim/job/*/*Registry.java
src/main/java/com/miningdim/power/PowerRegistry.java
src/main/java/com/miningdim/power/PowerMachineRegistry.java
build/libs/miningdim-1.20.1-1.0.19-all.jar
assets/miningdim/blockstates/
assets/miningdim/models/block/
data/miningdim/loot_tables/blocks/
```
