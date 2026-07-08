import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

// Flouci calls this URL after payment is completed
// Set this URL in your Flouci dashboard: https://app.flouci.com
// URL: https://yourdomain.com/api/webhook/flouci

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try { body = await req.json() } catch { return NextResponse.json({ ok: false }, { status: 400 }) }

  const paymentId = (body.payment_id || body.id) as string
  const status    = (body.status || body.result) as string

  console.log('[webhook/flouci] received:', { paymentId, status, body })

  if (!paymentId) return NextResponse.json({ ok: false, error: 'No payment_id' }, { status: 400 })

  // Verify with Flouci API that payment is genuine
  const verified = await verifyWithFlouci(paymentId)
  if (!verified) {
    console.warn('[webhook/flouci] verification FAILED for', paymentId)
    return NextResponse.json({ ok: false, error: 'Verification failed' }, { status: 400 })
  }

  const db = createServiceClient()

  // Find the order by Flouci payment ID or by developer_tracking_id
  const trackingId = body.developer_tracking_id as string | undefined

  const query = db.from('orders').select('*')
  const { data: order } = trackingId
    ? await query.eq('id', trackingId).single()
    : await query.eq('flouci_url', `%${paymentId}%`).single()

  if (!order) {
    console.warn('[webhook/flouci] order not found for paymentId', paymentId)
    return NextResponse.json({ ok: false, error: 'Order not found' }, { status: 404 })
  }

  if (order.payment_status === 'confirmed') {
    return NextResponse.json({ ok: true, message: 'Already processed' })
  }

  // Mark as confirmed
  await db.from('orders').update({
    payment_status: 'confirmed',
    flouci_payment_id: paymentId,
  }).eq('id', order.id)

  console.log('[webhook/flouci] order', order.id, 'marked as CONFIRMED')

  // Send delivery email
  await sendDeliveryEmail(order)

  return NextResponse.json({ ok: true })
}

async function verifyWithFlouci(paymentId: string): Promise<boolean> {
  const PUBLIC  = process.env.FLOUCI_PUBLIC_KEY
  const PRIVATE = process.env.FLOUCI_PRIVATE_KEY

  // If no keys yet — skip verification in dev/testing
  if (!PUBLIC || !PRIVATE) {
    console.warn('[webhook/flouci] No Flouci keys — skipping verification (dev mode)')
    return true
  }

  try {
    const res = await fetch(`https://developers.flouci.com/api/verify/${paymentId}`, {
      headers: {
        'apppublickey': PUBLIC,
        'appsecretkey': PRIVATE,
      },
    })
    const data = await res.json() as { result?: { status?: string } }
    return data?.result?.status === 'SUCCESS'
  } catch (e) {
    console.error('[webhook/flouci] verify error:', e)
    return false
  }
}

async function sendDeliveryEmail(order: {
  id: string
  customer_email: string
  customer_name: string
  product_id: string
}) {
  const RESEND_KEY = process.env.RESEND_API_KEY
  if (!RESEND_KEY) {
    console.warn('[webhook/flouci] No RESEND_API_KEY — skipping email')
    return
  }

  // Load product delivery content
  const db = createServiceClient()
  const { data: product } = await db
    .from('products')
    .select('title, delivery_content')
    .eq('id', order.product_id)
    .single()

  if (!product) return

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'noreply@yourdomain.com',
        to: order.customer_email,
        subject: `Your download is ready — ${product.title}`,
        html: `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px">
            <h2 style="color:#111">Hi ${order.customer_name},</h2>
            <p>Your payment was confirmed. Here is your download:</p>
            <div style="background:#f5f5f5;border-radius:8px;padding:20px;margin:24px 0">
              ${product.delivery_content || '<p>Your download link will appear here.</p>'}
            </div>
            <p style="color:#888;font-size:13px">Order ID: ${order.id}</p>
          </div>
        `,
      }),
    })
    console.log('[webhook/flouci] delivery email sent to', order.customer_email)
  } catch (e) {
    console.error('[webhook/flouci] email error:', e)
  }
}
