import { Head } from '@inertiajs/react';
import 'aos/dist/aos.css';

import { PageProps } from '@/types';
import { Navbar } from './Navbar';
import { HeroSection } from './HeroSection';
import { FeaturesSection } from './FeaturesSection';
import { PricingSection } from './PricingSection';
import { CareersSection } from './CareersSection';
import { ContactSection } from './ContactSection';
import SplashCursor from '@/Components/SplashCursor';

type CareerJob = {
  division: string;
  title?: string | null;
  location?: string | null;
  type?: string | null;
  description?: string | null;
  isHiring: boolean;
  availableSlots?: number | null;
};

type LandingPageProps = PageProps<{
  canLogin: boolean;
  canRegister: boolean;
  jobs: CareerJob[];
}>;

export default function LandingPage({
  canLogin,
  canRegister,
  jobs = [],
}: LandingPageProps) {
  return (
    <>
      <Head title="Lintas Data Prima" />
      <SplashCursor />
      <div className="bg-white min-h-screen overflow-x-hidden">
        <Navbar canLogin={canLogin} canRegister={canRegister} />
        <main>
          <HeroSection />
          <FeaturesSection />
          <PricingSection />
          <CareersSection jobs={jobs} />
          <ContactSection />
        </main>
      </div>
    </>
  );
}
