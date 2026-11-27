import {useRef, useState, type ChangeEvent} from 'react';
import {
  Check,
  Copy,
  Download,
  FileCode2,
  FolderSync,
  Upload,
  X,
} from 'lucide-react';
import type {CatalogItem} from '../data/businessConfig';
import {
  formatCatalogJson,
  hasEmbeddedDataImages,
  parseImportedCatalogJson,
} from '../utils/catalogManager';

interface CatalogPublishPanelProps {
  items: CatalogItem[];
  hasUnsavedChanges: boolean;
  fallbackImage: string;
  onSavedToProject: (savedItems: CatalogItem[], savedImagesCount: number) => void;
  onImportItems: (importedItems: CatalogItem[]) => void;
  onClose: () => void;
}

export function CatalogPublishPanel({
  items,
  hasUnsavedChanges,
  fallbackImage,
  onSavedToProject,
  onImportItems,
  onClose,
}: CatalogPublishPanelProps) {
  const [savingToProject, setSavingToProject] = useState(false);
  const [projectFeedback, setProjectFeedback] = useState<{
    tone: 'success' | 'info' | 'error';
    message: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [importError, setImportError] = useState('');
  const importInputRef = useRef<HTMLInputElement | null>(null);

  const containsInlinePhotos = hasEmbeddedDataImages(items);

  async function handleSaveToProject() {
    setSavingToProject(true);
    setProjectFeedback(null);
    setImportError('');

    try {
      const response = await fetch('/__api/catalog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({items}),
      });

      const contentType = response.headers.get('content-type') ?? '';
      if (!contentType.includes('application/json')) {
        setProjectFeedback({
          tone: 'info',
          message:
            'Direct file saving works in the AI Studio or local dev workspace. On a live static GitHub site, use Download or Copy JSON below and update src/data/products.json in your GitHub repository.',
        });
        return;
      }

      const payload = (await response.json()) as {
        ok?: boolean;
        items?: CatalogItem[];
        savedImagesCount?: number;
        error?: string;
      };

      if (!response.ok || !payload.ok || !Array.isArray(payload.items)) {
        setProjectFeedback({
          tone: 'error',
          message:
            payload.error ||
            'Could not save src/data/products.json. Use Download or Copy JSON below instead.',
        });
        return;
      }

      const imgCount = payload.savedImagesCount ?? 0;
      onSavedToProject(payload.items, imgCount);
      setProjectFeedback({
        tone: 'success',
        message:
          imgCount > 0
            ? `Saved ${payload.items.length} batteries to src/data/products.json and saved ${imgCount} uploaded photo(s) to public/assets/catalog/. Push or publish your project to GitHub now to go live.`
            : `Saved ${payload.items.length} batteries to src/data/products.json. Push or publish your project to GitHub now to go live.`,
      });
    } catch {
      setProjectFeedback({
        tone: 'info',
        message:
          'Direct file saving is unavailable on this host. Use Download or Copy JSON below and replace src/data/products.json in your GitHub repository.',
      });
    } finally {
      setSavingToProject(false);
    }
  }

  function handleDownloadJson() {
    const json = formatCatalogJson(items);
    const blob = new Blob([json], {type: 'application/json;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'products.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  async function handleCopyJson() {
    const json = formatCatalogJson(items);
    try {
      await navigator.clipboard.writeText(json);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = json;
      textarea.setAttribute('readonly', 'true');
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  function handleImportFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setImportError('');
    setProjectFeedback(null);

    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === 'string' ? reader.result : '';
      const parsed = parseImportedCatalogJson(text, fallbackImage);
      if (!parsed.valid) {
        setImportError(parsed.error || 'Could not import products.json.');
        return;
      }
      onImportItems(parsed.items);
    };
    reader.onerror = () => {
      setImportError('Failed to read the selected file.');
    };
    reader.readAsText(file);
  }

  return (
    <div
      data-testid="catalog-publish-panel"
      className="mb-8 rounded-xl border border-navy-900/20 bg-slate-50 p-5 sm:p-6 shadow-sm"
    >
      <div className="flex items-start justify-between gap-4 pb-4 mb-5 border-b border-slate-200">
        <div>
          <p className="text-xs font-semibold text-amber-700 mb-1">
            GitHub Publishing &amp; Backup
          </p>
          <h3 className="font-display text-lg sm:text-xl font-bold text-navy-900">
            Publish Battery Listing Edits to GitHub
          </h3>
          <p className="text-sm text-slate-600 mt-1 max-w-3xl">
            Edits made in your browser stay local until saved into{' '}
            <code className="font-mono text-xs bg-white px-1.5 py-0.5 rounded border border-slate-200 text-navy-900">
              src/data/products.json
            </code>
            . Save your catalog to the project files before pushing to GitHub,
            or export{' '}
            <code className="font-mono text-xs bg-white px-1.5 py-0.5 rounded border border-slate-200 text-navy-900">
              products.json
            </code>{' '}
            to commit directly on GitHub.
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close publish panel"
          className="p-1.5 rounded-lg text-slate-500 hover:text-navy-900 hover:bg-white border border-transparent hover:border-slate-200 transition-colors shrink-0"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Method 1: Save directly into project workspace for GitHub Push */}
        <div className="rounded-lg bg-white border border-slate-200 p-4 sm:p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <FolderSync
              className="w-4 h-4 text-amber-700 shrink-0"
              aria-hidden="true"
            />
            <h4 className="font-display text-base font-bold text-navy-900">
              1. Save to Project Files (Before Pushing to GitHub)
            </h4>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
            Writes all {items.length} current battery listings directly into{' '}
            <span className="font-mono text-xs text-navy-900">
              src/data/products.json
            </span>{' '}
            {containsInlinePhotos
              ? 'and saves any uploaded battery photos into public/assets/catalog/ '
              : ''}
            so your next GitHub push publishes these exact listings for every
            visitor.
          </p>

          <div className="mt-auto flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleSaveToProject}
              disabled={savingToProject}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-navy-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-60 rounded-lg transition-colors"
            >
              <FolderSync className="w-4 h-4" aria-hidden="true" />
              <span>
                {savingToProject
                  ? 'Saving to src/data/products.json...'
                  : 'Save to Project for GitHub'}
              </span>
            </button>

            {!hasUnsavedChanges && (
              <span className="text-xs font-medium text-emerald-700">
                Matches src/data/products.json
              </span>
            )}
          </div>

          {projectFeedback && (
            <div
              role="status"
              className={`mt-4 rounded-lg border px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed ${
                projectFeedback.tone === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : projectFeedback.tone === 'error'
                    ? 'bg-red-50 border-red-200 text-red-900'
                    : 'bg-amber-50 border-amber-200 text-navy-900'
              }`}
            >
              {projectFeedback.message}
            </div>
          )}
        </div>

        {/* Method 2: Download / Copy / Import for Direct GitHub Web Commit */}
        <div className="rounded-lg bg-white border border-slate-200 p-4 sm:p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <FileCode2
              className="w-4 h-4 text-navy-900 shrink-0"
              aria-hidden="true"
            />
            <h4 className="font-display text-base font-bold text-navy-900">
              2. Export or Commit Directly on GitHub
            </h4>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
            Editing from a live URL or want to update GitHub manually? Download
            or copy the file below, open{' '}
            <span className="font-mono text-xs text-navy-900">
              src/data/products.json
            </span>{' '}
            in your GitHub repository, paste the updated contents, and commit.
          </p>

          <div className="flex flex-wrap items-center gap-2.5 mt-auto">
            <button
              type="button"
              onClick={handleDownloadJson}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-navy-900 hover:bg-navy-800 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" aria-hidden="true" />
              <span>Download products.json</span>
            </button>

            <button
              type="button"
              onClick={handleCopyJson}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-navy-900 bg-white border border-slate-300 hover:border-navy-900 rounded-lg transition-colors"
            >
              {copied ? (
                <>
                  <Check
                    className="w-4 h-4 text-emerald-700"
                    aria-hidden="true"
                  />
                  <span>Copied JSON</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" aria-hidden="true" />
                  <span>Copy JSON</span>
                </>
              )}
            </button>

            <input
              ref={importInputRef}
              type="file"
              accept="application/json,.json"
              onChange={handleImportFile}
              className="sr-only"
              aria-label="Import products.json file"
            />
            <button
              type="button"
              onClick={() => importInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-slate-50 border border-slate-300 hover:border-navy-900 hover:text-navy-900 rounded-lg transition-colors"
            >
              <Upload className="w-4 h-4" aria-hidden="true" />
              <span>Import JSON</span>
            </button>
          </div>

          {importError && (
            <p
              role="alert"
              className="mt-3 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2"
            >
              {importError}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
