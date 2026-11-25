import {MessageCircle, Phone} from 'lucide-react';
import {
  BUSINESS_INFO,
  TESTIMONIAL_PLACEHOLDERS,
  WHY_CHOOSE_POINTS,
} from '../data/businessConfig';
import {buildWhatsAppUrl} from '../utils/enquiry';

export function WhyChooseUsSection() {
  const waUrl = buildWhatsAppUrl(
    BUSINESS_INFO.whatsappNumber,
    'Hello Krishna Battery Service, I would like to check battery options for my vehicle or home inverter.',
  );

  return (
    <>
      {/* Why Choose Us */}
      <section
        id="why-choose-us"
        className="py-16 lg:py-24 bg-navy-900 text-white border-b border-navy-800"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
            <div className="lg:col-span-4">
              <p className="text-sm font-semibold text-amber-400 mb-3">
                Why Choose Us
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
                Straightforward Retail Support You Can Reach Directly
              </h2>
              <p className="text-base text-slate-300 leading-relaxed mb-8">
                When your vehicle refuses to start or your home backup weakens,
                you need a nearby Mugalivakkam shop you can call directly and
                visit without hassle.
              </p>

              <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
                <a
                  href={BUSINESS_INFO.phoneHref}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-navy-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap"
                >
                  <Phone className="w-4 h-4" aria-hidden="true" />
                  <span>Call {BUSINESS_INFO.phoneDisplay}</span>
                </a>
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-navy-800 border border-navy-700 hover:border-amber-400 rounded-lg transition-colors whitespace-nowrap"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                  <span>Message on WhatsApp</span>
                </a>
              </div>
            </div>

            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {WHY_CHOOSE_POINTS.map((point, index) => (
                <div
                  key={point.number}
                  className={`p-6 rounded-xl bg-navy-800/80 border border-navy-700 ${
                    index === WHY_CHOOSE_POINTS.length - 1 ? 'sm:col-span-2' : ''
                  }`}
                >
                  <p className="font-mono text-xs font-semibold text-amber-400 mb-2">
                    {point.number}
                  </p>
                  <h3 className="font-display text-lg font-bold text-white mb-2">
                    {point.title}
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {point.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Customer Testimonials (Adjacent proof section with transparent editable slots) */}
      <section
        id="testimonials"
        className="py-16 lg:py-24 bg-slate-50 border-b border-slate-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold text-amber-700 mb-3">
                Customer Testimonials
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-navy-900 mb-3">
                Verified Customer Feedback Slots
              </h2>
              <p className="text-base text-slate-600 leading-relaxed">
                To maintain complete transparency, no sample reviews have been
                fabricated. Replace the editable cards below with verified
                customer reviews from your shop visitors and Google Maps profile.
              </p>
            </div>
            <p className="text-xs font-medium text-slate-500 whitespace-nowrap">
              Editable Review Placeholders
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {TESTIMONIAL_PLACEHOLDERS.map((slot) => (
              <figure
                key={slot.id}
                className="flex flex-col justify-between p-6 bg-white rounded-xl border border-slate-200"
              >
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-4">
                    {slot.slotLabel}
                  </p>
                  <blockquote className="text-sm sm:text-base text-slate-700 leading-relaxed mb-6">
                    &ldquo;{slot.quotePlaceholder}&rdquo;
                  </blockquote>
                </div>

                <figcaption className="pt-4 border-t border-slate-200">
                  <p className="text-sm font-semibold text-navy-900">
                    {slot.customerNamePlaceholder}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {slot.contextPlaceholder}
                  </p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
