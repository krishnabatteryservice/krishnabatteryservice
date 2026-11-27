export type GalleryCategory =
  | 'showroom'
  | 'automotive'
  | 'home-inverter'
  | 'service';

export type GalleryFilter = 'all' | GalleryCategory;

export interface GalleryMediaItem {
  id: string;
  category: GalleryCategory;
  categoryLabel: string;
  title: string;
  caption: string;
  src: string;
  alt: string;
  fit: 'cover' | 'contain';
}

export interface GalleryItemDraft {
  category: GalleryCategory;
  title: string;
  caption: string;
  src: string;
  fit: 'cover' | 'contain';
}

export const MAX_GALLERY_PHOTOS = 1000;
export const MAX_GALLERY_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB per photo
export const GALLERY_PAGE_SIZE = 12;

export const GALLERY_CATEGORY_LABELS: Record<GalleryCategory, string> = {
  showroom: 'Showroom',
  automotive: 'Automotive',
  'home-inverter': 'Home Inverter',
  service: 'Testing & Setup',
};

/**
 * Filters gallery media items cleanly by category tab.
 */
export function filterGalleryItems(
  items: readonly GalleryMediaItem[],
  filter: GalleryFilter,
): GalleryMediaItem[] {
  if (filter === 'all') {
    return [...items];
  }
  return items.filter((item) => item.category === filter);
}

/**
 * Slices a filtered gallery list for progressive "Load More" rendering.
 */
export function paginateGalleryItems(
  items: readonly GalleryMediaItem[],
  visibleCount: number,
): {
  visibleItems: GalleryMediaItem[];
  remainingCount: number;
  hasMore: boolean;
} {
  const safeCount = Math.max(1, visibleCount);
  const visibleItems = items.slice(0, safeCount);
  const remainingCount = Math.max(0, items.length - visibleItems.length);
  return {
    visibleItems,
    remainingCount,
    hasMore: remainingCount > 0,
  };
}

/**
 * Converts a photo filename into a clean display title for bulk uploads.
 */
export function formatPhotoTitleFromFilename(filename: string): string {
  const base = filename
    .replace(/\.[^.]+$/, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (base.length < 2) {
    return 'Showroom Photo';
  }
  return base
    .split(' ')
    .map((word) =>
      word.length > 0 ? word[0].toUpperCase() + word.slice(1) : '',
    )
    .join(' ')
    .slice(0, 72);
}

/**
 * Checks whether incoming gallery photos fit within the configured maximum limit.
 */
export function canAddGalleryPhotos(
  currentCount: number,
  incomingCount: number,
  maxLimit: number = MAX_GALLERY_PHOTOS,
): {allowed: boolean; remainingSlots: number; error?: string} {
  const remainingSlots = Math.max(0, maxLimit - currentCount);
  if (incomingCount <= 0) {
    return {allowed: false, remainingSlots, error: 'Select at least one photo.'};
  }
  if (currentCount + incomingCount > maxLimit) {
    return {
      allowed: false,
      remainingSlots,
      error:
        remainingSlots === 0
          ? `Gallery has reached the ${maxLimit.toLocaleString()} photo maximum.`
          : `Only ${remainingSlots.toLocaleString()} photo slots remaining (maximum ${maxLimit.toLocaleString()}).`,
    };
  }
  return {allowed: true, remainingSlots: remainingSlots - incomingCount};
}

/**
 * Computes next or previous index in a circular lightbox carousel.
 */
export function stepLightboxIndex(
  currentIndex: number,
  direction: 'prev' | 'next',
  total: number,
): number {
  if (total <= 0) return -1;
  if (direction === 'next') {
    return (currentIndex + 1) % total;
  }
  return (currentIndex - 1 + total) % total;
}

/**
 * Generates a unique slug ID for newly added gallery media.
 */
export function generateGalleryItemId(
  title: string,
  timestamp: number = Date.now(),
  indexSuffix: number = 0,
): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32);
  const suffix = indexSuffix > 0 ? `-${indexSuffix}` : '';
  return `gallery-${slug || 'photo'}-${timestamp.toString(36)}${suffix}`;
}

/**
 * Validates a gallery media draft strictly before adding it.
 */
export function validateGalleryDraft(draft: GalleryItemDraft): {
  valid: boolean;
  errors: {title?: string; src?: string};
} {
  const errors: {title?: string; src?: string} = {};
  if (draft.title.trim().length < 2) {
    errors.title = 'Enter a photo title (at least 2 characters).';
  }
  const src = draft.src.trim();
  const isAllowedSrc =
    src.startsWith('/') ||
    src.startsWith('data:image/') ||
    /^https?:\/\//i.test(src);
  if (!src || !isAllowedSrc) {
    errors.src = 'Upload a photo or select a valid image path.';
  }
  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
