import { Link, NavLink } from 'react-router-dom'
import { Pickaxe } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

const NAV = [
  { to: '/', label: '首页', end: true },
  { to: '/wiki', label: 'Wiki', end: false },
]

export function SiteHeader() {
  return (
    <header className="glass sticky top-0 z-30 border-b border-border bg-card">
      <div className="mx-auto flex h-16 w-full max-w-[1680px] items-center gap-6 px-5 sm:px-8 lg:px-12 2xl:px-16">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Pickaxe className="size-[18px]" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-sm font-semibold tracking-tight">World of Kivotos</span>
            <span className="mt-0.5 text-[11px] text-muted-foreground">服务器 Wiki</span>
          </span>
        </Link>

        <nav className="ml-auto flex items-center gap-1">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                cn(
                  'rounded-md px-3 py-1.5 text-sm transition-colors',
                  isActive
                    ? 'font-medium text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )
              }
            >
              {n.label}
            </NavLink>
          ))}
          <div className="mx-1.5 h-5 w-px bg-border-strong" />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  )
}
