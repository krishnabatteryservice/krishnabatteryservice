import {useState} from 'react';
import {ArrowRight, MessageCircle} from 'lucide-react';
import {BUSINESS_INFO, CATALOG_ITEMS} from '../data/businessConfig';
import {
  buildWhatsAppUrl,
  filterCatalogItems,
  type CatalogFilter,
  type EnquiryCategory,
} from '../utils/enquiry';
import {ResilientImage} from './ResilientImage';

interface ProductsServicesSectionProps {
  onSelectEnquiryCategory: (category: EnquiryCategory, modelNote?: string) => void;
}

const FILTER_TABS: {id: CatalogFilter; label: string}[] = [
  {id: 'all', label: 'All'},
  {id: 'car-two-wheeler', label: 'Car & Two-Wheeler'},
  {id: 'home-inverter', label: 'Home Inverter'},
  {id: 'solutions-services', label: 'Solutions & Services'},
];

function mapItemToEnquiryCategory(itemId: string): EnquiryCategory {
  switch (itemId) {
    case 'car-two-wheeler-battery':
      return 'Car Battery';
    case 'home-inverter-battery':
      return 'Home Inverter Battery';
    case 'inverter-battery-combo':
      return 'Inverter & Battery Combo';
    default:
      return 'Battery Check / Other';
  }
}

export function ProductsServicesSection({
  onSelectEnquiryCategory,
}: ProductsServicesSectionProps) {
  const [activeFilter, setActiveFilter] = useState<CatalogFilter>('all');
  const visibleItems = filterCatalogItems(CATALOG_ITEMS, activeFilter);

  return (
    <section
      id="products"
      className="py-16 lg:py-24 bg-white border-b border-slate-200 scroll-mt-16"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div className="max-w-xl">
            <p className="text-sm font-semibold text-amber-700 mb-3">
              Products &amp; Services
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-navy-900 mb-3">
              Battery Lineup &amp; Store Services
            </h2>
            <p className="text-base text-slate-600 leading-relaxed">
              Filter by category to explore our retail lineup. Brand slots,
              warranty terms, and pricing are kept as editable placeholders
              ready for live store details.
            </p>
          </div>

          {/* Functional interactive filter tabs (strictly single-row on desktop) */}
          <div
            role="tablist"
            aria-label="Filter products and services"
            className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200 max-w-full overflow-x-auto self-start lg:self-end lg:shrink-0"
          >
            {FILTER_TABS.map((tab) => {
              const isSelected = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setActiveFilter(tab.id)}
                  className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    isSelected
                      ? 'bg-navy-900 text-white shadow-sm'
                      : 'text-slate-700 hover:text-navy-900 hover:bg-white/70'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Balanced 2-column product & service grid */}
        <div
          data-testid="catalog-grid"
          className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8"
        >
          {visibleItems.map((item) => {
            const waUrl = buildWhatsAppUrl(
              BUSINESS_INFO.whatsappNumber,
              item.whatsappPrompt,
            );
            const enquiryCategory = mapItemToEnquiryCategory(item.id);

            return (
              <article
                key={item.id}
                className="flex flex-col bg-slate-50 rounded-xl border border-slate-200 overflow-hidden transition-transform duration-200 hover:-translate-y-0.5"
              >
                <div className="aspect-[4/3] w-full bg-slate-200 overflow-hidden">
                  <ResilientImage
                    src={item.image}
                    alt={item.imageAlt}
                    fallbackLabel={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex flex-col flex-1 p-6">
                  <p className="text-xs font-medium text-amber-700 mb-1.5">
                    {item.categoryLabel}
                  </p>
                  <h3 className="font-display text-xl font-bold text-navy-900 mb-2.5">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed mb-5">
                    {item.summary}
                  </p>

                  {/* Clean hairline specification metadata (no pill badges) */}
                  <dl className="space-y-2 text-xs border-t border-slate-200 pt-4 mb-6 text-slate-600">
                    <div>
                      <dt className="font-semibold text-slate-800 inline">
                        Specifications:{' '}
                      </dt>
                      <dd className="inline">{item.specPlaceholder}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-slate-800 inline">
                        Brands:{' '}
                      </dt>
                      <dd className="inline">{item.brandSlot}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-slate-800 inline">
                        Pricing:{' '}
                      </dt>
                      <dd className="inline font-mono tabular-nums text-navy-900">
                        {item.pricePlaceholder}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-slate-800 inline">
                        Warranty:{' '}
                      </dt>
                      <dd className="inline">{item.warrantyPlaceholder}</dd>
                    </div>
                  </dl>

                  <div className="mt-auto flex items-center gap-2.5 pt-2">
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-600 rounded-lg transition-colors whitespace-nowrap"
                    >
                      <MessageCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>WhatsApp</span>
                    </a>

                    <button
                      type="button"
                      onClick={() =>
                        onSelectEnquiryCategory(enquiryCategory, item.title)
                      }
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-navy-900 bg-white border border-slate-300 hover:border-navy-900 rounded-lg transition-colors whitespace-nowrap"
                    >
                      <span>Enquire</span>
                      <ArrowRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    </button>
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
