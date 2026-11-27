import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Expand,
  FolderSync,
  Images,
  Plus,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import gallerySeed from '../data/mediaGallery.json';
import {
  GALLERY_CATEGORY_LABELS,
  GALLERY_PAGE_SIZE,
  MAX_GALLERY_IMAGE_BYTES,
  MAX_GALLERY_PHOTOS,
  canAddGalleryPhotos,
  filterGalleryItems,
  formatPhotoTitleFromFilename,
  generateGalleryItemId,
  paginateGalleryItems,
  stepLightboxIndex,
  validateGalleryDraft,
  type GalleryCategory,
  type GalleryFilter,
  type GalleryItemDraft,
  type GalleryMediaItem,
} from '../utils/mediaGallery';
import {isSocialOwnerMode} from '../utils/socialMedia';
import {ResilientImage} from './ResilientImage';

const CANONICAL_GALLERY = gallerySeed as GalleryMediaItem[];

const FILTER_TABS: {id: GalleryFilter; label: string}[] = [
  {id: 'all', label: 'All Photos'},
  {id: 'showroom', label: 'Showroom'},
  {id: 'automotive', label: 'Automotive'},
  {id: 'home-inverter', label: 'Home Inverter'},
  {id: 'service', label: 'Testing & Setup'},
];

function createEmptyDraft(): GalleryItemDraft {
  return {
    category: 'showroom',
    title: '',
    caption: '',
    src: '',
    fit: 'cover',
  };
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read image file.'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });
}

function dataUrlToBlob(dataUrl: string): {blob: Blob; ext: string} | null {
  const match = dataUrl.match(
    /^data:image\/(png|jpeg|jpg|webp);base64,([A-Za-z0-9+/=]+)$/,
  );
  if (!match) return null;
  const rawExt = match[1].toLowerCase();
  const ext = rawExt === 'jpeg' ? 'jpg' : rawExt;
  const binary = atob(match[2]);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return {blob: new Blob([bytes], {type: `image/${match[1]}`}), ext};
}

export function MediaGallerySection() {
  const isOwnerMode = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return isSocialOwnerMode(window.location.search);
  }, []);

  const [items, setItems] = useState<GalleryMediaItem[]>(CANONICAL_GALLERY);
  const [activeFilter, setActiveFilter] = useState<GalleryFilter>('all');
  const [visibleCount, setVisibleCount] = useState<number>(GALLERY_PAGE_SIZE);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Private owner-only gallery manager state (?owner=1#gallery)
  const [showAddForm, setShowAddForm] = useState(false);
  const [draft, setDraft] = useState<GalleryItemDraft>(createEmptyDraft);
  const [bulkCategory, setBulkCategory] = useState<GalleryCategory>('showroom');
  const [bulkUploading, setBulkUploading] = useState(false);
  const [draftErrors, setDraftErrors] = useState<{
    title?: string;
    src?: string;
  }>({});
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [savingToProject, setSavingToProject] = useState(false);
  const [statusNotice, setStatusNotice] = useState('');

  const filteredItems = useMemo(
    () => filterGalleryItems(items, activeFilter),
    [items, activeFilter],
  );

  const {visibleItems, remainingCount, hasMore} = useMemo(
    () => paginateGalleryItems(filteredItems, visibleCount),
    [filteredItems, visibleCount],
  );

  const countsByFilter = useMemo(() => {
    return {
      all: items.length,
      showroom: items.filter((i) => i.category === 'showroom').length,
      automotive: items.filter((i) => i.category === 'automotive').length,
      'home-inverter': items.filter((i) => i.category === 'home-inverter')
        .length,
      service: items.filter((i) => i.category === 'service').length,
    };
  }, [items]);

  const activeLightboxItem =
    lightboxIndex !== null && filteredItems[lightboxIndex]
      ? filteredItems[lightboxIndex]
      : null;

  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setLightboxIndex(null);
      } else if (event.key === 'ArrowRight') {
        setLightboxIndex((prev) =>
          prev === null
            ? null
            : stepLightboxIndex(prev, 'next', filteredItems.length),
        );
      } else if (event.key === 'ArrowLeft') {
        setLightboxIndex((prev) =>
          prev === null
            ? null
            : stepLightboxIndex(prev, 'prev', filteredItems.length),
        );
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, filteredItems.length]);

  function handleFileUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setDraftErrors((prev) => ({
        ...prev,
        src: 'Please select a JPG, PNG, or WebP image file.',
      }));
      return;
    }
    if (file.size > MAX_GALLERY_IMAGE_BYTES) {
      setDraftErrors((prev) => ({
        ...prev,
        src: 'Please choose an image smaller than 5 MB.',
      }));
      return;
    }
    setDraftErrors((prev) => ({...prev, src: undefined}));
    void readFileAsDataUrl(file).then((dataUrl) => {
      setDraft((prev) => ({
        ...prev,
        src: dataUrl,
        title: prev.title.trim()
          ? prev.title
          : formatPhotoTitleFromFilename(file.name),
      }));
    });
  }

  async function handleBulkFilesUpload(event: ChangeEvent<HTMLInputElement>) {
    const fileList = event.target.files;
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);
    event.target.value = '';

    const capacity = canAddGalleryPhotos(items.length, files.length);
    if (!capacity.allowed) {
      setStatusNotice(capacity.error || 'Gallery photo limit reached.');
      return;
    }

    setBulkUploading(true);
    setStatusNotice('');
    try {
      const addedItems: GalleryMediaItem[] = [];
      let skippedCount = 0;
      const now = Date.now();

      for (let i = 0; i < files.length; i += 1) {
        const file = files[i];
        if (
          !file.type.startsWith('image/') ||
          file.size > MAX_GALLERY_IMAGE_BYTES
        ) {
          skippedCount += 1;
          continue;
        }
        const dataUrl = await readFileAsDataUrl(file);
        const title = formatPhotoTitleFromFilename(file.name);
        addedItems.push({
          id: generateGalleryItemId(title, now, i + 1),
          category: bulkCategory,
          categoryLabel: GALLERY_CATEGORY_LABELS[bulkCategory],
          title,
          caption:
            'Krishna Battery Service — Madhananthapuram, Mugalivakkam, Chennai.',
          src: dataUrl,
          alt: `${title} — Krishna Battery Service`,
          fit: 'cover',
        });
      }

      if (addedItems.length > 0) {
        setItems((prev) => [...addedItems, ...prev]);
        if (activeFilter !== 'all' && activeFilter !== bulkCategory) {
          setActiveFilter('all');
        }
        const skippedNote =
          skippedCount > 0
            ? ` (${skippedCount} file${skippedCount === 1 ? '' : 's'} skipped for format or >5 MB size)`
            : '';
        setStatusNotice(
          `Added ${addedItems.length} photo${addedItems.length === 1 ? '' : 's'} to ${GALLERY_CATEGORY_LABELS[bulkCategory]}${skippedNote}. Click "Save Gallery for GitHub" to store them permanently.`,
        );
      } else {
        setStatusNotice(
          'No valid photos were added. Please select PNG, JPG, or WebP files under 5 MB each.',
        );
      }
    } finally {
      setBulkUploading(false);
    }
  }

  function handleAddPhoto(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const capacity = canAddGalleryPhotos(items.length, 1);
    if (!capacity.allowed) {
      setStatusNotice(capacity.error || 'Gallery photo limit reached.');
      return;
    }
    const validation = validateGalleryDraft(draft);
    if (!validation.valid) {
      setDraftErrors(validation.errors);
      return;
    }
    const newItem: GalleryMediaItem = {
      id: generateGalleryItemId(draft.title),
      category: draft.category,
      categoryLabel: GALLERY_CATEGORY_LABELS[draft.category],
      title: draft.title.trim(),
      caption:
        draft.caption.trim() ||
        'Krishna Battery Service — Madhananthapuram, Mugalivakkam, Chennai.',
      src: draft.src.trim(),
      alt: `${draft.title.trim()} — Krishna Battery Service`,
      fit: draft.fit,
    };
    setItems((prev) => [newItem, ...prev]);
    if (activeFilter !== 'all' && activeFilter !== newItem.category) {
      setActiveFilter('all');
    }
    setDraft(createEmptyDraft());
    setDraftErrors({});
    setShowAddForm(false);
    setStatusNotice(
      `Added "${newItem.title}". Click "Save Gallery for GitHub" to store it in src/data/mediaGallery.json.`,
    );
  }

  function handleRemovePhoto(id: string, title: string) {
    setItems((prev) => prev.filter((item) => item.id !== id));
    setConfirmDeleteId(null);
    setLightboxIndex(null);
    setStatusNotice(
      `Removed "${title}". Click "Save Gallery for GitHub" to persist this change.`,
    );
  }

  async function handleSaveGalleryToProject() {
    setSavingToProject(true);
    setStatusNotice('');
    try {
      // Upload newly added data-URI photos individually first so bulk uploads never hit body-size caps
      const preparedItems: GalleryMediaItem[] = [];
      for (const item of items) {
        if (item.src.startsWith('data:image/')) {
          const decoded = dataUrlToBlob(item.src);
          if (decoded) {
            const uploadRes = await fetch('/__api/gallery/upload-photo', {
              method: 'POST',
              headers: {
                'Content-Type': decoded.blob.type,
                'X-Photo-Filename': encodeURIComponent(
                  `${item.id}.${decoded.ext}`,
                ),
              },
              body: decoded.blob,
            });
            const uploadCt = uploadRes.headers.get('content-type') ?? '';
            if (uploadRes.ok && uploadCt.includes('application/json')) {
              const uploadPayload = (await uploadRes.json()) as {
                ok?: boolean;
                url?: string;
              };
              if (uploadPayload.ok && uploadPayload.url) {
                preparedItems.push({...item, src: uploadPayload.url});
                continue;
              }
            }
          }
        }
        preparedItems.push(item);
      }

      const response = await fetch('/__api/gallery', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({items: preparedItems}),
      });
      const contentType = response.headers.get('content-type') ?? '';
      if (!contentType.includes('application/json')) {
        setStatusNotice(
          'Direct saving works in AI Studio or local dev. To update on GitHub, edit src/data/mediaGallery.json.',
        );
        return;
      }
      const payload = (await response.json()) as {
        ok?: boolean;
        items?: GalleryMediaItem[];
        error?: string;
      };
      if (!response.ok || !payload.ok || !Array.isArray(payload.items)) {
        setStatusNotice(
          payload.error || 'Could not save src/data/mediaGallery.json.',
        );
        return;
      }
      setItems(payload.items);
      setStatusNotice(
        `Saved ${payload.items.length} gallery photos to src/data/mediaGallery.json — ready to push to GitHub.`,
      );
    } catch {
      setStatusNotice(
        'Direct project save is unavailable on this static host.',
      );
    } finally {
      setSavingToProject(false);
    }
  }

  return (
    <section
      id="gallery"
      className="py-16 lg:py-24 bg-slate-50 border-b border-slate-200 scroll-mt-16"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-amber-700 mb-3">
              Media Gallery
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-navy-900 mb-3">
              Showroom, Battery Range &amp; Installation Gallery
            </h2>
            <p className="text-base text-slate-600 leading-relaxed">
              Explore our Mugalivakkam retail counter, stocked automotive and
              home inverter battery lineup, and on-site battery testing bay.
              Click any photo to view it full-screen.
            </p>
          </div>

          {isOwnerMode && (
            <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-end shrink-0">
              <span className="text-xs font-mono tabular-nums text-slate-600 bg-white border border-slate-200 rounded-lg px-3 py-2">
                {items.length.toLocaleString()} /{' '}
                {MAX_GALLERY_PHOTOS.toLocaleString()} photos
              </span>
              <button
                type="button"
                onClick={handleSaveGalleryToProject}
                disabled={savingToProject}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-navy-900 hover:bg-navy-800 disabled:opacity-60 rounded-lg transition-colors whitespace-nowrap"
              >
                <FolderSync className="w-4 h-4" aria-hidden="true" />
                <span>
                  {savingToProject ? 'Saving...' : 'Save Gallery for GitHub'}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm((prev) => !prev)}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-navy-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                <span>{showAddForm ? 'Close Form' : 'Add Photos'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Owner-only status notice & add photo form */}
        {isOwnerMode && statusNotice && (
          <div
            role="status"
            className="mb-6 flex items-center justify-between gap-3 px-4 py-3 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-900"
          >
            <p className="font-medium">{statusNotice}</p>
            <button
              type="button"
              onClick={() => setStatusNotice('')}
              aria-label="Dismiss gallery notice"
              className="p-1 text-emerald-700 hover:text-emerald-950"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        )}

        {isOwnerMode && showAddForm && (
          <div className="mb-8 rounded-xl border border-navy-900/20 bg-white p-5 sm:p-6 shadow-sm space-y-6">
            {/* Bulk multi-photo uploader */}
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-display text-base font-bold text-navy-900">
                    Bulk Upload Multiple Photos (Up to{' '}
                    {MAX_GALLERY_PHOTOS.toLocaleString()} Total)
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Select dozens of shop, battery, or installation photos at
                    once (PNG, JPG, WebP up to 5 MB each).
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  <select
                    aria-label="Category for bulk upload"
                    value={bulkCategory}
                    onChange={(e) =>
                      setBulkCategory(e.target.value as GalleryCategory)
                    }
                    className="px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-navy-900"
                  >
                    <option value="showroom">Showroom</option>
                    <option value="automotive">Automotive</option>
                    <option value="home-inverter">Home Inverter</option>
                    <option value="service">Testing &amp; Setup</option>
                  </select>
                  <label className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-navy-950 bg-amber-400 hover:bg-amber-300 rounded-lg cursor-pointer transition-colors whitespace-nowrap">
                    <Upload className="w-4 h-4" aria-hidden="true" />
                    <span>
                      {bulkUploading
                        ? 'Adding Photos...'
                        : 'Select Multiple Photos'}
                    </span>
                    <input
                      type="file"
                      multiple
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleBulkFilesUpload}
                      disabled={bulkUploading}
                      className="sr-only"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Single custom-captioned photo form */}
            <form onSubmit={handleAddPhoto} className="space-y-4">
              <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-200">
                <h3 className="font-display text-base font-bold text-navy-900">
                  Or Add Single Photo with Custom Caption
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  aria-label="Close add photo form"
                  className="p-1.5 text-slate-500 hover:text-navy-900"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label
                    htmlFor="gallery-photo-title"
                    className="block text-xs font-semibold text-slate-700 mb-1"
                  >
                    Photo Title *
                  </label>
                  <input
                    id="gallery-photo-title"
                    type="text"
                    value={draft.title}
                    onChange={(e) => {
                      setDraft((prev) => ({...prev, title: e.target.value}));
                      if (draftErrors.title) {
                        setDraftErrors((prev) => ({...prev, title: undefined}));
                      }
                    }}
                    placeholder="e.g. New Amaron Pro Stock Arrival"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:border-navy-900"
                  />
                  {draftErrors.title && (
                    <p className="mt-1 text-xs font-medium text-red-700">
                      {draftErrors.title}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="gallery-photo-category"
                    className="block text-xs font-semibold text-slate-700 mb-1"
                  >
                    Category *
                  </label>
                  <select
                    id="gallery-photo-category"
                    value={draft.category}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        category: e.target.value as GalleryCategory,
                      }))
                    }
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:border-navy-900"
                  >
                    <option value="showroom">Showroom</option>
                    <option value="automotive">Automotive</option>
                    <option value="home-inverter">Home Inverter</option>
                    <option value="service">Testing &amp; Setup</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="gallery-photo-fit"
                    className="block text-xs font-semibold text-slate-700 mb-1"
                  >
                    Image Framing
                  </label>
                  <select
                    id="gallery-photo-fit"
                    value={draft.fit}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        fit: e.target.value as 'cover' | 'contain',
                      }))
                    }
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:border-navy-900"
                  >
                    <option value="cover">Fill Frame (Standard Photos)</option>
                    <option value="contain">
                      Full Uncropped (Posters &amp; Charts)
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="gallery-photo-caption"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  Short Caption
                </label>
                <input
                  id="gallery-photo-caption"
                  type="text"
                  value={draft.caption}
                  onChange={(e) =>
                    setDraft((prev) => ({...prev, caption: e.target.value}))
                  }
                  placeholder="Brief description shown under the photo"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:border-navy-900"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <label className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-navy-900 bg-slate-100 border border-slate-300 hover:border-navy-900 rounded-lg cursor-pointer">
                  <Upload className="w-4 h-4" aria-hidden="true" />
                  <span>
                    {draft.src ? 'Change Uploaded Photo' : 'Upload Photo'}
                  </span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleFileUpload}
                    className="sr-only"
                  />
                </label>
                {draft.src && (
                  <span className="text-xs font-medium text-emerald-700">
                    Photo selected and ready to add
                  </span>
                )}
                {draftErrors.src && (
                  <p className="text-xs font-medium text-red-700">
                    {draftErrors.src}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:border-navy-900 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold text-navy-950 bg-amber-400 hover:bg-amber-300 rounded-lg"
                >
                  Add to Gallery
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-slate-200">
          <div
            role="tablist"
            aria-label="Filter gallery photos by category"
            className="inline-flex items-center gap-1 p-1 bg-white rounded-lg border border-slate-200 max-w-full overflow-x-auto self-start"
          >
            {FILTER_TABS.map((tab) => {
              const isSelected = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => {
                    setActiveFilter(tab.id);
                    setVisibleCount(GALLERY_PAGE_SIZE);
                    setLightboxIndex(null);
                  }}
                  className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    isSelected
                      ? 'bg-navy-900 text-white shadow-sm'
                      : 'text-slate-700 hover:text-navy-900 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}{' '}
                  <span
                    className={`font-mono text-xs ${
                      isSelected ? 'text-amber-300' : 'text-slate-500'
                    }`}
                  >
                    ({countsByFilter[tab.id]})
                  </span>
                </button>
              );
            })}
          </div>

          <div className="inline-flex items-center gap-2 text-xs font-medium text-slate-500">
            <Images className="w-4 h-4 text-amber-700" aria-hidden="true" />
            <span>
              Showing {visibleItems.length} of {filteredItems.length} gallery
              photos
            </span>
          </div>
        </div>

        {/* Gallery Grid */}
        <div
          data-testid="media-gallery-grid"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {visibleItems.map((item, idx) => {
            const isConfirmingDelete = confirmDeleteId === item.id;
            return (
              <figure
                key={item.id}
                data-testid={`gallery-card-${item.id}`}
                className="group flex flex-col rounded-xl bg-white border border-slate-200 overflow-hidden transition-transform duration-200 hover:-translate-y-0.5 hover:border-slate-300"
              >
                <button
                  type="button"
                  onClick={() => setLightboxIndex(idx)}
                  aria-label={`View ${item.title} full screen`}
                  className="relative aspect-[4/3] w-full bg-white overflow-hidden border-b border-slate-200 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-500"
                >
                  <ResilientImage
                    src={item.src}
                    alt={item.alt}
                    fallbackLabel={item.title}
                    className={`w-full h-full transition-transform duration-300 group-hover:scale-[1.03] ${
                      item.fit === 'contain'
                        ? 'object-contain p-2 bg-white'
                        : 'object-cover'
                    }`}
                  />
                  <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-md bg-navy-950/85 text-white text-[11px] font-semibold border border-white/15">
                    {item.categoryLabel}
                  </span>
                  <span
                    aria-hidden="true"
                    className="absolute bottom-2.5 right-2.5 w-8 h-8 rounded-md bg-navy-950/80 text-white inline-flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-white/15"
                  >
                    <Expand className="w-4 h-4" />
                  </span>
                </button>

                <figcaption className="flex flex-col flex-1 p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-display text-sm sm:text-base font-bold text-navy-900 leading-snug">
                      {item.title}
                    </h3>
                    {isOwnerMode && (
                      <button
                        type="button"
                        onClick={() =>
                          setConfirmDeleteId(
                            isConfirmingDelete ? null : item.id,
                          )
                        }
                        aria-label={`Remove ${item.title}`}
                        className="p-1 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.caption}
                  </p>

                  {isOwnerMode && isConfirmingDelete && (
                    <div className="mt-3 pt-2.5 border-t border-red-200 flex items-center justify-between gap-2 text-xs text-red-900">
                      <span className="font-medium">Remove photo?</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(item.id, item.title)}
                          className="px-2 py-1 rounded bg-red-700 text-white font-semibold hover:bg-red-800"
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-2 py-1 rounded bg-white border border-red-200 text-red-800"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </figcaption>
              </figure>
            );
          })}
        </div>

        {/* Progressive Load More / Show All controls for large galleries */}
        {hasMore && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() =>
                setVisibleCount((prev) => prev + GALLERY_PAGE_SIZE)
              }
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-navy-900 hover:bg-navy-800 rounded-lg transition-colors"
            >
              Load More Photos ({Math.min(GALLERY_PAGE_SIZE, remainingCount)}{' '}
              more)
            </button>
            {remainingCount > GALLERY_PAGE_SIZE && (
              <button
                type="button"
                onClick={() => setVisibleCount(filteredItems.length)}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-navy-900 bg-white border border-slate-300 hover:border-navy-900 rounded-lg transition-colors"
              >
                Show All ({filteredItems.length})
              </button>
            )}
          </div>
        )}
      </div>

      {/* Full-Screen Lightbox Viewer */}
      {activeLightboxItem && lightboxIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={activeLightboxItem.title}
          data-testid="gallery-lightbox"
          onClick={() => setLightboxIndex(null)}
          className="fixed inset-0 z-50 bg-navy-950/92 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl rounded-xl bg-navy-900 border border-navy-700 overflow-hidden shadow-2xl"
          >
            {/* Top bar */}
            <div className="flex items-center justify-between gap-4 px-4 sm:px-5 py-3.5 border-b border-navy-800 text-white">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-xs font-semibold text-amber-400 shrink-0">
                  {activeLightboxItem.categoryLabel}
                </span>
                <span className="text-xs font-mono tabular-nums text-slate-400 shrink-0">
                  {lightboxIndex + 1} / {filteredItems.length}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setLightboxIndex(null)}
                aria-label="Close photo viewer"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-200 hover:text-white bg-navy-800 hover:bg-navy-700 rounded-md transition-colors"
              >
                <X className="w-4 h-4" aria-hidden="true" />
                <span>Close</span>
              </button>
            </div>

            {/* Image viewport */}
            <div className="relative bg-navy-950 flex items-center justify-center aspect-[16/10] max-h-[68vh] w-full">
              <img
                src={activeLightboxItem.src}
                alt={activeLightboxItem.alt}
                className={`max-w-full max-h-full ${
                  activeLightboxItem.fit === 'contain'
                    ? 'object-contain bg-white p-3'
                    : 'object-contain'
                }`}
              />

              {filteredItems.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setLightboxIndex((prev) =>
                        prev === null
                          ? null
                          : stepLightboxIndex(
                              prev,
                              'prev',
                              filteredItems.length,
                            ),
                      )
                    }
                    aria-label="Previous photo"
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-navy-950/85 hover:bg-navy-900 text-white border border-white/20 inline-flex items-center justify-center transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" aria-hidden="true" />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setLightboxIndex((prev) =>
                        prev === null
                          ? null
                          : stepLightboxIndex(
                              prev,
                              'next',
                              filteredItems.length,
                            ),
                      )
                    }
                    aria-label="Next photo"
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-navy-950/85 hover:bg-navy-900 text-white border border-white/20 inline-flex items-center justify-center transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" aria-hidden="true" />
                  </button>
                </>
              )}
            </div>

            {/* Caption footer */}
            <div className="px-5 py-4 bg-navy-900 border-t border-navy-800">
              <h3 className="font-display text-base sm:text-lg font-bold text-white mb-1">
                {activeLightboxItem.title}
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                {activeLightboxItem.caption}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
