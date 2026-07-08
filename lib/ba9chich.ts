/* eslint-disable @typescript-eslint/no-require-imports */
// Use node:https directly — Next.js patched fetch blocks external calls
import * as https from 'node:https'
import type { IncomingMessage } from 'node:http'

const HOST = 'store.ba9chich.com'

interface RawRes { status: number; headers: Record<string, string | string[]>; body: string }

function rawRequest(method: string, path: string, body: string | null, extraHeaders: Record<string, string>, cookies: string): Promise<RawRes> {
  return new Promise((resolve, reject) => {
    const headers: Record<string, string | number> = {
      'Accept': 'text/html,application/json,*/*',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Referer': `https://${HOST}/`,
      ...extraHeaders,
    }
    if (cookies) headers['Cookie'] = cookies
    const buf = body ? Buffer.from(body) : null
    if (buf) headers['Content-Length'] = buf.length

    const opts = { hostname: HOST, path, method, headers, rejectUnauthorized: false }

    const req = https.request(opts, (res: IncomingMessage) => {
      let data = ''
      res.on('data', (c: Buffer) => { data += c.toString() })
      res.on('end', () => resolve({
        status: res.statusCode ?? 0,
        headers: res.headers as Record<string, string | string[]>,
        body: data,
      }))
    })
    req.on('error', reject)
    if (buf) req.write(buf)
    req.end()
  })
}

function get(path: string, cookies: string) {
  return rawRequest('GET', path, null, {}, cookies)
}

function postForm(path: string, body: string, cookies: string) {
  return rawRequest('POST', path, body, {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Origin': `https://${HOST}`,
  }, cookies)
}

function parseCookies(headers: Record<string, string | string[]>): string {
  const sc = headers['set-cookie']
  if (!sc) return ''
  const arr = Array.isArray(sc) ? sc : [sc]
  return arr.map((c: string) => c.split(';')[0].trim()).join('; ')
}

function mergeCookies(a: string, b: string): string {
  const m: Record<string, string> = {}
  ;`${a}; ${b}`.split('; ').filter(Boolean).forEach(c => {
    const k = c.split('=')[0].trim()
    if (k) m[k] = c.trim()
  })
  return Object.values(m).join('; ')
}

export async function generateFlouciUrl(params: {
  productId: number
  firstName: string
  lastName: string
  email: string
  phone: string
}): Promise<string> {
  const { productId, firstName, lastName, email, phone } = params
  let cookies = ''

  /* 1 — Classic add-to-cart URL, no nonce */
  console.log('[ba9chich] step 1: add-to-cart')
  const r1 = await get(`/?add-to-cart=${productId}&quantity=1`, '')
  cookies = parseCookies(r1.headers)
  console.log('[ba9chich] step 1:', r1.status, cookies.slice(0, 80))

  // Follow redirects
  let loc = (r1.headers['location'] as string) || ''
  for (let i = 0; i < 3 && loc; i++) {
    const p = loc.startsWith('http') ? new URL(loc).pathname + new URL(loc).search : loc
    const rr = await get(p, cookies)
    cookies = mergeCookies(cookies, parseCookies(rr.headers))
    loc = (rr.headers['location'] as string) || ''
    console.log('[ba9chich] redirect', i + 1, p, rr.status)
  }

  /* 2 — Load /checkout/ to get process-checkout nonce */
  console.log('[ba9chich] step 2: checkout page')
  const r2 = await get('/checkout/', cookies)
  cookies = mergeCookies(cookies, parseCookies(r2.headers))
  const html = r2.body

  const nonce =
    (html.match(/name="woocommerce-process-checkout-nonce"\s+value="([^"]+)"/i) || [])[1] ||
    (html.match(/id="woocommerce-process-checkout-nonce"[^>]+value="([^"]+)"/i) || [])[1] ||
    (html.match(/"woocommerce-process-checkout-nonce","([^"]+)"/i) || [])[1] || ''

  const payment =
    (html.match(/value="(wc_flouci_gateway|flouci[^"]*)"/) || [])[1] || 'wc_flouci_gateway'

  console.log('[ba9chich] step 2:', r2.status, 'nonce:', nonce, 'payment:', payment)

  /* 3 — POST wc-ajax=checkout */
  console.log('[ba9chich] step 3: posting checkout')
  const formData = [
    ['billing_first_name', firstName], ['billing_last_name', lastName],
    ['billing_email', email], ['billing_phone', phone],
    ['billing_address_1', 'Tunis'], ['billing_address_2', ''],
    ['billing_city', 'Tunis'], ['billing_state', ''],
    ['billing_postcode', '1000'], ['billing_country', 'TN'],
    ['billing_company', ''], ['ship_to_different_address', '0'],
    ['order_comments', ''], ['payment_method', payment],
    ['woocommerce-process-checkout-nonce', nonce],
    ['_wp_http_referer', '/checkout/'], ['terms', 'on'],
  ]
  const body = formData.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&')

  const r3 = await postForm('/?wc-ajax=checkout', body, cookies)
  console.log('[ba9chich] step 3:', r3.status, r3.body.slice(0, 200))

  let json: { result?: string; redirect?: string } = {}
  try { json = JSON.parse(r3.body) } catch { /* not JSON */ }

  if (json.result === 'success' && json.redirect?.includes('flouci')) {
    console.log('[ba9chich] SUCCESS:', json.redirect)
    return json.redirect
  }

  throw new Error(`Checkout failed (${r3.status}): ${r3.body.slice(0, 300)}`)
}
