import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  ScrollRestoration,
} from 'react-router-dom'
import { SiteHeader } from '@/components/site/SiteHeader'
import { SiteFooter } from '@/components/site/SiteFooter'
import { WikiLayout } from '@/components/wiki/WikiLayout'
import { HomePage } from '@/pages/HomePage'
import { WikiIndexPage } from '@/pages/WikiIndexPage'
import { JobPage } from '@/pages/JobPage'
import { EconomyPage } from '@/pages/EconomyPage'
import { DimensionPage } from '@/pages/DimensionPage'
import { ChampionIndexPage } from '@/pages/ChampionIndexPage'
import { ChampionEffectPage } from '@/pages/ChampionEffectPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

function RootLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
      <ScrollRestoration />
    </div>
  )
}

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      {
        path: '/wiki',
        element: <WikiLayout />,
        children: [
          { index: true, element: <WikiIndexPage /> },
          { path: 'jobs/:jobId', element: <JobPage /> },
          { path: 'economy', element: <EconomyPage /> },
          { path: 'dimensions/:dimId', element: <DimensionPage /> },
          { path: 'champions', element: <ChampionIndexPage /> },
          { path: 'champions/:effectId', element: <ChampionEffectPage /> },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
