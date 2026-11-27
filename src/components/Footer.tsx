import {MessageCircle, Phone} from 'lucide-react';
import {BUSINESS_INFO} from '../data/businessConfig';
import {buildWhatsAppUrl} from '../utils/enquiry';

export function Footer() {
  const year = new Date().getFullYear();
  const waUrl = buildWhatsAppUrl(
    BUSINESS_INFO.whatsappNumber,
    'Hello Krishna Battery Service, I found your website and would like to enquire about batteries.',
  );

  return (
    <footer className="bg-navy-950 text-slate-300 border-t border-navy-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          {/* Column 1: Business Identity */}
          <div className="lg:col-span-4 space-y-4">
            <a
              href="#top"
              className="font-display text-xl font-bold tracking-tight text-white inline-block"
            >
              {BUSINESS_INFO.name}
            </a>
            <p className="text-sm text-slate-400 leading-relaxed">
              Automobile battery and home inverter battery retail shop serving
              vehicle owners and households in Madhananthapuram, Mugalivakkam,
              and nearby Chennai localities.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <a
                href={BUSINESS_INFO.phoneHref}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-navy-950 bg-amber-400 hover:bg-amber-300 rounded-md transition-colors font-mono tabular-nums"
              >
                <Phone className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{BUSINESS_INFO.phoneRaw}</span>
              </a>
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-600 rounded-md transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" aria-hidden="true" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Column 2: Quick Navigation */}
          <div className="lg:col-span-3">
            <h3 className="font-display text-sm font-semibold text-white mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#about" className="hover:text-amber-400 transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="#car-two-wheeler"
                  className="hover:text-amber-400 transition-colors"
                >
                  Car &amp; Two-Wheeler Batteries
                </a>
              </li>
              <li>
                <a
                  href="#home-inverter"
                  className="hover:text-amber-400 transition-colors"
                >
                  Home Inverter Batteries
                </a>
              </li>
              <li>
                <a
                  href="#inverter-solutions"
                  className="hover:text-amber-400 transition-colors"
                >
                  Inverter &amp; Battery Solutions
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-amber-400 transition-colors">
                  Frequently Asked Questions
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Address & Local Areas */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="font-display text-sm font-semibold text-white">
              Shop Location &amp; Nearby Service Areas
            </h3>
            <address className="not-italic text-sm text-slate-300 leading-relaxed">
              {BUSINESS_INFO.addressLine1}, {BUSINESS_INFO.addressLine2},{' '}
              {BUSINESS_INFO.cityStatePin}
            </address>
            <p className="text-xs text-slate-400 leading-relaxed">
              Conveniently reachable from{' '}
              {BUSINESS_INFO.nearbyAreas.join(' · ')}.
            </p>
            <p className="text-xs text-slate-400">
              Hours: {BUSINESS_INFO.hoursPlaceholder}
            </p>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-navy-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-400">
          <p>
            &copy; {year} {BUSINESS_INFO.name}. All rights reserved.
          </p>
          <p className="leading-relaxed">
            Location map powered by Google Maps Platform. Subject to{' '}
            <a
              href="https://maps.google.com/help/terms_maps/?utm_campaign=gmp_mcp_codeassist_v1_aistudio"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-slate-200"
            >
              Google Maps Terms
            </a>{' '}
            and{' '}
            <a
              href="https://policies.google.com/privacy?utm_campaign=gmp_mcp_codeassist_v1_aistudio"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-slate-200"
            >
              Google Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </footer>
  );
}
