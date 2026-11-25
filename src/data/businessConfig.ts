export type CatalogCategory =
  | 'car-two-wheeler'
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
  heroShowcase: '/src/assets/images/hero_battery_showcase_1795588429117.jpg',
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
  hoursPlaceholder: '[Editable: Add Shop Opening Hours, e.g. Mon–Sun, Timing]',
  emailPlaceholder: '[Editable: Add Business Email Address if Available]',
  establishedPlaceholder: '[Editable: Add Year Established or Store Milestone]',
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
    id: 'car-two-wheeler-battery',
    category: 'car-two-wheeler',
    categoryLabel: 'Automobile Batteries',
    title: 'Car & Two-Wheeler Starter Batteries',
    summary:
      'Replacement starter batteries for hatchbacks, sedans, SUVs, scooters, and motorcycles matched to your vehicle model and terminal layout.',
    specPlaceholder: '[Editable: Car Ah Sizes, DIN / JIS & 12V Two-Wheeler Range]',
    brandSlot: '[Editable: Add Stocked Car & Bike Battery Brands]',
    pricePlaceholder: 'Price on Enquiry — [Editable Price Range]',
    warrantyPlaceholder: '[Editable: Manufacturer Warranty Terms]',
    image: IMAGES.carTwoWheeler,
    imageAlt:
      'Automotive car starter battery and compact two-wheeler battery on a clean workshop surface',
    whatsappPrompt:
      'Hello Krishna Battery Service, I am looking for a car or two-wheeler battery. Please share available options and pricing.',
  },
  {
    id: 'home-inverter-battery',
    category: 'home-inverter',
    categoryLabel: 'Home Inverter Batteries',
    title: 'Tubular & Flat-Plate Inverter Batteries',
    summary:
      'Deep-cycle backup batteries designed for steady household power backup across apartments, independent houses, and home offices.',
    specPlaceholder: '[Editable: Available Ah Ratings, e.g. Tall / Short Tubular]',
    brandSlot: '[Editable: Add Stocked Inverter Battery Brands]',
    pricePlaceholder: 'Price on Enquiry — [Editable Price Range]',
    warrantyPlaceholder: '[Editable: Manufacturer Warranty Terms]',
    image: IMAGES.homeInverter,
    imageAlt:
      'Home inverter and tall tubular battery neatly housed in a ventilated trolley inside a modern hallway',
    whatsappPrompt:
      'Hello Krishna Battery Service, I am looking for a home inverter battery. Please share available models and pricing.',
  },
  {
    id: 'inverter-battery-combo',
    category: 'solutions-services',
    categoryLabel: 'Inverter & Battery Solutions',
    title: 'Complete Home Inverter & Battery Systems',
    summary:
      'Matched inverter unit and battery setups sized to your household lights, ceiling fans, Wi-Fi router, and essential appliance load.',
    specPlaceholder: '[Editable: VA Capacity Options & Single/Dual Battery Setups]',
    brandSlot: '[Editable: Add Available Inverter & Combo Brands]',
    pricePlaceholder: 'Price on Enquiry — [Editable Combo Price]',
    warrantyPlaceholder: '[Editable: Manufacturer Warranty Terms]',
    image: IMAGES.backupSolutions,
    imageAlt:
      'Neatly wired wall-mounted home inverter connected to dual backup batteries with heavy-duty cables',
    whatsappPrompt:
      'Hello Krishna Battery Service, I want guidance on a complete home inverter and battery setup.',
  },
  {
    id: 'battery-health-check',
    category: 'solutions-services',
    categoryLabel: 'Shop Services',
    title: 'Battery Voltage Testing & Fitment Support',
    summary:
      'In-store battery health inspection, terminal check, and model-matched replacement guidance before you purchase a new unit.',
    specPlaceholder: '[Editable: Add Testing / Fitment / Old Battery Exchange Details]',
    brandSlot: 'Applicable across car, two-wheeler & inverter batteries',
    pricePlaceholder: '[Editable: Confirm Service Charges at Store]',
    warrantyPlaceholder: '[Editable: Add Old Battery Exchange Policy if Offered]',
    image: IMAGES.testingService,
    imageAlt:
      'Technician checking an automobile battery under the hood using a digital voltage tester',
    whatsappPrompt:
      'Hello Krishna Battery Service, I would like to enquire about battery testing or replacement service.',
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
      '[Editable: Insert Krishna Battery Service opening and closing hours here.] You can also call 7904055290 before visiting to confirm stock readiness.',
  },
];
