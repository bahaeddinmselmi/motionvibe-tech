'use client'

import { useState, useRef, useEffect } from 'react'
import type { Product, ProductSection } from '@/lib/types'
import {
  Check, ChevronDown, ArrowRight, Loader2,
  Star, Shield, Download, Clock, Play, ChevronLeft, ChevronRight
} from 'lucide-react'

/* ── palette ── */
const OR   = '#E05C00'   // burnt orange — main accent
const DARK = '#111111'
const MID  = '#555555'
const LITE = '#888888'
const SAND = '#F5F2EC'   // section alternating bg
const BDR  = '#E0DDD8'   // border

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || ''

const TRANSLATIONS = {
  en: {
    title: 'Digital Store',
    moralStories: 'Moral Stories',
    aboutProduct: 'About this product',
    whatIsThis: 'What is this?',
    seeItInAction: 'See it in action',
    everythingYouGet: 'Everything you get',
    whatCustomersSay: 'What customers say',
    faq: 'Frequently Asked Questions',
    emailAccess: 'Access will be sent to your email',
    emailPlaceholder: 'Email Address',
    firstNamePlaceholder: 'First name',
    lastNamePlaceholder: 'Last name',
    phonePlaceholder: '+216 · Phone number',
    instantDownload: 'Instant digital download',
    subTotal: 'Sub Total',
    megaUpgrade: 'Mega Bundle Upgrade',
    total: 'Total',
    yesWantThis: 'Yes, I Want This! 🎉',
    buyNow: 'Buy Now',
    processing: 'Processing…',
    securedBy: 'Secured by Flouci · Tunisia',
    specialOffer: '🔥 Special Upgrade Offer',
    megaBundleTitle: 'Mega Viral Reel Bundle',
    megaBundleTagline: '15,000+ Reels · 9 Bundles included',
    add: 'ADD',
    added: '✓ Added',
    downloadNotice: 'Instant download link sent by email',
    secureNotice: 'Secure payment via Flouci',
    noSubscription: 'Lifetime access — no subscription',
    checkoutButton: 'Go to Checkout',
    refundPolicy: 'Refund policy',
    privacyPolicy: 'Privacy policy',
    termsAndConditions: 'Terms and conditions',
    orderReceived: 'Order Received!',
    redirecting: 'Redirecting to Flouci payment in',
    payWithFlouci: 'Pay with Flouci',
    cancel: 'Cancel',
    processingOrder: 'Processing Order...',
    creatingLink: 'We are creating your secure checkout link. Please do not close or refresh this page.',
    limitedOffer: 'Limited offer',
    selectLanguage: 'Choose your language / اختر لغتك',
    welcome: 'Welcome to Digital Store',
  },
  ar: {
    title: 'المتجر الرقمي',
    moralStories: 'قصص وعبر',
    aboutProduct: 'حول هذا المنتج',
    whatIsThis: 'شنية هذا؟',
    seeItInAction: 'شوفو يخدم قدامك',
    everythingYouGet: 'كل شي باش تتحصل عليه',
    whatCustomersSay: 'آراء الحرفاء متاعنا',
    faq: 'الأسئلة الشائعة',
    emailAccess: 'الرابط باش يوصلك مباشرة على إيميلك',
    emailPlaceholder: 'عنوان البريد الإلكتروني',
    firstNamePlaceholder: 'الاسم الأول',
    lastNamePlaceholder: 'اللقب',
    phonePlaceholder: 'رقم الهاتف · 216+',
    instantDownload: 'تحميل رقمي فوري',
    subTotal: 'المجموع الفرعي',
    megaUpgrade: 'ترقية الباقة العملاقة',
    total: 'المجموع الإجمالي',
    yesWantThis: 'إي، نحب نشري هذا! 🎉',
    buyNow: 'اشري توة',
    processing: 'قاعد يحضر…',
    securedBy: 'دفع آمن عن طريق Flouci · تونس',
    specialOffer: '🔥 عرض خاص ولفترة محدودة',
    megaBundleTitle: 'الباقة العملاقة للفيديوهات الفيروسية',
    megaBundleTagline: 'أكثر من 15,000 فيديو · 9 باقات مدمجة',
    add: 'زيادة',
    added: '✓ تمّت الإضافة',
    downloadNotice: 'رابط التحميل يوصلك بالوقت على الإيميل',
    secureNotice: 'دفع آمن وموثوق عن طريق Flouci',
    noSubscription: 'شراء لمرة واحدة مدى الحياة — بدون اشتراك شهري',
    checkoutButton: 'تعدى للدفع',
    refundPolicy: 'سياسة الاسترجاع',
    privacyPolicy: 'سياسة الخصوصية',
    termsAndConditions: 'الشروط والأحكام',
    orderReceived: 'تم تلقي الطلب بنجاح!',
    redirecting: 'قاعدين نحولو فيك لصفحة الدفع Flouci في',
    payWithFlouci: 'ادفع بـ Flouci',
    cancel: 'إلغاء',
    processingOrder: 'قاعدين نحضرو في طلبك...',
    creatingLink: 'نصنعولك في رابط الدفع الآمن. يرجى عدم إغلاق أو تحديث الصفحة.',
    limitedOffer: 'عرض محدود',
    selectLanguage: 'اختر لغتك / Choose your language',
    welcome: 'مرحباً بك في المتجر الرقمي',
  }
}

function LanguageGate({ onSelect }: { onSelect: (lang: 'en' | 'ar') => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-white w-full max-w-sm p-8 text-center shadow-2xl rounded-3xl border border-[#E0DDD8] animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 mx-auto mb-4 bg-[#F5F2EC] rounded-2xl flex items-center justify-center text-3xl">
          🌍
        </div>
        <h2 className="text-xl font-black mb-1 text-[#111111]">
          اختر لغتك / Choose Language
        </h2>
        <p className="text-xs text-[#888888] mb-6">
          Tunisian Arabic or English / الدارجة التونسية أو الإنقليزية
        </p>
        <div className="space-y-3">
          <button
            onClick={() => onSelect('ar')}
            className="w-full font-bold text-base py-4 px-6 rounded-xl border-2 hover:border-[#E05C00] hover:bg-[#FFF7F2] transition text-[#111111]"
            style={{ borderColor: '#E0DDD8' }}
          >
            🇹🇳 الدارجة التونسية
          </button>
          <button
            onClick={() => onSelect('en')}
            className="w-full font-bold text-base py-4 px-6 rounded-xl border-2 hover:border-[#E05C00] hover:bg-[#FFF7F2] transition text-[#111111]"
            style={{ borderColor: '#E0DDD8' }}
          >
            🇬🇧 English
          </button>
        </div>
      </div>
    </div>
  )
}

function getAssetUrl(url: string | undefined | null) {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url
  if (url.startsWith('/')) {
    if (url.startsWith(BASE_PATH)) return url
    return `${BASE_PATH}${url}`
  }
  return `${BASE_PATH}/${url}`
}

/* ── RedirectOverlay ── */
function RedirectOverlay({ url, onCancel, t }: { url: string; onCancel: () => void; t: (key: any) => string }) {
  const [n, setN] = useState(5)
  useEffect(() => {
    if (n <= 0) { window.location.href = url; return }
    const timer = setTimeout(() => setN(c => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [n, url])
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-white w-full max-w-sm p-8 text-center shadow-2xl rounded-2xl">
        <div className="text-5xl font-bold mb-2" style={{ color: OR }}>✓</div>
        <div className="text-xl font-bold mt-2 mb-1" style={{ color: DARK }}>{t('orderReceived')}</div>
        <p className="text-sm mb-5" style={{ color: LITE }}>
          {t('redirecting')} <strong style={{ color: OR }}>{n}s</strong>…
        </p>
        <button onClick={() => { window.location.href = url }}
          className="w-full font-black text-sm uppercase tracking-wider py-3.5 text-white flex items-center justify-center gap-2 hover:brightness-110 transition mb-3"
          style={{ background: OR }}>
          <ArrowRight className="w-4 h-4" /> {t('payWithFlouci')}
        </button>
        <button onClick={onCancel} className="text-sm w-full py-1" style={{ color: LITE }}>← {t('cancel')}</button>
      </div>
    </div>
  )
}

/* ── LoadingOverlay ── */
function LoadingOverlay({ t }: { t: (key: any) => string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}>
      <div className="bg-white w-full max-w-sm p-8 text-center shadow-2xl rounded-2xl flex flex-col items-center">
        <Loader2 className="w-12 h-12 animate-spin mb-4" style={{ color: OR }} />
        <div className="text-xl font-bold mb-2" style={{ color: DARK }}>{t('processingOrder')}</div>
        <p className="text-sm px-4" style={{ color: LITE }}>
          {t('creatingLink')}
        </p>
      </div>
    </div>
  )
}

/* ── Upsell Modal ── */
const UPSELL_PRICE = 30
const UPSELL_BUNDLES = [
  'Mad Scientist Reels Bundle',
  'Hulk Reels Bundle',
  'Motion Reels Bundle',
  'Anime Reels Bundle',
  'Mr Beast Reels Bundle',
  'Movie Reels Bundle',
  'Ghibli Reels Bundle',
]
const UPSELL_BONUS = [
  'Motivational Reels Bundle',
  'Satisfying Reels Bundle',
]

function UpsellModal({ onAccept, onDecline, t }: { onAccept: () => void; onDecline: () => void; t: (key: any) => string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)' }}>
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl no-scrollbar"
        style={{ maxHeight: '92vh', overflowY: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>

        {/* Badge */}
        <div className="text-center pt-5 pb-2 px-5">
          <span className="inline-block text-[11px] font-black uppercase tracking-widest px-3 py-1 text-white rounded-full"
            style={{ background: OR }}>⚡ {t('limitedOffer')}</span>
        </div>

        {/* Image */}
        <div className="mx-4 rounded-2xl overflow-hidden" style={{ border: `2px solid ${BDR}` }}>
          <img src={`${BASE_PATH}/mega-bundle.jpg`} alt="Mega Viral Reel Bundle" className="w-full object-cover" />
        </div>

        {/* Title */}
        <div className="px-5 pt-4 pb-2 text-center">
          <h3 style={{ fontSize: 20, fontWeight: 900, color: DARK, lineHeight: 1.25 }}>
            {t('megaBundleTitle')}
          </h3>
          <p className="text-sm mt-1 font-semibold" style={{ color: OR }}>{t('megaBundleTagline')}</p>
        </div>

        {/* Bundles */}
        <div className="px-5 pb-3">
          <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: LITE }}>🚀 {t('everythingYouGet')}</p>
          <div className="space-y-1.5">
            {UPSELL_BUNDLES.map((b, i) => (
              <div key={i} className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: OR }} />
                <span className="text-sm font-medium" style={{ color: DARK }}>{b}</span>
              </div>
            ))}
          </div>
          <p className="text-xs font-bold uppercase tracking-wider mt-3 mb-2" style={{ color: LITE }}>🎁 {t('specialOffer')}</p>
          <div className="space-y-1.5">
            {UPSELL_BONUS.map((b, i) => (
              <div key={i} className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#10B981' }} />
                <span className="text-sm font-medium" style={{ color: DARK }}>{b}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Price + CTA */}
        <div className="px-5 pb-6 pt-2" style={{ borderTop: `2px dashed ${BDR}` }}>
          <div className="flex items-center justify-between mb-3 pt-3">
            <span className="text-sm font-semibold" style={{ color: MID }}>{t('subTotal')}</span>
            <span className="text-2xl font-black" style={{ color: OR }}>+{UPSELL_PRICE} TND</span>
          </div>
          <button onClick={onAccept}
            className="w-full font-black text-sm uppercase tracking-wider py-4 text-white flex items-center justify-center gap-2 hover:brightness-110 transition rounded-xl mb-2"
            style={{ background: OR }}>
            <ArrowRight className="w-4 h-4" /> {t('yesWantThis')} — +{UPSELL_PRICE} TND
          </button>
          <button onClick={onDecline}
            className="w-full text-xs py-2 hover:underline transition"
            style={{ color: LITE }}>
            {t('cancel')}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Checkout Sidebar ── */
function CheckoutSidebar({
  product,
  lang,
  t,
  upsellAdded,
  setUpsellAdded
}: {
  product: Product
  lang: 'en' | 'ar'
  t: (key: any) => string
  upsellAdded: boolean
  setUpsellAdded: (val: boolean) => void
}) {
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', phone: '' })
  const [wantThis, setWantThis] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [flounciUrl, setFlounciUrl] = useState<string | null>(null)
  const [showUpsell, setShowUpsell] = useState(false)

  const total = product.price + (upsellAdded ? UPSELL_PRICE : 0)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!wantThis) {
      setError(lang === 'ar' ? 'يرجى تأكيد رغبتك في شراء المنتج.' : 'Please confirm you want this product.')
      return
    }
    if (!form.first_name || !form.last_name || !form.email || !form.phone) {
      setError(lang === 'ar' ? 'جميع الحقول مطلوبة.' : 'All fields are required.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`${BASE_PATH}/api/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: product.slug, ...form, upsell: upsellAdded }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || (lang === 'ar' ? 'حدث خطأ ما، يرجى المحاولة لاحقاً.' : 'Something went wrong'))
      setFlounciUrl(data.flounciUrl)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : (lang === 'ar' ? 'يرجى المحاولة مجدداً.' : 'Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  if (flounciUrl) return <RedirectOverlay url={flounciUrl} onCancel={() => setFlounciUrl(null)} t={t} />

  const inp = "w-full text-sm bg-white border outline-none px-3.5 py-3 rounded-xl transition-colors focus:border-[#E05C00] placeholder-[#BBBBBB]"

  return (
    <>
      {loading && <LoadingOverlay t={t} />}
      {showUpsell && (
        <UpsellModal
          onAccept={() => { setUpsellAdded(true); setShowUpsell(false) }}
          onDecline={() => setShowUpsell(false)}
          t={t}
        />
      )}
      <form onSubmit={submit}
        className="bg-white rounded-2xl overflow-hidden"
        style={{ border: `2px dashed ${BDR}` }}>

      {/* Product hero image */}
      {product.hero_image && (
        <div className="relative overflow-hidden" style={{ borderBottom: `2px dashed ${BDR}` }}>
          <img
            src={getAssetUrl(product.hero_image)}
            alt={product.title}
            className="w-full object-cover"
            style={{ maxHeight: 220 }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        </div>
      )}

      {/* Card header */}
      <div className="px-5 py-4" style={{ borderBottom: `2px dashed ${BDR}`, background: SAND }}>
        <p className="text-xs font-semibold tracking-wider uppercase" style={{ color: MID }}>
          {t('emailAccess')}
        </p>
      </div>

      {/* Inputs */}
      <div className="px-5 py-5 space-y-3">
        {error && (
          <div className="text-xs px-3 py-2.5 border rounded-xl font-medium"
            style={{ borderColor: '#FCA5A5', background: '#FEF2F2', color: '#B91C1C' }}>
            {error}
          </div>
        )}

        <input type="email" placeholder={t('emailPlaceholder')} required
          style={{ borderColor: BDR }} className={inp}
          value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />

        <div className="grid grid-cols-2 gap-2.5">
          <input placeholder={t('firstNamePlaceholder')} required
            style={{ borderColor: BDR }} className={inp}
            value={form.first_name} onChange={e => setForm(p => ({ ...p, first_name: e.target.value }))} />
          <input placeholder={t('lastNamePlaceholder')} required
            style={{ borderColor: BDR }} className={inp}
            value={form.last_name} onChange={e => setForm(p => ({ ...p, last_name: e.target.value }))} />
        </div>
        <input placeholder={t('phonePlaceholder')} required
          style={{ borderColor: BDR }} className={inp}
          value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
      </div>

      {/* Product card summary */}
      <div className="mx-5 mb-4 p-3 flex items-start gap-3 rounded-xl"
        style={{ background: SAND, border: `1px dashed ${BDR}` }}>
        {product.hero_image
          ? <img src={getAssetUrl(product.hero_image)} alt="" className="w-14 h-14 object-cover flex-shrink-0 rounded-lg" style={{ border: `1px solid ${BDR}` }} />
          : <div className="w-14 h-14 flex-shrink-0 flex items-center justify-center text-[9px] font-black text-white uppercase rounded-lg"
              style={{ background: OR }}>BUNDLE</div>
        }
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold leading-snug" style={{ color: DARK }}>{product.title}</div>
          <div className="text-[10px] mt-0.5" style={{ color: LITE }}>{t('instantDownload')}</div>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-sm font-black" style={{ color: OR }}>{product.price} TND</span>
            {product.original_price && (
              <span className="text-xs line-through" style={{ color: '#BBBBBB' }}>{product.original_price} TND</span>
            )}
          </div>
        </div>
      </div>

      {/* ── Upsell Order Bump ── */}
      <div className="mx-5 mb-4 rounded-2xl overflow-hidden"
        style={{ border: upsellAdded ? `2px solid ${OR}` : `2px dashed ${BDR}`, background: upsellAdded ? '#FFF7F2' : '#fff' }}>
        <div className="px-4 py-3" style={{ borderBottom: `1px dashed ${BDR}`, background: upsellAdded ? '#FFF0E6' : SAND }}>
          <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: OR }}>{t('specialOffer')}</span>
        </div>
        <div className="p-3 flex items-center gap-3">
          <div className="flex items-center gap-3 cursor-pointer flex-1 min-w-0" onClick={() => setShowUpsell(true)}>
            <img src={`${BASE_PATH}/mega-bundle.jpg`} alt="Mega Bundle" className="w-14 h-14 object-cover flex-shrink-0 rounded-xl" style={{ border: `1px solid ${BDR}` }} />
            <div className="min-w-0">
              <div className="text-xs font-bold leading-tight" style={{ color: DARK }}>{t('megaBundleTitle')}</div>
              <div className="text-[10px] mt-0.5" style={{ color: LITE }}>{t('megaBundleTagline')}</div>
              <div className="text-sm font-black mt-1" style={{ color: OR }}>+{UPSELL_PRICE} TND</div>
            </div>
          </div>
          {upsellAdded ? (
            <button type="button" onClick={() => setUpsellAdded(false)}
              className="flex-shrink-0 text-[10px] font-bold px-2.5 py-1.5 rounded-lg border transition"
              style={{ borderColor: OR, color: OR, background: '#FFF7F2' }}>{t('added')}</button>
          ) : (
            <button type="button" onClick={() => setUpsellAdded(true)}
              className="flex-shrink-0 text-[10px] font-black uppercase px-3 py-1.5 text-white rounded-lg hover:brightness-110 transition"
              style={{ background: OR }}>{t('add')}</button>
          )}
        </div>
      </div>

      {/* Totals */}
      <div className="px-5 pb-4 space-y-2" style={{ borderTop: `2px dashed ${BDR}`, paddingTop: 16 }}>
        <div className="flex justify-between text-sm">
          <span style={{ color: LITE }}>{t('subTotal')}</span>
          <span className="font-semibold" style={{ color: DARK }}>{product.price} TND</span>
        </div>
        {upsellAdded && (
          <div className="flex justify-between text-sm">
            <span style={{ color: LITE }}>{t('megaUpgrade')}</span>
            <span className="font-semibold" style={{ color: OR }}>+{UPSELL_PRICE} TND</span>
          </div>
        )}
        <div className="flex justify-between text-base font-black">
          <span style={{ color: DARK }}>{t('total')}</span>
          <span style={{ color: OR }}>{total} TND</span>
        </div>
      </div>

      {/* "Yes, I Want This!" checkbox */}
      <div className="px-5 pb-4">
        <label
          className="flex items-start gap-3 cursor-pointer group"
          onClick={() => setWantThis(v => !v)}
        >
          <div
            className="flex-shrink-0 mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-all"
            style={{
              borderColor: wantThis ? OR : BDR,
              background: wantThis ? OR : '#fff',
            }}
          >
            {wantThis && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
          </div>
          <span className="text-sm font-semibold leading-tight" style={{ color: wantThis ? OR : MID }}>
            {t('yesWantThis')}
          </span>
        </label>
      </div>

      {/* CTA */}
      <div className="px-5 pb-5" style={{ borderTop: `2px dashed ${BDR}`, paddingTop: 16 }}>
        <button type="submit" disabled={loading}
          className="w-full font-black text-sm uppercase tracking-wider py-4 text-white flex items-center justify-center gap-2.5 hover:brightness-110 transition disabled:opacity-60 rounded-xl"
          style={{ background: loading ? '#9A3E00' : OR }}>
          {loading
            ? <><Loader2 className="w-4 h-4 animate-spin" /> {t('processing')}</>
            : <><ArrowRight className="w-4 h-4" /> {t('buyNow')} — {total} TND</>}
        </button>
        <div className="flex items-center justify-center gap-1.5 mt-3">
          <Shield className="w-3.5 h-3.5" style={{ color: LITE }} />
          <span className="text-[11px]" style={{ color: LITE }}>{t('securedBy')}</span>
        </div>
      </div>
    </form>
    </>
  )
}

/* ── FAQ ── */
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: `1px solid ${BDR}` }}>
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between py-4 text-left font-semibold text-sm gap-4 transition hover:opacity-70"
        style={{ color: DARK }}>
        {q}
        <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          style={{ color: open ? OR : LITE }} />
      </button>
      {open && <p className="pb-4 text-sm leading-relaxed pr-6" style={{ color: MID }}>{a}</p>}
    </div>
  )
}

/* ── BulletList ── */
function BulletList({ items, icon: Icon = Check, color = OR }: {
  items: string[]
  icon?: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  color?: string
}) {
  return (
    <ul className="mt-5 space-y-3">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3">
          <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color }} />
          <span className="text-base leading-snug" style={{ color: MID }}>{item}</span>
        </li>
      ))}
    </ul>
  )
}

/* ── YouTube ID extractor ── */
function getYoutubeId(url: string) {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/)
  return m ? m[1] : null
}

/* ── Image Carousel ── */
function ImageCarousel({ images }: { images: { url: string; caption?: string }[] }) {
  const [idx, setIdx] = useState(0)
  if (!images.length) return null
  return (
    <div className="relative rounded-2xl overflow-hidden" style={{ border: `1px solid ${BDR}` }}>
      <img src={getAssetUrl(images[idx].url)} alt={images[idx].caption || ''} className="w-full object-cover aspect-video" />
      {images[idx].caption && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-sm px-4 py-2">
          {images[idx].caption}
        </div>
      )}
      {images.length > 1 && (
        <>
          <button onClick={() => setIdx(i => (i - 1 + images.length) % images.length)}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow transition">
            <ChevronLeft className="w-4 h-4" style={{ color: DARK }} />
          </button>
          <button onClick={() => setIdx(i => (i + 1) % images.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow transition">
            <ChevronRight className="w-4 h-4" style={{ color: DARK }} />
          </button>
          <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-1.5">
            {images.map((_, i) => (
              <button key={i} onClick={() => setIdx(i)}
                className="w-2 h-2 rounded-full transition"
                style={{ background: i === idx ? OR : 'rgba(255,255,255,0.5)' }} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

/* ── Dynamic Section Renderer ── */
function SectionRenderer({ section }: { section: ProductSection }) {
  return (
    <Sec>
      {section.type === 'youtube' && (
        <>
          {section.title && <H2>{section.title}</H2>}
          <div className="mt-5 space-y-4">
            {section.videos.filter(v => v.url).map((v, i) => {
              const id = getYoutubeId(v.url)
              if (!id) return null
              return (
                <div key={i}>
                  <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${BDR}` }}>
                    <iframe
                      src={`https://www.youtube.com/embed/${id}`}
                      className="w-full aspect-video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  {v.caption && <p className="text-sm mt-2 text-center" style={{ color: MID }}>{v.caption}</p>}
                </div>
              )
            })}
          </div>
        </>
      )}

      {section.type === 'images' && (
        <>
          {section.title && <H2>{section.title}</H2>}
          <div className="mt-5 grid grid-cols-2 gap-3">
            {section.images.filter(img => img.url).map((img, i) => (
              <div key={i} className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${BDR}` }}>
                <img src={getAssetUrl(img.url)} alt={img.caption || ''} className="w-full object-cover aspect-video" />
                {img.caption && (
                  <div className="px-3 py-2 text-xs" style={{ color: MID }}>{img.caption}</div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {section.type === 'carousel' && (
        <>
          {section.title && <H2>{section.title}</H2>}
          <div className="mt-5">
            <ImageCarousel images={section.images.filter(img => img.url)} />
          </div>
        </>
      )}

      {section.type === 'text' && (
        <>
          {section.title && <H2>{section.title}</H2>}
          <p className="mt-4 text-base leading-relaxed" style={{ color: MID }}>{section.content}</p>
        </>
      )}

      {section.type === 'bullets' && (
        <>
          {section.title && <H2>{section.title}</H2>}
          <BulletList items={section.items.filter(Boolean)} />
        </>
      )}
    </Sec>
  )
}

/* ── Section wrapper ── */
function Sec({ children, alt }: { children: React.ReactNode; alt?: boolean }) {
  return (
    <div className="rounded-2xl overflow-hidden shadow-sm" style={{
      background: alt ? SAND : '#fff',
      border: `1px solid ${BDR}`,
    }}>
      <div className="px-6 py-8">
        {children}
      </div>
    </div>
  )
}

/* ── Display title ── */
function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.3, color: DARK }}>
      {children}
    </h2>
  )
}

function EyeBrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 mb-3">
      <div className="h-[2px] w-7" style={{ background: OR }} />
      <span className="text-xs font-bold tracking-[0.2em] uppercase" style={{ color: OR }}>{children}</span>
    </div>
  )
}

export default function LandingPageClient({
  initialProduct,
  slug,
  searchParams
}: {
  initialProduct: Product | null
  slug: string
  searchParams: Record<string, string | string[] | undefined>
}) {
  const product = initialProduct
  const formMobileRef = useRef<HTMLDivElement>(null)

  const paid = searchParams?.payment === 'success'

  const [lang, setLang] = useState<'en' | 'ar' | null>(null)
  const [upsellAdded, setUpsellAdded] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('mv_lang') as 'en' | 'ar' | null
    if (saved) {
      setLang(saved)
    }
  }, [])

  const handleSelectLang = (l: 'en' | 'ar') => {
    localStorage.setItem('mv_lang', l)
    setLang(l)
  }

  if (!product) return (
    <div className="min-h-screen flex items-center justify-center text-sm tracking-widest uppercase bg-white" style={{ color: LITE }}>
      Product not found
    </div>
  )

  if (!lang) {
    return <LanguageGate onSelect={handleSelectLang} />
  }

  const t = (key: keyof typeof TRANSLATIONS.en) => {
    return TRANSLATIONS[lang][key]
  }

  const discount = product.original_price
    ? Math.round(100 - (product.price / product.original_price) * 100)
    : 0

  const total = product.price + (upsellAdded ? UPSELL_PRICE : 0)

  return (
    <div className="min-h-screen bg-white pb-16 lg:pb-0" dir={lang === 'ar' ? 'rtl' : 'ltr'} style={{ fontFamily: 'var(--font-dm), sans-serif', color: DARK }}>
      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      ` }} />

      {/* ── TOPBAR ── */}
      <div className="px-5 lg:px-10 py-3 flex items-center justify-between"
        style={{ borderBottom: `1px solid ${BDR}`, background: SAND }}>
        <span className="text-xs font-bold tracking-[0.2em] uppercase" style={{ color: LITE }}>{t('title')}</span>
        {discount > 0 && (
          <span className="text-xs font-black uppercase tracking-wider px-3 py-1 text-white"
            style={{ background: OR }}>
            {discount}% {t('limitedOffer')}
          </span>
        )}
      </div>

      {/* ── TITLE BAR ── */}
      <div className="px-5 lg:px-10 py-5" style={{ borderBottom: `1px solid ${BDR}` }}>
        <h1 style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 700, lineHeight: 1.25, color: DARK }}>
          {product.title}
        </h1>
        {product.subtitle && (
          <p className="mt-1.5 text-base" style={{ color: MID, maxWidth: 640 }}>{product.subtitle}</p>
        )}
      </div>

      {/* ── TWO-COLUMN ── */}
      <div className="flex gap-5 items-start max-w-7xl mx-auto px-4 lg:px-6 py-6">

        {/* ══ LEFT COLUMN ══ */}
        <div className="w-full lg:w-[70%] min-w-0 flex flex-col gap-4">

          {/* Hero image */}
          {product.hero_image ? (
            <div className="rounded-2xl overflow-hidden shadow-sm" style={{ border: `1px solid ${BDR}` }}>
              <img src={getAssetUrl(product.hero_image)} alt={product.title} className="w-full object-cover" />
            </div>
          ) : (
            <div className="rounded-2xl overflow-hidden aspect-video flex items-center justify-center shadow-sm"
              style={{ background: SAND, border: `1px solid ${BDR}` }}>
              <div style={{ fontFamily: 'var(--font-inter)', fontSize: 'clamp(72px,14vw,160px)', color: OR, opacity: 0.12, lineHeight: 1 }}>
                2000+
              </div>
            </div>
          )}

          {/* Mobile Anchor CTA */}
          <div className="lg:hidden mt-1">
            <button
              onClick={() => formMobileRef.current?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full font-black text-sm uppercase tracking-wider py-4 text-white flex items-center justify-center gap-2 hover:brightness-110 transition rounded-xl shadow-md"
              style={{ background: OR }}
            >
              <ArrowRight className="w-4 h-4" /> {t('checkoutButton')}
            </button>
          </div>

          {/* About */}
          <Sec>
            <H2>{t('whatIsThis')}</H2>
            {product.description ? (
              <div
                className="mt-4 text-base leading-relaxed prose max-w-none"
                style={{ color: MID }}
                dangerouslySetInnerHTML={{ __html: product.description.replace(/\n/g, '<br/>') }}
              />
            ) : (
              <p className="mt-4 text-base leading-relaxed" style={{ color: MID }}>{product.subtitle}</p>
            )}
          </Sec>

          {/* Previews */}
          {product.preview_images.length > 0 && (
            <Sec alt>
              <H2>{t('seeItInAction')}</H2>
              <div className="mt-5 grid grid-cols-1 gap-3">
                {product.preview_images.map((img, i) => (
                  <div key={i} className="relative group overflow-hidden" style={{ border: `1px solid ${BDR}` }}>
                    <img src={getAssetUrl(img.url)} alt={img.caption || ''} className="w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    {img.caption && (
                      <div className="px-4 py-2 text-sm font-medium" style={{ background: '#fff', color: MID }}>
                        {img.caption}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Sec>
          )}

          {/* What's included */}
          {product.features.length > 0 && (
            <Sec>
              <H2>{t('everythingYouGet')}</H2>
              <BulletList items={product.features} />
            </Sec>
          )}

          {/* Dynamic sections */}
          {product.sections.map((sec, i) => <SectionRenderer key={i} section={sec} />)}

          {/* Testimonials */}
          {product.testimonials.length > 0 && (
            <Sec>
              <H2>{t('whatCustomersSay')}</H2>
              <div className="mt-5 grid sm:grid-cols-2 gap-4">
                {product.testimonials.map((testi, idx) => (
                  <div key={idx} className="p-5" style={{ border: `1px solid ${BDR}`, background: SAND }}>
                    <div className="flex gap-0.5 mb-3">
                      {[...Array(testi.rating)].map((_, j) => (
                        <Star key={j} className="w-4 h-4 fill-current" style={{ color: '#F59E0B' }} />
                      ))}
                    </div>
                    <p className="text-base leading-relaxed mb-4 italic" style={{ color: MID }}>
                      &ldquo;{testi.text}&rdquo;
                    </p>
                    <div className="flex items-center gap-2.5">
                      {testi.avatar
                        ? <img src={getAssetUrl(testi.avatar)} alt={testi.name} className="w-8 h-8 object-cover" style={{ border: `1px solid ${BDR}` }} />
                        : <div className="w-8 h-8 flex items-center justify-center text-xs font-black text-white"
                            style={{ background: OR }}>{testi.name[0]}</div>
                      }
                      <div>
                        <div className="text-sm font-bold" style={{ color: DARK }}>{testi.name}</div>
                        <div className="text-[11px]" style={{ color: LITE }}>{lang === 'ar' ? 'حريف مؤكد' : 'Verified customer'}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Sec>
          )}

          {/* FAQ */}
          {product.faqs.length > 0 && (
            <Sec alt>
              <H2>{t('faq')}</H2>
              <div className="mt-5" style={{ borderTop: `1px solid ${BDR}` }}>
                {product.faqs.map((f, idx) => <FAQItem key={idx} q={f.question} a={f.answer} />)}
              </div>
            </Sec>
          )}

          {/* Mobile Checkout Form */}
          <div ref={formMobileRef} className="lg:hidden mt-6">
            <CheckoutSidebar product={product} lang={lang} t={t} upsellAdded={upsellAdded} setUpsellAdded={setUpsellAdded} />
          </div>

          {/* Footer links */}
          <div className="py-4 flex flex-wrap gap-5">
            {['refundPolicy', 'privacyPolicy', 'termsAndConditions'].map((key) => (
              <button key={key} className="text-sm hover:underline transition" style={{ color: LITE }}>
                {t(key as any)}
              </button>
            ))}
          </div>
        </div>

        {/* ══ RIGHT COLUMN — sticky checkout ══ */}
        <div className="hidden lg:block lg:w-[30%] flex-shrink-0 sticky top-0 self-start no-scrollbar"
          style={{
            maxHeight: '100vh',
            overflowY: 'auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            background: '#fff'
          }}>
          <div className="p-5">
            <CheckoutSidebar product={product} lang={lang} t={t} upsellAdded={upsellAdded} setUpsellAdded={setUpsellAdded} />
            {/* Trust list */}
            <div className="mt-4 space-y-2.5">
              {[
                { Icon: Download, text: t('downloadNotice') },
                { Icon: Shield, text: t('secureNotice') },
                { Icon: Clock, text: t('noSubscription') },
              ].map(({ Icon, text }, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: OR }} />
                  <span className="text-xs" style={{ color: LITE }}>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══ MOBILE sticky buy bar ══ */}
      {!paid && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 shadow-lg"
          style={{ background: '#fff', borderTop: `1px solid ${BDR}` }}>
          <div>
            <div className="text-[10px] uppercase tracking-wider" style={{ color: LITE }}>{t('total')}</div>
            <div className="font-black text-xl" style={{ fontFamily: 'var(--font-inter)', color: OR, lineHeight: 1, fontSize: 26 }}>
              {total} TND
            </div>
          </div>
          <button
            onClick={() => formMobileRef.current?.scrollIntoView({ behavior: 'smooth' })}
            className="font-black text-xs uppercase tracking-wider px-6 py-3 text-white flex items-center gap-2 hover:brightness-110 transition rounded-xl"
            style={{ background: OR }}>
            <ArrowRight className="w-3.5 h-3.5" /> {t('checkoutButton')}
          </button>
        </div>
      )}
    </div>
  )
}
