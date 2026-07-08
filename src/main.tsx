import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// 自托管 JetBrains Mono (latin 子集 400/500/600), 随站点打包, 不依赖 Google CDN
import '@fontsource/jetbrains-mono/latin-400.css'
import '@fontsource/jetbrains-mono/latin-500.css'
import '@fontsource/jetbrains-mono/latin-600.css'
import './index.css'
import App from './App.tsx'
import { initTheme } from '@/lib/theme'

// 渲染前应用主题, 避免首屏闪烁
initTheme()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
