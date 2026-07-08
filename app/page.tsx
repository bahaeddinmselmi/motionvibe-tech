import LandingPage from './[slug]/page'

export const dynamic = 'force-dynamic'

export default async function Home() {
  return (
    <LandingPage
      params={Promise.resolve({ slug: 'youtube-automation' })}
      searchParams={Promise.resolve({})}
    />
  )
}
