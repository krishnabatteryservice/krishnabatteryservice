import {MapPin, Phone} from 'lucide-react';
import {BUSINESS_INFO, IMAGES} from '../data/businessConfig';
import {ResilientImage} from './ResilientImage';

export function AboutSection() {
  return (
    <section
      id="about"
      className="py-16 lg:py-24 bg-white border-b border-slate-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-stretch">
          {/* Left: Service bay editorial visual */}
          <div className="lg:col-span-5 flex">
            <div className="w-full min-h-[280px] sm:min-h-[360px] rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
              <ResilientImage
                src={IMAGES.testingService}
                alt="Technician testing an automobile battery voltage under the hood of a car in a service bay"
                fallbackLabel="Battery Diagnostics & Retail Guidance"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Right: Factual store narrative + editable business details */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <p className="text-sm font-semibold text-amber-700 mb-3">
              About Krishna Battery Service
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-navy-900 mb-5">
              A Local Retail Battery Shop Serving Mugalivakkam &amp; Nearby
              Chennai Areas
            </h2>
            <p className="text-base text-slate-600 leading-relaxed mb-4">
              Located on Madha Nagar Main Road in Madhananthapuram, Mugalivakkam,
              Krishna Battery Service focuses on helping vehicle owners and
              households choose dependable battery replacements and home power
              backup setups without guesswork.
            </p>
            <p className="text-base text-slate-600 leading-relaxed mb-8">
              Whether your car is slow to crank, your two-wheeler battery needs
              a fresh replacement, or your home needs a dependable inverter
              battery for Chennai power cuts, you can visit our counter or call
              directly to discuss suitable capacities and current availability.
            </p>

            {/* Clean unboxed hairline specification list (no cards-within-cards) */}
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-slate-200">
              <div>
                <dt className="text-xs font-medium text-slate-500 mb-1">
                  Shop Address
                </dt>
                <dd className="text-sm font-medium text-slate-900 leading-relaxed">
                  {BUSINESS_INFO.addressLine1}, {BUSINESS_INFO.addressLine2},{' '}
                  {BUSINESS_INFO.cityStatePin}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-500 mb-1">
                  Store Timings
                </dt>
                <dd className="text-sm font-medium text-slate-700 leading-relaxed">
                  {BUSINESS_INFO.hoursPlaceholder}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-500 mb-1">
                  Store Background
                </dt>
                <dd className="text-sm font-medium text-slate-700 leading-relaxed">
                  {BUSINESS_INFO.establishedPlaceholder}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-500 mb-1">
                  Quick Store Enquiry
                </dt>
                <dd className="flex flex-wrap items-center gap-4 text-sm font-semibold">
                  <a
                    href={BUSINESS_INFO.phoneHref}
                    className="inline-flex items-center gap-1.5 text-navy-900 hover:text-amber-700 transition-colors font-mono tabular-nums"
                  >
                    <Phone className="w-4 h-4 text-amber-600" aria-hidden="true" />
                    <span>{BUSINESS_INFO.phoneRaw}</span>
                  </a>
                  <a
                    href="#contact"
                    className="inline-flex items-center gap-1.5 text-navy-900 hover:text-amber-700 transition-colors"
                  >
                    <MapPin className="w-4 h-4 text-amber-600" aria-hidden="true" />
                    <span>Find Us on Map</span>
                  </a>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
