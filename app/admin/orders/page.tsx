'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Order } from '@/lib/types'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    createClient().from('orders').select('*').order('created_at', { ascending: false })
      .then(({ data }) => setOrders(data || []))
  }, [])

  const statusColor = (s: string) =>
    s === 'confirmed' ? 'bg-green-500/20 text-green-400' :
    s === 'redirected' ? 'bg-amber-500/20 text-amber-400' :
    'bg-slate-700 text-slate-400'

  return (
    <div className="min-h-screen bg-[#050818] text-white">
      <header className="border-b border-white/10 px-6 py-4 flex items-center gap-3">
        <Link href="/admin" className="text-slate-400 hover:text-white transition"><ArrowLeft className="w-4 h-4" /></Link>
        <span className="font-bold">Orders</span>
        <span className="text-slate-500 text-sm">({orders.length})</span>
      </header>
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-[#0D1225] border border-white/10 rounded-xl overflow-hidden">
          {orders.length === 0 ? (
            <div className="py-16 text-center text-slate-500">No orders yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-white/10 text-xs text-slate-500 uppercase tracking-wider">
                  <tr>
                    {['Customer', 'Email', 'Phone', 'Amount', 'Status', 'Date', ''].map(h => (
                      <th key={h} className="text-left px-4 py-3 font-medium whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {orders.map(o => (
                    <tr key={o.id} className="hover:bg-white/2 transition">
                      <td className="px-4 py-3 font-medium whitespace-nowrap">{o.customer_name}</td>
                      <td className="px-4 py-3 text-slate-400">{o.customer_email}</td>
                      <td className="px-4 py-3 text-slate-400">{o.customer_phone || '—'}</td>
                      <td className="px-4 py-3 font-mono tabular-nums">{o.amount ? `${o.amount} TND` : '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(o.payment_status)}`}>
                          {o.payment_status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                        {new Date(o.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        {o.flouci_url && (
                          <a href={o.flouci_url} target="_blank" rel="noreferrer"
                            className="text-slate-500 hover:text-violet-400 transition">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
