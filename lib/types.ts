export interface Product {
  id: string
  slug: string
  is_active: boolean
  title: string
  title_ar?: string
  subtitle?: string
  subtitle_ar?: string
  description?: string          // Rich description shown in the About section (admin editable)
  description_ar?: string       // Tunisian Arabic description
  superprofile_url?: string     // SuperProfile.bio embed URL (optional)
  price: number
  original_price?: number
  ba9chich_product_id?: number
  hero_image?: string
  preview_images: { url: string; caption?: string }[]
  features: string[]
  features_ar?: string[]
  testimonials: { name: string; text: string; rating: number; avatar?: string }[]
  testimonials_ar?: { name: string; text: string; rating: number; avatar?: string }[]
  faqs: { question: string; answer: string }[]
  faqs_ar?: { question: string; answer: string }[]
  upsell_slugs: string[]
  sections: ProductSection[]
  sections_ar?: ProductSection[]
  created_at: string
}

export interface Order {
  id: string
  product_id: string
  customer_name: string
  customer_email: string
  customer_phone?: string
  amount?: number
  flouci_url?: string
  ba9chich_checkout_done: boolean
  payment_status: 'pending' | 'redirected' | 'confirmed'
  created_at: string
}

export interface CheckoutPayload {
  slug: string
  first_name: string
  last_name: string
  email: string
  phone: string
  product_id: string
  ba9chich_product_id: number
  amount: number
}

/* ─── Dynamic section types ─── */

export interface YoutubeSection {
  type: 'youtube'
  title?: string
  videos: { url: string; caption?: string }[]
}

export interface ImagesSection {
  type: 'images'
  title?: string
  layout?: 'grid' | 'masonry'
  images: { url: string; caption?: string }[]
}

export interface CarouselSection {
  type: 'carousel'
  title?: string
  images: { url: string; caption?: string }[]
}

export interface TextSection {
  type: 'text'
  title: string
  content: string
}

export interface BulletsSection {
  type: 'bullets'
  title: string
  items: string[]
  icon?: 'check' | 'star' | 'fire'
}

export type ProductSection =
  | YoutubeSection
  | ImagesSection
  | CarouselSection
  | TextSection
  | BulletsSection
