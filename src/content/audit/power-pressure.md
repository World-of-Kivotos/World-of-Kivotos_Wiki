---
order: 40
name: 能源与动态压力完整审计
en: Power and pressure audit
group: 玩法
tagline: 核对 1.0.19 已注册能源内容、三阶段工业链、电网与发电安全机制，并单列动态压力的真实生效路径和已确认断线。
facts:
  - label: 方块
    value: '37'
  - label: 物品
    value: '85'
  - label: 能源配方
    value: '66'
  - label: 阶段
    value: P1 / P2 / P3
  - label: 压力档位
    value: '5'
  - label: 审计提交
    value: 701093bd8492
---

能源与压力都由 MiningDim 的子系统表装配，属于当前 main 的生产路径。能源链已经从基础矿物和橡胶贯通到三档发电机、十二级导体、两台加工机与超导冷却；动态压力的服务端计算、刷怪和陷阱门控也已生效。不过压力 HUD、矿工“声东击西”和若干配置键仍存在明确断线，不能按源码注释宣称为可用功能。

## 装配、配置与入包证据

:::table{mono="1"}
| 对象 | 生产接线 | 结论 |
| --- | --- | --- |
| 能源入口 | MiningDim -> PowerSystem.register | 已接线；注册表、客户端界面、数据生成监听和电网事件均被装配 |
| 压力入口 | MiningDim -> PressureSystem.register | 已接线；MobPressureSystem 挂 Forge 总线，并把 danger 注入动态陷阱 |
| 能源服务端配置 | miningdim-power.toml | 三档发电机与两台机器的运行参数可配置 |
| 压力服务端配置 | miningdim-server.toml | danger、刷怪与动态陷阱开关位于主服务端配置 |
| 生成资源 sourceSet | sourceSets.main.resources += src/generated/resources | 数据生成产物会进入生产 JAR，不是仅开发期文件 |
| 现存生产产物 | build/libs/miningdim-1.20.1-1.0.19-all.jar | 66 个能源配方、85 个物品模型、37 个 blockstate、37 个方块战利品表均已核到，缺失数为 0 |
:::

> 本页统计命名空间统一为 miningdim；GameTest 类虽然位于 src/main/java 并随 JAR 入包，但只列为验证代码，不计玩家功能。

## 37 个方块注册总账

:::table{mono="2"}
| 分类 | 数量 | 完整注册 ID |
| --- | ---: | --- |
| 三档发电机 | 3 | miningdim:industrial_generator、miningdim:modern_generator、miningdim:future_energy_generator |
| 十二级标准线缆 | 12 | miningdim:iron_energy_cable、miningdim:aluminum_energy_cable、miningdim:copper_energy_cable、miningdim:tinned_copper_energy_cable、miningdim:ofc_copper_energy_cable、miningdim:ofe_copper_energy_cable、miningdim:silver_plated_copper_energy_cable、miningdim:gold_energy_cable、miningdim:silver_energy_cable、miningdim:graphene_energy_cable、miningdim:nbti_superconductor_energy_cable、miningdim:ybco_superconductor_energy_cable |
| 特殊线缆与控制器 | 2 | miningdim:tungsten_heat_resistant_wire、miningdim:low_temperature_controller |
| 加工机器 | 2 | miningdim:metallurgic_purifier、miningdim:air_separation_unit |
| 七矿物的普通矿与深板岩矿 | 14 | miningdim:bauxite_ore、miningdim:deepslate_bauxite_ore、miningdim:borax_ore、miningdim:deepslate_borax_ore、miningdim:silver_ore、miningdim:deepslate_silver_ore、miningdim:tin_ore、miningdim:deepslate_tin_ore、miningdim:nickel_ore、miningdim:deepslate_nickel_ore、miningdim:chromium_ore、miningdim:deepslate_chromium_ore、miningdim:tungsten_ore、miningdim:deepslate_tungsten_ore |
| 橡胶树系 | 4 | miningdim:rubber_log、miningdim:rubber_planks、miningdim:rubber_leaves、miningdim:rubber_tree_sapling |
:::

## 85 个物品注册总账

37 个方块全部另有同 ID 的 BlockItem。下表再列 48 个纯物品；37 + 48 = 85。能源创造标签 miningdim:power 会展示全部 85 项。

:::table{mono="2"}
| 分类 | 数量 | 完整注册 ID |
| --- | ---: | --- |
| 上述方块对应物品 | 37 | 与“37 个方块注册总账”的 ID 一一相同 |
| 燃料芯、保护件与终局材料 | 8 | miningdim:industrial_fuel_core、miningdim:modern_fuel_core、miningdim:future_fuel_core、miningdim:nichrome_fuse、miningdim:graphene_sheet、miningdim:superconductor_precursor、miningdim:nbti_conductor、miningdim:ybco_tape |
| 十二级裸导线 | 12 | miningdim:iron_wire、miningdim:aluminum_wire、miningdim:copper_wire、miningdim:tinned_copper_wire、miningdim:ofc_copper_wire、miningdim:ofe_copper_wire、miningdim:silver_plated_copper_wire、miningdim:gold_wire、miningdim:silver_wire、miningdim:graphene_wire、miningdim:nbti_superconductor_wire、miningdim:ybco_superconductor_wire |
| 机器产物 | 7 | miningdim:deoxidized_copper_ingot、miningdim:phosphorus_deoxidized_copper_ingot、miningdim:ofc_copper_ingot、miningdim:ofe_copper_ingot、miningdim:gold_4n_ingot、miningdim:argon_canister、miningdim:liquid_nitrogen_canister |
| 矿物原料与锭 | 13 | miningdim:raw_aluminum、miningdim:aluminum_ingot、miningdim:borax、miningdim:raw_silver、miningdim:silver_ingot、miningdim:raw_tin、miningdim:tin_ingot、miningdim:raw_nickel、miningdim:nickel_ingot、miningdim:raw_chromium、miningdim:chromium_ingot、miningdim:raw_tungsten、miningdim:tungsten_ingot |
| 橡胶、绝缘与工具 | 8 | miningdim:latex、miningdim:rubber、miningdim:insulation_pvc、miningdim:insulation_pe、miningdim:insulation_epr、miningdim:insulation_xlpe、miningdim:insulation_silicone、miningdim:rubber_tapping_knife |
:::

## 其余能源注册对象

:::table{mono="2"}
| 注册类型 | 数量 | 完整 ID |
| --- | ---: | --- |
| BlockEntityType | 7 | miningdim:generator_controller、miningdim:generator_port、miningdim:energy_cable、miningdim:low_temperature_controller、miningdim:metallurgic_purifier、miningdim:air_separation_unit、miningdim:rubber_log |
| MenuType | 4 | miningdim:generator、miningdim:low_temperature_controller、miningdim:metallurgic_purifier、miningdim:air_separation_unit |
| RecipeType | 2 | miningdim:metallurgic_purifying、miningdim:air_separating |
| RecipeSerializer | 2 | miningdim:metallurgic_purifying、miningdim:air_separating |
| CreativeModeTab | 1 | miningdim:power |
| Configured feature | 8 | miningdim:ore_bauxite、miningdim:ore_borax、miningdim:ore_silver、miningdim:ore_tin、miningdim:ore_nickel、miningdim:ore_chromium、miningdim:ore_tungsten、miningdim:rubber_tree |
| Placed feature | 13 | miningdim:ore_bauxite_easy、miningdim:ore_bauxite_medium、miningdim:ore_bauxite_hard、miningdim:ore_borax_medium、miningdim:ore_borax_hard、miningdim:ore_silver_medium、miningdim:ore_silver_hard、miningdim:ore_tin_medium、miningdim:ore_tin_hard、miningdim:ore_nickel_hard、miningdim:ore_chromium_hard、miningdim:ore_tungsten_hard、miningdim:rubber_tree_placed |
:::

## P1 到 P3 的可达玩法链

| 阶段 | 核心内容 | 生存推进 |
| --- | --- | --- |
| P1 基础供电 | 铁、铝、铜三档显式列入 P1_MATERIALS；工业发电机；基础矿物、橡胶与 PVC/PE | 采矿和割胶取得原料，制作工业燃料芯、工业发电机与低压线缆 |
| P2 精炼与中高压 | 镀锡铜、OFC、OFE、镀银铜、4N 金、银；冶金提纯机、空分装置；现代发电机 | 工业电驱动提纯和空分，产出氩气、液氮与高纯导体，再升级现代档 |
| P3 极高压与超导 | 石墨烯、NbTi、YBCO、钨耐热线、低温控制器；未来能源发电机 | 合成超导前驱体和带材，以液氮维持 NbTi，最终升级未来档 |

> P1 的三导体集合、P2 六导体和 P3 三导体由源码及对应 GameTest 明确命名；阶段内其他机器和发电机按实际配方依赖链归类。

## 七种矿物与矿山生成

- 每种矿物同时替换 stone_ore_replaceables 与 deepslate_ore_replaceables，普通矿与深板岩矿共用一个 configured feature。
- 高度为 above_bottom 8 到 below_top 8 的均匀分布，discard_chance_on_air_exposure 为 0。
- 入门矿山只注入铝土矿；进阶注入铝土、硼砂、锡、银；硬核注入全部七种。
- 六种金属均有 200 tick 熔炉和 100 tick 高炉配方，经验 0.7；硼砂不熔成锭。

:::table{mono="1"}
| 矿物 | 原料 / 锭 | 矿脉大小 | 入门 / 进阶 / 硬核每区块尝试 |
| --- | --- | ---: | --- |
| 铝土矿 | raw_aluminum / aluminum_ingot | 9 | 10 / 6 / 3 |
| 硼砂 | borax / 无锭 | 5 | 0 / 4 / 3 |
| 银 | raw_silver / silver_ingot | 5 | 0 / 3 / 5 |
| 锡 | raw_tin / tin_ingot | 8 | 0 / 5 / 3 |
| 镍 | raw_nickel / nickel_ingot | 6 | 0 / 0 / 4 |
| 铬 | raw_chromium / chromium_ingot | 4 | 0 / 0 / 3 |
| 钨 | raw_tungsten / tungsten_ingot | 3 | 0 / 0 / 2 |
:::

## 橡胶与绝缘链

1. 丛林生物群系通过 miningdim:add_rubber_tree 注入 rubber_tree_placed，稀有度过滤为 1/24。树干高度参数为 4 + 2 + 1，树冠为半径 2、高 3 的 blob foliage。
2. 手持 rubber_tapping_knife 右击 rubber_log，获得 1 个 latex；同一原木冷却 24,000 tick，刀消耗 1 耐久，最大耐久 128。
3. 原木的割胶冷却保存在 RubberLogBlockEntity，并随精准拾取或方块物品 NBT 保留。
4. latex 熔炼 200 tick 得 rubber；rubber 再合成五档绝缘材料。

:::table{mono="0"}
| 配方 | 输入 | 输出 |
| --- | --- | --- |
| insulation_pvc | rubber + clay_ball | 1 PVC |
| insulation_pe | rubber + charcoal | 1 PE |
| insulation_epr | 2 rubber + slime_ball | 2 EPR |
| insulation_xlpe | 2 PE + blaze_powder | 2 XLPE |
| insulation_silicone | 2 rubber + quartz | 2 silicone |
:::

## 三档发电机数值

- 每个发电机物品一次放置 3 x 2 x 2、共 12 个外壳状态；锚点是正面下层中央，输出口是背面下层中央。放置前会检查世界边界、碰撞与十二格可替换性，破坏任一部分会清除整个结构。
- 锚点右击打开界面。内部只有燃料芯与镍铬保险丝两个槽；自动化只能插入，玩家可手动取出。只有后方输出口朝外的一面暴露 FE 输出。
- 有正确档位燃料芯即可运行，燃料芯每秒损失 1 耐久。发电量先进入内部缓冲，未被接收的输出按拒收比例升温。
- 达到“环境温度到熔毁温度差值”的 85% 时，已安装保险丝被消耗并进入 SCRAM；换新保险丝且温度降到 50% 以下后恢复。未装保险丝时不会自动停机，可继续升温至熔毁。
- 熔毁会拆除整机，按原方块爆炸抗性与掉落语义限制破坏，并烧毁半径内耐压不足的线缆；工业 / 现代 / 未来的半径为 4 / 8 / 24，最多破坏 64 / 192 / 512 方块，最多点火 8 / 24 / 64 处，中心伤害为目标最大生命的 25% / 40% / 60%。

:::table{mono="0"}
| 发电机 | 源电压 | 峰值 | 缓冲 | 燃料芯寿命 | 熔毁温度 | 拒收升温 / 空载冷却 |
| --- | --- | ---: | ---: | --- | --- | --- |
| industrial_generator | LOW | 192 FE/t | 38,400 FE | 600 耐久 / 12,000 tick / 10 分钟 | 200 C | 最多 0.25 C/t / 0.10 C/t |
| modern_generator | MEDIUM | 1,152 FE/t | 230,400 FE | 900 耐久 / 18,000 tick / 15 分钟 | 260 C | 最多 0.50 C/t / 0.15 C/t |
| future_energy_generator | HIGH | 3,072 FE/t | 614,400 FE | 1,200 耐久 / 24,000 tick / 20 分钟 | 320 C | 最多 1.00 C/t / 0.20 C/t |
:::

## 十三种线缆物理档案

:::table{mono="0"}
| 导体或特殊线 | 额定吞吐 | 降效地板 | 绝缘 / 耐温 | 耐压 | 基础线阻单位 |
| --- | ---: | ---: | --- | --- | ---: |
| iron | 256 | 0.35 | PVC / 70 C | LOW | 961 |
| aluminum | 768 | 0.42 | PVC / 70 C | LOW | 265 |
| copper | 1,280 | 0.45 | PE / 80 C | LOW | 168 |
| tinned_copper | 1,536 | 0.45 | PE / 80 C | MEDIUM | 168 |
| ofc_copper | 2,048 | 0.46 | EPR / 105 C | MEDIUM | 166 |
| ofe_copper | 3,072 | 0.46 | XLPE / 120 C | MEDIUM | 165 |
| silver_plated_copper | 4,096 | 0.47 | XLPE / 120 C | HIGH | 160 |
| gold | 2,560 | 0.50 | XLPE / 120 C | HIGH | 221 |
| silver | 5,120 | 0.46 | silicone / 180 C | HIGH | 159 |
| graphene | 8,192 | 1.00 | silicone / 180 C | EXTREME | 80 |
| nbti_superconductor | 16,384 | 1.00 | silicone / 180 C | EXTREME | 168；有效冷却时归零 |
| ybco_superconductor | 32,768 | 1.00 | silicone / 180 C | EXTREME | 1 |
| tungsten_heat_resistant_wire | 1,536 | 0.85 | 独立上限 300 C | EXTREME | 528 |
:::

> tungsten_heat_resistant_wire 名称虽然是 wire，注册对象实际是可连接电网的方块与 BlockItem，不是十二级裸导线之一。

## 电网结算、损耗与兼容边界

- EnergyNetworkManager 按 ServerLevel 维护网络。线缆加载时增量合并，移除时 flood-fill 分网；拓扑、瞬态缓冲、温度与累计损耗不写 NBT，重载后由方块实体重新建网。
- 混合网络按最弱一段取额定吞吐、耐压、绝缘耐温和标准降效地板。网络缓冲容量等于最弱线缆的一次额定吞吐，不随线缆数量相乘。
- 管理器在每个服务端 END tick 从 canExtract 端点拉电，再向 canReceive 且不能 extract 的端点推电；端点稳定排序并轮转游标，避免永远偏向列表头。
- 超过额定负载 75% 开始升温，满载升温 4 C/t；低负载向 20 C 回落。标准线缆从耐温上限的 70% 开始线性降容，到上限落至地板，网络硬温度上限为 400 C。
- 路径经 Dijkstra 缓存。净送达遵循 gross x 1,000,000 / (1,000,000 + 路径线阻)，损失单独记账并计入热负载。石墨烯线阻倍率从 20 C 的 1.0 线性降至 180 C 的 0.5；YBCO 以线阻 1 近似零损耗。
- 只有实现 VoltageAwareEnergyStorage 的生产端会进行电压检查。源电压高于网络耐压时阻止抽取并报告 OVER_VOLTAGE；普通 Forge IEnergyStorage 生产端没有电压元数据，会绕过这道检查。
- 同时 canExtract 与 canReceive 的通用储能端点会被归为生产端，不会在推电阶段充电；这会影响部分第三方双向电池。
- 网络故障枚举为 NONE、OVER_VOLTAGE、BUFFER_OVERFLOW、SUPERCONDUCTOR_QUENCH。普通过压只断流，不会烧线；发电机熔毁才会按半径烧毁耐压不足的线缆。

## NbTi 低温控制

- low_temperature_controller 必须让背面贴在线缆上，只有这个方向会附着到目标网络。
- 槽内 1 个 liquid_nitrogen_canister 会在空闲时立即消耗，提供 24,000 tick，也就是 20 分钟冷却；系统没有空罐返还物。
- 每台活动控制器覆盖 64 段 NbTi。全网活动覆盖总量不小于 NbTi 段数时状态为 ACTIVE，NbTi 路径线阻按 0 结算。
- 覆盖不足时报告 SUPERCONDUCTOR_QUENCH，并把整个网络有效吞吐额外乘 0.10。石墨烯与 YBCO 不要求此控制器。
- 控制器本身不耗 FE；界面与 Jade 显示工作状态、剩余 tick 和覆盖段数。

## 加工机器与精确运行成本

- 冶金提纯机默认 FE 容量 102,400、灌注容量 100；空分装置默认 FE 容量 614,400。配置低于任一工序单 tick 需要或完整灌注批次时会直接抛错，不静默降级。
- 两台机器都暴露只接收 FE 的能力与物品能力，服务端每 tick 推进并持久化进度。空分装置可在氩气与液氮间切换，但加工中禁止切换。
- 空分两种配方没有物料或空罐输入，会直接由 FE 产出完整 canister。

:::table{mono="0"}
| 工序 | 输入与灌注 | 耗时 | 功率 | 总 FE | 输出 |
| --- | --- | ---: | ---: | ---: | --- |
| copper_to_deoxidized | copper_ingot + 20 borax 单位；1 borax = 1 单位 | 200 | 20 FE/t | 4,000 | deoxidized_copper_ingot |
| deoxidized_to_ofc | deoxidized_copper_ingot + 40 borax 单位；1 borax = 1 单位 | 400 | 40 FE/t | 16,000 | ofc_copper_ingot |
| deoxidized_to_phosphorus | deoxidized_copper_ingot + 20 phosphorus 单位；1 bone_meal = 1 单位 | 200 | 20 FE/t | 4,000 | phosphorus_deoxidized_copper_ingot |
| ofc_to_ofe | ofc_copper_ingot + 100 argon 单位；1 canister = 100 单位 | 800 | 128 FE/t | 102,400 | ofe_copper_ingot |
| gold_to_4n | gold_ingot + 100 argon 单位；1 canister = 100 单位 | 600 | 64 FE/t | 38,400 | gold_4n_ingot |
| air_separation_argon | 无物品输入 | 1,200 | 512 FE/t | 614,400 | argon_canister |
| air_separation_liquid_nitrogen | 无物品输入 | 400 | 256 FE/t | 102,400 | liquid_nitrogen_canister |
:::

## 66 个生产配方总账

- 普通裸导线为 3 份导体出 6 根；镀锡铜为 8 copper_wire + 1 tin_ingot 出 8 根，镀银铜为 8 ofe_copper_wire + 1 silver_ingot 出 8 根。石墨烯、NbTi、YBCO 都是 3 份对应材料出 6 根。
- 每种标准线缆用 3 根对应裸导线 + 3 份匹配绝缘，产出 6 个线缆方块。钨特殊线用 3 tungsten_ingot + 3 insulation_silicone，产出 6。
- 工业燃料芯为 4 coal + 4 redstone + 1 iron；工业发电机为 6 iron + 1 copper + 1 redstone + 1 furnace。
- 现代燃料芯为 4 OFE copper + 5 blaze_rod；现代发电机为 4 OFE copper + 4 gold_4n + 1 industrial_generator。
- 未来燃料芯与未来发电机都各用 4 graphene_sheet + 4 ybco_tape，中心分别为 nether_star 与 modern_generator。
- graphene_sheet 为 4 charcoal + 2 quartz + 1 blaze_powder 出 2；nichrome_fuse 为 4 nickel + 1 chromium 出 4。
- low_temperature_controller 为 4 phosphorus_deoxidized_copper + 2 nbti_conductor + 2 OFE copper + 1 liquid_nitrogen_canister。

:::table{mono="2"}
| 组 | 数量 | 配方 ID |
| --- | ---: | --- |
| 六金属熔炼与高炉 | 12 | miningdim:raw_aluminum_to_aluminum_ingot_smelting、miningdim:raw_aluminum_to_aluminum_ingot_blasting、miningdim:raw_silver_to_silver_ingot_smelting、miningdim:raw_silver_to_silver_ingot_blasting、miningdim:raw_tin_to_tin_ingot_smelting、miningdim:raw_tin_to_tin_ingot_blasting、miningdim:raw_nickel_to_nickel_ingot_smelting、miningdim:raw_nickel_to_nickel_ingot_blasting、miningdim:raw_chromium_to_chromium_ingot_smelting、miningdim:raw_chromium_to_chromium_ingot_blasting、miningdim:raw_tungsten_to_tungsten_ingot_smelting、miningdim:raw_tungsten_to_tungsten_ingot_blasting |
| 橡胶、工具与绝缘 | 8 | miningdim:rubber_from_latex_smelting、miningdim:rubber_planks、miningdim:rubber_tapping_knife、miningdim:insulation_pvc、miningdim:insulation_pe、miningdim:insulation_epr、miningdim:insulation_xlpe、miningdim:insulation_silicone |
| 十二导线、十二线缆与钨特殊线 | 25 | miningdim:iron_wire、miningdim:aluminum_wire、miningdim:copper_wire、miningdim:tinned_copper_wire、miningdim:ofc_copper_wire、miningdim:ofe_copper_wire、miningdim:silver_plated_copper_wire、miningdim:gold_wire、miningdim:silver_wire、miningdim:graphene_wire、miningdim:nbti_superconductor_wire、miningdim:ybco_superconductor_wire、miningdim:iron_energy_cable、miningdim:aluminum_energy_cable、miningdim:copper_energy_cable、miningdim:tinned_copper_energy_cable、miningdim:ofc_copper_energy_cable、miningdim:ofe_copper_energy_cable、miningdim:silver_plated_copper_energy_cable、miningdim:gold_energy_cable、miningdim:silver_energy_cable、miningdim:graphene_energy_cable、miningdim:nbti_superconductor_energy_cable、miningdim:ybco_superconductor_energy_cable、miningdim:tungsten_heat_resistant_wire |
| 三发电机与三燃料芯 | 6 | miningdim:industrial_fuel_core、miningdim:industrial_generator、miningdim:modern_fuel_core、miningdim:modern_generator、miningdim:future_fuel_core、miningdim:future_energy_generator |
| 两机器、五提纯、两空分 | 9 | miningdim:metallurgic_purifier、miningdim:air_separation_unit、miningdim:copper_to_deoxidized、miningdim:deoxidized_to_ofc、miningdim:deoxidized_to_phosphorus、miningdim:ofc_to_ofe、miningdim:gold_to_4n、miningdim:air_separation_argon、miningdim:air_separation_liquid_nitrogen |
| 终局材料、保险丝与控制器 | 6 | miningdim:graphene_sheet、miningdim:superconductor_precursor、miningdim:nbti_conductor、miningdim:ybco_tape、miningdim:low_temperature_controller、miningdim:nichrome_fuse |
:::

## 界面与可选联动

:::table{mono="0"}
| 对象 | 状态 | 玩家可见信息 |
| --- | --- | --- |
| 四个原生菜单 | 已注册 | 发电机、提纯机、空分装置、低温控制器均有代码绘制 Screen |
| JEI 15.20.0.135 | 条件可用 | 插件 UID miningdim:power；分类 miningdim:metallurgic_purifying 与 miningdim:air_separating；两台机器分别作为 catalyst，显示输入输出、时间、FE/t 与总 FE |
| Jade 11.13.2+forge | 条件可用 | 五个 provider UID：power_cable、power_generator、power_purifier、power_air_separator、power_low_temperature_controller |
| 线缆 Jade | 条件可用 | 温度、额定与有效吞吐、缓冲、负载、单次与累计溢出损耗、距离损耗、耐压、故障、冷却状态 |
| 发电机 Jade | 条件可用 | 状态、缓冲、燃料剩余、保险丝、温度、熔毁温度、网络故障与网络耐压 |
| 机器与控制器 Jade | 条件可用 | 加工进度、FE、灌注或模式，以及冷却状态、剩余时间、NbTi 覆盖 |
:::

> JEI 与 Jade 都是 mods.toml 中 mandatory=false 的软依赖；开发运行时只有显式传入 -PwithPowerCompat 才加载完整实现。

## 动态压力公式与默认配置

服务端每 20 tick 评估一次：danger = clamp(wZone x zone + wTime x (1 - exp(-tWin / (timeSoftCap x 20))) + wOre x oreRichness, 0, max)。玩家只要在活动实例 region 内就被视为持续作业。

:::table{mono="0"}
| 配置键 | 默认值 | 当前真实作用 |
| --- | ---: | --- |
| danger.max | 1.0 | 总 danger 上限 |
| danger.weightZoneDifficulty | 1.0 | 难度区基础项权重 |
| danger.weightTimeSpent | 0.5 | 停留时间项权重 |
| danger.weightOreRichness | 0.3 | 已定义但生产调用恒传 0，当前无效果 |
| danger.timeSoftCap | 60 秒 | 时间项指数收敛尺度 |
| danger.decayPerTickAway | 0.2 | 有算法，但生产路径离区会直接删状态，当前无衰减场景 |
| danger.evalIntervalTicks | 20 | 危险评估与 S2C 同步周期 |
| mob.spawnIntervalTicks | 100 | 未被 MobPressureSystem 读取；实际间隔取 SpawnTier 硬编码 |
| mob.maxPerPlayer | 8 | 玩家附近本系统怪物并发上限；配置 0 会被 Math.max(1, value) 改成 1 |
| mob.maxPerInstance | 30 | 实例 liveMobs 硬上限；压力刷怪与动态苦力怕共用 |
| mob.behindPlayerChance | 0.5 | 高压与满压时，非苦力怕怪走身后选点的概率 |
| mob.spawnRadius | 24 | 普通压力刷怪半径 |
| trap.dynamicEnabled | true | 总开关；关闭后动态苦力怕、坍塌、岩浆全停 |
:::

## 三难度压力曲线

- 首次观测玩家时建立 200 tick 出生冻结：显示 danger 被压到最多 0.15，且不主动刷怪。tWin 在冻结期间仍继续累积，因此冻结结束会直接跳到已经累计后的真实 danger。
- 压力状态只存在内存；离开矿山维度、登出、跨实例或落在无效 region 会删除或重建。重新进入不会继承上次压力。
- 矿工“耐压”被动已接线：L1-L3 系数 1.0，L4 为 0.85，逐级下降到 L10 的 0.60；只缩放 tWin 累积和理论衰减，不削弱 zone 基础项。

| 难度 | zone 初值 | 理论天花板 | 默认阈值到达时间，从进入实例计 |
| --- | ---: | ---: | --- |
| 入门 | 0.09 | 0.59 | LIGHT 0.20 约 15 秒；MEDIUM 0.40 约 58 秒；坍塌 0.55 约 152 秒；HIGH 与岩浆不可达 |
| 进阶 | 0.29 | 0.79 | MEDIUM 约 15 秒；动态苦力怕 0.50 约 33 秒；坍塌约 44 秒；HIGH 约 58 秒；岩浆约 103 秒；EXTREME 不可达 |
| 硬核 | 0.40 | 0.90 | 动态苦力怕约 14 秒；坍塌约 21 秒；HIGH 约 31 秒；岩浆约 55 秒；EXTREME 约 97 秒 |

## 五档压力刷怪

- 选点最多尝试 12 次，距离至少 8 格，以玩家 Y 上下 24 格搜索脚下稳固、头顶两格空气且仍在 region 内的位置。
- 苦力怕必走身后选点；HIGH 和 EXTREME 的其他怪按 behindPlayerChance 决定。身后范围 8-20 格、排除玩家 70 度视锥，并有同玩家 100 tick 冷却与苦力怕预警声。
- 怪物用 Forge onFinalizeSpawn 与 SPAWNER 类型初始化，再通过原版 checkSpawnRules；落地前写入 MobInstanceTag。EntityJoin 与 EntityLeave 维护实例计数，覆盖死亡、自爆、discard、自然消失和区块卸载/重载。
- 压力怪不设 persistenceRequired，沿用原版自然消失。每实例只有一个 nextSpawnTick，多玩家共用；迭代中先到的玩家可能消费本次波次。
- 落地成功后无条件调用自研 ChampionSpawnSeam。ChampionSystem 当前无条件绑定 promoter，升格不再依赖外部 Champions mod；入门 / 进阶 / 硬核升格概率由冠军系统另定为 6% / 10% / 15%。

| 档位 | danger 区间 | 间隔 | 单波 | 允许怪物 | 同步视觉档 |
| --- | --- | ---: | --- | --- | --- |
| SAFE | [0.00, 0.20) | 不刷 | 0 | 无 | SAFE；压暗系数 0 |
| LIGHT | [0.20, 0.40) | 400 tick / 20 秒 | 1 | zombie、spider | ALERT；压暗系数 0 |
| MEDIUM | [0.40, 0.60) | 280 tick / 14 秒 | 1-2 | 再加入 skeleton | ALERT；压暗系数 0.33 |
| HIGH | [0.60, 0.80) | 180 tick / 9 秒 | 2-3 | 再加入 creeper | HIGH；压暗系数 0.66 |
| EXTREME | [0.80, 1.00] | 120 tick / 6 秒 | 3-4 | 再加入 cave_spider、witch | HIGH；压暗系数 1.0 |

## 压力驱动的三类动态陷阱

- 每实例每次评估最多触发 1 个动态陷阱，优先级为岩浆、坍塌、身后苦力怕。
- 实现没有“按 danger 概率掷骰”的随机门；只要达到阈值、冷却结束且找到合法位置，就会按优先级确定性触发。源码类注释中的“概率 tick”与实际代码不一致。

| 陷阱 | 门槛 | 冷却与预警 | 实际效果 |
| --- | --- | --- | --- |
| 身后苦力怕 | danger >= 0.50；入门禁用 | 每玩家 100 tick；生成声提示 | 8-20 格视锥外寻找合法点，设为 persistenceRequired，并计入同一实例怪物上限 |
| 局部坍塌 | danger >= 0.55；三难度均可 | 每玩家 200 tick；预警 10 tick | 随机 1-3 列，保留原可落方块语义，伤害上限 6 |
| 岩浆喷发 | danger >= 0.70；入门禁用 | 每实例 300 tick；预警 20 tick | 放置 1 个岩浆源，5 tick 后回收 |

## 已确认断线与缺陷

| 级别 | 问题 | 证据与影响 |
| --- | --- | --- |
| Major | 压力 HUD 与屏幕压暗未接线 | DangerSyncS2C 已注册并持续写 ClientDangerState，但生产代码没有任何 HUD 或 overlay 读取 ClientDangerState；client.dangerVisualMode、showInstanceHud、dangerHudScale 因而没有可见效果 |
| Major | 矿工 L9 声东击西不影响压力 | MinerActions 写 entry.IMiningPlayerData.spawnFreezeUntil；MobPressureSystem 读取的是 pressure.PlayerMiningData.spawnFreezeUntil，两份状态没有桥接。技能提示与冷却会发生，但不会降压或停刷 |
| Major | 矿物富集度项恒为零 | MobPressureSystem 把 oreRichness01 硬编码为 0.0，weightOreRichness 默认 0.3 当前完全拿不到贡献 |
| Major | 压力衰减没有生产入口 | activeInRegion 在评估路径恒为 true；离区或实例无效时直接 danger.onLeave 删除状态，decayPerTickAway 算法无法触发 |
| Major | 刷怪基础间隔配置是死键 | mob.spawnIntervalTicks 默认 100 从未被读取，五档实际间隔固定为 400 / 280 / 180 / 120 tick |
| Major | 第三方 FE 电压与双向电池语义不完整 | 普通 IEnergyStorage 生产端绕过耐压判断；同时可收可发的储能被当生产端，只会被抽取而不会由网络充电 |
| Major | 多人压力波次共享调度 | nextSpawnTick 按实例保存而非按玩家；同实例玩家的循环顺序会影响谁收到该波怪 |
| Minor | maxPerPlayer = 0 不会禁刷 | 代码把配置值 Math.max(1, value)，配置允许的 0 实际变成每玩家上限 1 |
| Minor | 发电机原生 GUI 不显示电网故障 | GeneratorMenu 已同步 networkFaultOrdinal，但 GeneratorScreen 没有读取；安装 Jade 时可从 Jade 提示看到 |
| Minor | 客户端压力缓存离开维度后不清 | 当前没有渲染消费者，所以暂时不可见；未来接 HUD 前需要处理旧值残留 |
| 信息 | Champions 软依赖声明已过时 | mods.toml 仍声明可选 Champions 2.1.10.2，部分注释也称未安装时不升格；实际 ChampionSystem 已改为自研并无条件绑定 |

## 资源存在、测试专用与明确排除

| 对象 | 物理状态 | 本页归类 |
| --- | --- | --- |
| 能源模型、blockstate、loot、中英名称 | 85 / 37 / 37 全量对应，en_us 与 zh_cn 的 85 个展示键均齐全 | 已接线资源，没有发现“有注册无资源”的能源对象 |
| src/generated/resources | 被主 sourceSet 打包；66 个能源配方均在 1.0.19 JAR | 生产数据，不是测试残留 |
| dist/generator-*-model-preview.png 与生成脚本 | dist 不在根资源 sourceSet | 设计预览与离线工具，不算 mod 内玩家内容 |
| 9 个 power GameTest 类 | 位于 src/main/java 且外层 class 随 JAR 入包 | 测试专用，不算功能入口 |
| 3 个 pressure GameTest 类 | DangerCurveGameTests、MobCountAccountingGameTests、PressureGameTests | 测试专用，不算功能入口 |
| EnergyNetworkManager debug 方法 | debugNetworkSize、debugSameNetwork、debugLastLoadAt、debugRatedCapAt、debugEndpointCountAt、debugNetworkActiveAt、debugPutSyntheticEndpoint、debugClearSyntheticEndpoints | 编译入包的测试探针，无玩家注册入口 |

> power 的 9 个测试类为 GeneratorGameTests、GeneratorRuntimeGameTests、EnergyCableGameTests、PowerMidgameRecipeGameTests、PowerEndgameRecipeGameTests、PowerMachineGameTests、PowerMineralGameTests、RubberGameTests、LowTemperatureControllerGameTests。

## 关键源码与资源路径

- 装配：src/main/java/com/miningdim/MiningDim.java；src/main/java/com/miningdim/power/PowerSystem.java；src/main/java/com/miningdim/pressure/PressureSystem.java。
- 注册：power/PowerRegistry.java、PowerMachineRegistry.java、mineral/PowerMineralRegistry.java、rubber/PowerRubberRegistry.java、PowerCreativeTab.java。
- 发电与结构：power/generator/GeneratorBlockEntity.java、GeneratorSpec.java、GeneratorMeltdown.java；power/GeneratorMultiblockBlock.java。
- 电网与线缆：power/cable/ConductorMaterial.java、SpecialCableMaterial.java；power/grid/EnergyNetworkManager.java、EnergyNetwork.java、CableThermics.java。
- 机器与控制器：power/machine；power/endgame/LowTemperatureControllerBlockEntity.java；PowerGeneratorConfig.java、PowerMachineConfig.java。
- 压力：pressure/Danger.java、SpawnTier.java、MobPressureSystem.java、PlayerMiningData.java、DangerJobFactor.java；trap/DynamicTrapEngine.java、TrapParams.java。
- 资源：src/generated/resources/data/miningdim/recipes；src/generated/resources/data/miningdim/worldgen；src/main/resources/data/miningdim/worldgen/biome。
- 联动与 UI：power/compat/jei；power/compat/jade；power/client；network/DangerSyncS2C.java、ClientDangerState.java。
