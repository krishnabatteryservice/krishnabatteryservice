import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildEnquiryWhatsAppMessage,
  buildWhatsAppUrl,
  filterCatalogItems,
  formatIndianPhone,
  generateEnquiryRef,
  normalizeIndianPhone,
  validateEnquiryForm,
} from './enquiry';
import {CATALOG_ITEMS} from '../data/businessConfig';

test('normalizeIndianPhone handles plain, +91, 91, and 0-prefixed numbers', () => {
  assert.equal(normalizeIndianPhone('7904055290'), '7904055290');
  assert.equal(normalizeIndianPhone('+91 79040 55290'), '7904055290');
  assert.equal(normalizeIndianPhone('91-79040-55290'), '7904055290');
  assert.equal(normalizeIndianPhone('07904055290'), '7904055290');
});

test('formatIndianPhone formats valid 10-digit numbers cleanly', () => {
  assert.equal(formatIndianPhone('7904055290'), '+91 79040 55290');
  assert.equal(formatIndianPhone('+919876543210'), '+91 98765 43210');
});

test('validateEnquiryForm rejects empty or invalid inputs with specific field errors', () => {
  const result = validateEnquiryForm({
    name: ' ',
    phone: '12345',
    category: '',
    modelOrRequirement: '',
    area: '',
    message: '',
  });
  assert.equal(result.valid, false);
  assert.ok(result.errors.name);
  assert.ok(result.errors.phone);
  assert.ok(result.errors.category);
});

test('validateEnquiryForm rejects non-Indian starting digits and accepts valid numbers', () => {
  const badStart = validateEnquiryForm({
    name: 'Karthik',
    phone: '5123456789',
    category: 'Car Battery',
    modelOrRequirement: 'Swift Petrol',
    area: 'Mugalivakkam',
    message: '',
  });
  assert.equal(badStart.valid, false);
  assert.ok(badStart.errors.phone);

  const good = validateEnquiryForm({
    name: 'Karthik S',
    phone: '+91 98401 23456',
    category: 'Home Inverter Battery',
    modelOrRequirement: '150Ah Tubular',
    area: 'Madhananthapuram',
    message: 'Need stock availability',
  });
  assert.equal(good.valid, true);
  assert.equal(good.normalizedPhone, '9840123456');
  assert.deepEqual(good.errors, {});
});

test('buildWhatsAppUrl encodes text cleanly with shop number', () => {
  const url = buildWhatsAppUrl('917904055290', 'Hello & test battery');
  assert.equal(
    url,
    'https://wa.me/917904055290?text=Hello%20%26%20test%20battery',
  );
});

test('buildEnquiryWhatsAppMessage includes reference, category, and optional fields', () => {
  const msg = buildEnquiryWhatsAppMessage({
    referenceId: 'KBS-20261124-0420',
    name: 'Arun',
    phone: '9876543210',
    formattedPhone: '+91 98765 43210',
    category: 'Car Battery',
    modelOrRequirement: 'Honda City',
    area: 'Mugalivakkam',
    message: 'Need availability today',
    submittedAt: '2026-11-24T10:00:00Z',
  });
  assert.match(msg, /KBS-20261124-0420/);
  assert.match(msg, /Car Battery/);
  assert.match(msg, /Honda City/);
  assert.match(msg, /Mugalivakkam/);
});

test('generateEnquiryRef produces deterministic reference format', () => {
  const ref = generateEnquiryRef(new Date(2026, 10, 24, 1, 2, 3));
  assert.equal(ref, 'KBS-20261124-3723');
});

test('filterCatalogItems filters accurately by category and all', () => {
  const all = filterCatalogItems(CATALOG_ITEMS, 'all');
  assert.equal(all.length, CATALOG_ITEMS.length);

  const carOnly = filterCatalogItems(CATALOG_ITEMS, 'car-battery');
  assert.ok(carOnly.length >= 1);
  assert.ok(carOnly.every((item) => item.category === 'car-battery'));

  const twoWheelerOnly = filterCatalogItems(
    CATALOG_ITEMS,
    'two-wheeler-battery',
  );
  assert.ok(twoWheelerOnly.length >= 1);
  assert.ok(
    twoWheelerOnly.every((item) => item.category === 'two-wheeler-battery'),
  );

  const inverterOnly = filterCatalogItems(CATALOG_ITEMS, 'home-inverter');
  assert.ok(inverterOnly.length >= 1);
  assert.ok(inverterOnly.every((item) => item.category === 'home-inverter'));
});
