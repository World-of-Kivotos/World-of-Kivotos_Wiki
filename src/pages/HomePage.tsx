import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { JOBS, DIMENSIONS, CHAMPION_EFFECTS, LAND_DOCS } from '@/content/wiki'
import { LinkRow } from '@/components/wiki/LinkRow'
import { Reveal, staggerDelay } from '@/components/ui/Reveal'

/** 栏头: 小标签 + 标题 + 右侧计数, 三栏共用。 */
function ColumnHead({ label, title, right }: { label: string; title: string; right?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 pb-2">
      <div className="flex items-baseline gap-2.5">
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
      </div>
      {right && <span className="font-mono text-xs text-muted-foreground">{right}</span>}
    </div>
  )
}

/** 速览里的一行: 标签左, 等宽数值右。刻意不用大卡片包数字。 */
function Stat({ label, value, to }: { label: string; value: string; to?: string }) {
  const body = (
    <>
      <span className="text-sm text-muted-foreground group-hover:text-foreground">{label}</span>
      <span className="font-mono text-sm tabular-nums">{value}</span>
    </>
  )
  return to ? (
    <Link to={to} className="group flex items-baseline justify-between py-2">
      {body}
    </Link>
  ) : (
    <div className="flex items-baseline justify-between py-2">{body}</div>
  )
}

export function HomePage() {
  const championPools = new Set(CHAMPION_EFFECTS.map((e) => e.pool)).size

  return (
    <div className="mx-auto w-full max-w-[1680px] px-5 sm:px-8 lg:px-12 2xl:px-16">
      {/* 首屏: 左文案 | 右速览, 中间一条竖分割线。原来的整宽单列留白太多, 这里把右半边利用起来。 */}
      <section className="grid gap-10 py-12 sm:py-16 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-0 lg:divide-x lg:divide-border">
        <Reveal className="lg:pr-14">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            World of Kivotos · 服务器 Wiki
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
            服务器的一切,都记在这里
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
            职业怎么赚钱、领地怎么圈、精英怪怎么打、经济怎么运转 —— 全部写成能照着做的教程,随版本更新。
            新人从"第一次圈地"开始看,老玩家直接翻权限与数值表。
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/wiki"
              className="group inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all duration-300 ease-spring hover:-translate-y-0.5 hover:bg-primary/90 active:translate-y-0 active:scale-[0.97]"
            >
              浏览 Wiki
              <ArrowRight className="size-4 transition-transform duration-300 ease-spring group-hover:translate-x-1" />
            </Link>
            <Link
              to="/wiki/land/getting-started"
              className="inline-flex items-center rounded-md border border-border-strong px-4 py-2 text-sm font-medium transition-all duration-300 ease-spring hover:-translate-y-0.5 hover:bg-subtle active:translate-y-0 active:scale-[0.97]"
            >
              第一次圈地
            </Link>
            <Link
              to="/wiki/economy"
              className="inline-flex items-center rounded-md px-2 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              经济总览
            </Link>
          </div>
        </Reveal>

        <Reveal delay={110} stagger className="lg:pl-14">
          <p className="pb-1 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            速览
          </p>
          <div className="divide-y divide-border border-y border-border">
            <div className="stagger-item" style={staggerDelay(0)}>
              <Stat label="职业" value={`${JOBS.length} 个`} to="/wiki" />
            </div>
            <div className="stagger-item" style={staggerDelay(1)}>
              <Stat label="领地文档" value={`${LAND_DOCS.length} 篇`} to="/wiki/land" />
            </div>
            <div className="stagger-item" style={staggerDelay(2)}>
              <Stat
                label="精英怪词条"
                value={`${CHAMPION_EFFECTS.length} 条 / ${championPools} 池`}
                to="/wiki/champions"
              />
            </div>
            <div className="stagger-item" style={staggerDelay(3)}>
              <Stat label="维度" value={`${DIMENSIONS.length} 个`} />
            </div>
          </div>
          <p className="mt-4 text-[13px] leading-relaxed text-muted-foreground">
            内容以服务器实际运行的版本为准。数值有出入以游戏内为准,发现不对请在群里说一声。
          </p>
        </Reveal>
      </section>

      {/* 板块: 三栏竖线分隔。一屏内看到全部入口, 比原来整宽堆叠密得多。 */}
      <section className="grid border-t border-border py-12 lg:grid-cols-3 lg:divide-x lg:divide-border">
        <Reveal stagger className="lg:pr-9">
          <ColumnHead label="Jobs" title="职业" right={`${JOBS.length} 个`} />
          <p className="pb-1 text-[13px] leading-relaxed text-muted-foreground">
            主打经济产出,战斗只做少量加成。
          </p>
          <ul className="divide-y divide-border border-t border-border">
            {JOBS.map((j, i) => (
              <li key={j.id} className="stagger-item" style={staggerDelay(i)}>
                <LinkRow
                  dense
                  to={`/wiki/jobs/${j.id}`}
                  name={j.name}
                  en={j.en}
                  desc={j.tagline}
                  meta={j.difficulty}
                />
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal stagger delay={90} className="mt-10 lg:mt-0 lg:px-9">
          <ColumnHead label="Flan" title="领地" right={`${LAND_DOCS.length} 篇`} />
          <p className="pb-1 text-[13px] leading-relaxed text-muted-foreground">
            圈下你的地,箱子和建筑就没人动得了。
          </p>
          <ul className="divide-y divide-border border-t border-border">
            <li className="stagger-item" style={staggerDelay(0)}>
              <LinkRow
                dense
                to="/wiki/land"
                name="领地总览"
                en="Flan"
                desc="额度怎么来、领地怎么算钱、整套机制一次看懂"
              />
            </li>
            {LAND_DOCS.map((d, i) => (
              <li key={d.id} className="stagger-item" style={staggerDelay(i + 1)}>
                <LinkRow
                  dense
                  to={`/wiki/land/${d.id}`}
                  name={d.name}
                  en={d.en}
                  desc={d.tagline}
                  meta={d.group}
                />
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal stagger delay={180} className="mt-10 space-y-8 lg:mt-0 lg:pl-9">
          <div>
            <ColumnHead label="Champion" title="精英怪" right={`${CHAMPION_EFFECTS.length} 条`} />
            <ul className="divide-y divide-border border-t border-border">
              <li className="stagger-item" style={staggerDelay(0)}>
                <LinkRow
                  dense
                  to="/wiki/champions"
                  name="精英怪总览"
                  en="Champion"
                  desc={`星级、词条与减伤机制, ${championPools} 个点数池逐条详解`}
                />
              </li>
            </ul>
          </div>

          <div>
            <ColumnHead label="Economy" title="经济" />
            <ul className="divide-y divide-border border-t border-border">
              <li className="stagger-item" style={staggerDelay(1)}>
                <LinkRow
                  dense
                  to="/wiki/economy"
                  name="经济总览"
                  desc="两种货币、收入与每日上限、跳蚤市场怎么用"
                />
              </li>
            </ul>
          </div>

          <div>
            <ColumnHead label="Dimensions" title="维度" />
            <ul className="divide-y divide-border border-t border-border">
              {DIMENSIONS.map((d, i) => (
                <li key={d.id} className="stagger-item" style={staggerDelay(i + 2)}>
                  <LinkRow dense to={`/wiki/dimensions/${d.id}`} name={d.name} en={d.en} desc={d.tagline} />
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[13px] text-muted-foreground">更多维度陆续开放。</p>
          </div>
        </Reveal>
      </section>
    </div>
  )
}
