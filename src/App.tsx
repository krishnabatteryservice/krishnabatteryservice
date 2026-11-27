import {useEffect, useState} from 'react';
import {Header} from './components/Header';
import {HeroSection} from './components/HeroSection';
import {AboutSection} from './components/AboutSection';
import {WhyChooseUsSection} from './components/WhyChooseUsSection';
import {SocialMediaReelsSection} from './components/SocialMediaReelsSection';
import {ContactSection} from './components/ContactSection';
import {Footer} from './components/Footer';
import {MobileStickyBar} from './components/MobileStickyBar';

export default function App() {
  const [mapsQuotaExceeded, setMapsQuotaExceeded] = useState(false);

  useEffect(() => {
    const handleQuotaExceeded = () => {
      setMapsQuotaExceeded(true);
    };
    window.addEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    return () => {
      window.removeEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 pb-14 md:pb-0">
      {mapsQuotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      <Header />

      <main className="flex-1">
        <HeroSection />
        <AboutSection />
        <WhyChooseUsSection />
        <SocialMediaReelsSection />
        <ContactSection />
      </main>

      <Footer />
      <MobileStickyBar />
    </div>
  );
}
