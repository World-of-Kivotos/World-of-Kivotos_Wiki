import { JOBS, DIMENSIONS } from '@/content/wiki'
import { JobList } from '@/components/wiki/JobList'
import { LinkRow } from '@/components/wiki/LinkRow'

function GroupHead({ children }: { children: string }) {
  return (
    <h2 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </h2>
  )
}

export function WikiIndexPage() {
  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Wiki 概览</h1>
        <p className="mt-2 max-w-[64ch] text-[15px] leading-relaxed text-muted-foreground">
          World of Kivotos 的玩法说明手册。职业讲每个职业自己的玩法与技能;经济讲货币、收入与玩家间交易;
          维度讲各个玩法世界本身的机制。内容随版本更新。
        </p>
      </header>

      <section>
        <GroupHead>职业</GroupHead>
        <JobList jobs={JOBS} />
      </section>

      <section>
        <GroupHead>精英怪</GroupHead>
        <ul className="divide-y divide-border">
          <li>
            <LinkRow
              to="/wiki/champions"
              name="精英怪总览"
              en="Champion"
              desc="星级与词条、减伤与血池机制, 19 条已实现词条逐一详解"
            />
          </li>
        </ul>
      </section>

      <section>
        <GroupHead>经济</GroupHead>
        <ul className="divide-y divide-border">
          <li>
            <LinkRow to="/wiki/economy" name="经济总览" desc="两种货币、收入与每日上限、跳蚤市场怎么用" />
          </li>
        </ul>
      </section>

      <section>
        <GroupHead>维度</GroupHead>
        <ul className="divide-y divide-border">
          {DIMENSIONS.map((d) => (
            <li key={d.id}>
              <LinkRow to={`/wiki/dimensions/${d.id}`} name={d.name} en={d.en} desc={d.tagline} />
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-muted-foreground">更多维度陆续开放。</p>
      </section>
    </div>
  )
}
