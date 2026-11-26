import test from 'node:test';
import assert from 'node:assert/strict';
import {CATALOG_ITEMS, IMAGES} from '../data/businessConfig';
import {
  addBatteryItem,
  buildBatteryItemFromDraft,
  createEmptyBatteryDraft,
  filterAndSearchBatteries,
  generateBatteryItemId,
  isManageModeFromSearch,
  itemToBatteryDraft,
  mapCatalogItemToEnquiryCategory,
  parseStoredCatalog,
  removeBatteryItem,
  updateBatteryItem,
  validateBatteryDraft,
} from './catalogManager';

test('validateBatteryDraft rejects empty required fields with clear errors', () => {
  const empty = createEmptyBatteryDraft(IMAGES.carTwoWheeler);
  const result = validateBatteryDraft(empty);
  assert.equal(result.valid, false);
  assert.ok(result.errors.title);
  assert.ok(result.errors.brandSlot);
  assert.ok(result.errors.specPlaceholder);
});

test('validateBatteryDraft accepts valid custom battery entry', () => {
  const result = validateBatteryDraft({
    category: 'car-battery',
    categoryLabel: 'Car Battery',
    title: 'Amaron Flo 42B20L',
    brandSlot: 'Amaron',
    specPlaceholder: '35Ah · 12V · Hatchback Petrol',
    pricePlaceholder: '₹5,200 (with exchange)',
    warrantyPlaceholder: '48 Months',
    summary: 'Zero-maintenance car battery for daily city driving.',
    image: IMAGES.carTwoWheeler,
  });
  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, {});
});

test('addBatteryItem, updateBatteryItem, and removeBatteryItem update list immutably', () => {
  const draft = {
    category: 'home-inverter' as const,
    categoryLabel: 'Tall Tubular Inverter Battery',
    title: 'Amaron Current 150Ah Tubular',
    brandSlot: 'Amaron',
    specPlaceholder: '150Ah · 12V · Tall Tubular',
    pricePlaceholder: 'Price on Enquiry',
    warrantyPlaceholder: 'Confirm at Store',
    summary: 'Deep-cycle home backup battery.',
    image: IMAGES.homeInverter,
  };

  const id = generateBatteryItemId(draft.title, 1700000000000);
  const created = buildBatteryItemFromDraft(draft, id, IMAGES.homeInverter);

  const added = addBatteryItem(CATALOG_ITEMS, created);
  assert.equal(added.length, CATALOG_ITEMS.length + 1);
  assert.equal(added[added.length - 1].title, 'Amaron Current 150Ah Tubular');
  assert.match(added[added.length - 1].whatsappPrompt, /Amaron Current 150Ah Tubular/);

  const editedDraft = {
    ...itemToBatteryDraft(created),
    pricePlaceholder: '₹14,500',
  };
  const updatedItem = buildBatteryItemFromDraft(
    editedDraft,
    id,
    IMAGES.homeInverter,
  );
  const updated = updateBatteryItem(added, id, updatedItem);
  assert.equal(updated.length, added.length);
  assert.equal(
    updated.find((item) => item.id === id)?.pricePlaceholder,
    '₹14,500',
  );

  const removed = removeBatteryItem(updated, id);
  assert.equal(removed.length, CATALOG_ITEMS.length);
  assert.equal(removed.find((item) => item.id === id), undefined);
});

test('filterAndSearchBatteries combines category tabs and search text accurately', () => {
  const inverterItems = filterAndSearchBatteries(
    CATALOG_ITEMS,
    'home-inverter',
    '',
  );
  assert.ok(inverterItems.length >= 1);
  assert.ok(inverterItems.every((item) => item.category === 'home-inverter'));

  const twoWheelerMatches = filterAndSearchBatteries(
    CATALOG_ITEMS,
    'all',
    'two-wheeler',
  );
  assert.ok(twoWheelerMatches.length >= 1);
  assert.ok(
    twoWheelerMatches.some((item) =>
      `${item.title} ${item.categoryLabel}`.toLowerCase().includes('two-wheeler'),
    ),
  );
});

test('mapCatalogItemToEnquiryCategory maps car, bike, inverter, and combo items cleanly', () => {
  assert.equal(
    mapCatalogItemToEnquiryCategory({
      category: 'two-wheeler-battery',
      categoryLabel: 'Two-Wheeler Battery',
      title: 'Scooter & Bike 12V Battery',
    }),
    'Two-Wheeler Battery',
  );
  assert.equal(
    mapCatalogItemToEnquiryCategory({
      category: 'car-battery',
      categoryLabel: 'Car Battery',
      title: 'Hatchback & Sedan Starter Battery',
    }),
    'Car Battery',
  );
  assert.equal(
    mapCatalogItemToEnquiryCategory({
      category: 'home-inverter',
      categoryLabel: 'Tall Tubular Inverter Battery',
      title: '150Ah Tall Tubular',
    }),
    'Home Inverter Battery',
  );
  assert.equal(
    mapCatalogItemToEnquiryCategory({
      category: 'solutions-services',
      categoryLabel: 'Inverter & Battery Combo',
      title: 'Home Power Backup Combo',
    }),
    'Inverter & Battery Combo',
  );
});

test('parseStoredCatalog handles valid JSON, legacy migration, empty list, and corrupt data safely', () => {
  assert.equal(parseStoredCatalog(null, CATALOG_ITEMS).length, CATALOG_ITEMS.length);
  assert.equal(parseStoredCatalog('not-json', CATALOG_ITEMS).length, CATALOG_ITEMS.length);
  assert.equal(parseStoredCatalog('[]', CATALOG_ITEMS).length, 0);

  const legacySerialized = JSON.stringify([
    {
      ...CATALOG_ITEMS[0],
      id: 'legacy-car',
      category: 'car-two-wheeler',
      categoryLabel: 'Car Battery',
      title: 'Swift Car Battery',
    },
    {
      ...CATALOG_ITEMS[2],
      id: 'legacy-bike',
      category: 'car-two-wheeler',
      categoryLabel: 'Two-Wheeler Battery',
      title: 'Activa Scooter Battery',
    },
  ]);
  const migrated = parseStoredCatalog(legacySerialized, CATALOG_ITEMS);
  assert.equal(migrated.length, 2);
  assert.equal(migrated[0].category, 'car-battery');
  assert.equal(migrated[1].category, 'two-wheeler-battery');
});

test('isManageModeFromSearch stays disabled for public URLs and enables for manage query param', () => {
  assert.equal(isManageModeFromSearch(''), false);
  assert.equal(isManageModeFromSearch('?utm_source=maps'), false);
  assert.equal(isManageModeFromSearch('?manage=0'), false);
  assert.equal(isManageModeFromSearch('?manage=1'), true);
  assert.equal(isManageModeFromSearch('?manage=true'), true);
  assert.equal(isManageModeFromSearch('?edit=1'), true);
});
