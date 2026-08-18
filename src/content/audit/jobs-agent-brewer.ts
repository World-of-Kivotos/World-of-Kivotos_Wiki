import type { AuditDoc } from '../types'

export const auditJobsAgentBrewer: AuditDoc = {
  id: 'jobs-agent-brewer',
  name: '职业审计：特勤干员与酿酒师',
  en: 'Agent and Brewer',
  group: '职业',
  tagline: '核对两个职业在 main@701093bd 中的真实入口、完整数值、注册物、跨系统联动和已知断线点。',
  facts: [
    { label: '职业 ID', value: 'agent / brewer' },
    { label: '启动状态', value: '均已由 MiningDim 装配' },
    { label: 'Agent 入口', value: 'MCEF WebUI' },
    { label: 'Brewer 入口', value: '原生方块菜单 + WebUI 状态页' },
    { label: '专属配置', value: 'Agent 无 / Brewer 有' },
    { label: '审计快照', value: 'main@701093bd · 1.0.19' },
  ],
  intro:
    '两个职业的服务端 class 都已进入 1.0.19 生产 JAR，并由 MiningDim 的子系统表真实注册；但“入包”不等于所有设计字段都能玩。特勤干员的扫描、封印已接到自研精英系统，悬赏仍是不可用骨架；酿酒师的生产、陈酿、饮酒和永久层链路完整可达，同时存在会影响存档、燃料结算和方块拆除的高风险问题。',
  sections: [
    {
      heading: '启动注册链',
      table: {
        columns: ['职业', '生产注册链', '已注册入口', '实际结论'],
        rows: [
          [
            '特勤干员',
            'MiningDim -> JobFrameworkSystem -> ChampionSystem -> AgentSystem -> AgentIntegrationBootstrap',
            'job.agent.state / scan / seal',
            '扫描、封印、击杀 XP、额外信用点和精英增伤已接线',
          ],
          [
            '酿酒师',
            'MiningDim -> JobFrameworkSystem -> BrewerSystem',
            '物品、方块、BE、Menu、Screen、事件、配置、job.brewer.state',
            '生产、陈酿、饮酒和一条命永久层已接线',
          ],
        ],
      },
      note:
        '关键证据位于 src/main/java/com/miningdim/MiningDim.java、job/agent/AgentSystem.java、job/agent/integration/AgentIntegrationBootstrap.java 与 job/brewer/BrewerSystem.java。Agent 使用项目自研 MiningChampions capability，不依赖第三方 Champions API；源码注释与可选依赖元数据仍有旧口径。',
    },
    {
      heading: '公共职业等级与命令',
      table: {
        columns: ['等级', '累计 XP', '升下一级所需 XP'],
        numericCols: [0, 1, 2],
        rows: [
          ['1', '0', '3,300'],
          ['2', '3,300', '3,800'],
          ['3', '7,100', '4,500'],
          ['4', '11,600', '5,300'],
          ['5', '16,900', '6,300'],
          ['6', '23,200', '7,400'],
          ['7', '30,600', '8,800'],
          ['8', '39,400', '10,300'],
          ['9', '49,700', '12,200'],
          ['10', '61,900', '满级'],
        ],
      },
      note:
        '两者都使用 JobXpCurve。每个职业按 UTC 日期独立记录当日有效 XP；0 至 1,999 按 100%，2,000 至 2,799 按 40%，2,800 至 3,399 按 20%，3,400 至 3,799 按 8%，3,800 起按 2%，没有硬上限。所有玩家按需创建 L1 进度，不存在排他的“只能选择一个职业”。',
    },
    {
      heading: '公共命令与界面前置',
      bullets: [
        '公共命令为 /job list、/job info <job>、/job wallet，以及权限等级 2 的 /job set <target> <job> <1..10>；两者均无专属命令。/job wallet 在源码中仍标为临时调试命令。',
        '默认 G 键打开 MCEF WebUI，客户端默认地址为 http://localhost:5173/。生产客户端必须配置已部署地址；MCEF 在 mods.toml 中是非强制客户端依赖。',
        '缺少 MCEF 时，Agent 没有原生扫描或封印回退入口；Brewer 的两个原生方块菜单仍可正常使用，WebUI 只影响状态总览。',
        'webui/src 是独立前端工程，不嵌入 mod JAR；服务端 action 已注册不代表客户端一定能打开页面。',
      ],
    },
    {
      heading: '特勤干员定位与激活状态',
      paragraphs: [
        '职业 ID 为 agent，定位是侦察自研精英、临时封印可封词条，并从精英击杀获得职业 XP、额外信用点和小幅伤害加成。任何合格参与者都能获得 Agent XP，但第一次成功封印后才会写入 activeAgent。扫描本身不会激活。',
        '等级与 XP 存在玩家 MiningPlayerData capability；activeAgent 存在主世界 SavedData miningdim_agent_bounty，并跨登录、重启和死亡保留。当前没有正常玩法会取消该标记。',
      ],
      note:
        '没有“入职选择”门。未激活玩家可以一路升级，但拿不到 Agent 额外信用点和精英增伤。',
    },
    {
      heading: '特勤干员等级能力',
      table: {
        columns: ['等级', '扫描半径', '扫描 CD', '解密范围', '被动封印 窗口/CD', '机制封印 窗口/CD'],
        numericCols: [0, 1],
        rows: [
          ['1', '64', '60 秒', '最近目标前 1 条被动', '未解锁', '未解锁'],
          ['2', '96', '57 秒', '最近目标前 2 条被动', '未解锁', '未解锁'],
          ['3', '128', '54 秒', '最近目标前 3 条被动', '8/30 秒', '未解锁'],
          ['4', '160', '50 秒', '全部被动', '9/30 秒', '未解锁'],
          ['5', '200', '47 秒', '全部被动与机制', '9/26 秒', '未解锁'],
          ['6', '256', '44 秒', '全部被动与机制', '10/24 秒', '未解锁'],
          ['7', '320', '40 秒', '全部被动与机制', '11/22 秒', '未解锁'],
          ['8', '384', '37 秒', '全部词条并返回坐标', '11/20 秒', '3/20 秒'],
          ['9', '448', '34 秒', '同上', '11/20 秒', '4/20 秒'],
          ['10', 'max(448, 服务端视距区块×16)', '30 秒', '同上', '12/18 秒', '5/45 秒'],
        ],
      },
      note:
        'L10 不是全图或无限距离。扫描仅限玩家当前维度，以球形距离检索，按距离排序并最多返回 8 个目标；空扫描同样消耗完整 CD。',
    },
    {
      heading: '特勤干员封印、奖励与增伤数值',
      table: {
        columns: ['等级', '可封最高星', '槽位', '信用点倍率', 'activeAgent 对精英增伤', '日/周悬赏槽预览'],
        numericCols: [0],
        rows: [
          ['1', '不可封', '0', '1.00', '5%', '1/0'],
          ['2', '不可封', '0', '1.25', '6%', '1/0'],
          ['3', '3', '1', '1.50', '7%', '2/0'],
          ['4', '4', '1', '1.75', '8%', '2/1'],
          ['5', '5', '1', '2.00', '9%', '3/1'],
          ['6', '6', '1', '2.25', '10%', '3/1'],
          ['7', '7', '1', '2.50', '11%', '3/2'],
          ['8', '8', '1', '2.70', '12%', '4/2'],
          ['9', '9', '8 星以上目标 2，否则 1', '2.85', '13%', '4/2'],
          ['10', '10', '8 星以上目标 2，否则 1', '3.00', '15%', '5/3'],
        ],
      },
      note: '日/周槽、最大悬赏星级、L4 周常和 L8 世界 Boss 权限只是现有面板预览表，不代表悬赏玩法已开放。',
    },
    {
      heading: '特勤干员 XP 与经济结算',
      bullets: [
        '精英击杀原始职业 XP = round(精英初始星级 × 60 × 贡献份额)，随后进入公共职业 XP 日衰减。被词条召唤出的精英不发职业 XP 或 Agent 奖励。',
        '参与者必须在线，并满足“有效伤害不少于精英有效生命 0.5%”或“有效伤害不少于队伍平均有效伤害 15%”之一。',
        '合格且已激活的 Agent 额外获得 floor(星级 × 600 × 等级倍率) 信用点；每人拿完整个人奖励，不按贡献份额再次分摊，也不发青辉石。',
        '信用点仍进入全局 credit_faucet：每 60,000 毛收入跨一档，后续档乘 0.6，最低 1%。',
        '增伤在 LivingHurtEvent 中把最终事件伤害乘以 1+等级比例；攻击源 getEntity() 必须是 ServerPlayer，目标必须是自研 MiningChampion，因此不作用于普通怪、第三方精英或无法归属到玩家实体的伤害。',
      ],
    },
    {
      heading: '特勤扫描与封印操作流程',
      steps: [
        '从 /jobs/agent 打开 AgentPanel，调用 job.agent.scan；请求体不接受玩家自报半径或 CD。',
        '服务端在当前维度构建最多 8 个目标的个人快照；快照有效期等于本次扫描 CD，只存在进程内存。',
        '面板显示目标实体 ID、星级、距离、名称和已按等级解密的可封词条；L8 起额外返回精确方块坐标。',
        '玩家选择快照中的目标和已解密词条，调用 job.agent.seal。服务端再次校验目标、分类、星级、槽位、重复项和分类 CD。',
        '成功后从 MiningChampionData 真正移除词条，保存词条品质和维度，到期再恢复；SPRINT、OVERDRIVE、SELF_REPAIR 还会移除对应持续属性修饰。',
      ],
      note:
        '封印结果码为 OK、NOT_BOUND、NO_TARGET、AFFIX_NOT_SEALABLE、CATEGORY_LOCKED、STAR_TOO_HIGH、ALL_SLOTS_OCCUPIED、AFFIX_ALREADY_SEALED、ON_COOLDOWN。过期快照、目标不在快照或未解密词条会在 WebUI action 前置校验直接失败。',
    },
    {
      heading: '可封与不可封词条 ID',
      table: {
        columns: ['分类', '精确枚举 ID'],
        monoCols: [1],
        rows: [
          [
            '被动，可封 15 个',
            'BURNING, ARMOR_PIERCING, REND, HEAVY_CANNON, CORROSIVE, DOUBLE_STRIKE, QUADRUPLE_STRIKE, BLOODLUST, CHAOS_STRIKE, FROST, SPRINT, OVERDRIVE, BLINK, TACTICAL_BLINK, PHASE_WALK',
          ],
          [
            '机制，可封 10 个',
            'ELECTRO_CHARGE, THUNDER, LITTLE_BOY, DEATH_MARK, VISUAL_DISRUPTION, SELF_REPAIR, COUNTER_UNIT, CAESAR_SWAP, BLADE_WALTZ, SUMMON_SUPPORT',
          ],
          [
            '生存，不可封 10 个',
            'COMPOSITE_ARMOR, UHMWPE_ARMOR, HEAVY_ARMOR, REGEN_TISSUE, FLAMMABLE_REGEN, DEFLECTOR_SHIELD, FORTITUDE_SHIELD, THORNS, GIGANTISM, MINIATURIZATION',
          ],
        ],
      },
      note: '协议实际使用 AffixDef.name() 的大写枚举名，不是 namespaced ID；部分旧注释写法不准确。',
    },
    {
      heading: 'Agent 名义技能与真实 payload 的差距',
      table: {
        columns: ['AgentScanField 宣称等级', '设计字段', '当前生产状态'],
        rows: [
          ['L3', '有效生命', '未进入扫描 payload'],
          ['L4', '护甲减伤', '未进入扫描 payload'],
          ['L5', '技能名、子弹抗性', '未进入扫描 payload'],
          ['L6', '攻击与速度、赏金雷达', '未进入扫描 payload'],
          ['L7', '技能机制', '未进入扫描 payload'],
          ['L8', '质量表、发光高亮', '只实现返回精确坐标；未施加发光'],
          ['L9', '实时数值', '未进入扫描 payload'],
          ['L10', '全部实时属性', '未进入扫描 payload'],
        ],
      },
      note: '当前实际显示只有目标、星级、距离、实体类型/名称、分级解密的词条，以及 L8 后坐标。这些名义字段多由表格和 GameTest 锁定，但没有生产数据与前端渲染。',
    },
    {
      heading: 'Agent 未开放内容与确认缺陷',
      bullets: [
        '悬赏未开放：job.agent.state 固定 bounty.available=false；BountyDefinition、BountyProgress、每周青辉石上限 50 和 grantWeeklyBountyAzure 只存在逻辑骨架或无生产调用。没有模板、接受、推进、领取 action，也不持久化悬赏实例。',
        '封印恢复快照只在内存。停服会直接清空，已移除词条可能跨重启永久丢失。',
        '目标卸载时最多重试 24,000 tick，约 20 分钟；仍找不到就丢弃快照，词条可能永久缺失。',
        '同一精英存在多个错峰封印时，执行器等所有封印结束才整体恢复，短窗口会被最长窗口延长。',
        '注册表先占槽并记 CD，再执行真实词条移除；后者失败时没有回滚，可能出现未封成却占槽和冷却。',
        '新申请只清理注册表过期项，执行器尚未恢复的旧词条可能被新封印继续延长。',
        '前端仍提到与“游戏内按键封印”共用 CD，但原生扫描菜单和相关网络包已删除。',
      ],
      note:
        'Agent 没有专属物品、方块、方块实体、原生 Menu/Screen、配方、Loot Table、Tag、创造页内容或 Forge 配置。其平衡值硬编码在 AgentSkillTable、AgentKillXp、AgentEnhancedReward 等类。',
    },
    {
      heading: '酿酒师注册物清单',
      table: {
        columns: ['类别', '精确注册 ID', '数量与属性'],
        monoCols: [1],
        rows: [
          ['方块/物品/BE/Menu', 'miningdim:brewing_station', '酿酒台；5 输入、1 输出'],
          ['方块/物品/BE/Menu', 'miningdim:wine_cellar', '酒窖；12 酒槽、1 燃料槽'],
          ['物品', 'miningdim:dried_wheat', '声明最大堆叠 6192'],
          ['九种酒', 'miningdim:wine_brandy / wine_vodka / wine_gin / wine_rum / wine_tequila / wine_maotai / wine_whiskey / wine_champagne / wine_moonshine', '每种最大堆叠 16'],
          ['创造页', 'miningdim:miningdim_brewer', '两个方块、干小麦与九种酒'],
        ],
      },
      note:
        '酒种由物品 ID 表示；NBT 根为 MiningBrewer，字段为 quality、vintage、可选 brewer UUID 和 spoiled。品质/年份相同的酒可堆叠。',
    },
    {
      heading: '酿酒师普通配方',
      table: {
        columns: ['输出', '配方或输入', '结果'],
        monoCols: [0],
        rows: [
          ['miningdim:brewing_station', 'WCW / CBC / WCW；B=原版酿造台，C=铜锭，W=原版小麦', '1 个酿酒台'],
          ['miningdim:wine_cellar', 'PIP / IBI / PIP；B=木桶，I=冰，P=橡木木板', '1 个酒窖'],
          ['miningdim:dried_wheat', '熔炼 miningdim:farmer_wheat，100 tick', '1 个，熔炼 XP 0.1'],
        ],
      },
    },
    {
      heading: '九种酿酒台投料',
      table: {
        columns: ['酒', '物品 ID 后缀', '必须精确投入的材料'],
        monoCols: [1],
        rows: [
          ['白兰地', 'brandy', '农夫小麦 16 + 苹果 4'],
          ['伏特加', 'vodka', '农夫小麦 32'],
          ['金酒', 'gin', '农夫小麦 16 + 糖 4'],
          ['朗姆酒', 'rum', '甘蔗 8 + 农夫小麦 16'],
          ['龙舌兰', 'tequila', '胡萝卜 8 + 农夫小麦 16'],
          ['茅台', 'maotai', '农夫小麦 16 + 小麦种子 8；种子是稻米占位'],
          ['威士忌', 'whiskey', '农夫小麦 24'],
          ['香槟', 'champagne', '农夫小麦 16 + 糖 4 + 苹果 2'],
          ['月光酒', 'moonshine', '农夫小麦 24 + 糖 8'],
        ],
      },
      note: '配方按聚合后的物品种类和数量精确相等匹配；少放、多放或混入异物均不启动。所有“小麦”均为 miningdim:farmer_wheat，原版小麦不能替代。',
    },
    {
      heading: '酿酒台实际流程',
      steps: [
        '玩家打开酿酒台；仅在当前没有开工时记录该玩家为操作者。',
        '在 5 个输入槽放入一条精确配方。开始时锁定酒种、操作者和按操作者 Brewer 等级掷出的品质。',
        '服务端推进 2,400 tick，约 120 秒；中途改变任意输入会中断并清空进度、锁定酒种和品质。输出满时暂停。',
        '完成后消耗材料并产出 1 瓶 vintage=0 的基酒。若输出同物品但 NBT 不同或放不下，剩余成品会掉在方块上方。',
        '完工时操作者在线才获得基础原始 XP 20；茅台永久层使其乘 1+0.10×层数，即 0 至 5 层为 20、22、24、26、28、30。离线仍产酒但不发 XP。',
      ],
      note: '机器不暴露物品 capability，漏斗和外部机器不能自动输入/输出；所有等级均可使用全部配方，等级只影响品质概率。',
    },
    {
      heading: '品质系数与完整概率',
      table: {
        columns: ['等级', 'LOW 1.0', 'MID 1.5', 'HIGH 2.0', 'SUPERB 3.0', 'BRILLIANT 5.0'],
        numericCols: [0, 1, 2, 3, 4, 5],
        rows: [
          ['1', '62.50%', '37.50%', '0', '0', '0'],
          ['2', '54.00%', '37.33%', '8.00%', '0.67%', '0'],
          ['3', '45.57%', '36.71%', '15.19%', '2.53%', '0'],
          ['4', '37.50%', '35.71%', '21.43%', '5.36%', '0'],
          ['5', '30.00%', '34.44%', '26.67%', '8.89%', '0'],
          ['6', '23.20%', '32.99%', '30.93%', '12.89%', '0'],
          ['7', '17.14%', '31.43%', '34.29%', '17.14%', '0'],
          ['8', '11.84%', '29.82%', '36.84%', '21.49%', '0'],
          ['9', '7.26%', '28.23%', '38.71%', '25.81%', '0'],
          ['10 普通', '3.167%', '25.332%', '37.999%', '28.499%', '5.003%'],
          ['10 满月', '3.016%', '24.125%', '36.188%', '27.141%', '9.530%'],
        ],
      },
      note:
        '令 p=(等级-1)/9，归一化前 LOW=1-0.9p、MID=0.6+0.2p、HIGH=1.2p、SUPERB=0.9p²；BRILLIANT 仅 L10 有原始权重 0.158，满月 moonPhase==0 时翻为 0.316。饮酒强度 S=年份×品质系数。',
    },
    {
      heading: '酒窖陈酿与断粮',
      bullets: [
        '12 个酒槽加 1 个干小麦槽；每 100 tick 懒结算一次，使用服务端 System.currentTimeMillis。86,400,000 毫秒现实时间等于 1 酒龄年，卸载和离线期间会追赶。酒取出后冻结年份。',
        '满月默认使本次结算的年份增量乘 1.25。当前实现用结算当刻的一个 moonPhase 覆盖整段离线时间，并不回放历史月相。',
        '每瓶每酒龄年的干小麦需求为 16+5×当前年份²。燃料不足时只按已付款比例陈酿，未付款时间按断粮规则倒扣年份；小数燃料债保留。',
        '无燃料不是暂停：默认每现实日倒扣 200 年。年份降至 0 后写 spoiled=true、强度归零，并且之后不会再陈酿。新制 0 年酒只要经历正数无燃料时间就会立刻变质。',
        '12 瓶都处于 10 年时，一现实日满额需求为 12×(16+5×10²)=6,192 干小麦。',
      ],
      note: '酒窖也不暴露物品 capability，只支持手工操作。界面能看槽位、年份与变质状态，但没有精确的时间/燃料进度表。',
    },
    {
      heading: '饮酒临时效果',
      table: {
        columns: ['酒', '临时效果', '缩放'],
        rows: [
          ['白兰地', '急迫', '宽松曲线'],
          ['伏特加', '抗性提升', '战斗曲线'],
          ['金酒', '伤害吸收', '宽松曲线'],
          ['朗姆酒', '速度', '宽松曲线'],
          ['龙舌兰', '力量', '战斗曲线'],
          ['香槟', '生命恢复', '宽松曲线'],
          ['威士忌', '立即恢复 0.5×宽松柔化强度 HP', '瞬时'],
          ['茅台', '给予 round(2×宽松柔化强度) 原版玩家 XP', '瞬时'],
          ['月光酒', '从良性或负面池随机一个', '概率随 S'],
        ],
      },
      note:
        '柔化公式为 S<=knee 时保持 S，否则 knee+(S-knee)×diminish。默认战斗 knee=8/diminish=0.15，宽松 knee=16/diminish=0.40；每 6 点柔化强度升一级，战斗最高 amplifier 1、宽松最高 2；时长 400+30×柔化强度，最多 6,000 tick。新酒 S=0 无效果但仍会被喝掉。',
    },
    {
      heading: '月光酒赌博与饮用容器',
      bullets: [
        '月光良性概率=min(0.85, 0.40+0.01×S)。良性池为急迫、速度、力量、生命恢复、抗性提升，按宽松曲线缩放。',
        '负面池为中毒、反胃、虚弱、饥饿、缓慢，amplifier 0，持续 300 tick。',
        'WineItem 饮用时间为 32 tick，仅服务端结算；消耗一瓶并返还一个玻璃瓶。',
        '酿酒配方不消耗玻璃瓶，因此每喝一瓶都会净生成一个玻璃瓶。',
      ],
    },
    {
      heading: '闪耀品质的一条命永久层',
      table: {
        columns: ['酒龄', '本次增加层数'],
        numericCols: [1],
        rows: [
          ['小于 10', '0'],
          ['10 至不足 18', '1'],
          ['18 至不足 25', '2'],
          ['25 及以上', '3'],
        ],
      },
      note:
        '只有 BRILLIANT 酒触发。每个酒种独立封顶 5 层，没有跨酒种总层数上限；死亡事件未被取消时清空全部层，登录重挂。任何玩家都能喝并固化，不校验 Brewer 身份，也不要求饮用者等于 NBT 中的 brewer。',
    },
    {
      heading: '九种闪耀永久效果',
      table: {
        columns: ['酒', '效果', '5 层结果'],
        rows: [
          ['白兰地', '1-2 层急迫 I，3-4 层急迫 II，5 层急迫 III', '急迫 III'],
          ['伏特加', '每层全伤害减免 5%', '25%'],
          ['金酒', '每层基础最大生命 +10%', '+50%，仍受跨系统帽'],
          ['朗姆酒', '每层基础移动速度 +6%', '+30%'],
          ['龙舌兰', '每层近战攻击伤害 +3', '+15；枪械伤害管线不吃'],
          ['茅台', '每层酿酒台 XP +10%', '1.5 倍，仅酿酒 XP'],
          ['威士忌', '每 600 tick 回复最大生命 5%×层', '每 30 秒回复 25%'],
          ['香槟', '每 20 tick 回复最大生命 1%×层', '每秒回复 5%'],
          ['月光酒', '首次到 5 层时从 8 项中确定性抽 5 项', '结果按玩家 UUID 持久化'],
        ],
      },
      note: '层数保存在主世界 SavedData miningdim_brewer_buffs。只有真实、未被塔罗复活等机制取消的死亡会清层；所有永久效果都不要求玩家拥有或激活 Brewer 职业。',
    },
    {
      heading: '月光永久词条池',
      table: {
        columns: ['稳定 ID', '效果'],
        monoCols: [0],
        rows: [
          ['knockback_res', '击退抗性 +0.2'],
          ['plated', '护甲 +2'],
          ['tough', '护甲韧性 +2'],
          ['lucky', '幸运 +1'],
          ['swift', '基础移动速度 +4%'],
          ['brute', '攻击击退 +0.5'],
          ['vigor', '近战攻击 +1'],
          ['night_vision', '夜视'],
        ],
      },
      note: '抽取 5 项且不重复，种子由玩家 UUID 与抽取数派生；结果写入 SavedData，登录按已存 ID 重挂。',
    },
    {
      heading: 'miningdim-brewer.toml 默认配置',
      table: {
        columns: ['分组', '键', '默认值'],
        monoCols: [0, 1],
        rows: [
          ['fuel', 'driedWheatPerBottleYear / quadCoef', '16 / 5'],
          ['spoilage', 'decayYearsPerDay', '200'],
          ['aging', 'fullMoonBonus', '0.25'],
          ['permanent_layers', 'ginMaxHealthPctPerLayer / globalBonusMaxHealthCapPct', '0.10 / 1.0'],
          ['permanent_layers', 'vodkaReductionPerLayer', '0.05'],
          ['permanent_layers', 'whiskeyHealPctPerLayer / whiskeyHealIntervalTicks', '0.05 / 600'],
          ['permanent_layers', 'champagneHealPctPerLayer / champagneHealIntervalTicks', '0.01 / 20'],
          ['permanent_layers', 'rumMoveSpeedPctPerLayer / tequilaAttackPerLayer / maotaiXpPctPerLayer', '0.06 / 3 / 0.10'],
          ['softcap', 'combatKnee / combatDiminish', '8 / 0.15'],
          ['softcap', 'looseKnee / looseDiminish', '16 / 0.40'],
          ['softcap', 'ampPerSoftStrength / ampCapCombat / ampCapLoose', '6 / 1 / 2'],
          ['softcap', 'effectBaseDurationTicks / effectDurationPerSoft / effectMaxDurationTicks', '400 / 30 / 6000'],
          ['softcap', 'whiskeyHealPerSoft / maotaiXpPerSoft', '0.5 / 2'],
          ['moonshine', 'goodBaseProb / goodProbPerStrength / goodProbMax', '0.40 / 0.01 / 0.85'],
          ['moonshine', 'badDurationTicks', '300'],
        ],
      },
      note: '酿造 2,400 tick、现实日换算、100 tick 结算间隔、12 酒槽、6,192 容量、5 层上限与 10/18/25 年阈值是编译期常量，不能通过 TOML 调整。',
    },
    {
      heading: 'Brewer 跨模块与 WebUI 联动',
      bullets: [
        '农夫：全部九种酿酒配方和干小麦熔炼都依赖 miningdim:farmer_wheat。',
        'Combat：伏特加以 VodkaNumbness 接入 PlayerDamageReduction；与其他减伤乘算，最终受全局最高 85% 减伤限制。',
        'Tarot：金酒与塔罗额外生命共同受“额外最大生命不超过基础生命 100%”的帽；塔罗取消死亡时不清酿酒层。当前检查是金酒读取塔罗，方向并不完全对称。',
        'Tide：没有 API、class 或依赖，只读取原版 moonPhase==0；“潮汐联动”只是满月主题。',
        '市场：酒可挂牌，托管保留完整 ItemStack NBT；quality、vintage、strength、spoiled 会进入物品详情。没有 NPC 回收和系统收购价。',
        'JEI/Jade：没有酿酒专属 category/provider。普通工作台与熔炼配方可由 JEI 自动读到，Java 内部的九种投料配方不是 RecipeType，JEI 不会自动展示。',
        'job.brewer.state 是只读 action，返回等级、九种层数、月光词条、九种精确配方、现实年换算和 5 层上限；不返回方块位置、库存、燃料、酿造进度，也没有写操作。',
      ],
    },
    {
      heading: 'Brewer 高风险缺陷',
      bullets: [
        'Critical：dried_wheat 声明可堆 6,192，但 Minecraft 1.20.1 的 ItemStack NBT Count 与网络物品数量使用单字节。超过 127 的数量会截断或变负；6,192 的低字节仅为 48。现有测试只覆盖内存槽位，没有 NBT/网络往返。',
        'Major：酒允许同 NBT 堆叠 16 瓶，但 CellarSettle 每个非空槽只建立一个 BottleState，没有乘 stack.getCount()。一槽 16 瓶会一起改同一 stack NBT、一起长年份，却只按 1 瓶收费。',
        'Major：brewing_station 和 wine_cellar 没有 block loot table，也没有 onRemove/Containers.dropContents。按当前代码，生存拆除预计既不掉机器，也不释放内部原料、成品、酒和燃料。',
        'Major：登录重挂会遍历并移除全部 MoonshinePerk；night_vision 的 remove 无条件删除 MobEffects.NIGHT_VISION。即使玩家从未抽到月光夜视，也可能清掉药水、命令或其他系统的夜视。',
        'Major：满月离线追赶用加载/结算当刻的单一月相覆盖整段历史；满月加载可让多日离线时间全吃 25%，非满月加载则丢掉历史满月。',
        'Major：WineCellarBlockEntity 在内容变化时不先结算或重置 lastSettleEpochMillis。空窖放置很久后新塞酒，下一次 tick 可能把旧空闲时间应用到新酒：有燃料会瞬间老化，无燃料会瞬间变质。',
        '文案错误：中英文均提示“缺干小麦，陈酿暂停”，实际会立即按每现实日 200 年倒扣并变质，没有宽限期。',
      ],
    },
    {
      heading: 'Brewer 边界、占位与测试缺口',
      bullets: [
        '永久层没有职业、酿造者或跨酒种总帽校验；交易来的酒可让任意玩家把九类分别叠到 5 层。',
        '白兰地和月光夜视所谓“永久”实际是 51,840,000 tick，约连续加载 30 天的长时效果，没有周期刷新；到期后会消失。',
        '酿酒台配方不需要玻璃瓶，饮用固定返瓶，形成玻璃瓶产出。',
        '方块模型仍复用原版 barrel_top/barrel_side，干小麦模型仍指向原版 wheat；两个 GUI PNG 是极简占位，九种酒瓶已有独立纹理。',
        '缺少 2,400 tick 完整生产、在线/离线 XP、操作者与酒 NBT、输出满暂停、真实 WineItem 饮用、事件总线死亡/登录/tick、6,192 数量序列化、16 瓶计费、方块掉落和 GUI 同步的端到端覆盖。',
        'GameTest 源位于 src/main/java，因此测试 class 也进入生产 JAR；Agent 共 79 个源码测试，Brewer 共 59 个，它们是验证代码，不是玩家玩法。',
      ],
    },
    {
      heading: '源码与产物证据索引',
      table: {
        columns: ['主题', '关键路径'],
        monoCols: [1],
        rows: [
          ['总注册', 'src/main/java/com/miningdim/MiningDim.java'],
          ['公共职业', 'src/main/java/com/miningdim/job/JobId.java · JobXpCurve.java · JobCommands.java'],
          ['Agent 注册', 'src/main/java/com/miningdim/job/agent/AgentSystem.java · integration/AgentIntegrationBootstrap.java'],
          ['Agent 数值/扫描', 'job/agent/AgentSkillTable.java · AgentScanTier.java · AgentWebUiActions.java'],
          ['Agent 封印/奖励', 'job/agent/integration/AgentSealHandler.java · AgentSealExecutor.java · AgentRewardHandler.java · AgentDamageBonusHandler.java'],
          ['Agent 悬赏状态', 'job/agent/AgentBountySavedData.java · BountyDefinition.java · BountyProgress.java'],
          ['Brewer 注册/配置', 'job/brewer/BrewerSystem.java · BrewerConstants.java · BrewerConfig.java · BrewerItems.java'],
          ['酿酒台', 'job/brewer/station/BrewingStationBlockEntity.java · BrewRecipes.java · BrewQualityRoller.java'],
          ['酒窖', 'job/brewer/cellar/WineCellarBlockEntity.java · CellarSettle.java'],
          ['饮酒与永久层', 'job/brewer/WineItem.java · WineNbt.java · BrewEffectEngine.java · BrewBuffStore.java · BrewPermanentBuffs.java · MoonshinePerk.java'],
          ['数据资源', 'src/main/resources/data/miningdim/recipes/brewer · assets/miningdim/models · assets/miningdim/textures'],
          ['前端', 'webui/src/pages/jobs/panels/AgentPanel.tsx · BrewerPanel.tsx · webui/src/lib/actions.ts'],
        ],
      },
      note:
        '现有 1.0.19 生产 all-JAR 可找到上述运行类和 Brewer 数据资源。Claude 工作区记忆仅作历史线索：agent-bounty-deferred 对“悬赏延期”仍准确；brewer-job-state 早期段落含旧的未完成状态，须以其末段与当前 main 源码为准。',
    },
  ],
}
