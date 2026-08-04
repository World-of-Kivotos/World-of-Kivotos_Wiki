import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/lib/theme'

export function ThemeToggle() {
  const { theme, toggle } = useTheme()
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="切换主题"
      className="group inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-all duration-300 ease-spring hover:bg-subtle hover:text-foreground active:scale-90"
    >
      {theme === 'dark' ? (
        <Sun className="size-[18px] transition-transform duration-500 ease-spring group-hover:rotate-45" />
      ) : (
        <Moon className="size-[18px] transition-transform duration-500 ease-spring group-hover:-rotate-12" />
      )}
    </button>
  )
}
