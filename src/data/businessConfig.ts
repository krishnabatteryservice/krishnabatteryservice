import productsData from './products.json';

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

export const CATALOG_ITEMS: CatalogItem[] = productsData as CatalogItem[];

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
