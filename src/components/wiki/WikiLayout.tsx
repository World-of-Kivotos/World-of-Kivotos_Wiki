import { NavLink, Outlet } from 'react-router-dom'
import { JOBS, DIMENSIONS, CHAMPION_EFFECTS } from '@/content/wiki'
import { cn } from '@/lib/utils'

function itemCls({ isActive }: { isActive: boolean }) {
  return cn(
    'block truncate rounded-md px-2.5 py-1.5 text-sm transition-colors',
    isActive
      ? 'bg-subtle font-medium text-foreground'
      : 'text-muted-foreground hover:bg-subtle/60 hover:text-foreground',
  )
}

function GroupLabel({ children }: { children: string }) {
  return (
    <p className="mb-1.5 mt-5 px-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80 first:mt-0">
      {children}
    </p>
  )
}

export function WikiLayout() {
  return (
    <div className="mx-auto flex w-full max-w-[1680px] gap-8 px-5 py-9 sm:px-8 lg:gap-10 lg:px-12 2xl:px-16">
      <aside className="sticky top-[88px] hidden h-fit w-48 shrink-0 lg:block">
        <nav>
          <ul className="space-y-0.5">
            <li>
              <NavLink to="/wiki" end className={itemCls}>
                Wiki 概览
              </NavLink>
            </li>
          </ul>

          <GroupLabel>职业</GroupLabel>
          <ul className="space-y-0.5">
            {JOBS.map((j) => (
              <li key={j.id}>
                <NavLink to={`/wiki/jobs/${j.id}`} className={itemCls} title={j.en}>
                  {j.name}
                </NavLink>
              </li>
            ))}
          </ul>

          <GroupLabel>精英怪</GroupLabel>
          <ul className="space-y-0.5">
            <li>
              <NavLink to="/wiki/champions" end className={itemCls}>
                精英怪总览
              </NavLink>
            </li>
            {CHAMPION_EFFECTS.map((e) => (
              <li key={e.id}>
                <NavLink to={`/wiki/champions/${e.id}`} className={itemCls} title={e.en}>
                  {e.name}
                </NavLink>
              </li>
            ))}
          </ul>

          <GroupLabel>经济</GroupLabel>
          <ul className="space-y-0.5">
            <li>
              <NavLink to="/wiki/economy" className={itemCls}>
                经济总览
              </NavLink>
            </li>
          </ul>

          <GroupLabel>维度</GroupLabel>
          <ul className="space-y-0.5">
            {DIMENSIONS.map((d) => (
              <li key={d.id}>
                <NavLink to={`/wiki/dimensions/${d.id}`} className={itemCls} title={d.en}>
                  {d.name}
                </NavLink>
              </li>
            ))}
          </ul>
          <p className="px-2.5 pt-1.5 text-[11px] leading-snug text-muted-foreground/60">
            更多维度陆续开放
          </p>
        </nav>
      </aside>

      <div className="min-w-0 flex-1">
        <Outlet />
      </div>
    </div>
  )
}
