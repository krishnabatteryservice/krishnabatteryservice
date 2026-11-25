import {MessageCircle, Phone} from 'lucide-react';
import {BUSINESS_INFO} from '../data/businessConfig';
import {buildWhatsAppUrl} from '../utils/enquiry';

export function MobileStickyBar() {
  const waUrl = buildWhatsAppUrl(
    BUSINESS_INFO.whatsappNumber,
    'Hello Krishna Battery Service, I need assistance with a battery enquiry.',
  );

  return (
    <div
      aria-label="Quick mobile contact actions"
      className="md:hidden fixed inset-x-0 bottom-0 z-40 h-14 bg-white border-t border-slate-200 shadow-[0_-4px_16px_rgba(15,23,42,0.08)] grid grid-cols-2"
    >
      <a
        href={BUSINESS_INFO.phoneHref}
        className="flex items-center justify-center gap-2 text-sm font-semibold text-white bg-navy-900 active:bg-navy-800 transition-colors"
      >
        <Phone className="w-4 h-4 text-amber-400" aria-hidden="true" />
        <span>Call Now</span>
      </a>
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 text-sm font-semibold text-white bg-emerald-700 active:bg-emerald-600 transition-colors"
      >
        <MessageCircle className="w-4 h-4" aria-hidden="true" />
        <span>WhatsApp</span>
      </a>
    </div>
  );
}
