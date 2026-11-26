import {useEffect, useMemo, useRef, useState} from 'react';
import {
  ArrowRight,
  MessageCircle,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import {
  BUSINESS_INFO,
  CATALOG_ITEMS,
  IMAGES,
  type CatalogItem,
} from '../data/businessConfig';
import {
  buildWhatsAppUrl,
  type CatalogFilter,
  type EnquiryCategory,
} from '../utils/enquiry';
import {
  CATALOG_STORAGE_KEY,
  addBatteryItem,
  buildBatteryItemFromDraft,
  createEmptyBatteryDraft,
  filterAndSearchBatteries,
  generateBatteryItemId,
  itemToBatteryDraft,
  mapCatalogItemToEnquiryCategory,
  parseStoredCatalog,
  removeBatteryItem,
  updateBatteryItem,
  type BatteryProductDraft,
  type PresetBatteryImage,
} from '../utils/catalogManager';
import {BatteryProductEditor} from './BatteryProductEditor';
import {ResilientImage} from './ResilientImage';

interface ProductsServicesSectionProps {
  onSelectEnquiryCategory: (category: EnquiryCategory, modelNote?: string) => void;
}

const FILTER_TABS: {id: CatalogFilter; label: string}[] = [
  {id: 'all', label: 'All'},
  {id: 'car-battery', label: 'Car Battery'},
  {id: 'two-wheeler-battery', label: 'Two-Wheeler Battery'},
  {id: 'home-inverter', label: 'Home Inverter'},
  {id: 'solutions-services', label: 'Solutions & Services'},
];

const PRESET_BATTERY_IMAGES: PresetBatteryImage[] = [
  {
    id: 'car-starter',
    label: 'Car & Two-Wheeler Battery',
    src: IMAGES.carTwoWheeler,
  },
  {
    id: 'amaron-chart',
    label: 'Amaron Battery Range Chart',
    src: '/assets/aistudio/WhatsApp_Image_2026-11-25_at_4.30.01_PM__2__efa6172b.jpeg',
  },
  {
    id: 'home-inverter',
    label: 'Home Inverter Battery',
    src: IMAGES.homeInverter,
  },
  {
    id: 'amaron-lineup',
    label: 'Amaron Automotive & Tubular Lineup',
    src: IMAGES.heroShowcase,
  },
  {
    id: 'showroom',
    label: 'Amaron Experience Center Showroom',
    src: '/assets/aistudio/WhatsApp_Image_2026-11-25_at_4.30.03_PM_545247eb.jpeg',
  },
  {
    id: 'backup-combo',
    label: 'Inverter & Battery Setup',
    src: IMAGES.backupSolutions,
  },
];

function loadInitialCatalog(): CatalogItem[] {
  if (typeof window === 'undefined') {
    return [...CATALOG_ITEMS];
  }
  try {
    return parseStoredCatalog(
      window.localStorage.getItem(CATALOG_STORAGE_KEY),
      CATALOG_ITEMS,
    );
  } catch {
    return [...CATALOG_ITEMS];
  }
}

export function ProductsServicesSection({
  onSelectEnquiryCategory,
}: ProductsServicesSectionProps) {
  const [items, setItems] = useState<CatalogItem[]>(loadInitialCatalog);
  const [activeFilter, setActiveFilter] = useState<CatalogFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editorMode, setEditorMode] = useState<'add' | 'edit' | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [statusNotice, setStatusNotice] = useState<string>('');
  const editorAnchorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore storage quota errors gracefully
    }
  }, [items]);

  const isCustomized = useMemo(() => {
    return JSON.stringify(items) !== JSON.stringify(CATALOG_ITEMS);
  }, [items]);

  const countsByFilter = useMemo(() => {
    return {
      all: items.length,
      'car-battery': items.filter((i) => i.category === 'car-battery').length,
      'two-wheeler-battery': items.filter(
        (i) => i.category === 'two-wheeler-battery',
      ).length,
      'home-inverter': items.filter((i) => i.category === 'home-inverter')
        .length,
      'solutions-services': items.filter(
        (i) => i.category === 'solutions-services',
      ).length,
    };
  }, [items]);

  const visibleItems = useMemo(
    () => filterAndSearchBatteries(items, activeFilter, searchQuery),
    [items, activeFilter, searchQuery],
  );

  const editorInitialDraft: BatteryProductDraft | null = useMemo(() => {
    if (editorMode === 'add') {
      return createEmptyBatteryDraft(IMAGES.carTwoWheeler);
    }
    if (editorMode === 'edit' && editingItemId) {
      const target = items.find((item) => item.id === editingItemId);
      if (target) {
        return itemToBatteryDraft(target);
      }
    }
    return null;
  }, [editorMode, editingItemId, items]);

  function openAddEditor() {
    setConfirmDeleteId(null);
    setConfirmReset(false);
    setEditingItemId(null);
    setEditorMode('add');
    setTimeout(() => {
      editorAnchorRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }, 30);
  }

  function openEditEditor(item: CatalogItem) {
    setConfirmDeleteId(null);
    setConfirmReset(false);
    setEditingItemId(item.id);
    setEditorMode('edit');
    setTimeout(() => {
      editorAnchorRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }, 30);
  }

  function closeEditor() {
    setEditorMode(null);
    setEditingItemId(null);
  }

  function handleSaveDraft(draft: BatteryProductDraft) {
    if (editorMode === 'add') {
      const id = generateBatteryItemId(draft.title);
      const newItem = buildBatteryItemFromDraft(
        draft,
        id,
        IMAGES.carTwoWheeler,
      );
      setItems((prev) => addBatteryItem(prev, newItem));
      if (activeFilter !== 'all' && activeFilter !== newItem.category) {
        setActiveFilter('all');
      }
      setSearchQuery('');
      setStatusNotice(`Added "${newItem.title}" to the battery listing.`);
      closeEditor();
      return;
    }

    if (editorMode === 'edit' && editingItemId) {
      const updated = buildBatteryItemFromDraft(
        draft,
        editingItemId,
        IMAGES.carTwoWheeler,
      );
      setItems((prev) => updateBatteryItem(prev, editingItemId, updated));
      setStatusNotice(`Saved changes to "${updated.title}".`);
      closeEditor();
    }
  }

  function handleConfirmDelete(item: CatalogItem) {
    setItems((prev) => removeBatteryItem(prev, item.id));
    if (editingItemId === item.id) {
      closeEditor();
    }
    setConfirmDeleteId(null);
    setStatusNotice(`Removed "${item.title}" from the battery listing.`);
  }

  function handleResetDefaults() {
    setItems([...CATALOG_ITEMS]);
    setActiveFilter('all');
    setSearchQuery('');
    setConfirmReset(false);
    setConfirmDeleteId(null);
    closeEditor();
    setStatusNotice('Restored default battery listings.');
  }

  return (
    <section
      id="products"
      className="py-16 lg:py-24 bg-white border-b border-slate-200 scroll-mt-16"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header + Add / Reset actions */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-amber-700 mb-3">
              Products &amp; Services
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-navy-900 mb-3">
              Battery Product Listing
            </h2>
            <p className="text-base text-slate-600 leading-relaxed">
              Browse multiple car, two-wheeler, and home inverter batteries. Use{' '}
              <span className="font-semibold text-navy-900">Add Battery</span>{' '}
              or <span className="font-semibold text-navy-900">Edit</span> on
              any card to customize models, brands, specifications, pricing, and
              photos directly in this section.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-end shrink-0">
            {isCustomized && !confirmReset && (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:border-navy-900 hover:text-navy-900 rounded-lg transition-colors whitespace-nowrap"
              >
                <RotateCcw className="w-4 h-4" aria-hidden="true" />
                <span>Reset Defaults</span>
              </button>
            )}

            {isCustomized && confirmReset && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50 text-xs font-medium text-navy-900">
                <span>Restore defaults?</span>
                <button
                  type="button"
                  onClick={handleResetDefaults}
                  className="px-2.5 py-1 rounded bg-navy-900 text-white hover:bg-navy-800 font-semibold"
                >
                  Confirm
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="px-2 py-1 rounded bg-white border border-slate-300 text-slate-700 hover:text-navy-900"
                >
                  Cancel
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={openAddEditor}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-navy-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>Add Battery</span>
            </button>
          </div>
        </div>

        {/* Filter tabs + Search bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 mb-8 border-b border-slate-200">
          <div
            role="tablist"
            aria-label="Filter battery products"
            className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200 max-w-full overflow-x-auto self-start"
          >
            {FILTER_TABS.map((tab) => {
              const isSelected = activeFilter === tab.id;
              const count = countsByFilter[tab.id];
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setActiveFilter(tab.id)}
                  className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    isSelected
                      ? 'bg-navy-900 text-white shadow-sm'
                      : 'text-slate-700 hover:text-navy-900 hover:bg-white/70'
                  }`}
                >
                  {tab.label}{' '}
                  <span
                    className={`font-mono text-xs ${
                      isSelected ? 'text-amber-300' : 'text-slate-500'
                    }`}
                  >
                    ({count})
                  </span>
                </button>
              );
            })}
          </div>

          <div className="relative w-full lg:w-72 shrink-0">
            <label htmlFor="battery-catalog-search" className="sr-only">
              Search battery products
            </label>
            <Search
              className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="battery-catalog-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search model, brand, or Ah..."
              className="w-full pl-10 pr-9 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-navy-900 focus:ring-2 focus:ring-navy-900/15"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-navy-900"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        {/* Live feedback notice */}
        {statusNotice && (
          <div
            role="status"
            className="mb-6 flex items-center justify-between gap-3 px-4 py-3 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-900"
          >
            <p className="font-medium">{statusNotice}</p>
            <button
              type="button"
              onClick={() => setStatusNotice('')}
              aria-label="Dismiss notification"
              className="p-1 text-emerald-700 hover:text-emerald-950"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        )}

        {/* Inline Add / Edit Battery Editor */}
        <div ref={editorAnchorRef} className="scroll-mt-24">
          {editorMode && editorInitialDraft && (
            <BatteryProductEditor
              key={editingItemId ?? 'new-battery'}
              mode={editorMode}
              initialDraft={editorInitialDraft}
              presetImages={PRESET_BATTERY_IMAGES}
              onSave={handleSaveDraft}
              onCancel={closeEditor}
            />
          )}
        </div>

        {/* Multi-battery listing grid */}
        {visibleItems.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
            <p className="font-display text-lg font-bold text-navy-900 mb-2">
              No matching batteries listed
            </p>
            <p className="text-sm text-slate-600 mb-5">
              {searchQuery
                ? `No battery entries matched "${searchQuery}". Try another keyword or add a new battery.`
                : 'There are currently no batteries in this category. Add a new battery listing to display it here.'}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {(searchQuery || activeFilter !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setActiveFilter('all');
                  }}
                  className="px-4 py-2 text-sm font-semibold text-navy-900 bg-white border border-slate-300 hover:border-navy-900 rounded-lg transition-colors"
                >
                  Show All Batteries
                </button>
              )}
              <button
                type="button"
                onClick={openAddEditor}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-navy-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                <span>Add Battery</span>
              </button>
            </div>
          </div>
        ) : (
          <div
            data-testid="catalog-grid"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {visibleItems.map((item, index) => {
              const waUrl = buildWhatsAppUrl(
                BUSINESS_INFO.whatsappNumber,
                item.whatsappPrompt,
              );
              const enquiryCategory = mapCatalogItemToEnquiryCategory(item);
              const isConfirmingDelete = confirmDeleteId === item.id;
              const isBeingEdited =
                editorMode === 'edit' && editingItemId === item.id;

              return (
                <article
                  key={item.id}
                  data-testid={`battery-card-${item.id}`}
                  className={`flex flex-col bg-slate-50 rounded-xl border overflow-hidden transition-transform duration-200 hover:-translate-y-0.5 ${
                    isBeingEdited
                      ? 'border-navy-900 ring-2 ring-amber-400'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="relative aspect-[4/3] w-full bg-white overflow-hidden border-b border-slate-200">
                    <ResilientImage
                      src={item.image}
                      alt={item.imageAlt}
                      fallbackLabel={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex flex-col flex-1 p-5">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <p className="text-xs font-semibold text-amber-700 pt-0.5">
                        {item.categoryLabel}
                      </p>

                      {/* Per-card customize & remove actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => openEditEditor(item)}
                          aria-label={`Edit ${item.title}`}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-navy-900 bg-white border border-slate-200 hover:border-navy-900 rounded-md transition-colors"
                        >
                          <Pencil className="w-3 h-3" aria-hidden="true" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setConfirmDeleteId(
                              isConfirmingDelete ? null : item.id,
                            )
                          }
                          aria-label={`Remove ${item.title}`}
                          className="inline-flex items-center justify-center p-1.5 text-slate-500 bg-white border border-slate-200 hover:border-red-300 hover:text-red-700 rounded-md transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    </div>

                    {isConfirmingDelete && (
                      <div className="mb-3 flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-xs text-red-900">
                        <span className="font-medium">Remove this item?</span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleConfirmDelete(item)}
                            className="px-2.5 py-1 rounded bg-red-700 hover:bg-red-800 text-white font-semibold"
                          >
                            Confirm
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-2 py-1 rounded bg-white border border-red-200 text-red-800 hover:bg-red-100"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    <h3 className="font-display text-lg font-bold text-navy-900 leading-snug mb-2">
                      {item.title}
                    </h3>
                    <p
                      className={`text-sm text-slate-600 leading-relaxed mb-4${
                        index === 0 ? ' font-bold' : ''
                      }`}
                    >
                      {item.summary}
                    </p>

                    {/* Clean hairline specification metadata */}
                    <dl className="space-y-1.5 text-xs border-t border-slate-200 pt-3.5 mb-5 text-slate-600">
                      <div>
                        <dt className="font-semibold text-slate-800 inline">
                          Specs:{' '}
                        </dt>
                        <dd className="inline">{item.specPlaceholder}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-slate-800 inline">
                          Brand:{' '}
                        </dt>
                        <dd className="inline">{item.brandSlot}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-slate-800 inline">
                          Price:{' '}
                        </dt>
                        <dd className="inline font-mono tabular-nums text-navy-900 font-medium">
                          {item.pricePlaceholder}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-slate-800 inline">
                          Warranty:{' '}
                        </dt>
                        <dd className="inline">{item.warrantyPlaceholder}</dd>
                      </div>
                    </dl>

                    <div className="mt-auto flex items-center gap-2 pt-1">
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-600 rounded-lg transition-colors whitespace-nowrap"
                      >
                        <MessageCircle
                          className="w-4 h-4 shrink-0"
                          aria-hidden="true"
                        />
                        <span>WhatsApp</span>
                      </a>

                      <button
                        type="button"
                        onClick={() =>
                          onSelectEnquiryCategory(
                            enquiryCategory,
                            `${item.title} (${item.brandSlot})`,
                          )
                        }
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold text-navy-900 bg-white border border-slate-300 hover:border-navy-900 rounded-lg transition-colors whitespace-nowrap"
                      >
                        <span>Enquire</span>
                        <ArrowRight
                          className="w-3.5 h-3.5 shrink-0"
                          aria-hidden="true"
                        />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
