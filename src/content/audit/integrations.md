---
order: 130
name: 依赖、联动与部署边界
en: Dependencies and integration boundaries
group: 联动
tagline: 逐项区分硬依赖、JarJar 运行库、可选 Mod、数据标签兼容、外部前端、独立伴生 Mod 和仅停留在设计中的名称。
facts:
  - label: 硬性 Mod 前置
    value: Forge 47.x / Minecraft 1.20.1
  - label: 内嵌运行库
    value: sqlite-jdbc 3.45.3.0
  - label: 声明的可选 Mod
    value: '6'
  - label: 远端界面
    value: React WebUI，不在主 JAR
  - label: 审计提交
    value: main@701093bd8492
---

联动是否存在不能只看 build.gradle 里有一个 JAR，也不能只看 mods.toml 写了 optional。本页同时检查依赖声明、运行时 ModList 守卫、跨模组类调用、数据包命名空间、Forge capability 和玩家入口。结论分为“硬依赖”“条件可用”“仅数据兼容”“独立工程”“历史残留”和“未实现”；所有 compileOnly 联动仍需在正式整合包的真实客户端与专服复验。

## 依赖总表

:::table{mono="0,1"}
| 对象 | 声明 / 版本 | 接入层级 | 当前 main 的真实作用 | 状态 |
| --- | --- | --- | --- | --- |
| forge | [47,) | mandatory / BOTH | Mod Loader、事件总线、注册表、网络、Forge Energy 与配置基础 | 硬依赖 |
| minecraft | [1.20.1,1.20.2) | mandatory / BOTH | 维度和数据包格式锁定 1.20.1 | 硬依赖 |
| mcef | [2.1.6,) | optional / CLIENT / compileOnly 2.1.6 | 承载游戏内远端 React WebUI；服务端动作不依赖浏览器 | 条件可用 |
| farmersdelight | [1.20.1-1.2.0,) | optional / BOTH / registry ID | 农夫作物、番茄路径和厨师番茄酱调味 | 条件可用 |
| tacz | [1.1.8,1.1.9) | optional / BOTH / compileOnly 1.1.8-hotfix | 制弹与枪匠、枪械任务、开箱皮肤、板甲弹道分类 | 条件可用；真服必验 |
| champions | [1.20.1-2.1.10.2,1.20.1-2.1.11) | optional / BOTH / compileOnly | 自研精英已不调用其 API；只剩可选声明和 16 个原词缀禁用覆盖 | 历史兼容残留 |
| jei | [15.20.0.135] | optional / CLIENT / 插件注解 | 展示能源系统两种自定义机器配方；普通 JSON 配方由 JEI 自行读取 | 已接线 |
| jade | [11.13.2+forge] | optional / BOTH / 插件注解 | 显示线缆、发电机、净化器、空分机和低温控制器状态 | 已接线 |
| sqlite-jdbc | [3.45.3.0,3.46)；pin 3.45.3.0 | JarJar 内嵌库 | 统一账本、市场、开箱等 SQLite 路径的 JDBC 驱动 | 仅 -all.jar 自带 |
| flavor_immersed_daily | 无 mods.toml 声明；实核 1.1.0.3 | 可选物品标签与命名空间识别 | 27 种调料可进入厨师槽，并按口味偏向效果池 | 数据级软兼容 |
:::

## TaCZ：四条真实联动链

:::table
| 主系统 | TaCZ 接点 | 缺失 TaCZ 时 | 当前边界 |
| --- | --- | --- | --- |
| 军火商 | 把口径与批次物化为 TaCZ 弹药；枪匠装配 9 种枪 ID | 职业与工作台仍注册，但弹药/枪械物化不可用 | 枪匠默认关闭且没有生存发放链；只有 M4A1 使用自定义 miningdim 枪数据 |
| 开箱 | 17 种皮肤归属、资源探测和应用写入 | 服务端 case action 会按不可用状态拒绝关键步骤 | 开箱状态机和 SQLite Saga 在主 JAR，实际皮肤应用必须真客户端验证 |
| 任务 | 枪械击杀等事实来源在 TaCZ 加载时注册 | 非枪械任务仍可用，TaCZ 事实不会产生 | 任务核心不是 TaCZ 硬依赖 |
| 铸甲师 | 监听 TaCZ 枪击事件，并对四个已知 damage ID 分别走 R 或 Q | 板甲仍处理通用物理伤害 | 未知未来 TaCZ 伤害 ID 明确不猜；跨版本可能改变内部包和事件顺序 |
:::

> 源码不仅使用公开 API，还触及 TaCZ 内部资源包。mods.toml 因此把上界锁在 1.1.9 之前；当前可确认编译目标是本地 1.1.8-hotfix，不能据此宣称任意 1.1.8 整合包都已通过真服。

## MCEF 与外部 React WebUI

- MCEF 只在客户端另装，不会被 miningdim JAR 内嵌；未安装时服务器、SQLite、矿洞和原生方块菜单仍可运行。
- 客户端默认 G 键打开单例浏览器；所有触达 MCEF class 的入口先经过 ModList.isLoaded("mcef") 与初始化检查。
- 服务端包含权威 C2S/S2C 网关、握手、批处理和 70 个已注册 action；React 的 webui/src 与 webui/dist 均不属于根 Gradle sourceSet。
- miningdim-client.toml 的 webui.url 默认仍为 http://localhost:5173/。正式整合包必须覆盖为实际托管地址，否则装了 MCEF 也只会尝试本机开发端口。
- 特勤干员的 scan 与 seal 当前只有 WebUI action 入口；无 MCEF 时仍能通过击杀精英获取经验，但不能进入扫描、封印和 activeAgent 完整循环。
- JAR 内唯一完整 HTML 是 assets/miningdim/web/case-opening.html，用于开箱动画；它不等于整套 React WebUI 已经内嵌。

## SQLite 与生产 JAR 选择

- 统一数据库文件是世界目录下 miningdim.db；schema 当前为 V4，由 MiningStoreSubsystem 在 ServerAboutToStart 打开并在停服关闭。
- SQLite 服务端路径不依赖 MCEF。没有浏览器的专服仍可运行账本和事务；只是玩家缺少部分 WebUI 操作入口。
- 现有 GameTest 日志记录无 MCEF 条件下 1327 个 required 测试通过，但本轮没有重跑，也没有替代生产 JarJar 加载和真实多人客户端验证。

:::table{mono="0"}
| 产物 | sqlite-jdbc | 可证明的用途 | 部署结论 |
| --- | --- | --- | --- |
| miningdim-1.20.1-1.0.19-all.jar | META-INF/jarjar 内含 3.45.3.0 | 自带统一数据库运行驱动 | 正式服目标产物 |
| miningdim-1.20.1-1.0.19.jar | 不含 JarJar 驱动 | 代码与资源齐全，但不能证明目标服务器另有 JDBC 驱动 | 不可作为自包含生产包 |
:::

## 内容与信息展示兼容

:::table
| 对象 | 接线内容 | 未覆盖内容 |
| --- | --- | --- |
| Farmer’s Delight | 农夫识别 cabbage、onion、tomato、rice 等收获物；番茄有专用重采路径；厨师接受 tomato_sauce | 未安装时相关可选注册 ID 路径跳过，不阻断原版作物与主 Mod 作物 |
| 烟火凡人心 | 准确 modId 是 flavor_immersed_daily；调味标签和 SeasoningTag 识别 27 种物品，并有战斗效果黑名单 | 没有 mods.toml 版本门、Java API 或专属测试运行时；属于数据 ID 兼容 |
| JEI | PowerJeiPlugin 注册 Metallurgic Purifying 与 Air Separating 两类自定义 RecipeType 展示 | 酿酒师 9 个 Java 内部配方不是 RecipeType，不会自动出现在 JEI |
| Jade | PowerJadePlugin 注册 5 类方块 provider，含能量、温度、故障、进度与冷却状态 | 其他职业机器没有专属 Jade provider |
:::

## 容易被误写成现成联动的项目

:::table
| 名称 | 当前源码事实 | 本区判定 |
| --- | --- | --- |
| Champions | 35 个词缀、星级、血池和特勤探测已迁入 MiningChampionData；不再调用 top.theillusivec4.champions | 第三方 Champions 不是精英主玩法前置；16 个禁用 JSON 和声明属于历史兼容 |
| Tide | 酿酒满月只读取原版 getMoonPhase；空军职业仍是设计调研 | 未联动、未入主工程 classpath |
| Flux Networks | 能源方块暴露标准 ForgeCapabilities.ENERGY / IEnergyStorage，但没有 Flux 专用类或版本声明 | 只能宣称通用 Forge Energy 互操作边界，不能宣称已完成 Flux 专项支持 |
| Festival Delicacies | 它是独立 modId festival_delicacies；当前调料表使用的是 flavor_immersed_daily 命名空间 | 没有专用接线，不能把两个模组混称 |
| Flan | 主 JAR 没有 Flan 依赖声明或 API 调用；Wiki 的领地文档描述服务器另装内容 | 外部服务器玩法，不统计为 miningdim 编译功能 |
| WOK-ChestShop | 位于独立仓库、独立构建与独立 mod；可消费同一信用点体系，但不在根 sourceSet | 独立伴生 Mod，不计入本次 377 个主 JAR 注册对象 |
| 组队 / 空军 / 统一平板终局 | 只有设计、调研或未合分支线索，当前装配表没有对应 Subsystem | 未实现 |
:::

## 真服验证矩阵

:::table
| 组合 | 静态证据 | 仍需验证 |
| --- | --- | --- |
| 纯 Forge + -all.jar | 无可选 Mod 的 GameTest 路径和 SQLite 内嵌元数据存在 | 全新世界迁移、JarJar 驱动加载、多人账本一致性 |
| + TaCZ 1.1.8-hotfix | 编译签名、版本门和 ModList 守卫通过 | 弹药物化、枪匠数据、枪击事件顺序、皮肤资源与任务事实 |
| + MCEF 2.1.6 | 客户端守卫、网络 action 和远端 URL 配置存在 | JCEF 初始化、登录握手、页面往返、断线恢复与特勤 scan/seal |
| + JEI / Jade 精确版本 | 插件类、翻译键和依赖声明入包 | 客户端加载、配方布局、服务端数据 provider 与权限边界 |
| + Farmer’s Delight / 烟火凡人心 | registry ID、可选标签与偏向映射存在 | 真实版本下收获事件、物品 ID 漂移、调味槽与效果黑名单 |
:::

> “需真服验证”不是“没有编译”。它表示当前 JAR 已含调用方或数据入口，但外部 Mod 的真实二进制、事件顺序、资源包和客户端环境不在本轮只读审计的可控边界内。
