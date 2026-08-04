import { useEffect, useMemo, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { JOBS, DIMENSIONS, CHAMPION_EFFECTS, LAND_DOCS, LAND_GROUPS } from '@/content/wiki'
import { cn } from '@/lib/utils'
import { NavGroup } from './NavGroup'

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
  const { pathname } = useLocation()

  // 精英怪词条按 pool 字段动态派生分组(池按首次出现顺序), 条目/数量全从 CHAMPION_EFFECTS 取, 不硬编码。
  const championPools = useMemo(() => {
    const order: string[] = []
    const byPool = new Map<string, typeof CHAMPION_EFFECTS>()
    for (const e of CHAMPION_EFFECTS) {
      const bucket = byPool.get(e.pool)
      if (bucket) {
        bucket.push(e)
      } else {
        byPool.set(e.pool, [e])
        order.push(e.pool)
      }
    }
    return order.map((pool) => ({ pool, effects: byPool.get(pool)! }))
  }, [])

  // 领地文档按 group 归组; 组的显示顺序由 LAND_GROUPS 固定(上手在前, 服主在后), 不随数据文件里的排列漂移。
  const landGroups = useMemo(
    () => LAND_GROUPS.map((group) => ({ group, docs: LAND_DOCS.filter((d) => d.group === group) })),
    [],
  )

  // 当前路由命中的可折叠组, 组 key 带板块前缀避免两个板块的同名组互相牵连; 仅用于自动展开, 高亮由 NavLink isActive 负责。
  const activeGroup = useMemo(() => {
    const champion = pathname.match(/^\/wiki\/champions\/(.+)$/)
    if (champion) {
      const pool = CHAMPION_EFFECTS.find((e) => e.id === champion[1])?.pool
      return pool ? `champion:${pool}` : null
    }
    const land = pathname.match(/^\/wiki\/land\/(.+)$/)
    if (land) {
      const group = LAND_DOCS.find((d) => d.id === land[1])?.group
      return group ? `land:${group}` : null
    }
    return null
  }, [pathname])

  // 展开态提升到常驻的布局层, 本次会话内保持手动展开的组; 初始只展开命中项所在的组。
  const [openGroups, setOpenGroups] = useState<Set<string>>(() =>
    activeGroup ? new Set([activeGroup]) : new Set(),
  )

  // 路由切到别的组时自动展开新命中的组, 但不自动收起用户已手动展开过的组。
  useEffect(() => {
    if (!activeGroup) return
    setOpenGroups((prev) => {
      if (prev.has(activeGroup)) return prev
      const next = new Set(prev)
      next.add(activeGroup)
      return next
    })
  }, [activeGroup])

  const toggleGroup = (key: string) =>
    setOpenGroups((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })

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
            {championPools.map(({ pool, effects }) => (
              <NavGroup
                key={pool}
                label={`${pool}池`}
                count={effects.length}
                open={openGroups.has(`champion:${pool}`)}
                onToggle={() => toggleGroup(`champion:${pool}`)}
              >
                {effects.map((e) => (
                  <li key={e.id}>
                    <NavLink to={`/wiki/champions/${e.id}`} className={itemCls} title={e.en}>
                      {e.name}
                    </NavLink>
                  </li>
                ))}
              </NavGroup>
            ))}
          </ul>

          <GroupLabel>领地</GroupLabel>
          <ul className="space-y-0.5">
            <li>
              <NavLink to="/wiki/land" end className={itemCls}>
                领地总览
              </NavLink>
            </li>
            {landGroups.map(({ group, docs }) => (
              <NavGroup
                key={group}
                label={group}
                count={docs.length}
                open={openGroups.has(`land:${group}`)}
                onToggle={() => toggleGroup(`land:${group}`)}
              >
                {docs.map((d) => (
                  <li key={d.id}>
                    <NavLink to={`/wiki/land/${d.id}`} className={itemCls} title={d.en}>
                      {d.name}
                    </NavLink>
                  </li>
                ))}
              </NavGroup>
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
