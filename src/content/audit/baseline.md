---
order: 10
name: 审计口径与构建证据
en: Build baseline
group: 证据
tagline: 说明什么叫“编译进 mod”，并固定本轮统计所对应的提交、产物和排除范围。
facts:
  - label: 源码提交
    value: 701093bd8492
  - label: MOD 版本
    value: 1.0.19
  - label: 目标产物
    value: miningdim-1.20.1-1.0.19-all.jar
  - label: 审计日期
    value: 2026-08-18
---

本页是临时故障排查区的事实基线。统计只认 Wok-Project 远端 main 当前提交和该提交对应的生产 JAR，不把设计文档、未合分支、Claude 记忆里的计划项直接当成已上线功能。

## 三层判据

:::table
| 层级 | 通过条件 | Wiki 里的含义 |
| --- | --- | --- |
| 物理入包 | 类或资源存在于根 sourceSet，并能在 1.0.19-all.jar 中找到 | 只能证明字节进入产物 |
| 启动接线 | 由 MiningDim、有效事件订阅器或已注册的 DeferredRegister 接入 | 服务器启动时会装配 |
| 玩家可达 | 存在事件、命令、配方、方块交互、界面或明确发放入口，且通过配置与前置门 | 可按文档实际游玩 |
:::

> 后两层没有通过时，即使 class 在 JAR 里，也不会写成“已上线玩法”。

## 源码与产物证据

- 本地 HEAD、本地 main、origin/main 与远端 refs/heads/main 均为 701093bd849270c8fdd5c5d38b598bec391129de。
- 根工程是单模块 Forge 1.20.1 / Forge 47.3.0 / Java 17；版本号为 1.0.19。
- 966 个 src/main/java 顶级源码都能在 -all.jar 找到对应 class；1916 个已跟踪主资源和生成资源均入包。
- 生产目标是 32,305,962 字节的 -all.jar；它包含 sqlite-jdbc 3.45.3.0，薄 JAR 不具备完整 SQLite 运行依赖。
- \-all.jar 的 SHA-256 为 B4A30F5D6C4A935EB11E8A438C2F58108F55C91611F8ABBDE0D52224F47CD255。
- 现有 run/logs/latest.log 记录 1327 个 required GameTest 全部通过；本轮为保持 Mod 工作区只读没有重跑，这条历史记录不能替代真服复现。

## 明确排除

:::table
| 对象 | 物理状态 | 本轮处理 |
| --- | --- | --- |
| 125 个 GameTest 源文件 | 位于 src/main/java；发布 JAR 内共有 177 个 GameTest/testutil class | 只算验证代码，不算玩家功能 |
| com.miningdim.command.CommandSystem | class 入包，但未加入 MiningDim 的子系统表 | 标记为未装配旧命令树 |
| standalone/kivotos-armorer | 独立 Gradle 根与独立 modId | 不计入 miningdim 主 JAR |
| webui/src 与 webui/dist | 根 Gradle 未接线 | 远端前端不计作 JAR 内置资源 |
| 未合分支与设计文档计划 | 不在当前 main 产物边界 | 统一列入未实现或待验证 |
:::

## 状态标签怎么读

:::table
| 标签 | 定义 |
| --- | --- |
| 已接线 | 入包、启动装配、存在玩家入口 |
| 条件可用 | 已接线，但需要外部 mod、权限、配置开关或真服环境 |
| 仅骨架/不可达 | 注册物或逻辑存在，默认配置或发放链让普通生存流程无法到达 |
| 未装配 | 物理入包，但主入口没有接线 |
| 不入主包 | 属于独立工程、外部前端或外部依赖 |
| 未实现 | 只存在设计、记忆或未合分支线索 |
:::
