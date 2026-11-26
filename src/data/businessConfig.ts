export type CatalogCategory =
  | 'car-battery'
  | 'two-wheeler-battery'
  | 'home-inverter'
  | 'solutions-services';

export interface CatalogItem {
  id: string;
  category: CatalogCategory;
  categoryLabel: string;
  title: string;
  summary: string;
  specPlaceholder: string;
  brandSlot: string;
  pricePlaceholder: string;
  warrantyPlaceholder: string;
  image: string;
  imageAlt: string;
  whatsappPrompt: string;
}

export interface WhyChoosePoint {
  number: string;
  title: string;
  description: string;
}

export interface TestimonialPlaceholder {
  id: string;
  slotLabel: string;
  quotePlaceholder: string;
  customerNamePlaceholder: string;
  contextPlaceholder: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export const IMAGES = {
  heroShowcase: '/src/assets/images/hero_amaron_batteries_1795603793986.jpg',
  carTwoWheeler:
    '/src/assets/images/car_two_wheeler_battery_1795588431694.jpg',
  homeInverter: '/src/assets/images/home_inverter_battery_1795588432641.jpg',
  testingService:
    '/src/assets/images/battery_testing_service_1795588434084.jpg',
  backupSolutions:
    '/src/assets/images/inverter_backup_solutions_1795588434517.jpg',
} as const;

export const BUSINESS_INFO = {
  name: 'Krishna Battery Service',
  category: 'Automobile Battery & Home Inverter Battery Retail Shop',
  phoneRaw: '7904055290',
  phoneHref: 'tel:+917904055290',
  phoneDisplay: '+91 79040 55290',
  whatsappNumber: '917904055290',
  addressLine1: 'No. 21, Madha Nagar Main Road',
  addressLine2: 'Madhananthapuram, Mugalivakkam',
  cityStatePin: 'Chennai - 600125, Tamil Nadu, India',
  fullAddress:
    'No. 21, Madha Nagar Main Road, Madhananthapuram, Mugalivakkam, Chennai - 600125, Tamil Nadu, India',
  mapSearchQuery:
    'No. 21, Madha Nagar Main Road, Madhananthapuram, Mugalivakkam, Chennai 600125, Tamil Nadu, India',
  googleMapsDirectionsUrl:
    'https://www.google.com/maps/search/?api=1&query=No.+21,+Madha+Nagar+Main+Road,+Madhananthapuram,+Mugalivakkam,+Chennai+600125,+Tamil+Nadu,+India',
  // Editable placeholders for store-specific operational details
  hoursPlaceholder: 'Mon – Sat: 9:00 AM – 9:00 PM · Sunday: Holiday',
  emailPlaceholder: '[Editable: Add Business Email Address if Available]',
  establishedPlaceholder: 'Established in 2022',
  nearbyAreas: [
    'Mugalivakkam',
    'Madhananthapuram',
    'Porur',
    'Ramapuram',
    'Gerugambakkam',
    'Manapakkam',
  ],
} as const;

export const CATALOG_ITEMS: CatalogItem[] = [
  {
    id: 'car-battery-hatchback-sedan',
    category: 'car-battery',
    categoryLabel: 'Car Battery',
    title: 'Car Starter Battery — Hatchback & Sedan',
    summary:
      'Model-matched 12V starter batteries for petrol and diesel hatchbacks and sedans with terminal layout verification at our Mugalivakkam counter.',
    specPlaceholder: '[Editable: e.g. 35Ah – 45Ah · 12V · JIS / DIN Range]',
    brandSlot: 'Amaron (Editable: Add other stocked brands)',
    pricePlaceholder: 'Price on Enquiry — [Editable Price]',
    warrantyPlaceholder: '[Editable: Manufacturer Warranty Terms]',
    image: IMAGES.carTwoWheeler,
    imageAlt:
      'Automotive car starter battery for hatchback and sedan vehicles',
    whatsappPrompt:
      'Hello Krishna Battery Service, I am looking for a Hatchback / Sedan Car Battery. Please share available models and pricing.',
  },
  {
    id: 'car-battery-suv-diesel',
    category: 'car-battery',
    categoryLabel: 'SUV / Commercial Battery',
    title: 'Heavy-Duty Car & SUV Battery',
    summary:
      'Higher cranking-power automotive batteries suited for SUVs, MUVs, diesel engines, and commercial vehicles.',
    specPlaceholder: '[Editable: e.g. 60Ah – 80Ah · 12V · High-Crank]',
    brandSlot: 'Amaron (Editable: Add other stocked brands)',
    pricePlaceholder: 'Price on Enquiry — [Editable Price]',
    warrantyPlaceholder: '[Editable: Manufacturer Warranty Terms]',
    image:
      '/assets/aistudio/WhatsApp_Image_2026-11-25_at_4.30.01_PM__2__efa6172b.jpeg',
    imageAlt:
      'Amaron automotive and heavy-duty SUV battery range chart',
    whatsappPrompt:
      'Hello Krishna Battery Service, I am looking for an SUV / Heavy-Duty Car Battery. Please share compatible models and pricing.',
  },
  {
    id: 'two-wheeler-battery',
    category: 'two-wheeler-battery',
    categoryLabel: 'Two-Wheeler Battery',
    title: 'Two-Wheeler Battery — Scooter & Motorcycle',
    summary:
      'Compact 12V starter batteries matched to popular scooters and motorcycles for dependable electric start.',
    specPlaceholder: '[Editable: e.g. 4Ah – 9Ah · 12V VRLA / AGM]',
    brandSlot: 'Amaron (Editable: Add other stocked brands)',
    pricePlaceholder: 'Price on Enquiry — [Editable Price]',
    warrantyPlaceholder: '[Editable: Manufacturer Warranty Terms]',
    image:
      '/assets/aistudio/WhatsApp_Image_2026-11-25_at_4.30.03_PM_545247eb.jpeg',
    imageAlt:
      'Two-wheeler motorcycle and scooter batteries displayed in showroom',
    whatsappPrompt:
      'Hello Krishna Battery Service, I am looking for a Two-Wheeler Scooter / Motorcycle Battery. Please share available options and pricing.',
  },
  {
    id: 'tall-tubular-inverter-battery',
    category: 'home-inverter',
    categoryLabel: 'Tall Tubular Inverter Battery',
    title: 'Tall Tubular Home Inverter Battery',
    summary:
      'Deep-cycle tall tubular backup battery built for steady household backup of lights, fans, and Wi-Fi during Chennai power cuts.',
    specPlaceholder: '[Editable: e.g. 150Ah / 180Ah / 200Ah · 12V Tall Tubular]',
    brandSlot: '[Editable: Add Stocked Inverter Battery Brand]',
    pricePlaceholder: 'Price on Enquiry — [Editable Price]',
    warrantyPlaceholder: '[Editable: Manufacturer Warranty Terms]',
    image: IMAGES.homeInverter,
    imageAlt:
      'Home inverter and tall tubular battery neatly housed in a ventilated trolley inside a modern hallway',
    whatsappPrompt:
      'Hello Krishna Battery Service, I am looking for a Tall Tubular Home Inverter Battery. Please share available models and pricing.',
  },
  {
    id: 'flat-plate-inverter-battery',
    category: 'home-inverter',
    categoryLabel: 'Flat-Plate Inverter Battery',
    title: 'Compact Flat-Plate Inverter Battery',
    summary:
      'Space-saving inverter battery option suited for apartments, compact utility corners, and everyday backup requirements.',
    specPlaceholder: '[Editable: e.g. 100Ah – 150Ah · 12V Flat-Plate]',
    brandSlot: '[Editable: Add Stocked Flat-Plate Battery Brand]',
    pricePlaceholder: 'Price on Enquiry — [Editable Price]',
    warrantyPlaceholder: '[Editable: Manufacturer Warranty Terms]',
    image: IMAGES.heroShowcase,
    imageAlt:
      'Home backup battery lineup for apartments and residential inverter units',
    whatsappPrompt:
      'Hello Krishna Battery Service, I am looking for a Compact Flat-Plate Home Inverter Battery. Please share available models and pricing.',
  },
  {
    id: 'inverter-battery-combo',
    category: 'solutions-services',
    categoryLabel: 'Inverter & Battery Combo',
    title: 'Complete Home Inverter & Battery Combo',
    summary:
      'Matched inverter unit and backup battery paired to your household load, plus in-store battery voltage testing and fitment guidance.',
    specPlaceholder: '[Editable: e.g. 900VA – 1500VA Inverter + 150Ah Battery]',
    brandSlot: '[Editable: Add Stocked Inverter & Battery Combo Brands]',
    pricePlaceholder: 'Price on Enquiry — [Editable Combo Price]',
    warrantyPlaceholder: '[Editable: Manufacturer Warranty Terms]',
    image: IMAGES.backupSolutions,
    imageAlt:
      'Neatly wired wall-mounted home inverter connected to dual backup batteries with heavy-duty cables',
    whatsappPrompt:
      'Hello Krishna Battery Service, I want guidance on a Complete Home Inverter & Battery Combo.',
  },
];

export const WHY_CHOOSE_POINTS: WhyChoosePoint[] = [
  {
    number: '01',
    title: 'Dedicated Battery Retail Focus',
    description:
      'Focused specifically on automobile starter batteries and home inverter backup systems rather than general mixed retail.',
  },
  {
    number: '02',
    title: 'Application-Matched Guidance',
    description:
      'Help selecting the right physical size, terminal layout, and capacity for your vehicle model or household backup load.',
  },
  {
    number: '03',
    title: 'Accessible Mugalivakkam Storefront',
    description:
      'Located directly on Madha Nagar Main Road in Madhananthapuram, convenient for residents across Mugalivakkam and nearby Chennai neighbourhoods.',
  },
  {
    number: '04',
    title: 'Direct Phone & WhatsApp Support',
    description:
      'Reach the shop directly on 7904055290 to confirm stock, discuss requirements, or plan your visit without call-centre delays.',
  },
  {
    number: '05',
    title: '[Editable Highlight Slot]',
    description:
      '[Editable: Add verified shop service highlights here—such as old battery exchange, doorstep fitment coverage, or payment options once confirmed.]',
  },
];

export const TESTIMONIAL_PLACEHOLDERS: TestimonialPlaceholder[] = [
  {
    id: 'review-slot-1',
    slotLabel: 'Verified Review Slot 01 · Car Battery',
    quotePlaceholder:
      '[Editable Customer Testimonial: Replace this slot with a verified customer review from Google Maps or direct store feedback for car battery purchase or fitment.]',
    customerNamePlaceholder: '[Customer Name]',
    contextPlaceholder: '[Vehicle Model · Area, e.g. Mugalivakkam]',
  },
  {
    id: 'review-slot-2',
    slotLabel: 'Verified Review Slot 02 · Home Inverter',
    quotePlaceholder:
      '[Editable Customer Testimonial: Replace this slot with a verified customer review describing home inverter or tubular battery consultation and setup.]',
    customerNamePlaceholder: '[Customer Name]',
    contextPlaceholder: '[Home Inverter Setup · Area, e.g. Madhananthapuram]',
  },
  {
    id: 'review-slot-3',
    slotLabel: 'Verified Review Slot 03 · Two-Wheeler',
    quotePlaceholder:
      '[Editable Customer Testimonial: Replace this slot with a verified customer review for two-wheeler battery replacement or testing support.]',
    customerNamePlaceholder: '[Customer Name]',
    contextPlaceholder: '[Two-Wheeler Model · Area, e.g. Chennai]',
  },
];

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'faq-location',
    question: 'Where is Krishna Battery Service located in Chennai?',
    answer:
      'Our retail shop is located at No. 21, Madha Nagar Main Road, Madhananthapuram, Mugalivakkam, Chennai - 600125, Tamil Nadu, India. You can use the interactive map in our Contact section to open turn-by-turn directions on Google Maps.',
  },
  {
    id: 'faq-types',
    question: 'What types of batteries can I enquire about at your shop?',
    answer:
      'We focus on automobile batteries for cars and two-wheelers (scooters and motorcycles), home inverter batteries, and complete home inverter and battery backup solutions.',
  },
  {
    id: 'faq-pricing-brands',
    question: 'How do I check available brands, warranty terms, and current prices?',
    answer:
      'Battery pricing and brand availability depend on the exact vehicle model or inverter capacity required. Call us directly at 7904055290 or tap the WhatsApp button to receive current stock details, manufacturer warranty information, and pricing.',
  },
  {
    id: 'faq-choosing-battery',
    question: 'What information should I share to get the right battery recommendation?',
    answer:
      'For cars or two-wheelers, share your vehicle make, model, fuel type (petrol/diesel), and current battery size if visible. For home inverters, share the number of fans, lights, routers, or appliances you want to run and the approximate backup duration needed.',
  },
  {
    id: 'faq-old-battery',
    question: 'Can I enquire about old battery exchange or testing?',
    answer:
      '[Editable: Confirm whether old battery exchange, testing, or doorstep installation is offered and update this answer accordingly. Customers can call 7904055290 to check current store service availability.]',
  },
  {
    id: 'faq-hours',
    question: 'What are your shop timings and best time to visit?',
    answer:
      'We are open Monday to Saturday from 9:00 AM to 9:00 PM (Sunday is a holiday). You can also call 7904055290 before visiting to confirm stock readiness.',
  },
];
