import { createServer } from 'node:http'
import { spawn } from 'node:child_process'
import { readFileSync, readdirSync, existsSync, statSync, mkdtempSync, rmSync } from 'node:fs'
import { join, extname, resolve } from 'node:path'
import { tmpdir } from 'node:os'

/**
 * 一次性验收工具: 用真实 Chromium 把改造前后的站点逐路由渲染出来, 比较 DOM。
 * 数据层已有逐字段等价证明, 这一层证的是"界面确实还活着"——五关全绿不等于页面没白。
 *
 * 用法: node tools/dom-parity.mjs <当前 dist> <基线 dist>
 */

const [currentDist, baselineDist] = process.argv.slice(2)
if (!currentDist || !baselineDist) {
  console.error('用法: node tools/dom-parity.mjs <当前 dist> <基线 dist>')
  process.exit(1)
}

const CHROME =
  process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe'

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.svg': 'image/svg+xml', '.woff': 'font/woff', '.woff2': 'font/woff2',
  '.png': 'image/png', '.json': 'application/json',
}

function serve(root, port) {
  const server = createServer((req, res) => {
    const url = decodeURIComponent(req.url.split('?')[0])
    let file = join(root, url)
    if (!existsSync(file) || statSync(file).isDirectory()) file = join(root, 'index.html')
    res.writeHead(200, { 'content-type': MIME[extname(file)] ?? 'application/octet-stream' })
    res.end(readFileSync(file))
  })
  return new Promise((ok) => server.listen(port, () => ok(server)))
}

class Cdp {
  #ws
  #id = 0
  #pending = new Map()
  #waiters = []

  static async attach(port) {
    for (let i = 0; i < 100; i += 1) {
      try {
        const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()
        const page = targets.find((t) => t.type === 'page')
        if (page) {
          const cdp = new Cdp()
          await cdp.#connect(page.webSocketDebuggerUrl)
          return cdp
        }
      } catch {
        // Chrome 还没起来, 继续等
      }
      await new Promise((r) => setTimeout(r, 200))
    }
    throw new Error('连不上 Chrome 的调试端口')
  }

  #connect(url) {
    return new Promise((ok, fail) => {
      this.#ws = new WebSocket(url)
      this.#ws.onopen = () => ok()
      this.#ws.onerror = (e) => fail(e)
      this.#ws.onmessage = (event) => {
        const msg = JSON.parse(event.data)
        if (msg.id !== undefined) {
          const p = this.#pending.get(msg.id)
          this.#pending.delete(msg.id)
          if (msg.error) p.fail(new Error(JSON.stringify(msg.error)))
          else p.ok(msg.result)
        } else {
          this.#waiters = this.#waiters.filter((w) => {
            if (w.method !== msg.method) return true
            w.ok(msg.params)
            return false
          })
        }
      }
    })
  }

  send(method, params = {}) {
    const id = (this.#id += 1)
    return new Promise((ok, fail) => {
      this.#pending.set(id, { ok, fail })
      this.#ws.send(JSON.stringify({ id, method, params }))
    })
  }

  once(method, timeoutMs = 20000) {
    return new Promise((ok, fail) => {
      const waiter = { method, ok }
      this.#waiters.push(waiter)
      setTimeout(() => {
        this.#waiters = this.#waiters.filter((w) => w !== waiter)
        fail(new Error(`等待 ${method} 超时`))
      }, timeoutMs)
    })
  }

  close() {
    this.#ws.close()
  }
}

/** 抓页面的可见结构与文字; 去掉带内容 hash 的资源名, 只留真正的渲染结果。 */
const SNAPSHOT_JS = `(() => {
  const root = document.getElementById('root')
  if (!root) return { html: '<<NO ROOT>>', text: '' }
  return { html: root.innerHTML, text: root.innerText }
})()`

async function snapshot(cdp, origin, route) {
  await cdp.send('Page.navigate', { url: origin + route })
  await cdp.once('Page.loadEventFired')
  // React 在脚本求值时同步挂载, 再给一拍让 effect 里的展开态落定。
  await new Promise((r) => setTimeout(r, 120))
  const { result } = await cdp.send('Runtime.evaluate', {
    expression: SNAPSHOT_JS,
    returnByValue: true,
  })
  return result.value
}

/** 路由表从内容目录现推, 免得多一份要手工维护的清单。 */
function collectRoutes() {
  const root = resolve('src/content')
  const ids = (dir) =>
    readdirSync(join(root, dir))
      .filter((f) => f.endsWith('.md') && !f.startsWith('_') && f !== 'README.md')
      .map((f) => f.slice(0, -3))
      .sort()

  return [
    '/',
    '/wiki',
    '/wiki/economy',
    '/wiki/champions',
    '/wiki/land',
    '/wiki/audit',
    '/wiki/nope-404',
    ...ids('jobs').map((id) => `/wiki/jobs/${id}`),
    ...ids('dimensions').map((id) => `/wiki/dimensions/${id}`),
    ...ids('champions').map((id) => `/wiki/champions/${id}`),
    ...ids('land').map((id) => `/wiki/land/${id}`),
    ...ids('audit').map((id) => `/wiki/audit/${id}`),
  ]
}

async function main() {
  const manifest = { routes: collectRoutes() }
  console.log(`共 ${manifest.routes.length} 条路由`)
  const serverA = await serve(resolve(currentDist), 4181)
  const serverB = await serve(resolve(baselineDist), 4182)

  const profile = mkdtempSync(join(tmpdir(), 'wok-dom-parity-'))
  const chrome = spawn(CHROME, [
    '--headless=new',
    '--remote-debugging-port=9333',
    `--user-data-dir=${profile}`,
    '--no-first-run',
    '--disable-gpu',
    '--hide-scrollbars',
    'about:blank',
  ])

  const cdp = await Cdp.attach(9333)
  await cdp.send('Page.enable')

  const diffs = []
  let checked = 0
  for (const route of manifest.routes) {
    const current = await snapshot(cdp, 'http://127.0.0.1:4181', route)
    const baseline = await snapshot(cdp, 'http://127.0.0.1:4182', route)
    checked += 1
    if (current.html !== baseline.html) {
      let at = 0
      while (at < current.html.length && current.html[at] === baseline.html[at]) at += 1
      diffs.push({
        route,
        at,
        current: current.html.slice(Math.max(0, at - 90), at + 90),
        baseline: baseline.html.slice(Math.max(0, at - 90), at + 90),
      })
    }
    if (checked % 10 === 0) console.log(`  已比对 ${checked}/${manifest.routes.length}`)
  }

  cdp.close()
  chrome.kill()
  serverA.close()
  serverB.close()
  // Chrome 退出是异步的, profile 目录常常还被占着; 清不掉只是留个临时目录, 不该盖住比对结论。
  try {
    rmSync(profile, { recursive: true, force: true })
  } catch (err) {
    console.log(`提示: 临时 profile ${profile} 未能删除 (${err.code}), 可稍后手工清理`)
  }

  if (diffs.length === 0) {
    console.log(`DOM 逐路由比对通过: ${checked} 条路由, 渲染结果与改造前逐字符相同`)
    return
  }
  console.log(`DOM 比对发现 ${diffs.length} / ${checked} 条路由有差异:`)
  for (const d of diffs) {
    console.log(`\n--- ${d.route} (首处差异 @${d.at}) ---`)
    console.log(`  现在: ...${d.current}...`)
    console.log(`  基线: ...${d.baseline}...`)
  }
  process.exitCode = 1
}

main()
