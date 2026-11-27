import {TESTIMONIAL_PLACEHOLDERS} from '../data/businessConfig';

export function WhyChooseUsSection() {
  return (
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
  );
}
