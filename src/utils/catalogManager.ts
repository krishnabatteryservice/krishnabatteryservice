import type {CatalogCategory, CatalogItem} from '../data/businessConfig';
import type {CatalogFilter, EnquiryCategory} from './enquiry';

export const CATALOG_STORAGE_KEY = 'kbs_battery_catalog_v1';

export interface BatteryProductDraft {
  category: CatalogCategory;
  categoryLabel: string;
  title: string;
  brandSlot: string;
  specPlaceholder: string;
  pricePlaceholder: string;
  warrantyPlaceholder: string;
  summary: string;
  image: string;
}

export interface BatteryDraftErrors {
  title?: string;
  category?: string;
  brandSlot?: string;
  specPlaceholder?: string;
}

export interface BatteryDraftValidationResult {
  valid: boolean;
  errors: BatteryDraftErrors;
}

export interface PresetBatteryImage {
  id: string;
  label: string;
  src: string;
}

export const CATEGORY_DEFAULT_LABELS: Record<CatalogCategory, string> = {
  'car-battery': 'Car Battery',
  'two-wheeler-battery': 'Two-Wheeler Battery',
  'home-inverter': 'Home Inverter Battery',
  'solutions-services': 'Inverter Combo & Service',
};

export const CATEGORY_LABEL_OPTIONS: Record<CatalogCategory, string[]> = {
  'car-battery': [
    'Car Battery',
    'SUV / Commercial Battery',
    'Hatchback / Sedan Battery',
  ],
  'two-wheeler-battery': [
    'Two-Wheeler Battery',
    'Scooter Battery',
    'Motorcycle Battery',
  ],
  'home-inverter': [
    'Tall Tubular Inverter Battery',
    'Flat-Plate Inverter Battery',
    'Home Inverter Battery',
  ],
  'solutions-services': [
    'Inverter & Battery Combo',
    'Battery Testing & Fitment',
    'Charging & Jump-Start Service',
  ],
};

/**
 * Creates a clean empty draft for adding a new battery listing.
 */
export function createEmptyBatteryDraft(defaultImage: string): BatteryProductDraft {
  return {
    category: 'car-battery',
    categoryLabel: 'Car Battery',
    title: '',
    brandSlot: '',
    specPlaceholder: '',
    pricePlaceholder: '',
    warrantyPlaceholder: '',
    summary: '',
    image: defaultImage,
  };
}

/**
 * Converts an existing CatalogItem into an editable form draft.
 */
export function itemToBatteryDraft(item: CatalogItem): BatteryProductDraft {
  return {
    category: item.category,
    categoryLabel: item.categoryLabel,
    title: item.title,
    brandSlot: item.brandSlot,
    specPlaceholder: item.specPlaceholder,
    pricePlaceholder: item.pricePlaceholder,
    warrantyPlaceholder: item.warrantyPlaceholder,
    summary: item.summary,
    image: item.image,
  };
}

/**
 * Strictly validates a battery listing draft without silently substituting missing required values.
 */
export function validateBatteryDraft(
  draft: BatteryProductDraft,
): BatteryDraftValidationResult {
  const errors: BatteryDraftErrors = {};

  if (draft.title.trim().length < 2) {
    errors.title = 'Enter a battery name or model (at least 2 characters).';
  }

  if (
    draft.category !== 'car-battery' &&
    draft.category !== 'two-wheeler-battery' &&
    draft.category !== 'home-inverter' &&
    draft.category !== 'solutions-services'
  ) {
    errors.category = 'Select a valid battery category.';
  }

  if (draft.brandSlot.trim().length < 2) {
    errors.brandSlot = 'Enter the brand name (or an editable brand note).';
  }

  if (draft.specPlaceholder.trim().length < 2) {
    errors.specPlaceholder = 'Enter capacity or key specifications (e.g. 35Ah, 12V).';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Generates a clean WhatsApp enquiry prompt tailored to a specific battery product.
 */
export function buildProductWhatsAppPrompt(item: {
  title: string;
  brandSlot: string;
  specPlaceholder: string;
}): string {
  const parts = [`Hello Krishna Battery Service, I am interested in "${item.title.trim()}"`];
  if (item.brandSlot.trim()) {
    parts.push(`Brand: ${item.brandSlot.trim()}`);
  }
  if (item.specPlaceholder.trim()) {
    parts.push(`Specs: ${item.specPlaceholder.trim()}`);
  }
  return `${parts.join(' · ')}. Please share current availability and pricing.`;
}

/**
 * Maps a CatalogItem to the closest Contact EnquiryForm category.
 */
export function mapCatalogItemToEnquiryCategory(
  item: Pick<CatalogItem, 'category' | 'categoryLabel' | 'title'>,
): EnquiryCategory {
  const combined = `${item.categoryLabel} ${item.title}`.toLowerCase();
  if (item.category === 'two-wheeler-battery') {
    return 'Two-Wheeler Battery';
  }
  if (item.category === 'car-battery') {
    return 'Car Battery';
  }
  if (item.category === 'home-inverter') {
    return 'Home Inverter Battery';
  }
  if (combined.includes('combo') || combined.includes('inverter')) {
    return 'Inverter & Battery Combo';
  }
  return 'Battery Check / Other';
}

/**
 * Generates a unique slug-based ID for newly added battery listings.
 */
export function generateBatteryItemId(title: string, timestamp: number = Date.now()): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32);
  return `battery-${slug || 'item'}-${timestamp.toString(36)}`;
}

/**
 * Builds a complete CatalogItem from a validated draft.
 */
export function buildBatteryItemFromDraft(
  draft: BatteryProductDraft,
  id: string,
  fallbackImage: string,
): CatalogItem {
  const title = draft.title.trim();
  const brandSlot = draft.brandSlot.trim();
  const specPlaceholder = draft.specPlaceholder.trim();
  const categoryLabel =
    draft.categoryLabel.trim() || CATEGORY_DEFAULT_LABELS[draft.category];
  const pricePlaceholder =
    draft.pricePlaceholder.trim() || 'Price on Enquiry';
  const warrantyPlaceholder =
    draft.warrantyPlaceholder.trim() || 'Confirm Warranty at Store';
  const summary =
    draft.summary.trim() ||
    `${categoryLabel} available at Krishna Battery Service, Mugalivakkam. Call or WhatsApp for fitment confirmation.`;
  const image = draft.image.trim() || fallbackImage;

  return {
    id,
    category: draft.category,
    categoryLabel,
    title,
    summary,
    specPlaceholder,
    brandSlot,
    pricePlaceholder,
    warrantyPlaceholder,
    image,
    imageAlt: `${title} — ${categoryLabel}`,
    whatsappPrompt: buildProductWhatsAppPrompt({
      title,
      brandSlot,
      specPlaceholder,
    }),
  };
}

/**
 * Appends a new battery item to the catalog list immutably.
 */
export function addBatteryItem(
  items: readonly CatalogItem[],
  newItem: CatalogItem,
): CatalogItem[] {
  return [...items, newItem];
}

/**
 * Updates a single battery item by ID immutably.
 */
export function updateBatteryItem(
  items: readonly CatalogItem[],
  id: string,
  updatedItem: CatalogItem,
): CatalogItem[] {
  return items.map((item) => (item.id === id ? updatedItem : item));
}

/**
 * Removes a battery item by ID immutably.
 */
export function removeBatteryItem(
  items: readonly CatalogItem[],
  id: string,
): CatalogItem[] {
  return items.filter((item) => item.id !== id);
}

/**
 * Filters battery listings by category tab and optional search text.
 */
export function filterAndSearchBatteries(
  items: readonly CatalogItem[],
  filter: CatalogFilter,
  query: string,
): CatalogItem[] {
  const byCategory =
    filter === 'all'
      ? [...items]
      : items.filter((item) => item.category === filter);

  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return byCategory;
  }

  return byCategory.filter((item) => {
    const haystack = [
      item.title,
      item.categoryLabel,
      item.brandSlot,
      item.specPlaceholder,
      item.summary,
      item.pricePlaceholder,
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(normalizedQuery);
  });
}

/**
 * Migrates legacy category slugs (such as 'car-two-wheeler') into separate
 * 'car-battery' and 'two-wheeler-battery' categories.
 */
function normalizeStoredCategory(
  rawCategory: unknown,
  categoryLabel: string,
  title: string,
): CatalogCategory | null {
  if (
    rawCategory === 'car-battery' ||
    rawCategory === 'two-wheeler-battery' ||
    rawCategory === 'home-inverter' ||
    rawCategory === 'solutions-services'
  ) {
    return rawCategory;
  }
  if (rawCategory === 'car-two-wheeler') {
    const combined = `${categoryLabel} ${title}`.toLowerCase();
    if (
      combined.includes('two-wheeler') ||
      combined.includes('two wheeler') ||
      combined.includes('scooter') ||
      combined.includes('motorcycle') ||
      combined.includes('bike')
    ) {
      return 'two-wheeler-battery';
    }
    return 'car-battery';
  }
  return null;
}

/**
 * Parses persisted catalog JSON safely, migrating legacy category slugs and
 * falling back to defaults if invalid.
 */
export function parseStoredCatalog(
  raw: string | null,
  fallback: readonly CatalogItem[],
): CatalogItem[] {
  if (!raw) {
    return [...fallback];
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [...fallback];
    }
    const validItems: CatalogItem[] = [];
    for (const entry of parsed) {
      if (
        typeof entry !== 'object' ||
        entry === null ||
        typeof (entry as CatalogItem).id !== 'string' ||
        typeof (entry as CatalogItem).title !== 'string'
      ) {
        continue;
      }
      const item = entry as CatalogItem;
      const normalizedCategory = normalizeStoredCategory(
        (item as {category: unknown}).category,
        item.categoryLabel ?? '',
        item.title,
      );
      if (!normalizedCategory) {
        continue;
      }
      validItems.push({
        ...item,
        category: normalizedCategory,
      });
    }
    return validItems;
  } catch {
    return [...fallback];
  }
}
