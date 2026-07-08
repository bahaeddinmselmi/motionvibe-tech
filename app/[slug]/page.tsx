import { Suspense } from 'react'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import LandingPageClient from './LandingPageClient'
import { Loader2 } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = 0

const OR = '#E05C00'

export async function generateMetadata(
  props: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await props.params
  const supabase = await createClient()
  const { data: product } = await supabase
    .from('products')
    .select('title, subtitle, description, hero_image, original_price, price')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!product) {
    return {
      title: 'Product Not Found | Digital Store',
    }
  }

  const discount = product.original_price
    ? Math.round(100 - (Number(product.price) / Number(product.original_price)) * 100)
    : 0

  return {
    title: `${product.title} ${discount > 0 ? `(${discount}% OFF)` : ''} | Digital Store`,
    description: product.subtitle || product.description?.slice(0, 160) || 'Premium digital product bundle',
    openGraph: {
      title: product.title,
      description: product.subtitle || product.description?.slice(0, 160),
      images: product.hero_image ? [{ url: product.hero_image }] : undefined,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.title,
      description: product.subtitle || product.description?.slice(0, 160),
      images: product.hero_image ? [product.hero_image] : undefined,
    }
  }
}

export default async function LandingPage(
  props: {
    params: Promise<{ slug: string }>
    searchParams: Promise<Record<string, string | string[] | undefined>>
    slugOverride?: string
  }
) {
  const { slug: routeSlug } = await props.params
  const slug = props.slugOverride || routeSlug
  const searchParams = await props.searchParams

  const supabase = await createClient()
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: OR }} />
      </div>
    }>
      <LandingPageClient
        initialProduct={product}
        slug={slug}
        searchParams={searchParams}
      />
    </Suspense>
  )
}
