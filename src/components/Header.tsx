import {useState} from 'react';
import {Menu, Phone, X} from 'lucide-react';
import {BUSINESS_INFO} from '../data/businessConfig';

const NAV_LINKS = [
  {label: 'About', href: '#about'},
  {label: 'Batteries', href: '#batteries'},
  {label: 'FAQ', href: '#faq'},
  {label: 'Contact', href: '#contact'},
] as const;

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[60px] md:h-[72px] flex items-center justify-between gap-8">
        {/* Zone 1: Single-line brand wordmark */}
        <a
          href="#top"
          className="font-display text-lg md:text-xl font-bold tracking-tight text-navy-900 hover:text-navy-700 transition-colors whitespace-nowrap shrink-0"
        >
          {BUSINESS_INFO.name}
        </a>

        {/* Zone 2: 5 concise single-line text nav links */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="py-1 border-b-2 border-transparent hover:border-amber-600 hover:text-navy-900 transition-colors whitespace-nowrap shrink-0"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Zone 3: 1 primary action on desktop, menu toggle on mobile */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href={BUSINESS_INFO.phoneHref}
            className="hidden md:inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-navy-900 rounded-lg hover:bg-navy-800 transition-colors whitespace-nowrap shrink-0 font-mono tabular-nums"
          >
            <Phone className="w-4 h-4 text-amber-400" aria-hidden="true" />
            <span>Call {BUSINESS_INFO.phoneRaw}</span>
          </a>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation-drawer"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-lg border border-slate-200 text-navy-900 hover:bg-slate-100 transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" aria-hidden="true" />
            ) : (
              <Menu className="w-5 h-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <nav
          id="mobile-navigation-drawer"
          aria-label="Mobile navigation"
          className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-1 shadow-lg"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-3 text-base font-medium text-slate-700 hover:text-navy-900 hover:bg-slate-50 rounded-lg transition-colors"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-3 mt-2 border-t border-slate-100">
            <a
              href={BUSINESS_INFO.phoneHref}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full px-4 py-3 text-sm font-semibold text-white bg-navy-900 rounded-lg hover:bg-navy-800 transition-colors font-mono tabular-nums"
            >
              <Phone className="w-4 h-4 text-amber-400" aria-hidden="true" />
              <span>Call {BUSINESS_INFO.phoneDisplay}</span>
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
