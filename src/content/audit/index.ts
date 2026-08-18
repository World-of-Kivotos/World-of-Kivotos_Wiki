import type { AuditInfo } from '../types'
import { auditBaseline } from './baseline'
import { auditSystems } from './systems'
import { auditGameplay } from './gameplay'
import { auditPowerPressure } from './power-pressure'
import { auditChampionsCases } from './champions-cases'
import { auditEconomySocial } from './economy-social'
import { auditJobsMinerFarmer } from './jobs-miner-farmer'
import { auditJobsChefEngineer } from './jobs-chef-engineer'
import { auditJobsMunitionsTarot } from './jobs-munitions-tarot'
import { auditJobsAgentBrewer } from './jobs-agent-brewer'
import { auditRegistryBlocks } from './registry-blocks'
import { auditRegistryItems } from './registry-items'
import { auditIntegrations } from './integrations'
import { auditKnownGaps } from './known-gaps'

export const AUDIT_INFO: AuditInfo = {
  facts: [
    { label: '快照', value: 'main@701093bd' },
    { label: '生产 JAR', value: '1.0.19-all' },
    { label: '已装配子系统', value: '36' },
    { label: '职业', value: '8' },
    { label: '注册总数', value: '377' },
  ],
  intro:
    '这里是为 1.0.19 故障排查临时建立的源码审计区。它记录当前 main 真正进入生产 JAR、完成启动接线并具备玩家入口的内容，逐项展开 71 个方块、224 个物品和 82 个其他注册对象，同时把软依赖、默认关闭功能、仅有骨架和明确未实现项分开标注。',
  sections: [
    {
      heading: '为什么单独开区',
      paragraphs: [
        '正式 Wiki 面向玩家教学，临时审计区面向版本核对和 Bug 复现。这里会保留注册 ID、配置门、源码路径和不可达项，不直接改写正式职业页与维度页。',
        '本区随 main 快照更新，数值与状态不保证跨版本稳定。确认无误后，适合玩家阅读的部分再回填正式文档。',
      ],
      note: '该区域当前公开可访问，不包含服务器凭据、玩家数据或内部密钥。',
    },
    {
      heading: '阅读顺序',
      steps: [
        '先看“审计口径与构建证据”，确认版本和状态标签。',
        '按玩法、职业、方块物品、联动等专题查具体功能。',
        '遇到“条件可用”或“仅骨架/不可达”时，按页内配置门和前置条件复现。',
        'Bug 回报附上页面中的注册 ID、main 提交和状态标签，避免把旧分支行为混进来。',
      ],
    },
  ],
}

export const AUDIT_GROUPS = ['证据', '玩法', '职业', '内容', '联动', '边界'] as const

export const AUDIT_DOCS = [
  auditBaseline,
  auditSystems,
  auditGameplay,
  auditPowerPressure,
  auditChampionsCases,
  auditEconomySocial,
  auditJobsMinerFarmer,
  auditJobsChefEngineer,
  auditJobsMunitionsTarot,
  auditJobsAgentBrewer,
  auditRegistryBlocks,
  auditRegistryItems,
  auditIntegrations,
  auditKnownGaps,
]
