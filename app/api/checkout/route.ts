import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { generateFlouciUrl } from '@/lib/ba9chich'
import { createServiceClient } from '@/lib/supabase/service'

const schema = z.object({
  slug:       z.string().min(1),
  first_name: z.string().min(1),
  last_name:  z.string().min(1),
  email:      z.string().email(),
  phone:      z.string().min(6),
})

function err(msg: string, status = 500) {
  console.error('[checkout]', msg)
  return NextResponse.json({ error: msg }, { status })
}

export async function POST(req: NextRequest) {
  let body: unknown
  try { body = await req.json() } catch { return err('Invalid JSON body', 400) }

  const parsed = schema.safeParse(body)
  if (!parsed.success) return err(parsed.error.issues[0].message, 400)

  const { slug, first_name, last_name, email, phone } = parsed.data
  const db = createServiceClient()

  // Load product
  const { data: product, error: productErr } = await db
    .from('products')
    .select('id, price, ba9chich_product_id, is_active')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (productErr || !product) return err('Product not found', 404)
  if (!product.ba9chich_product_id) return err('Product not configured — ba9chich ID missing', 500)

  // Create pending order
  const { data: order, error: orderErr } = await db
    .from('orders')
    .insert({
      product_id:     product.id,
      customer_name:  `${first_name} ${last_name}`,
      customer_email: email,
      customer_phone: phone,
      amount:         product.price,
      payment_status: 'pending',
    })
    .select('id')
    .single()

  if (orderErr || !order) {
    console.error('[checkout] order insert error:', orderErr)
    return err('Could not create order: ' + (orderErr?.message || 'unknown'))
  }

  // Automate ba9chich.com checkout → get Flouci URL
  try {
    const flounciUrl = await generateFlouciUrl({
      productId: product.ba9chich_product_id,
      firstName: first_name,
      lastName:  last_name,
      email,
      phone,
    })

    await db.from('orders').update({
      flouci_url:             flounciUrl,
      ba9chich_checkout_done: true,
      payment_status:         'redirected',
    }).eq('id', order.id)

    return NextResponse.json({ flounciUrl, orderId: order.id })

  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('[checkout] ba9chich automation failed:', msg)
    // Mark order as failed but still return the error clearly
    await db.from('orders').update({ payment_status: 'pending' }).eq('id', order.id)
    return err('Payment link generation failed: ' + msg)
  }
}
