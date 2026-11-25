import type {CatalogCategory, CatalogItem} from '../data/businessConfig';

export type CatalogFilter = 'all' | CatalogCategory;

export type EnquiryCategory =
  | 'Car Battery'
  | 'Two-Wheeler Battery'
  | 'Home Inverter Battery'
  | 'Inverter & Battery Combo'
  | 'Battery Check / Other';

export interface EnquiryFormInput {
  name: string;
  phone: string;
  category: EnquiryCategory | '';
  modelOrRequirement: string;
  area: string;
  message: string;
}

export interface ValidatedEnquiry {
  referenceId: string;
  name: string;
  phone: string;
  formattedPhone: string;
  category: EnquiryCategory;
  modelOrRequirement: string;
  area: string;
  message: string;
  submittedAt: string;
}

export interface EnquiryValidationErrors {
  name?: string;
  phone?: string;
  category?: string;
}

export interface EnquiryValidationResult {
  valid: boolean;
  errors: EnquiryValidationErrors;
  normalizedPhone: string;
}

/**
 * Strips non-digit characters and extracts a 10-digit Indian mobile number
 * when prefixed with +91, 91, or a leading 0.
 */
export function normalizeIndianPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits.slice(2);
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    return digits.slice(1);
  }
  return digits;
}

/**
 * Formats a valid 10-digit Indian mobile number as "+91 XXXXX XXXXX".
 */
export function formatIndianPhone(raw: string): string {
  const normalized = normalizeIndianPhone(raw);
  if (normalized.length !== 10) {
    return raw.trim();
  }
  return `+91 ${normalized.slice(0, 5)} ${normalized.slice(5)}`;
}

/**
 * Validates customer enquiry fields strictly without substituting defaults.
 */
export function validateEnquiryForm(
  input: EnquiryFormInput,
): EnquiryValidationResult {
  const errors: EnquiryValidationErrors = {};
  const trimmedName = input.name.trim();
  const normalizedPhone = normalizeIndianPhone(input.phone);

  if (trimmedName.length < 2) {
    errors.name = 'Please enter your name (at least 2 characters).';
  }

  if (!/^[6-9]\d{9}$/.test(normalizedPhone)) {
    errors.phone =
      'Please enter a valid 10-digit Indian mobile number (e.g. 9876543210).';
  }

  if (!input.category) {
    errors.category = 'Please select the type of battery or service you need.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    normalizedPhone,
  };
}

/**
 * Generates a readable shop enquiry reference code: KBS-YYYYMMDD-XXXX.
 */
export function generateEnquiryRef(now: Date = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const suffix = String(
    (now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()) % 10000,
  ).padStart(4, '0');
  return `KBS-${year}${month}${day}-${suffix}`;
}

/**
 * Builds a properly URL-encoded WhatsApp deep link.
 */
export function buildWhatsAppUrl(
  whatsappNumber: string,
  message: string,
): string {
  const cleanNumber = whatsappNumber.replace(/\D/g, '');
  const encoded = encodeURIComponent(message.trim());
  return `https://wa.me/${cleanNumber}?text=${encoded}`;
}

/**
 * Builds a clean WhatsApp message summary from a validated enquiry.
 */
export function buildEnquiryWhatsAppMessage(enquiry: ValidatedEnquiry): string {
  const lines = [
    `Hello Krishna Battery Service,`,
    `New Website Enquiry (${enquiry.referenceId})`,
    `Name: ${enquiry.name}`,
    `Mobile: ${enquiry.formattedPhone}`,
    `Requirement: ${enquiry.category}`,
  ];

  if (enquiry.modelOrRequirement.trim()) {
    lines.push(`Vehicle / Inverter Details: ${enquiry.modelOrRequirement.trim()}`);
  }
  if (enquiry.area.trim()) {
    lines.push(`Location: ${enquiry.area.trim()}`);
  }
  if (enquiry.message.trim()) {
    lines.push(`Notes: ${enquiry.message.trim()}`);
  }

  return lines.join('\n');
}

/**
 * Filters catalog items deterministically by category tab.
 */
export function filterCatalogItems(
  items: readonly CatalogItem[],
  filter: CatalogFilter,
): CatalogItem[] {
  if (filter === 'all') {
    return [...items];
  }
  return items.filter((item) => item.category === filter);
}
