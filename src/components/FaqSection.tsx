import {useState} from 'react';
import {ChevronDown, Phone} from 'lucide-react';
import {BUSINESS_INFO, FAQ_ITEMS} from '../data/businessConfig';

export function FaqSection() {
  const [openId, setOpenId] = useState<string | null>(FAQ_ITEMS[0]?.id ?? null);

  const handleToggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section
      id="faq"
      className="py-16 lg:py-24 bg-white border-b border-slate-200 scroll-mt-16"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          <div className="lg:col-span-4">
            <p className="text-sm font-semibold text-amber-700 mb-3">
              Frequently Asked Questions
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-navy-900 mb-4">
              Common Questions Before You Visit or Call
            </h2>
            <p className="text-base text-slate-600 leading-relaxed mb-6">
              Have a specific vehicle model or inverter backup question not
              covered here? Speak directly with Krishna Battery Service.
            </p>
            <a
              href={BUSINESS_INFO.phoneHref}
              className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-navy-900 hover:bg-navy-800 rounded-lg transition-colors whitespace-nowrap font-mono tabular-nums"
            >
              <Phone className="w-4 h-4 text-amber-400" aria-hidden="true" />
              <span>Call {BUSINESS_INFO.phoneRaw}</span>
            </a>
          </div>

          <div className="lg:col-span-8 divide-y divide-slate-200 border-t border-b border-slate-200">
            {FAQ_ITEMS.map((item) => {
              const isOpen = openId === item.id;
              const panelId = `${item.id}-panel`;
              return (
                <div key={item.id} className="py-1">
                  <h3>
                    <button
                      type="button"
                      onClick={() => handleToggle(item.id)}
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      className="w-full py-4 flex items-center justify-between gap-4 text-left text-base sm:text-lg font-semibold text-navy-900 hover:text-amber-700 transition-colors"
                    >
                      <span>{item.question}</span>
                      <ChevronDown
                        className={`w-5 h-5 text-slate-500 shrink-0 transition-transform duration-200 ${
                          isOpen ? 'rotate-180 text-amber-700' : ''
                        }`}
                        aria-hidden="true"
                      />
                    </button>
                  </h3>
                  {isOpen && (
                    <div
                      id={panelId}
                      className="pb-5 pr-8 text-sm sm:text-base text-slate-600 leading-relaxed"
                    >
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
