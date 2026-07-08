'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { ProductSection } from '@/lib/types'
import { ArrowLeft, Plus, X, ChevronUp, ChevronDown, Video, Image, AlignLeft, List, Layers } from 'lucide-react'
import Link from 'next/link'

/* ─── Section type config ─── */
const SECTION_TYPES = [
  { value: 'youtube',  label: 'YouTube Videos', icon: Video,      desc: 'Embed YouTube demo videos' },
  { value: 'images',   label: 'Image Grid',     icon: Image,      desc: 'Grid of product screenshots' },
  { value: 'carousel', label: 'Image Carousel', icon: Layers,     desc: 'Horizontal scrollable images' },
  { value: 'text',     label: 'Text Block',     icon: AlignLeft,  desc: 'Heading + paragraph content' },
  { value: 'bullets',  label: 'Bullet List',    icon: List,       desc: 'Checklist with icon' },
]

function newSection(type: string): ProductSection {
  if (type === 'youtube')  return { type: 'youtube',  title: '', videos: [{ url: '', caption: '' }] }
  if (type === 'images')   return { type: 'images',   title: '', images: [{ url: '', caption: '' }] }
  if (type === 'carousel') return { type: 'carousel', title: '', images: [{ url: '', caption: '' }] }
  if (type === 'text')     return { type: 'text',  title: '', content: '' }
  return { type: 'bullets', title: '', items: [''], icon: 'check' }
}

/* ─── Single section editor ─── */
function SectionCard({
  section, index, total,
  onChange, onDelete, onMove,
}: {
  section: ProductSection; index: number; total: number
  onChange: (s: ProductSection) => void
  onDelete: () => void
  onMove: (dir: -1 | 1) => void
}) {
  const info = SECTION_TYPES.find(t => t.value === section.type)!
  const Icon = info.icon
  const inp = "w-full text-sm bg-white border border-[#E0DDD8] rounded-xl px-3.5 py-2.5 outline-none focus:border-[#E05C00] transition placeholder-[#BBB]"

  const update = (patch: Partial<ProductSection>) => onChange({ ...section, ...patch } as ProductSection)

  return (
    <div className="bg-white border border-[#E0DDD8] rounded-2xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-[#F5F2EC] border-b border-[#E0DDD8]">
        <Icon className="w-4 h-4 text-[#E05C00]" />
        <span className="font-semibold text-sm text-[#111] flex-1">{info.label}</span>
        <div className="flex items-center gap-1">
          <button onClick={() => onMove(-1)} disabled={index === 0}
            className="p-1 rounded-lg hover:bg-white transition disabled:opacity-30">
            <ChevronUp className="w-4 h-4 text-[#555]" />
          </button>
          <button onClick={() => onMove(1)} disabled={index === total - 1}
            className="p-1 rounded-lg hover:bg-white transition disabled:opacity-30">
            <ChevronDown className="w-4 h-4 text-[#555]" />
          </button>
          <button onClick={onDelete} className="p-1 rounded-lg hover:bg-red-50 transition ml-1">
            <X className="w-4 h-4 text-[#888] hover:text-red-500" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        {/* Title (most sections have it) */}
        {'title' in section && (
          <div>
            <label className="block text-[11px] font-semibold tracking-wider uppercase text-[#888] mb-1.5">Section title</label>
            <input className={inp} placeholder="e.g. Demo Videos" value={section.title || ''}
              onChange={e => update({ title: e.target.value } as Partial<ProductSection>)} />
          </div>
        )}

        {/* YouTube */}
        {section.type === 'youtube' && (
          <div className="space-y-2">
            <label className="block text-[11px] font-semibold tracking-wider uppercase text-[#888] mb-1">YouTube URLs</label>
            {section.videos.map((v, i) => (
              <div key={i} className="flex gap-2">
                <input className={`${inp} flex-1`} placeholder="https://youtube.com/watch?v=..."
                  value={v.url}
                  onChange={e => {
                    const videos = [...section.videos]
                    videos[i] = { ...videos[i], url: e.target.value }
                    update({ videos })
                  }} />
                <input className="w-32 text-sm border border-[#E0DDD8] rounded-xl px-3 py-2.5 outline-none focus:border-[#E05C00] bg-white placeholder-[#BBB]"
                  placeholder="Caption"
                  value={v.caption || ''}
                  onChange={e => {
                    const videos = [...section.videos]
                    videos[i] = { ...videos[i], caption: e.target.value }
                    update({ videos })
                  }} />
                {section.videos.length > 1 && (
                  <button onClick={() => update({ videos: section.videos.filter((_, j) => j !== i) })}
                    className="text-[#BBB] hover:text-red-500 transition"><X className="w-4 h-4" /></button>
                )}
              </div>
            ))}
            <button onClick={() => update({ videos: [...section.videos, { url: '', caption: '' }] })}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#E05C00] hover:underline">
              <Plus className="w-3.5 h-3.5" /> Add video
            </button>
          </div>
        )}

        {/* Images / Carousel */}
        {(section.type === 'images' || section.type === 'carousel') && (
          <div className="space-y-2">
            <label className="block text-[11px] font-semibold tracking-wider uppercase text-[#888] mb-1">Image URLs</label>
            {section.images.map((img, i) => (
              <div key={i} className="flex gap-2">
                <input className={`${inp} flex-1`} placeholder="https://..."
                  value={img.url}
                  onChange={e => {
                    const images = [...section.images]
                    images[i] = { ...images[i], url: e.target.value }
                    update({ images })
                  }} />
                <input className="w-32 text-sm border border-[#E0DDD8] rounded-xl px-3 py-2.5 outline-none focus:border-[#E05C00] bg-white placeholder-[#BBB]"
                  placeholder="Caption"
                  value={img.caption || ''}
                  onChange={e => {
                    const images = [...section.images]
                    images[i] = { ...images[i], caption: e.target.value }
                    update({ images })
                  }} />
                {section.images.length > 1 && (
                  <button onClick={() => update({ images: section.images.filter((_, j) => j !== i) })}
                    className="text-[#BBB] hover:text-red-500 transition"><X className="w-4 h-4" /></button>
                )}
              </div>
            ))}
            <button onClick={() => update({ images: [...section.images, { url: '', caption: '' }] })}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#E05C00] hover:underline">
              <Plus className="w-3.5 h-3.5" /> Add image
            </button>
          </div>
        )}

        {/* Text block */}
        {section.type === 'text' && (
          <div>
            <label className="block text-[11px] font-semibold tracking-wider uppercase text-[#888] mb-1.5">Content</label>
            <textarea rows={4} className={`${inp} resize-none`} placeholder="Write your content here…"
              value={section.content}
              onChange={e => update({ content: e.target.value })} />
          </div>
        )}

        {/* Bullets */}
        {section.type === 'bullets' && (
          <div className="space-y-2">
            <label className="block text-[11px] font-semibold tracking-wider uppercase text-[#888] mb-1">Items</label>
            {section.items.map((item, i) => (
              <div key={i} className="flex gap-2">
                <input className={`${inp} flex-1`} placeholder="Bullet point text…"
                  value={item}
                  onChange={e => {
                    const items = [...section.items]
                    items[i] = e.target.value
                    update({ items })
                  }} />
                {section.items.length > 1 && (
                  <button onClick={() => update({ items: section.items.filter((_, j) => j !== i) })}
                    className="text-[#BBB] hover:text-red-500 transition"><X className="w-4 h-4" /></button>
                )}
              </div>
            ))}
            <button onClick={() => update({ items: [...section.items, ''] })}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#E05C00] hover:underline">
              <Plus className="w-3.5 h-3.5" /> Add item
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Tag input ─── */
function TagInput({ label, items, onChange }: { label: string; items: string[]; onChange: (v: string[]) => void }) {
  const [draft, setDraft] = useState('')
  function add() {
    const v = draft.trim(); if (!v) return
    onChange([...items, v]); setDraft('')
  }
  return (
    <div>
      <label className="block text-[11px] font-semibold tracking-wider uppercase text-[#888] mb-1.5">{label}</label>
      <div className="flex flex-wrap gap-2 mb-2">
        {items.map((t, i) => (
          <span key={i} className="flex items-center gap-1 bg-orange-50 text-[#E05C00] text-xs px-2.5 py-1 rounded-full border border-orange-200">
            {t}
            <button onClick={() => onChange(items.filter((_, j) => j !== i))}><X className="w-3 h-3" /></button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input value={draft} onChange={e => setDraft(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), add())}
          className="flex-1 text-sm bg-white border border-[#E0DDD8] rounded-xl px-3.5 py-2.5 outline-none focus:border-[#E05C00] transition placeholder-[#BBB]"
          placeholder="Type and press Enter…" />
        <button onClick={add} type="button"
          className="bg-[#E05C00] hover:brightness-110 text-white px-3.5 py-2.5 rounded-xl text-sm transition">
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

/* ─── Card wrapper ─── */
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-[#E0DDD8] rounded-2xl overflow-hidden shadow-sm">
      <div className="px-5 py-3.5 border-b border-[#E0DDD8] bg-[#F5F2EC]">
        <span className="font-semibold text-sm text-[#111]">{title}</span>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  )
}

/* ─── Main ─── */
export default function NewProduct() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title: '', slug: '', subtitle: '', description: '', superprofile_url: '',
    price: '', original_price: '',
    ba9chich_product_id: '', hero_image: '',
  })
  const [features, setFeatures] = useState<string[]>([])
  const [faqs, setFaqs] = useState<{ question: string; answer: string }[]>([])
  const [faqDraft, setFaqDraft] = useState({ question: '', answer: '' })
  const [sections, setSections] = useState<ProductSection[]>([])
  const [previewImages, setPreviewImages] = useState<{ url: string; caption?: string }[]>([])
  const [addingType, setAddingType] = useState('')

  function f(key: keyof typeof form) {
    return {
      value: form[key],
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm(p => ({ ...p, [key]: e.target.value })),
    }
  }

  function autoSlug(t: string) {
    return t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  }

  function addSection() {
    if (!addingType) return
    setSections(s => [...s, newSection(addingType)])
    setAddingType('')
  }

  function updateSection(i: number, s: ProductSection) {
    setSections(prev => prev.map((x, j) => j === i ? s : x))
  }

  function deleteSection(i: number) {
    setSections(prev => prev.filter((_, j) => j !== i))
  }

  function moveSection(i: number, dir: -1 | 1) {
    const next = [...sections]
    const j = i + dir
    if (j < 0 || j >= next.length) return
    ;[next[i], next[j]] = [next[j], next[i]]
    setSections(next)
  }

  async function save() {
    setError('')
    if (!form.title || !form.slug || !form.price) { setError('Title, slug and price are required.'); return }
    setSaving(true)
    const db = createClient()
    const { error: err } = await db.from('products').insert({
      title: form.title, slug: form.slug, subtitle: form.subtitle || null,
      description: form.description || null,
      superprofile_url: form.superprofile_url || null,
      price: parseFloat(form.price),
      original_price: form.original_price ? parseFloat(form.original_price) : null,
      ba9chich_product_id: form.ba9chich_product_id ? parseInt(form.ba9chich_product_id) : null,
      hero_image: form.hero_image || null,
      features, faqs, sections,
      preview_images: previewImages, testimonials: [], upsell_slugs: [], is_active: false,
    })
    if (err) { setError(err.message); setSaving(false); return }
    router.push('/admin/products')
  }

  const inp = "w-full text-sm bg-white border border-[#E0DDD8] rounded-xl px-3.5 py-2.5 outline-none focus:border-[#E05C00] transition placeholder-[#BBB]"

  return (
    <div className="min-h-screen bg-[#F5F2EC]" style={{ fontFamily: 'var(--font-inter), sans-serif' }}>
      <header className="bg-white border-b border-[#E0DDD8] px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link href="/admin/products" className="text-[#888] hover:text-[#111] transition p-1">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <span className="font-bold text-[#111]">New Product</span>
        </div>
        <button onClick={save} disabled={saving}
          className="bg-[#E05C00] hover:brightness-110 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2 rounded-xl transition">
          {saving ? 'Saving…' : 'Save product'}
        </button>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">
        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>}

        {/* Basic info */}
        <Card title="Basic info">
          <div>
            <label className="block text-[11px] font-semibold tracking-wider uppercase text-[#888] mb-1.5">Product title *</label>
            <input className={inp} placeholder="e.g. Biggest Video Editing Bundle"
              value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value, slug: autoSlug(e.target.value) }))} />
          </div>
          <div>
            <label className="block text-[11px] font-semibold tracking-wider uppercase text-[#888] mb-1.5">URL slug *</label>
            <input className={inp} placeholder="biggest-video-editing-bundle" {...f('slug')} />
          </div>
          <div>
            <label className="block text-[11px] font-semibold tracking-wider uppercase text-[#888] mb-1.5">Subtitle</label>
            <input className={inp} placeholder="One-liner shown under the title" {...f('subtitle')} />
          </div>
          <div>
            <label className="block text-[11px] font-semibold tracking-wider uppercase text-[#888] mb-1.5">Description (About section)</label>
            <textarea rows={5} className={`${inp} resize-none`}
              placeholder="Write the full product description here. This replaces the About section text. You can use line breaks."
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
            <p className="text-[11px] text-[#AAA] mt-1">Supports line breaks. Shown in the About section on the product page.</p>
          </div>
          <div>
            <label className="block text-[11px] font-semibold tracking-wider uppercase text-[#888] mb-1.5">SuperProfile.bio URL (embed)</label>
            <input className={inp} placeholder="https://superprofile.bio/vp/..." {...f('superprofile_url')} />
            <p className="text-[11px] text-[#AAA] mt-1">Embeds a SuperProfile.bio preview below the About section.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold tracking-wider uppercase text-[#888] mb-1.5">Price (TND) *</label>
              <input type="number" step="0.01" className={inp} placeholder="39.99" {...f('price')} />
            </div>
            <div>
              <label className="block text-[11px] font-semibold tracking-wider uppercase text-[#888] mb-1.5">Original price</label>
              <input type="number" step="0.01" className={inp} placeholder="99.00" {...f('original_price')} />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-semibold tracking-wider uppercase text-[#888] mb-1.5">
              ba9chich.com Product ID
            </label>
            <input type="number" className={inp} placeholder="11309" {...f('ba9chich_product_id')} />
            <p className="text-[11px] text-[#AAA] mt-1">In ba9chich admin → product edit URL: ?post=XXXXX</p>
          </div>
          <div>
            <label className="block text-[11px] font-semibold tracking-wider uppercase text-[#888] mb-1.5">Hero image URL</label>
            <input className={inp} placeholder="https://..." {...f('hero_image')} />
          </div>
        </Card>

        {/* Features */}
        <Card title="Features (what&apos;s included)">
          <TagInput label="" items={features} onChange={setFeatures} />
        </Card>

        {/* Dynamic sections */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-sm text-[#111]">Page sections</span>
            <span className="text-[11px] text-[#888]">{sections.length} section{sections.length !== 1 ? 's' : ''}</span>
          </div>

          <div className="space-y-3 mb-4">
            {sections.map((s, i) => (
              <SectionCard
                key={i} section={s} index={i} total={sections.length}
                onChange={updated => updateSection(i, updated)}
                onDelete={() => deleteSection(i)}
                onMove={dir => moveSection(i, dir)}
              />
            ))}
          </div>

          {/* Add section UI */}
          <div className="bg-white border-2 border-dashed border-[#E0DDD8] rounded-2xl p-5">
            <p className="text-sm font-semibold text-[#555] mb-4">Add a section</p>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {SECTION_TYPES.map(t => {
                const Icon = t.icon
                return (
                  <button key={t.value} onClick={() => setAddingType(t.value)}
                    className={`flex items-start gap-3 p-3 rounded-xl border text-left transition ${
                      addingType === t.value
                        ? 'border-[#E05C00] bg-orange-50'
                        : 'border-[#E0DDD8] hover:border-[#E05C00] hover:bg-orange-50/50'
                    }`}>
                    <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${addingType === t.value ? 'text-[#E05C00]' : 'text-[#888]'}`} />
                    <div>
                      <div className={`text-xs font-semibold ${addingType === t.value ? 'text-[#E05C00]' : 'text-[#111]'}`}>{t.label}</div>
                      <div className="text-[10px] text-[#888] mt-0.5">{t.desc}</div>
                    </div>
                  </button>
                )
              })}
            </div>
            <button onClick={addSection} disabled={!addingType}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition disabled:opacity-40"
              style={{ background: addingType ? '#E05C00' : '#CCC' }}>
              <Plus className="w-4 h-4" /> Add {addingType ? SECTION_TYPES.find(t => t.value === addingType)?.label : 'section'}
            </button>
          </div>
        </div>

        {/* FAQs */}
        <Card title="FAQs">
          {faqs.map((fq, i) => (
            <div key={i} className="flex gap-3 bg-[#F5F2EC] rounded-xl p-3">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-[#111] truncate">{fq.question}</div>
                <div className="text-xs text-[#888] mt-0.5 line-clamp-2">{fq.answer}</div>
              </div>
              <button onClick={() => setFaqs(fs => fs.filter((_, j) => j !== i))}>
                <X className="w-4 h-4 text-[#BBB] hover:text-red-500" />
              </button>
            </div>
          ))}
          <div className="space-y-2">
            <input className={inp} placeholder="Question" value={faqDraft.question}
              onChange={e => setFaqDraft(p => ({ ...p, question: e.target.value }))} />
            <input className={inp} placeholder="Answer" value={faqDraft.answer}
              onChange={e => setFaqDraft(p => ({ ...p, answer: e.target.value }))} />
            <button onClick={() => {
              if (faqDraft.question && faqDraft.answer) {
                setFaqs(p => [...p, faqDraft])
                setFaqDraft({ question: '', answer: '' })
              }
            }} className="flex items-center gap-1.5 text-xs font-semibold text-[#E05C00] hover:underline">
              <Plus className="w-3.5 h-3.5" /> Add FAQ
            </button>
          </div>
        </Card>

        {/* Previews */}
        <Card title="Demo preview images (gallery)">
          <div className="space-y-3">
            {previewImages.map((img, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input className={`${inp} flex-1`} placeholder="Image URL (e.g. /preview_story_1.png)"
                  value={img.url}
                  onChange={e => {
                    const next = [...previewImages]
                    next[i] = { ...next[i], url: e.target.value }
                    setPreviewImages(next)
                  }} />
                <input className="w-48 text-sm border border-[#E0DDD8] rounded-xl px-3 py-2.5 outline-none focus:border-[#E05C00] bg-white placeholder-[#BBB]"
                  placeholder="Caption (optional)" value={img.caption || ''}
                  onChange={e => {
                    const next = [...previewImages]
                    next[i] = { ...next[i], caption: e.target.value }
                    setPreviewImages(next)
                  }} />
                {img.url && (
                  <a href={img.url} target="_blank" rel="noreferrer" className="text-[#E05C00] hover:underline text-xs flex-shrink-0">
                    View
                  </a>
                )}
                <button onClick={() => setPreviewImages(previewImages.filter((_, j) => j !== i))}
                  className="text-[#BBB] hover:text-red-500 transition"><X className="w-4 h-4" /></button>
              </div>
            ))}
            <button onClick={() => setPreviewImages([...previewImages, { url: '', caption: '' }])}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#E05C00] hover:underline">
              <Plus className="w-3.5 h-3.5" /> Add preview image
            </button>
          </div>
        </Card>

        <div className="flex justify-end gap-3 pb-10">
          <Link href="/admin/products" className="text-sm text-[#888] hover:text-[#111] transition px-4 py-2.5">Cancel</Link>
          <button onClick={save} disabled={saving}
            className="bg-[#E05C00] hover:brightness-110 disabled:opacity-60 text-white text-sm font-semibold px-7 py-2.5 rounded-xl transition">
            {saving ? 'Saving…' : 'Save product'}
          </button>
        </div>
      </div>
    </div>
  )
}
