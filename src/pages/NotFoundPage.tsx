import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-24 text-center">
      <p className="font-mono text-sm text-muted-foreground">404</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">页面不存在</h1>
      <Link
        to="/"
        className="mt-5 inline-block rounded-md border border-border-strong px-4 py-2 text-sm font-medium transition-colors hover:bg-subtle"
      >
        返回首页
      </Link>
    </div>
  )
}
