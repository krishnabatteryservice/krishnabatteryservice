import {useRef, useState, type ChangeEvent, type FormEvent} from 'react';
import {Check, ImagePlus, Plus, Save, X} from 'lucide-react';
import type {CatalogCategory} from '../data/businessConfig';
import {
  CATEGORY_LABEL_OPTIONS,
  type BatteryDraftErrors,
  type BatteryProductDraft,
  type PresetBatteryImage,
  validateBatteryDraft,
} from '../utils/catalogManager';
import {ResilientImage} from './ResilientImage';

interface BatteryProductEditorProps {
  mode: 'add' | 'edit';
  initialDraft: BatteryProductDraft;
  presetImages: PresetBatteryImage[];
  onSave: (draft: BatteryProductDraft) => void;
  onCancel: () => void;
}

const MAX_UPLOAD_BYTES = 1_500_000;

export function BatteryProductEditor({
  mode,
  initialDraft,
  presetImages,
  onSave,
  onCancel,
}: BatteryProductEditorProps) {
  const [draft, setDraft] = useState<BatteryProductDraft>(initialDraft);
  const [errors, setErrors] = useState<BatteryDraftErrors>({});
  const [uploadError, setUploadError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const labelSuggestions = CATEGORY_LABEL_OPTIONS[draft.category];

  function updateField<K extends keyof BatteryProductDraft>(
    key: K,
    value: BatteryProductDraft[K],
  ) {
    setDraft((prev) => ({...prev, [key]: value}));
    if (key in errors) {
      setErrors((prev) => {
        const next = {...prev};
        delete next[key as keyof BatteryDraftErrors];
        return next;
      });
    }
  }

  function handleCategoryChange(nextCategory: CatalogCategory) {
    const nextDefaultLabel = CATEGORY_LABEL_OPTIONS[nextCategory][0];
    setDraft((prev) => ({
      ...prev,
      category: nextCategory,
      categoryLabel: nextDefaultLabel,
    }));
  }

  function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    setUploadError('');
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (JPG, PNG, or WebP).');
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setUploadError('Please choose an image smaller than 1.5 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        updateField('image', reader.result);
      }
    };
    reader.onerror = () => {
      setUploadError('Could not read the selected image file.');
    };
    reader.readAsDataURL(file);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = validateBatteryDraft(draft);
    if (!result.valid) {
      setErrors(result.errors);
      return;
    }
    onSave(draft);
  }

  return (
    <div
      data-testid="battery-editor-panel"
      className="mb-10 rounded-xl border border-navy-200 bg-slate-50 p-5 sm:p-7 shadow-sm"
    >
      <div className="flex items-start justify-between gap-4 pb-5 mb-6 border-b border-slate-200">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-700 mb-1">
            {mode === 'add' ? 'Add New Battery' : 'Customize Listed Battery'}
          </p>
          <h3 className="font-display text-xl sm:text-2xl font-bold text-navy-900">
            {mode === 'add'
              ? 'Add a Battery to Your Product Listing'
              : `Editing: ${initialDraft.title}`}
          </h3>
        </div>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Close battery editor"
          className="inline-flex items-center justify-center p-2 rounded-lg text-slate-500 hover:text-navy-900 hover:bg-white border border-transparent hover:border-slate-200 transition-colors"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Structured battery details */}
          <div className="lg:col-span-8 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label
                  htmlFor="battery-title"
                  className="block text-sm font-medium text-navy-900 mb-1.5"
                >
                  Battery Name / Model <span className="text-red-600">*</span>
                </label>
                <input
                  id="battery-title"
                  name="title"
                  type="text"
                  value={draft.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="e.g. Amaron Flo 42B20L Car Battery or 150Ah Tall Tubular"
                  aria-invalid={Boolean(errors.title)}
                  className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-navy-900/15 ${
                    errors.title
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-slate-300 focus:border-navy-900'
                  }`}
                />
                {errors.title && (
                  <p role="alert" className="mt-1.5 text-xs font-medium text-red-600">
                    {errors.title}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="battery-category"
                  className="block text-sm font-medium text-navy-900 mb-1.5"
                >
                  Category Tab <span className="text-red-600">*</span>
                </label>
                <select
                  id="battery-category"
                  name="category"
                  value={draft.category}
                  onChange={(e) =>
                    handleCategoryChange(e.target.value as CatalogCategory)
                  }
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-navy-900 focus:ring-2 focus:ring-navy-900/15"
                >
                  <option value="car-battery">Car Battery</option>
                  <option value="two-wheeler-battery">Two-Wheeler Battery</option>
                  <option value="home-inverter">Home Inverter</option>
                  <option value="solutions-services">Solutions &amp; Services</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="battery-type-label"
                  className="block text-sm font-medium text-navy-900 mb-1.5"
                >
                  Battery Type Label
                </label>
                <input
                  id="battery-type-label"
                  name="categoryLabel"
                  type="text"
                  list="battery-type-suggestions"
                  value={draft.categoryLabel}
                  onChange={(e) => updateField('categoryLabel', e.target.value)}
                  placeholder="e.g. Car Battery, Two-Wheeler Battery"
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-navy-900 focus:ring-2 focus:ring-navy-900/15"
                />
                <datalist id="battery-type-suggestions">
                  {labelSuggestions.map((label) => (
                    <option key={label} value={label} />
                  ))}
                </datalist>
              </div>

              <div>
                <label
                  htmlFor="battery-brand"
                  className="block text-sm font-medium text-navy-900 mb-1.5"
                >
                  Brand <span className="text-red-600">*</span>
                </label>
                <input
                  id="battery-brand"
                  name="brandSlot"
                  type="text"
                  value={draft.brandSlot}
                  onChange={(e) => updateField('brandSlot', e.target.value)}
                  placeholder="e.g. Amaron"
                  aria-invalid={Boolean(errors.brandSlot)}
                  className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-navy-900/15 ${
                    errors.brandSlot
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-slate-300 focus:border-navy-900'
                  }`}
                />
                {errors.brandSlot && (
                  <p role="alert" className="mt-1.5 text-xs font-medium text-red-600">
                    {errors.brandSlot}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="battery-specs"
                  className="block text-sm font-medium text-navy-900 mb-1.5"
                >
                  Capacity / Specifications <span className="text-red-600">*</span>
                </label>
                <input
                  id="battery-specs"
                  name="specPlaceholder"
                  type="text"
                  value={draft.specPlaceholder}
                  onChange={(e) =>
                    updateField('specPlaceholder', e.target.value)
                  }
                  placeholder="e.g. 35Ah · 12V · DIN / JIS"
                  aria-invalid={Boolean(errors.specPlaceholder)}
                  className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-navy-900/15 ${
                    errors.specPlaceholder
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-slate-300 focus:border-navy-900'
                  }`}
                />
                {errors.specPlaceholder && (
                  <p role="alert" className="mt-1.5 text-xs font-medium text-red-600">
                    {errors.specPlaceholder}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="battery-price"
                  className="block text-sm font-medium text-navy-900 mb-1.5"
                >
                  Price (Optional)
                </label>
                <input
                  id="battery-price"
                  name="pricePlaceholder"
                  type="text"
                  value={draft.pricePlaceholder}
                  onChange={(e) =>
                    updateField('pricePlaceholder', e.target.value)
                  }
                  placeholder="e.g. ₹4,800 (with exchange) or Price on Enquiry"
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-navy-900 focus:ring-2 focus:ring-navy-900/15"
                />
              </div>

              <div>
                <label
                  htmlFor="battery-warranty"
                  className="block text-sm font-medium text-navy-900 mb-1.5"
                >
                  Warranty (Optional)
                </label>
                <input
                  id="battery-warranty"
                  name="warrantyPlaceholder"
                  type="text"
                  value={draft.warrantyPlaceholder}
                  onChange={(e) =>
                    updateField('warrantyPlaceholder', e.target.value)
                  }
                  placeholder="e.g. 48 Months or Confirm at Store"
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-navy-900 focus:ring-2 focus:ring-navy-900/15"
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="battery-summary"
                  className="block text-sm font-medium text-navy-900 mb-1.5"
                >
                  Short Description (Optional)
                </label>
                <textarea
                  id="battery-summary"
                  name="summary"
                  rows={2}
                  value={draft.summary}
                  onChange={(e) => updateField('summary', e.target.value)}
                  placeholder="Mention compatible vehicle models, backup load suitability, or fitment notes"
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-navy-900 focus:ring-2 focus:ring-navy-900/15 resize-y"
                />
              </div>
            </div>
          </div>

          {/* Right: Product image selector & custom upload */}
          <div className="lg:col-span-4 flex flex-col">
            <p className="text-sm font-medium text-navy-900 mb-1.5">
              Product Photo
            </p>
            <div className="aspect-[4/3] w-full rounded-lg overflow-hidden border border-slate-200 bg-white mb-3">
              <ResilientImage
                src={draft.image}
                alt={draft.title || 'Selected battery preview'}
                fallbackLabel="Battery Photo Preview"
                className="w-full h-full object-cover"
              />
            </div>

            <p className="text-xs font-medium text-slate-600 mb-2">
              Choose a store photo or upload your own:
            </p>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {presetImages.map((preset) => {
                const isSelected = draft.image === preset.src;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setUploadError('');
                      updateField('image', preset.src);
                    }}
                    aria-label={`Select photo: ${preset.label}`}
                    aria-pressed={isSelected}
                    className={`relative aspect-[4/3] rounded-md overflow-hidden border-2 transition-colors ${
                      isSelected
                        ? 'border-navy-900 ring-2 ring-amber-400'
                        : 'border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    <img
                      src={preset.src}
                      alt={preset.label}
                      className="w-full h-full object-cover"
                    />
                    {isSelected && (
                      <span className="absolute top-1 right-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-navy-900 text-amber-400">
                        <Check className="w-3 h-3" aria-hidden="true" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="sr-only"
              id="battery-photo-upload"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-semibold text-navy-900 bg-white border border-slate-300 hover:border-navy-900 rounded-lg transition-colors"
            >
              <ImagePlus className="w-4 h-4 text-amber-700" aria-hidden="true" />
              <span>Upload Custom Battery Photo</span>
            </button>

            {uploadError && (
              <p role="alert" className="mt-1.5 text-xs font-medium text-red-600">
                {uploadError}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:border-slate-400 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-navy-900 hover:bg-navy-800 rounded-lg transition-colors"
          >
            {mode === 'add' ? (
              <>
                <Plus className="w-4 h-4 text-amber-400" aria-hidden="true" />
                <span>Add to Listing</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-amber-400" aria-hidden="true" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
