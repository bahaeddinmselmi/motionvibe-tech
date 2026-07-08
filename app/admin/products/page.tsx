'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Product } from '@/lib/types'
import Link from 'next/link'
import { Plus, Eye, Pencil, ArrowLeft } from 'lucide-react'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    createClient().from('products').select('*').order('created_at', { ascending: false })
      .then(({ data }) => setProducts(data || []))
  }, [])

  async function toggleActive(id: string, current: boolean) {
    const db = createClient()
    await db.from('products').update({ is_active: !current }).eq('id', id)
    setProducts(ps => ps.map(p => p.id === id ? { ...p, is_active: !current } : p))
  }

  return (
    <div className="min-h-screen bg-[#050818] text-white">
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="text-slate-400 hover:text-white transition"><ArrowLeft className="w-4 h-4" /></Link>
          <span className="font-bold">Products</span>
        </div>
        <Link href="/admin/products/new" className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition">
          <Plus className="w-3.5 h-3.5" /> New Product
        </Link>
      </header>
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-[#0D1225] border border-white/10 rounded-xl overflow-hidden">
          {products.length === 0 ? (
            <div className="py-16 text-center text-slate-500">
              <div className="mb-3">No products yet.</div>
              <Link href="/admin/products/new" className="text-violet-400 hover:underline text-sm">Create your first product →</Link>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-white/10 text-xs text-slate-500 uppercase tracking-wider">
                <tr>
                  {['Product', 'Price', 'ba9chich ID', 'Status', ''].map(h => (
                    <th key={h} className="text-left px-5 py-3 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-white/2 transition">
                    <td className="px-5 py-3">
                      <div className="font-medium">{p.title}</div>
                      <div className="text-xs text-slate-500">/{p.slug}</div>
                    </td>
                    <td className="px-5 py-3 font-mono tabular-nums">{p.price} TND</td>
                    <td className="px-5 py-3 font-mono text-xs text-slate-400">{p.ba9chich_product_id || '—'}</td>
                    <td className="px-5 py-3">
                      <button onClick={() => toggleActive(p.id, p.is_active)}
                        className={`text-xs px-2 py-0.5 rounded-full cursor-pointer transition ${p.is_active ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}>
                        {p.is_active ? 'Active' : 'Draft'}
                      </button>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3 justify-end">
                        <Link href={`/${p.slug}`} target="_blank"><Eye className="w-4 h-4 text-slate-500 hover:text-white transition" /></Link>
                        <Link href={`/admin/products/${p.id}`}><Pencil className="w-4 h-4 text-slate-500 hover:text-white transition" /></Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
