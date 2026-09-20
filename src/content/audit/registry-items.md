---
order: 120
name: 物品注册总账
en: Item registry ledger
group: 内容
tagline: 逐项列出 1.0.19 生产 JAR 中已接入 modBus 的独立物品与方块物品。
facts:
  - label: 物品注册
    value: '224'
  - label: 系统数
    value: '8'
  - label: 模型根覆盖
    value: 222 / 224
  - label: 基础语言键
    value: 224 / 224
---

Item registry 总数包含 BlockItem，不把一个带 NBT、CustomModelData 或 predicate 的物品外观重复算成多个物品。GameTest 辅助类没有玩家物品 ID，也不进入本表。

## 按系统计数

:::table
| 系统 | 物品数 | 组成 |
| --- | ---: | --- |
| 核心/入口/婚姻 | 7 | 五个方块物品与两枚戒指 |
| 农夫 | 7 | 种子、小麦与五档农田 |
| 工程师 | 87 | 12 个基础物品、54 件插板护甲、21 面等离子盾 |
| 塔罗师 | 6 | 卡牌、碎片、三种卡包与制作台 |
| 厨师 | 5 | 五档调味台 |
| 军火商 | 15 | 八个机器方块物品与七种零件/弹药材料 |
| 酿酒师 | 12 | 干燥小麦、九种酒与两台机器 |
| 能源 | 85 | 发电、线缆、机器、矿物与橡胶链 |
| 合计 | 224 | 同一 Item registry 内无重复 ID |
:::

## 224 个物品注册 ID

:::table{caption="ID 列包含完整命名空间；54 件插板护甲在源文件中逐个枚举后展开。" mono="2"}
| 所属系统 | 分类 | 注册 ID |
| --- | --- | --- |
| 核心/入口 | 方块物品 | miningdim:mining_portal |
| 核心/入口 | 方块物品 | miningdim:fake_ore |
| 核心/入口 | 方块物品 | miningdim:entrance_easy |
| 核心/入口 | 方块物品 | miningdim:entrance_medium |
| 核心/入口 | 方块物品 | miningdim:entrance_hard |
| 婚姻 | 戒指 | miningdim:engagement_ring |
| 婚姻 | 戒指 | miningdim:wedding_ring |
| 农夫 | 种植材料 | miningdim:farmer_seed |
| 农夫 | 种植材料 | miningdim:farmer_wheat |
| 农夫 | 农田方块物品 | miningdim:farmer_farmland_low |
| 农夫 | 农田方块物品 | miningdim:farmer_farmland_medium |
| 农夫 | 农田方块物品 | miningdim:farmer_farmland_high |
| 农夫 | 农田方块物品 | miningdim:farmer_farmland_premium |
| 农夫 | 农田方块物品 | miningdim:farmer_farmland_supreme |
| 工程师 | 纳米护甲板 | miningdim:nano_plate_low |
| 工程师 | 纳米护甲板 | miningdim:nano_plate_medium |
| 工程师 | 纳米护甲板 | miningdim:nano_plate_high |
| 工程师 | 纳米护甲板 | miningdim:nano_plate_superior |
| 工程师 | 纳米护甲板 | miningdim:nano_plate_transcendent |
| 工程师 | 纳米护甲板 | miningdim:nano_plate_radiant |
| 工程师 | 生产台方块物品 | miningdim:production_table_low |
| 工程师 | 生产台方块物品 | miningdim:production_table_medium |
| 工程师 | 生产台方块物品 | miningdim:production_table_high |
| 工程师 | 生产台方块物品 | miningdim:production_table_superior |
| 工程师 | 生产台方块物品 | miningdim:production_table_transcendent |
| 工程师 | 生产台方块物品 | miningdim:production_table_radiant |
| 工程师 | 插板护甲 | miningdim:plate_armor_jaypc_olive |
| 工程师 | 插板护甲 | miningdim:plate_armor_jaypc_black |
| 工程师 | 插板护甲 | miningdim:plate_armor_paca |
| 工程师 | 插板护甲 | miningdim:plate_armor_mbss |
| 工程师 | 插板护甲 | miningdim:plate_armor_tv115 |
| 工程师 | 插板护甲 | miningdim:plate_armor_6b23_1_digital_flora |
| 工程师 | 插板护甲 | miningdim:plate_armor_6b5_16 |
| 工程师 | 插板护甲 | miningdim:plate_armor_kirasa_n_green |
| 工程师 | 插板护甲 | miningdim:plate_armor_mf_untar |
| 工程师 | 插板护甲 | miningdim:plate_armor_kora_kulon |
| 工程师 | 插板护甲 | miningdim:plate_armor_kora_kulon_digital |
| 工程师 | 插板护甲 | miningdim:plate_armor_mmac_ranger_green |
| 工程师 | 插板护甲 | miningdim:plate_armor_rbav_af_ranger_green |
| 工程师 | 插板护甲 | miningdim:plate_armor_strandhogg_ranger_green |
| 工程师 | 插板护甲 | miningdim:plate_armor_strandhogg_black_multicam |
| 工程师 | 插板护甲 | miningdim:plate_armor_trooper_tfo_multicam |
| 工程师 | 插板护甲 | miningdim:plate_armor_banshee_atacs_au |
| 工程师 | 插板护甲 | miningdim:plate_armor_6b13_flora |
| 工程师 | 插板护甲 | miningdim:plate_armor_6b3tm_01m_khaki |
| 工程师 | 插板护甲 | miningdim:plate_armor_ana_m1_olive |
| 工程师 | 插板护甲 | miningdim:plate_armor_a18_skanda_multicam |
| 工程师 | 插板护甲 | miningdim:plate_armor_avs_ranger_green |
| 工程师 | 插板护甲 | miningdim:plate_armor_avs_multicam |
| 工程师 | 插板护甲 | miningdim:plate_armor_thor_concealable |
| 工程师 | 插板护甲 | miningdim:plate_armor_stich_profi_v2_black |
| 工程师 | 插板护甲 | miningdim:plate_armor_tv110_coyote |
| 工程师 | 插板护甲 | miningdim:plate_armor_6b23_2_mountain_flora |
| 工程师 | 插板护甲 | miningdim:plate_armor_6b5_15_flora |
| 工程师 | 插板护甲 | miningdim:plate_armor_osprey_mk4a_assault |
| 工程师 | 插板护甲 | miningdim:plate_armor_tactec_ranger_green |
| 工程师 | 插板护甲 | miningdim:plate_armor_cpc_mod1_atacs_fg |
| 工程师 | 插板护甲 | miningdim:plate_armor_fcpc_v5 |
| 工程师 | 插板护甲 | miningdim:plate_armor_gladiator_s_light_multicam |
| 工程师 | 插板护甲 | miningdim:plate_armor_hexatac_hpc_black_multicam |
| 工程师 | 插板护甲 | miningdim:plate_armor_6b45_general |
| 工程师 | 插板护甲 | miningdim:plate_armor_6b45_medic |
| 工程师 | 插板护甲 | miningdim:plate_armor_gzhel_k |
| 工程师 | 插板护甲 | miningdim:plate_armor_gladiator_s_gray |
| 工程师 | 插板护甲 | miningdim:plate_armor_gladiator_s_viking |
| 工程师 | 插板护甲 | miningdim:plate_armor_tt_mkiii_coyote |
| 工程师 | 插板护甲 | miningdim:plate_armor_osprey_mk4a_protection |
| 工程师 | 插板护甲 | miningdim:plate_armor_defender_2_spot_camo |
| 工程师 | 插板护甲 | miningdim:plate_armor_defender_2 |
| 工程师 | 插板护甲 | miningdim:plate_armor_gladiator_s_deathless |
| 工程师 | 插板护甲 | miningdim:plate_armor_redut_m |
| 工程师 | 插板护甲 | miningdim:plate_armor_iotv_gen4_high_mobility |
| 工程师 | 插板护甲 | miningdim:plate_armor_iotv_gen4_full_protection |
| 工程师 | 插板护甲 | miningdim:plate_armor_iotv_gen4_assault |
| 工程师 | 插板护甲 | miningdim:plate_armor_korund_vm_black |
| 工程师 | 插板护甲 | miningdim:plate_armor_hexgrid |
| 工程师 | 插板护甲 | miningdim:plate_armor_slick |
| 工程师 | 插板护甲 | miningdim:plate_armor_stich_defense_mod2 |
| 工程师 | 插板护甲 | miningdim:plate_armor_6b43_zabralo_sh |
| 工程师 | 插板护甲 | miningdim:plate_armor_thor_integrated |
| 工程师 | 正式等离子盾 | miningdim:plasma_shield_nano_i |
| 工程师 | 正式等离子盾 | miningdim:plasma_shield_nano_ii |
| 工程师 | 正式等离子盾 | miningdim:plasma_shield_nano_iii |
| 工程师 | 正式等离子盾 | miningdim:plasma_shield_nano_iv |
| 工程师 | 正式等离子盾 | miningdim:plasma_shield_nano_v |
| 工程师 | 正式等离子盾 | miningdim:plasma_shield_nano_vi |
| 工程师 | 正式等离子盾 | miningdim:plasma_shield_standard_i |
| 工程师 | 正式等离子盾 | miningdim:plasma_shield_standard_ii |
| 工程师 | 正式等离子盾 | miningdim:plasma_shield_standard_iii |
| 工程师 | 正式等离子盾 | miningdim:plasma_shield_standard_iv |
| 工程师 | 正式等离子盾 | miningdim:plasma_shield_standard_v |
| 工程师 | 正式等离子盾 | miningdim:plasma_shield_standard_vi |
| 工程师 | 正式等离子盾 | miningdim:plasma_shield_quantum_i |
| 工程师 | 正式等离子盾 | miningdim:plasma_shield_quantum_ii |
| 工程师 | 正式等离子盾 | miningdim:plasma_shield_quantum_iii |
| 工程师 | 正式等离子盾 | miningdim:plasma_shield_quantum_iv |
| 工程师 | 正式等离子盾 | miningdim:plasma_shield_quantum_v |
| 工程师 | 正式等离子盾 | miningdim:plasma_shield_quantum_vi |
| 工程师 | 旧世界兼容盾 | miningdim:plasma_shield_nano |
| 工程师 | 旧世界兼容盾 | miningdim:plasma_shield_light |
| 工程师 | 旧世界兼容盾 | miningdim:plasma_shield_heavy_ion |
| 塔罗师 | 卡牌与卡包 | miningdim:tarot_card |
| 塔罗师 | 卡牌与卡包 | miningdim:tarot_shard |
| 塔罗师 | 卡牌与卡包 | miningdim:tarot_pack_common |
| 塔罗师 | 卡牌与卡包 | miningdim:tarot_pack_advanced |
| 塔罗师 | 卡牌与卡包 | miningdim:tarot_pack_shiny |
| 塔罗师 | 制作台方块物品 | miningdim:tarot_craft_table |
| 厨师 | 调味台方块物品 | miningdim:seasoning_table_low |
| 厨师 | 调味台方块物品 | miningdim:seasoning_table_medium |
| 厨师 | 调味台方块物品 | miningdim:seasoning_table_high |
| 厨师 | 调味台方块物品 | miningdim:seasoning_table_extraordinary |
| 厨师 | 调味台方块物品 | miningdim:seasoning_table_radiant |
| 军火商 | 机器方块物品 | miningdim:munitions_bench |
| 军火商 | 机器方块物品 | miningdim:munitions_bench_medium |
| 军火商 | 机器方块物品 | miningdim:munitions_bench_high |
| 军火商 | 机器方块物品 | miningdim:munitions_bench_superior |
| 军火商 | 机器方块物品 | miningdim:munitions_bench_transcendent |
| 军火商 | 机器方块物品 | miningdim:munitions_bench_radiant |
| 军火商 | 机器方块物品 | miningdim:gunsmith_press |
| 军火商 | 机器方块物品 | miningdim:gunsmith_assembly_bench |
| 军火商 | 枪械零件与弹药材料 | miningdim:gunsmith_part |
| 军火商 | 枪械零件与弹药材料 | miningdim:gunsmith_blueprint |
| 军火商 | 枪械零件与弹药材料 | miningdim:m4_assembly_template |
| 军火商 | 枪械零件与弹药材料 | miningdim:primer |
| 军火商 | 枪械零件与弹药材料 | miningdim:casing |
| 军火商 | 枪械零件与弹药材料 | miningdim:bullet_head |
| 军火商 | 枪械零件与弹药材料 | miningdim:propellant |
| 酿酒师 | 原料与酒 | miningdim:dried_wheat |
| 酿酒师 | 原料与酒 | miningdim:wine_brandy |
| 酿酒师 | 原料与酒 | miningdim:wine_vodka |
| 酿酒师 | 原料与酒 | miningdim:wine_gin |
| 酿酒师 | 原料与酒 | miningdim:wine_rum |
| 酿酒师 | 原料与酒 | miningdim:wine_tequila |
| 酿酒师 | 原料与酒 | miningdim:wine_maotai |
| 酿酒师 | 原料与酒 | miningdim:wine_whiskey |
| 酿酒师 | 原料与酒 | miningdim:wine_champagne |
| 酿酒师 | 原料与酒 | miningdim:wine_moonshine |
| 酿酒师 | 机器方块物品 | miningdim:brewing_station |
| 酿酒师 | 机器方块物品 | miningdim:wine_cellar |
| 能源 | 发电与低温方块物品 | miningdim:industrial_generator |
| 能源 | 发电与低温方块物品 | miningdim:modern_generator |
| 能源 | 发电与低温方块物品 | miningdim:future_energy_generator |
| 能源 | 发电与低温方块物品 | miningdim:low_temperature_controller |
| 能源 | 发电与超导材料 | miningdim:industrial_fuel_core |
| 能源 | 发电与超导材料 | miningdim:modern_fuel_core |
| 能源 | 发电与超导材料 | miningdim:future_fuel_core |
| 能源 | 发电与超导材料 | miningdim:nichrome_fuse |
| 能源 | 发电与超导材料 | miningdim:graphene_sheet |
| 能源 | 发电与超导材料 | miningdim:superconductor_precursor |
| 能源 | 发电与超导材料 | miningdim:nbti_conductor |
| 能源 | 发电与超导材料 | miningdim:ybco_tape |
| 能源 | 线缆方块物品 | miningdim:iron_energy_cable |
| 能源 | 线缆方块物品 | miningdim:aluminum_energy_cable |
| 能源 | 线缆方块物品 | miningdim:copper_energy_cable |
| 能源 | 线缆方块物品 | miningdim:tinned_copper_energy_cable |
| 能源 | 线缆方块物品 | miningdim:ofc_copper_energy_cable |
| 能源 | 线缆方块物品 | miningdim:ofe_copper_energy_cable |
| 能源 | 线缆方块物品 | miningdim:silver_plated_copper_energy_cable |
| 能源 | 线缆方块物品 | miningdim:gold_energy_cable |
| 能源 | 线缆方块物品 | miningdim:silver_energy_cable |
| 能源 | 线缆方块物品 | miningdim:graphene_energy_cable |
| 能源 | 线缆方块物品 | miningdim:nbti_superconductor_energy_cable |
| 能源 | 线缆方块物品 | miningdim:ybco_superconductor_energy_cable |
| 能源 | 线缆方块物品 | miningdim:tungsten_heat_resistant_wire |
| 能源 | 导体线材 | miningdim:iron_wire |
| 能源 | 导体线材 | miningdim:aluminum_wire |
| 能源 | 导体线材 | miningdim:copper_wire |
| 能源 | 导体线材 | miningdim:tinned_copper_wire |
| 能源 | 导体线材 | miningdim:ofc_copper_wire |
| 能源 | 导体线材 | miningdim:ofe_copper_wire |
| 能源 | 导体线材 | miningdim:silver_plated_copper_wire |
| 能源 | 导体线材 | miningdim:gold_wire |
| 能源 | 导体线材 | miningdim:silver_wire |
| 能源 | 导体线材 | miningdim:graphene_wire |
| 能源 | 导体线材 | miningdim:nbti_superconductor_wire |
| 能源 | 导体线材 | miningdim:ybco_superconductor_wire |
| 能源 | 加工机器方块物品 | miningdim:metallurgic_purifier |
| 能源 | 加工机器方块物品 | miningdim:air_separation_unit |
| 能源 | 提纯与气体材料 | miningdim:deoxidized_copper_ingot |
| 能源 | 提纯与气体材料 | miningdim:phosphorus_deoxidized_copper_ingot |
| 能源 | 提纯与气体材料 | miningdim:ofc_copper_ingot |
| 能源 | 提纯与气体材料 | miningdim:ofe_copper_ingot |
| 能源 | 提纯与气体材料 | miningdim:gold_4n_ingot |
| 能源 | 提纯与气体材料 | miningdim:argon_canister |
| 能源 | 提纯与气体材料 | miningdim:liquid_nitrogen_canister |
| 能源 | 矿石方块物品 | miningdim:bauxite_ore |
| 能源 | 矿石方块物品 | miningdim:deepslate_bauxite_ore |
| 能源 | 矿石方块物品 | miningdim:borax_ore |
| 能源 | 矿石方块物品 | miningdim:deepslate_borax_ore |
| 能源 | 矿石方块物品 | miningdim:silver_ore |
| 能源 | 矿石方块物品 | miningdim:deepslate_silver_ore |
| 能源 | 矿石方块物品 | miningdim:tin_ore |
| 能源 | 矿石方块物品 | miningdim:deepslate_tin_ore |
| 能源 | 矿石方块物品 | miningdim:nickel_ore |
| 能源 | 矿石方块物品 | miningdim:deepslate_nickel_ore |
| 能源 | 矿石方块物品 | miningdim:chromium_ore |
| 能源 | 矿石方块物品 | miningdim:deepslate_chromium_ore |
| 能源 | 矿石方块物品 | miningdim:tungsten_ore |
| 能源 | 矿石方块物品 | miningdim:deepslate_tungsten_ore |
| 能源 | 原矿材料 | miningdim:raw_aluminum |
| 能源 | 原矿材料 | miningdim:borax |
| 能源 | 原矿材料 | miningdim:raw_silver |
| 能源 | 原矿材料 | miningdim:raw_tin |
| 能源 | 原矿材料 | miningdim:raw_nickel |
| 能源 | 原矿材料 | miningdim:raw_chromium |
| 能源 | 原矿材料 | miningdim:raw_tungsten |
| 能源 | 矿物锭 | miningdim:aluminum_ingot |
| 能源 | 矿物锭 | miningdim:silver_ingot |
| 能源 | 矿物锭 | miningdim:tin_ingot |
| 能源 | 矿物锭 | miningdim:nickel_ingot |
| 能源 | 矿物锭 | miningdim:chromium_ingot |
| 能源 | 矿物锭 | miningdim:tungsten_ingot |
| 能源 | 橡胶树方块物品 | miningdim:rubber_log |
| 能源 | 橡胶树方块物品 | miningdim:rubber_planks |
| 能源 | 橡胶树方块物品 | miningdim:rubber_leaves |
| 能源 | 橡胶树方块物品 | miningdim:rubber_tree_sapling |
| 能源 | 橡胶与绝缘材料 | miningdim:latex |
| 能源 | 橡胶与绝缘材料 | miningdim:rubber |
| 能源 | 橡胶与绝缘材料 | miningdim:insulation_pvc |
| 能源 | 橡胶与绝缘材料 | miningdim:insulation_pe |
| 能源 | 橡胶与绝缘材料 | miningdim:insulation_epr |
| 能源 | 橡胶与绝缘材料 | miningdim:insulation_xlpe |
| 能源 | 橡胶与绝缘材料 | miningdim:insulation_silicone |
| 能源 | 橡胶与绝缘材料 | miningdim:rubber_tapping_knife |
:::

## 模型、语言与配方覆盖

:::table{mono="2"}
| 核查对象 | 结果 | 异常 ID 或路径 |
| --- | --- | --- |
| 注册物品模型根 | 222 / 224 存在 | miningdim:mining_portal；miningdim:fake_ore |
| 注册物品基础语言键 | 224 / 224 存在 | 无 |
| 语言文件 | 仅 en_us 与 zh_cn | assets/miningdim/lang/；没有 zh_tw |
| 配方 | 91 个 JSON 均可解析，miningdim 物品引用全部可解析 | data/miningdim/recipes/ |
| 模型图 | 798 个模型中 793 个可由注册根递归到达 | 5 个孤儿模型见下表 |
:::

> tarot_card 的 220 个 predicate 目标和 gunsmith_part 的 195 个 CustomModelData 目标都是同一注册物品的模型变体，不能计成额外物品。

## 资源存在但注册图不可达

:::table{mono="0"}
| 资源 | 生产引用 | 结论 |
| --- | --- | --- |
| assets/miningdim/models/item/tarot_card_back.json | 仅 GameTest 字符串断言 | 孤儿模型 |
| assets/miningdim/models/item/tarot_card_shiny.json | 无 | 孤儿模型 |
| assets/miningdim/models/item/tarot_card_sr.json | 无 | 孤儿模型 |
| assets/miningdim/models/item/tarot_card_ssr.json | 无 | 孤儿模型 |
| assets/miningdim/models/item/tarot_card_ur.json | 无 | 孤儿模型 |
| textures/item/tarot/hand/ | 35 个高置信孤儿贴图中的 27 个 | 生产代码与模型均不引用 |
| textures/item/gunsmith_*.png 等 | 35 个高置信孤儿贴图中的 8 个 | 生产代码与模型均不引用 |
:::

> 主 tarot/card_back.png 被自定义渲染器直接读取，不属于孤儿资源。孤儿贴图的其余八个为五张 gunsmith 贴图、copper_wire.png、silver_ingot.png 与 lead_sheath.png。

## 机器核查路径

```text
src/main/java/com/miningdim/registry/ModItems.java
src/main/java/com/miningdim/job/*/*Items.java
src/main/java/com/miningdim/job/engineer/armor/PlateArmorVariant.java
src/main/java/com/miningdim/job/engineer/shield/PlasmaShieldVariant.java
src/main/java/com/miningdim/power/PowerRegistry.java
src/main/java/com/miningdim/power/PowerMachineRegistry.java
build/libs/miningdim-1.20.1-1.0.19-all.jar
assets/miningdim/models/item/
assets/miningdim/lang/
data/miningdim/recipes/
```
