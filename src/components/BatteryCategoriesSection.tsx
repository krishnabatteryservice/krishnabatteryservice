import {ArrowRight, MessageCircle, Phone} from 'lucide-react';
import {BUSINESS_INFO, IMAGES} from '../data/businessConfig';
import {buildWhatsAppUrl, type EnquiryCategory} from '../utils/enquiry';
import {ResilientImage} from './ResilientImage';

interface BatteryCategoriesSectionProps {
  onSelectEnquiryCategory: (category: EnquiryCategory) => void;
}

export function BatteryCategoriesSection({
  onSelectEnquiryCategory,
}: BatteryCategoriesSectionProps) {
  const sections = [
    {
      id: 'car-two-wheeler',
      kicker: '01. Car & Two-Wheeler Batteries',
      meta: 'Cars · SUVs · Scooters · Motorcycles',
      heading: 'Reliable Automobile Batteries Matched to Your Vehicle',
      body: 'A healthy starter battery keeps daily commutes and highway drives trouble-free. Visit our Mugalivakkam retail counter to find compatible batteries for hatchbacks, sedans, SUVs, scooters, and motorcycles based on your exact vehicle model and terminal layout.',
      points: [
        'Fitment guidance by vehicle make, model, and fuel type (petrol or diesel).',
        'Options covering compact two-wheeler starter batteries and four-wheeler automotive batteries.',
        'Stocked Brands: Amaron car and two-wheeler batteries.',
        'Warranty & Pricing: [Editable — Confirm manufacturer warranty & current pricing at store].',
      ],
      image: IMAGES.carTwoWheeler,
      imageAlt:
        'Unbranded heavy-duty automotive car starter battery beside a compact two-wheeler battery',
      enquiryCategory: 'Car Battery' as EnquiryCategory,
      whatsappMessage:
        'Hello Krishna Battery Service, I need a car or two-wheeler battery. Please share compatible options and pricing.',
      imageFirst: false,
    },
    {
      id: 'home-inverter',
      kicker: '02. Home Inverter Batteries',
      meta: 'Flats · Independent Homes · Home Offices',
      heading: 'Dependable Home Inverter Batteries for Everyday Power Backup',
      body: 'Keep lights, ceiling fans, Wi-Fi routers, and essential household electronics running smoothly during unexpected outages in Chennai. We help households compare inverter battery types and capacities to suit their backup duration and space.',
      points: [
        'Guidance on choosing suitable inverter battery capacities (Ah) for apartments and independent houses.',
        'Support for replacing worn-out batteries connected to your existing home inverter.',
        'Stocked Brands: [Editable — Add available tubular / flat-plate battery brands here].',
        'Warranty & Pricing: [Editable — Confirm manufacturer warranty & current pricing at store].',
      ],
      image: IMAGES.homeInverter,
      imageAlt:
        'Home inverter unit placed neatly atop a ventilated trolley containing a tall tubular battery in a modern hallway',
      enquiryCategory: 'Home Inverter Battery' as EnquiryCategory,
      whatsappMessage:
        'Hello Krishna Battery Service, I am looking for a home inverter battery in Chennai. Please share options.',
      imageFirst: true,
    },
    {
      id: 'inverter-solutions',
      kicker: '03. Inverter & Battery Solutions',
      meta: 'Load Planning · Inverter Sizing · Combo Guidance',
      heading: 'Complete Inverter & Battery Solutions Tailored to Your Load',
      body: 'Planning a brand-new home or small-office power backup installation? Matching the inverter VA rating with the right battery capacity ensures steady charging and reliable backup without overloading your system.',
      points: [
        'Practical load assessment based on the fans, lights, computers, and appliances you run.',
        'Single-battery and higher-capacity backup configurations explained in plain terms.',
        'Available Inverter & Battery Combos: [Editable — Add stocked inverter brands & combo specs here].',
        'Installation Support: [Editable — Confirm installation & wiring support availability].',
      ],
      image: IMAGES.backupSolutions,
      imageAlt:
        'Cleanly installed wall-mounted home inverter wired to dual backup batteries with heavy-duty red and black cables',
      enquiryCategory: 'Inverter & Battery Combo' as EnquiryCategory,
      whatsappMessage:
        'Hello Krishna Battery Service, I would like advice on a complete home inverter and battery solution.',
      imageFirst: false,
    },
  ];

  return (
    <section
      id="batteries"
      className="py-16 lg:py-24 bg-slate-50 border-b border-slate-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-14 lg:mb-20">
          <p className="text-sm font-semibold text-amber-700 mb-3">
            Core Battery Categories
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-navy-900 mb-4">
            Solutions for Vehicles &amp; Home Power Backup
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            Explore our three core retail divisions in Mugalivakkam, Chennai.
            Call or message us with your vehicle model or household backup
            needs for current stock details.
          </p>
        </div>

        <div className="space-y-16 lg:space-y-24">
          {sections.map((section) => {
            const waUrl = buildWhatsAppUrl(
              BUSINESS_INFO.whatsappNumber,
              section.whatsappMessage,
            );
            return (
              <article
                key={section.id}
                id={section.id}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch scroll-mt-24"
              >
                {/* Media column */}
                <div
                  className={`lg:col-span-6 flex ${
                    section.imageFirst ? 'lg:order-1' : 'lg:order-2'
                  }`}
                >
                  <div className="w-full min-h-[260px] sm:min-h-[340px] rounded-xl overflow-hidden border border-slate-200 bg-white">
                    <ResilientImage
                      src={section.image}
                      alt={section.imageAlt}
                      fallbackLabel={section.heading}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Copy column */}
                <div
                  className={`lg:col-span-6 flex flex-col justify-center ${
                    section.imageFirst ? 'lg:order-2' : 'lg:order-1'
                  }`}
                >
                  <p className="text-sm font-semibold text-amber-700 mb-1.5">
                    {section.kicker}
                  </p>
                  <p className="text-xs font-medium text-slate-500 mb-3">
                    {section.meta}
                  </p>
                  <h3 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-navy-900 mb-4">
                    {section.heading}
                  </h3>
                  <p className="text-base text-slate-600 leading-relaxed mb-6">
                    {section.body}
                  </p>

                  <ul className="space-y-2.5 mb-8 border-t border-slate-200 pt-5">
                    {section.points.map((point, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-3 text-sm text-slate-700 leading-relaxed"
                      >
                        <span
                          aria-hidden="true"
                          className="font-mono text-xs font-semibold text-amber-700 pt-0.5 shrink-0"
                        >
                          0{idx + 1}
                        </span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex flex-wrap items-center gap-3">
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-600 rounded-lg transition-colors whitespace-nowrap shrink-0"
                    >
                      <MessageCircle className="w-4 h-4" aria-hidden="true" />
                      <span>WhatsApp for Stock</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => onSelectEnquiryCategory(section.enquiryCategory)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-navy-900 bg-white border border-slate-300 hover:border-navy-900 rounded-lg transition-colors whitespace-nowrap shrink-0"
                    >
                      <span>Enquire Online</span>
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </button>

                    <a
                      href={BUSINESS_INFO.phoneHref}
                      className="inline-flex items-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-navy-900 hover:text-amber-700 transition-colors whitespace-nowrap shrink-0 font-mono tabular-nums"
                    >
                      <Phone className="w-4 h-4 text-amber-600" aria-hidden="true" />
                      <span>{BUSINESS_INFO.phoneRaw}</span>
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
