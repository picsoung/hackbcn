import OrgNavbar from '@/app/components/home/OrgNavbar'
import OrgHero from '@/app/components/home/OrgHero'
import PartnersBar from '@/app/components/home/PartnersBar'
import UpcomingEvents from '@/app/components/home/UpcomingEvents'
import StatsBar from '@/app/components/home/StatsBar'
import PastEvents from '@/app/components/home/PastEvents'
import OrgFooter from '@/app/components/home/OrgFooter'

export default function HomePage() {
  return (
    <div>
      <OrgNavbar />
      <main>
        <OrgHero />
        <PartnersBar />
        <UpcomingEvents />
        <StatsBar />
        <PastEvents />
      </main>
      <OrgFooter />
    </div>
  )
}
