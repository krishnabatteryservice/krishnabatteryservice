import {motion} from 'motion/react';
import {MapPin, MessageCircle, Phone} from 'lucide-react';
import {BUSINESS_INFO} from '../data/businessConfig';
import {buildWhatsAppUrl} from '../utils/enquiry';
import {ResilientImage} from './ResilientImage';

export function HeroSection() {
  const heroWhatsAppUrl = buildWhatsAppUrl(
    BUSINESS_INFO.whatsappNumber,
    'Hello Krishna Battery Service, I would like to enquire about automobile or home inverter batteries.',
  );

  return (
    <section
      id="top"
      className="bg-navy-900 text-white border-b border-navy-800"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-12 lg:pt-16 lg:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
          {/* Left column: Value proposition and primary contact actions */}
          <motion.div
            initial={{opacity: 0, y: 14}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.35, ease: [0.16, 1, 0.3, 1]}}
            className="lg:col-span-6 flex flex-col justify-center"
          >
            <p className="text-sm font-medium text-amber-400 tracking-wide mb-4">
              Madhananthapuram, Mugalivakkam · Chennai 600125
            </p>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.25rem] font-bold tracking-tight text-white leading-[1.1] mb-5">
              Automobile &amp; Home Inverter Batteries in Mugalivakkam
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl mb-8">
              Krishna Battery Service is your dedicated local retail shop on
              Madha Nagar Main Road for car batteries, two-wheeler batteries,
              home inverter batteries, and complete home power backup solutions.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 mb-6">
              <a
                href={BUSINESS_INFO.phoneHref}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-base font-semibold text-navy-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <Phone className="w-5 h-5" aria-hidden="true" />
                <span>Call Now · {BUSINESS_INFO.phoneRaw}</span>
              </a>

              <a
                href={heroWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-base font-semibold text-white bg-emerald-700 hover:bg-emerald-600 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <MessageCircle className="w-5 h-5" aria-hidden="true" />
                <span>WhatsApp Enquiry</span>
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-300">
              <a
                href="#contact"
                className="inline-flex items-center gap-1.5 text-slate-200 hover:text-amber-400 transition-colors font-medium"
              >
                <MapPin className="w-4 h-4 text-amber-400" aria-hidden="true" />
                <span>View Shop Location &amp; Map</span>
              </a>
            </div>
          </motion.div>

          {/* Right column: Studio automotive & inverter battery hero visual */}
          <motion.div
            initial={{opacity: 0, y: 14}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.4, delay: 0.08, ease: [0.16, 1, 0.3, 1]}}
            className="lg:col-span-6 flex"
          >
            <div className="relative w-full min-h-[260px] sm:min-h-[340px] lg:min-h-[420px] rounded-xl overflow-hidden border border-navy-700 bg-navy-950">
              <ResilientImage
                src="/assets/aistudio/WhatsApp_Image_2026-11-25_at_4.30.02_PM_cfa250ca.jpeg"
                alt="Illuminated Amaron battery retail display wall showcasing automotive and inverter batteries"
                fallbackLabel="Amaron Automobile & Home Inverter Batteries"
                loading="eager"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-950/95 via-navy-950/55 to-transparent p-5 sm:p-6">
                <p className="text-xs font-medium text-amber-400 mb-1">
                  Car Batteries · Two-Wheeler Batteries · Home Inverter Batteries
                </p>
                <p className="text-sm text-slate-200">
                  Walk in or call ahead to check fitment compatibility and stock
                  availability at our Madhananthapuram showroom.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Full-width factual retail strip directly beneath the split */}
        <div className="mt-10 pt-8 border-t border-navy-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <p className="text-xs font-medium text-slate-400 mb-1">
              Retail Specialisation
            </p>
            <p className="text-sm font-semibold text-white">
              Automobile &amp; Home Inverter Batteries
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 mb-1">
              Direct Shop Mobile
            </p>
            <a
              href={BUSINESS_INFO.phoneHref}
              className="text-sm font-semibold text-amber-400 hover:text-amber-300 transition-colors font-mono tabular-nums"
            >
              {BUSINESS_INFO.phoneDisplay}
            </a>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 mb-1">
              Store Location
            </p>
            <p className="text-sm font-semibold text-white">
              No. 21, Madha Nagar Main Rd, Mugalivakkam
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 mb-1">
              Service Locality
            </p>
            <p className="text-sm font-semibold text-white">
              Madhananthapuram, Mugalivakkam &amp; Chennai
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
