'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Package, ShoppingCart, TrendingUp, LogOut, Plus, Eye } from 'lucide-react'
import type { Product, Order } from '@/lib/types'
import Link from 'next/link'

export default function AdminDashboard() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const db = createClient()
    Promise.all([
      db.from('products').select('*').order('created_at', { ascending: false }),
      db.from('orders').select('*').order('created_at', { ascending: false }).limit(20),
    ]).then(([p, o]) => {
      setProducts(p.data || [])
      setOrders(o.data || [])
      setLoading(false)
    })
  }, [])

  async function signOut() {
    const db = createClient()
    await db.auth.signOut()
    router.push('/admin/login')
  }

  const revenue = orders.filter(o => o.payment_status === 'confirmed').reduce((s, o) => s + (o.amount || 0), 0)

  if (loading) return (
    <div className="min-h-screen bg-[#050818] flex items-center justify-center text-slate-400">Loading…</div>
  )

  return (
    <div className="min-h-screen bg-[#050818] text-white">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="font-bold text-lg">Admin Dashboard</div>
        <div className="flex items-center gap-3">
          <Link href="/admin/products/new" className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition">
            <Plus className="w-3.5 h-3.5" /> New Product
          </Link>
          <button onClick={signOut} className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition">
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { icon: Package, label: 'Products', value: products.length, color: 'text-violet-400' },
            { icon: ShoppingCart, label: 'Total orders', value: orders.length, color: 'text-blue-400' },
            { icon: TrendingUp, label: 'Revenue (confirmed)', value: `${revenue.toFixed(2)} TND`, color: 'text-green-400' },
          ].map(s => (
            <div key={s.label} className="bg-[#0D1225] border border-white/10 rounded-xl p-5">
              <s.icon className={`w-5 h-5 ${s.color} mb-3`} />
              <div className="text-2xl font-bold mb-0.5">{s.value}</div>
              <div className="text-xs text-slate-500">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Products */}
          <div className="bg-[#0D1225] border border-white/10 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <h2 className="font-semibold text-sm">Products</h2>
              <Link href="/admin/products" className="text-xs text-violet-400 hover:underline">View all</Link>
            </div>
            <div className="divide-y divide-white/5">
              {products.length === 0 && <div className="px-5 py-6 text-sm text-slate-500 text-center">No products yet. <Link href="/admin/products/new" className="text-violet-400 hover:underline">Create one</Link></div>}
              {products.slice(0, 5).map(p => (
                <div key={p.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <div className="text-sm font-medium">{p.title}</div>
                    <div className="text-xs text-slate-500">{p.price} TND · /{p.slug}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${p.is_active ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'}`}>
                      {p.is_active ? 'Active' : 'Draft'}
                    </span>
                    <Link href={`/${p.slug}`} target="_blank"><Eye className="w-4 h-4 text-slate-500 hover:text-white transition" /></Link>
                    <Link href={`/admin/products/${p.id}`} className="text-xs text-slate-400 hover:text-white transition">Edit</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent orders */}
          <div className="bg-[#0D1225] border border-white/10 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <h2 className="font-semibold text-sm">Recent orders</h2>
              <Link href="/admin/orders" className="text-xs text-violet-400 hover:underline">View all</Link>
            </div>
            <div className="divide-y divide-white/5">
              {orders.length === 0 && <div className="px-5 py-6 text-sm text-slate-500 text-center">No orders yet.</div>}
              {orders.slice(0, 5).map(o => (
                <div key={o.id} className="px-5 py-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">{o.customer_name}</div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      o.payment_status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                      o.payment_status === 'redirected' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-slate-700 text-slate-400'
                    }`}>{o.payment_status}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">{o.customer_email} · {o.amount} TND</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
