// Flouci Payment API — uses YOUR merchant account
// Register at: https://app.flouci.com/

const API = 'https://developers.flouci.com/api'

export async function createPaymentLink(params: {
  amount: number        // in TND
  orderId: string       // our Supabase order UUID → returned in webhook
  successUrl: string    // where to send user after payment
  failUrl: string       // where to send user if cancelled
}) {
  const PUBLIC  = process.env.FLOUCI_PUBLIC_KEY
  const PRIVATE = process.env.FLOUCI_PRIVATE_KEY

  if (!PUBLIC || !PRIVATE) throw new Error('Flouci API keys not set in .env.local')

  const res = await fetch(`${API}/generate_payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      app_token:              PUBLIC,
      app_secret:             PRIVATE,
      amount:                 Math.round(params.amount * 1000), // millimes
      accept_card:            true,
      success_link:           params.successUrl,
      fail_link:              params.failUrl,
      session_timeout_secs:   1800,
      developer_tracking_id:  params.orderId,  // comes back in webhook
    }),
  })

  const data = await res.json() as {
    result?: { success: boolean; link: string; payment_id: string }
    message?: string
  }

  if (!data.result?.success) {
    throw new Error(`Flouci error: ${data.message ?? JSON.stringify(data)}`)
  }

  return {
    paymentUrl: data.result.link,        // https://checkout.flouci.com/YOURMERCHANT/xxx
    paymentId:  data.result.payment_id,  // store this to verify later
  }
}

export async function verifyPayment(paymentId: string): Promise<boolean> {
  const PUBLIC  = process.env.FLOUCI_PUBLIC_KEY
  const PRIVATE = process.env.FLOUCI_PRIVATE_KEY

  if (!PUBLIC || !PRIVATE) {
    console.warn('[flouci] No keys — cannot verify')
    return false
  }

  try {
    const res = await fetch(`${API}/verify/${paymentId}`, {
      headers: { 'apppublickey': PUBLIC, 'appsecretkey': PRIVATE },
    })
    const data = await res.json() as { result?: { status?: string } }
    return data?.result?.status === 'SUCCESS'
  } catch (e) {
    console.error('[flouci] verify error:', e)
    return false
  }
}
