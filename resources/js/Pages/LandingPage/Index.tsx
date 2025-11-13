import { Head } from '@inertiajs/react';
import 'aos/dist/aos.css';

import { PageProps } from '@/types';
import { Navbar } from './Navbar';
import { HeroSection } from './HeroSection';
import { FeaturesSection } from './FeaturesSection';
import { PricingSection } from './PricingSection';
import { CareersSection } from './CareersSection';
import { ContactSection } from './ContactSection';

type LandingPageProps = PageProps<{
  canLogin: boolean;
  canRegister: boolean;
}>;

export default function LandingPage({
  canLogin,
  canRegister,
}: LandingPageProps) {
  return (
    <>
      <Head title="Lintas Data Prima" />
      <div className="bg-white min-h-screen overflow-x-hidden">
        <Navbar canLogin={canLogin} canRegister={canRegister} />
        <main>
          <HeroSection />
          <FeaturesSection />
          <PricingSection />
          <CareersSection />
          <ContactSection />
        </main>
      </div>
    </>
  );
}
