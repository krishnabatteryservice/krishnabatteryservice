import test from 'node:test';
import assert from 'node:assert/strict';
import gallerySeed from '../data/mediaGallery.json';
import {
  MAX_GALLERY_PHOTOS,
  canAddGalleryPhotos,
  filterGalleryItems,
  formatPhotoTitleFromFilename,
  generateGalleryItemId,
  paginateGalleryItems,
  stepLightboxIndex,
  validateGalleryDraft,
  type GalleryMediaItem,
} from './mediaGallery';

const DEFAULT_GALLERY = gallerySeed as GalleryMediaItem[];

test('filterGalleryItems filters by showroom, automotive, home-inverter, service, and all', () => {
  assert.equal(filterGalleryItems(DEFAULT_GALLERY, 'all').length, DEFAULT_GALLERY.length);

  const showroom = filterGalleryItems(DEFAULT_GALLERY, 'showroom');
  assert.ok(showroom.length >= 1);
  assert.ok(showroom.every((item) => item.category === 'showroom'));

  const automotive = filterGalleryItems(DEFAULT_GALLERY, 'automotive');
  assert.ok(automotive.length >= 1);
  assert.ok(automotive.every((item) => item.category === 'automotive'));
});

test('stepLightboxIndex wraps forward and backward cleanly', () => {
  assert.equal(stepLightboxIndex(0, 'next', 8), 1);
  assert.equal(stepLightboxIndex(7, 'next', 8), 0);
  assert.equal(stepLightboxIndex(0, 'prev', 8), 7);
  assert.equal(stepLightboxIndex(3, 'prev', 8), 2);
  assert.equal(stepLightboxIndex(0, 'next', 0), -1);
});

test('validateGalleryDraft rejects unsafe or missing fields and accepts valid uploads', () => {
  const bad = validateGalleryDraft({
    category: 'showroom',
    title: 'A',
    caption: '',
    src: 'javascript:alert(1)',
    fit: 'cover',
  });
  assert.equal(bad.valid, false);
  assert.ok(bad.errors.title);
  assert.ok(bad.errors.src);

  const good = validateGalleryDraft({
    category: 'automotive',
    title: 'Amaron Flo Fitment',
    caption: 'Installed at Mugalivakkam counter',
    src: '/assets/aistudio/sample.jpeg',
    fit: 'cover',
  });
  assert.equal(good.valid, true);
  assert.match(generateGalleryItemId('Amaron Flo Fitment', 1700000000000), /^gallery-amaron-flo-fitment-/);
});

test('paginateGalleryItems slices progressively and reports remaining count accurately', () => {
  const page1 = paginateGalleryItems(DEFAULT_GALLERY, 4);
  assert.equal(page1.visibleItems.length, 4);
  assert.equal(page1.remainingCount, DEFAULT_GALLERY.length - 4);
  assert.equal(page1.hasMore, true);

  const all = paginateGalleryItems(DEFAULT_GALLERY, 100);
  assert.equal(all.visibleItems.length, DEFAULT_GALLERY.length);
  assert.equal(all.remainingCount, 0);
  assert.equal(all.hasMore, false);
});

test('formatPhotoTitleFromFilename and canAddGalleryPhotos support high-capacity bulk uploads', () => {
  assert.equal(
    formatPhotoTitleFromFilename('amaron_pro_battery-04.jpeg'),
    'Amaron Pro Battery 04',
  );
  assert.equal(formatPhotoTitleFromFilename('a.png'), 'Showroom Photo');

  assert.equal(MAX_GALLERY_PHOTOS, 1000);
  assert.equal(canAddGalleryPhotos(10, 50).allowed, true);
  assert.equal(canAddGalleryPhotos(10, 50).remainingSlots, 940);

  const overflow = canAddGalleryPhotos(995, 10);
  assert.equal(overflow.allowed, false);
  assert.equal(overflow.remainingSlots, 5);
  assert.ok(overflow.error);
});
