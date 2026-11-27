import {useMemo, useRef, useState, type ChangeEvent, type FormEvent} from 'react';
import {
  ArrowUpRight,
  Check,
  Copy,
  Download,
  Film,
  FolderSync,
  Link2,
  Pencil,
  Play,
  Plus,
  Settings2,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import socialSeed from '../data/socialMedia.json';
import {IMAGES} from '../data/businessConfig';
import {
  REEL_PLATFORM_BADGE_LABELS,
  SOCIAL_PLATFORM_LABELS,
  SOCIAL_STORAGE_KEY,
  filterReelsByPlatform,
  generateReelId,
  normalizeSocialUrl,
  parseReelEmbedUrl,
  parseStoredSocialMedia,
  validateReelDraft,
  type ReelDraft,
  type SocialMediaData,
  type SocialPlatform,
  type SocialProfile,
  type SocialReel,
  type SocialReelFilter,
} from '../utils/socialMedia';
import {ResilientImage} from './ResilientImage';
import {SocialPlatformIcon} from './SocialPlatformIcon';

const CANONICAL_SOCIAL_DATA = socialSeed as SocialMediaData;

const REEL_FILTER_TABS: {id: SocialReelFilter; label: string}[] = [
  {id: 'all', label: 'All Reels'},
  {id: 'instagram', label: 'Instagram'},
  {id: 'youtube', label: 'YouTube Shorts'},
  {id: 'facebook', label: 'Facebook'},
  {id: 'x', label: 'X'},
];

const PRESET_REEL_COVERS = [
  {
    id: 'showroom-wall',
    label: 'Amaron Display Wall',
    src: '/assets/aistudio/WhatsApp_Image_2026-11-25_at_4.30.02_PM_cfa250ca.jpeg',
  },
  {
    id: 'experience-center',
    label: 'Experience Center',
    src: '/assets/aistudio/WhatsApp_Image_2026-11-25_at_4.30.03_PM_545247eb.jpeg',
  },
  {
    id: 'amaron-chart',
    label: 'Amaron Range Chart',
    src: '/assets/aistudio/WhatsApp_Image_2026-11-25_at_4.30.01_PM__2__efa6172b.jpeg',
  },
  {
    id: 'home-inverter',
    label: 'Home Inverter Setup',
    src: IMAGES.homeInverter,
  },
  {
    id: 'battery-testing',
    label: 'Battery Testing Bay',
    src: IMAGES.testingService,
  },
];

const PLATFORM_ACCENT_STYLES: Record<
  SocialPlatform,
  {iconBg: string; iconText: string; hoverBorder: string}
> = {
  instagram: {
    iconBg: 'bg-rose-50',
    iconText: 'text-rose-700',
    hoverBorder: 'hover:border-rose-300',
  },
  facebook: {
    iconBg: 'bg-blue-50',
    iconText: 'text-blue-700',
    hoverBorder: 'hover:border-blue-300',
  },
  youtube: {
    iconBg: 'bg-red-50',
    iconText: 'text-red-700',
    hoverBorder: 'hover:border-red-300',
  },
  x: {
    iconBg: 'bg-slate-200/80',
    iconText: 'text-slate-900',
    hoverBorder: 'hover:border-slate-400',
  },
};

const MAX_THUMBNAIL_BYTES = 1.5 * 1024 * 1024;

function loadInitialSocialData(): SocialMediaData {
  if (typeof window === 'undefined') {
    return CANONICAL_SOCIAL_DATA;
  }
  try {
    return parseStoredSocialMedia(
      window.localStorage.getItem(SOCIAL_STORAGE_KEY),
      CANONICAL_SOCIAL_DATA,
    );
  } catch {
    return CANONICAL_SOCIAL_DATA;
  }
}

function saveSocialDraftToBrowser(next: SocialMediaData) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(SOCIAL_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore storage quota issues gracefully
  }
}

function clearSocialBrowserDraft() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(SOCIAL_STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
}

function createEmptyReelDraft(platform: SocialPlatform = 'instagram'): ReelDraft {
  return {
    platform,
    title: '',
    caption: '',
    reelUrl: '',
    thumbnail: PRESET_REEL_COVERS[0].src,
    duration: '0:30',
  };
}

export function SocialMediaReelsSection() {
  const [publishedData, setPublishedData] = useState<SocialMediaData>(
    CANONICAL_SOCIAL_DATA,
  );
  const [socialData, setSocialData] = useState<SocialMediaData>(
    loadInitialSocialData,
  );
  const [activeFilter, setActiveFilter] = useState<SocialReelFilter>('all');
  const [playingReelId, setPlayingReelId] = useState<string | null>(null);

  // Management panel state
  const [manageOpen, setManageOpen] = useState(false);
  const [manageTab, setManageTab] = useState<'profiles' | 'reel' | 'publish'>(
    'profiles',
  );
  const [profileDrafts, setProfileDrafts] = useState<SocialProfile[]>(
    () => socialData.profiles,
  );
  const [editingReelId, setEditingReelId] = useState<string | null>(null);
  const [reelDraft, setReelDraft] = useState<ReelDraft>(() =>
    createEmptyReelDraft(),
  );
  const [reelErrors, setReelErrors] = useState<{
    title?: string;
    reelUrl?: string;
  }>({});
  const [thumbnailError, setThumbnailError] = useState('');
  const [confirmDeleteReelId, setConfirmDeleteReelId] = useState<string | null>(
    null,
  );
  const [statusNotice, setStatusNotice] = useState('');
  const [savingToProject, setSavingToProject] = useState(false);
  const [projectMessage, setProjectMessage] = useState<{
    tone: 'success' | 'info' | 'error';
    text: string;
  } | null>(null);
  const [copiedJson, setCopiedJson] = useState(false);

  const managePanelRef = useRef<HTMLDivElement | null>(null);

  const hasUnsavedChanges = useMemo(() => {
    return JSON.stringify(socialData) !== JSON.stringify(publishedData);
  }, [socialData, publishedData]);

  const filteredReels = useMemo(
    () => filterReelsByPlatform(socialData.reels, activeFilter),
    [socialData.reels, activeFilter],
  );

  const countsByFilter = useMemo(() => {
    return {
      all: socialData.reels.length,
      instagram: socialData.reels.filter((r) => r.platform === 'instagram')
        .length,
      youtube: socialData.reels.filter((r) => r.platform === 'youtube').length,
      facebook: socialData.reels.filter((r) => r.platform === 'facebook')
        .length,
      x: socialData.reels.filter((r) => r.platform === 'x').length,
    };
  }, [socialData.reels]);

  function scrollToManager() {
    setTimeout(() => {
      managePanelRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }, 30);
  }

  function openProfilesManager() {
    setProfileDrafts(socialData.profiles);
    setManageTab('profiles');
    setManageOpen(true);
    scrollToManager();
  }

  function openAddReelManager(defaultPlatform: SocialPlatform = 'instagram') {
    setEditingReelId(null);
    setReelDraft(createEmptyReelDraft(defaultPlatform));
    setReelErrors({});
    setThumbnailError('');
    setManageTab('reel');
    setManageOpen(true);
    scrollToManager();
  }

  function openEditReelManager(reel: SocialReel) {
    setEditingReelId(reel.id);
    setReelDraft({
      platform: reel.platform,
      title: reel.title,
      caption: reel.caption,
      reelUrl: reel.reelUrl,
      thumbnail: reel.thumbnail,
      duration: reel.duration || '0:30',
    });
    setReelErrors({});
    setThumbnailError('');
    setManageTab('reel');
    setManageOpen(true);
    scrollToManager();
  }

  function handleSaveProfiles(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanedProfiles = profileDrafts.map((profile) => ({
      ...profile,
      handle: profile.handle.trim() || profile.name,
      url: normalizeSocialUrl(profile.url),
      description: profile.description.trim(),
    }));
    const nextData: SocialMediaData = {
      ...socialData,
      profiles: cleanedProfiles,
    };
    setSocialData(nextData);
    saveSocialDraftToBrowser(nextData);
    setStatusNotice(
      'Updated your Instagram, Facebook, YouTube, and X account links. Open the "Publish to GitHub" tab to save into src/data/socialMedia.json.',
    );
  }

  function handleReelUrlChange(value: string) {
    const detected = parseReelEmbedUrl(value, reelDraft.platform);
    setReelDraft((prev) => ({
      ...prev,
      reelUrl: value,
      platform: detected.externalUrl ? detected.platform : prev.platform,
    }));
    if (reelErrors.reelUrl) {
      setReelErrors((prev) => ({...prev, reelUrl: undefined}));
    }
  }

  function handleThumbnailUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setThumbnailError('Please select a JPG, PNG, or WebP cover image.');
      return;
    }
    if (file.size > MAX_THUMBNAIL_BYTES) {
      setThumbnailError('Cover image must be under 1.5 MB.');
      return;
    }
    setThumbnailError('');
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setReelDraft((prev) => ({...prev, thumbnail: reader.result as string}));
      }
    };
    reader.readAsDataURL(file);
  }

  function handleSaveReel(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = validateReelDraft(reelDraft);
    if (!validation.valid) {
      setReelErrors(validation.errors);
      return;
    }

    const normalizedUrl = normalizeSocialUrl(reelDraft.reelUrl);
    const cleanReel: SocialReel = {
      id: editingReelId ?? generateReelId(reelDraft.title),
      platform: reelDraft.platform,
      title: reelDraft.title.trim(),
      caption:
        reelDraft.caption.trim() ||
        'Watch this short update from Krishna Battery Service, Mugalivakkam.',
      reelUrl: normalizedUrl,
      thumbnail: reelDraft.thumbnail.trim() || PRESET_REEL_COVERS[0].src,
      duration: reelDraft.duration.trim() || '0:30',
    };

    const nextReels = editingReelId
      ? socialData.reels.map((r) => (r.id === editingReelId ? cleanReel : r))
      : [cleanReel, ...socialData.reels];

    const nextData: SocialMediaData = {
      ...socialData,
      reels: nextReels,
    };

    setSocialData(nextData);
    saveSocialDraftToBrowser(nextData);
    if (activeFilter !== 'all' && activeFilter !== cleanReel.platform) {
      setActiveFilter('all');
    }
    setStatusNotice(
      editingReelId
        ? `Updated reel "${cleanReel.title}".`
        : `Added reel "${cleanReel.title}" to your showcase.`,
    );
    setEditingReelId(null);
    setReelDraft(createEmptyReelDraft());
    setReelErrors({});
    setManageOpen(false);
  }

  function handleDeleteReel(id: string, title: string) {
    const nextData: SocialMediaData = {
      ...socialData,
      reels: socialData.reels.filter((r) => r.id !== id),
    };
    setSocialData(nextData);
    saveSocialDraftToBrowser(nextData);
    if (playingReelId === id) {
      setPlayingReelId(null);
    }
    setConfirmDeleteReelId(null);
    setStatusNotice(`Removed "${title}" from the reels showcase.`);
  }

  async function handleSaveToProject() {
    setSavingToProject(true);
    setProjectMessage(null);
    try {
      const response = await fetch('/__api/social', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(socialData),
      });
      const contentType = response.headers.get('content-type') ?? '';
      if (!contentType.includes('application/json')) {
        setProjectMessage({
          tone: 'info',
          text: 'Direct saving works in AI Studio or local dev. On a live static GitHub site, use Download or Copy JSON below to update src/data/socialMedia.json.',
        });
        return;
      }
      const payload = (await response.json()) as {
        ok?: boolean;
        data?: SocialMediaData;
        error?: string;
      };
      if (!response.ok || !payload.ok || !payload.data) {
        setProjectMessage({
          tone: 'error',
          text:
            payload.error ||
            'Could not save src/data/socialMedia.json. Use Download JSON below.',
        });
        return;
      }
      clearSocialBrowserDraft();
      setPublishedData(payload.data);
      setSocialData(payload.data);
      setProfileDrafts(payload.data.profiles);
      setProjectMessage({
        tone: 'success',
        text: 'Saved social accounts and reels to src/data/socialMedia.json. Push to GitHub to publish live.',
      });
      setStatusNotice(
        'Saved your social media profiles and reels to src/data/socialMedia.json.',
      );
    } catch {
      setProjectMessage({
        tone: 'info',
        text: 'Direct project save is unavailable on this static host. Download or Copy JSON below to commit src/data/socialMedia.json on GitHub.',
      });
    } finally {
      setSavingToProject(false);
    }
  }

  function handleDownloadSocialJson() {
    const json = `${JSON.stringify(socialData, null, 2)}\n`;
    const blob = new Blob([json], {type: 'application/json;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'socialMedia.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  async function handleCopySocialJson() {
    const json = `${JSON.stringify(socialData, null, 2)}\n`;
    try {
      await navigator.clipboard.writeText(json);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = json;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2500);
  }

  return (
    <section
      id="social"
      className="py-16 lg:py-24 bg-white border-b border-slate-200 scroll-mt-16"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-amber-700 mb-3">
              Social Media &amp; Reels
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-navy-900 mb-3">
              Follow Krishna Battery Service &amp; Watch Our Latest Reels
            </h2>
            <p className="text-base text-slate-600 leading-relaxed">
              Connect with our Mugalivakkam battery showroom on Instagram,
              Facebook, YouTube, and X for quick battery care reels, vehicle
              fitment clips, and home inverter tips.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-end shrink-0">
            <button
              type="button"
              onClick={() => {
                if (manageOpen) {
                  setManageOpen(false);
                } else {
                  openProfilesManager();
                }
              }}
              aria-expanded={manageOpen}
              className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg border transition-colors whitespace-nowrap ${
                manageOpen || hasUnsavedChanges
                  ? 'bg-navy-900 text-white border-navy-900 hover:bg-navy-800'
                  : 'bg-white text-navy-900 border-slate-300 hover:border-navy-900'
              }`}
            >
              <Settings2 className="w-4 h-4" aria-hidden="true" />
              <span>
                {manageOpen ? 'Close Manager' : 'Manage Accounts & Reels'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => openAddReelManager()}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-navy-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>Add Reel</span>
            </button>
          </div>
        </div>

        {/* Status banner */}
        {statusNotice && (
          <div
            role="status"
            className="mb-8 flex items-center justify-between gap-3 px-4 py-3 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-900"
          >
            <p className="font-medium">{statusNotice}</p>
            <button
              type="button"
              onClick={() => setStatusNotice('')}
              aria-label="Dismiss status notice"
              className="p-1 text-emerald-700 hover:text-emerald-950"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        )}

        {/* Inline Manage Accounts / Add Reel / Publish Panel */}
        <div ref={managePanelRef} className="scroll-mt-24">
          {manageOpen && (
            <div
              data-testid="social-manager-panel"
              className="mb-10 rounded-xl border border-navy-900/20 bg-slate-50 p-5 sm:p-6 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-200">
                <div className="inline-flex items-center gap-1 p-1 bg-white rounded-lg border border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileDrafts(socialData.profiles);
                      setManageTab('profiles');
                    }}
                    className={`px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-md transition-colors ${
                      manageTab === 'profiles'
                        ? 'bg-navy-900 text-white'
                        : 'text-slate-700 hover:text-navy-900'
                    }`}
                  >
                    Social Accounts (4)
                  </button>
                  <button
                    type="button"
                    onClick={() => setManageTab('reel')}
                    className={`px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-md transition-colors ${
                      manageTab === 'reel'
                        ? 'bg-navy-900 text-white'
                        : 'text-slate-700 hover:text-navy-900'
                    }`}
                  >
                    {editingReelId ? 'Edit Reel' : 'Add Reel'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setManageTab('publish')}
                    className={`px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-md transition-colors ${
                      manageTab === 'publish'
                        ? 'bg-navy-900 text-white'
                        : 'text-slate-700 hover:text-navy-900'
                    }`}
                  >
                    Save / Publish to GitHub
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setManageOpen(false)}
                  aria-label="Close social manager"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-navy-900 hover:bg-white border border-transparent hover:border-slate-200"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>

              {/* Tab 1: Edit Instagram / Facebook / YouTube / X Account URLs */}
              {manageTab === 'profiles' && (
                <form onSubmit={handleSaveProfiles} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profileDrafts.map((profile, idx) => (
                      <div
                        key={profile.platform}
                        className="rounded-lg bg-white border border-slate-200 p-4 space-y-3"
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-8 h-8 rounded-lg inline-flex items-center justify-center ${PLATFORM_ACCENT_STYLES[profile.platform].iconBg} ${PLATFORM_ACCENT_STYLES[profile.platform].iconText}`}
                          >
                            <SocialPlatformIcon
                              platform={profile.platform}
                              className="w-4 h-4"
                            />
                          </span>
                          <span className="font-display text-sm font-bold text-navy-900">
                            {profile.name} Account
                          </span>
                        </div>

                        <div>
                          <label
                            htmlFor={`social-handle-${profile.platform}`}
                            className="block text-xs font-semibold text-slate-700 mb-1"
                          >
                            Handle / Page Name
                          </label>
                          <input
                            id={`social-handle-${profile.platform}`}
                            type="text"
                            value={profile.handle}
                            onChange={(e) => {
                              const value = e.target.value;
                              setProfileDrafts((prev) =>
                                prev.map((p, i) =>
                                  i === idx ? {...p, handle: value} : p,
                                ),
                              );
                            }}
                            placeholder={`@krishnabatteryservice`}
                            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:border-navy-900"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor={`social-url-${profile.platform}`}
                            className="block text-xs font-semibold text-slate-700 mb-1"
                          >
                            Profile URL
                          </label>
                          <input
                            id={`social-url-${profile.platform}`}
                            type="text"
                            value={profile.url}
                            onChange={(e) => {
                              const value = e.target.value;
                              setProfileDrafts((prev) =>
                                prev.map((p, i) =>
                                  i === idx ? {...p, url: value} : p,
                                ),
                              );
                            }}
                            placeholder={`https://${profile.platform === 'x' ? 'x.com' : `${profile.platform}.com`}/your-account`}
                            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:border-navy-900"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setManageOpen(false)}
                      className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:border-navy-900 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 text-sm font-semibold text-navy-950 bg-amber-400 hover:bg-amber-300 rounded-lg"
                    >
                      Save Social Accounts
                    </button>
                  </div>
                </form>
              )}

              {/* Tab 2: Add or Edit a Reel */}
              {manageTab === 'reel' && (
                <form onSubmit={handleSaveReel} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="reel-platform"
                        className="block text-xs font-semibold text-slate-700 mb-1"
                      >
                        Platform *
                      </label>
                      <select
                        id="reel-platform"
                        value={reelDraft.platform}
                        onChange={(e) =>
                          setReelDraft((prev) => ({
                            ...prev,
                            platform: e.target.value as SocialPlatform,
                          }))
                        }
                        className="w-full px-3 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-navy-900"
                      >
                        <option value="instagram">Instagram Reel</option>
                        <option value="youtube">YouTube Short</option>
                        <option value="facebook">Facebook Reel</option>
                        <option value="x">X Video Post</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="reel-url"
                        className="block text-xs font-semibold text-slate-700 mb-1"
                      >
                        Reel / Short Video Link (Instagram, YouTube, Facebook, or X)
                      </label>
                      <input
                        id="reel-url"
                        type="text"
                        value={reelDraft.reelUrl}
                        onChange={(e) => handleReelUrlChange(e.target.value)}
                        placeholder="https://www.instagram.com/reel/... or youtube.com/shorts/..."
                        className="w-full px-3 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-navy-900"
                      />
                      {reelErrors.reelUrl && (
                        <p className="mt-1 text-xs font-medium text-red-700">
                          {reelErrors.reelUrl}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="reel-title"
                        className="block text-xs font-semibold text-slate-700 mb-1"
                      >
                        Reel Title *
                      </label>
                      <input
                        id="reel-title"
                        type="text"
                        value={reelDraft.title}
                        onChange={(e) => {
                          setReelDraft((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }));
                          if (reelErrors.title) {
                            setReelErrors((prev) => ({
                              ...prev,
                              title: undefined,
                            }));
                          }
                        }}
                        placeholder="e.g. Amaron Car Battery Replacement in Mugalivakkam"
                        className="w-full px-3 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-navy-900"
                      />
                      {reelErrors.title && (
                        <p className="mt-1 text-xs font-medium text-red-700">
                          {reelErrors.title}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="reel-duration"
                        className="block text-xs font-semibold text-slate-700 mb-1"
                      >
                        Duration (Optional)
                      </label>
                      <input
                        id="reel-duration"
                        type="text"
                        value={reelDraft.duration}
                        onChange={(e) =>
                          setReelDraft((prev) => ({
                            ...prev,
                            duration: e.target.value,
                          }))
                        }
                        placeholder="e.g. 0:30"
                        className="w-full px-3 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-navy-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="reel-caption"
                      className="block text-xs font-semibold text-slate-700 mb-1"
                    >
                      Short Caption
                    </label>
                    <textarea
                      id="reel-caption"
                      rows={2}
                      value={reelDraft.caption}
                      onChange={(e) =>
                        setReelDraft((prev) => ({
                          ...prev,
                          caption: e.target.value,
                        }))
                      }
                      placeholder="Brief summary shown under the reel..."
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-navy-900"
                    />
                  </div>

                  {/* Cover Image picker */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-700">
                        Reel Cover Photo
                      </span>
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-navy-900 bg-white border border-slate-300 hover:border-navy-900 rounded-md cursor-pointer">
                        <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Upload Cover</span>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          onChange={handleThumbnailUpload}
                          className="sr-only"
                        />
                      </label>
                    </div>
                    {thumbnailError && (
                      <p className="text-xs font-medium text-red-700">
                        {thumbnailError}
                      </p>
                    )}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                      {PRESET_REEL_COVERS.map((preset) => {
                        const selected = reelDraft.thumbnail === preset.src;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() =>
                              setReelDraft((prev) => ({
                                ...prev,
                                thumbnail: preset.src,
                              }))
                            }
                            className={`text-left rounded-lg overflow-hidden border transition-colors bg-white ${
                              selected
                                ? 'border-navy-900 ring-2 ring-amber-400'
                                : 'border-slate-200 hover:border-slate-400'
                            }`}
                          >
                            <div className="aspect-[16/10] w-full overflow-hidden bg-slate-100">
                              <img
                                src={preset.src}
                                alt={preset.label}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <p className="px-2 py-1.5 text-[11px] font-medium text-slate-700 truncate">
                              {preset.label}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingReelId(null);
                        setManageOpen(false);
                      }}
                      className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:border-navy-900 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 text-sm font-semibold text-navy-950 bg-amber-400 hover:bg-amber-300 rounded-lg"
                    >
                      {editingReelId ? 'Save Reel Changes' : 'Add Reel to Section'}
                    </button>
                  </div>
                </form>
              )}

              {/* Tab 3: Save & Publish to GitHub */}
              {manageTab === 'publish' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="rounded-lg bg-white border border-slate-200 p-4 flex flex-col">
                    <h4 className="font-display text-sm font-bold text-navy-900 mb-1.5">
                      Save Directly to Project Files
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-600 mb-4 leading-relaxed">
                      Saves your linked Instagram, Facebook, YouTube, and X
                      accounts plus all reels into{' '}
                      <code className="font-mono text-xs text-navy-900">
                        src/data/socialMedia.json
                      </code>{' '}
                      so pushing to GitHub publishes them for every visitor.
                    </p>
                    <div className="mt-auto">
                      <button
                        type="button"
                        onClick={handleSaveToProject}
                        disabled={savingToProject}
                        className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-navy-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-60 rounded-lg transition-colors"
                      >
                        <FolderSync className="w-4 h-4" aria-hidden="true" />
                        <span>
                          {savingToProject
                            ? 'Saving to src/data/socialMedia.json...'
                            : 'Save to Project for GitHub'}
                        </span>
                      </button>
                    </div>
                    {projectMessage && (
                      <p
                        role="status"
                        className={`mt-3 rounded-lg border px-3 py-2 text-xs leading-relaxed ${
                          projectMessage.tone === 'success'
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                            : projectMessage.tone === 'error'
                              ? 'bg-red-50 border-red-200 text-red-900'
                              : 'bg-amber-50 border-amber-200 text-navy-900'
                        }`}
                      >
                        {projectMessage.text}
                      </p>
                    )}
                  </div>

                  <div className="rounded-lg bg-white border border-slate-200 p-4 flex flex-col">
                    <h4 className="font-display text-sm font-bold text-navy-900 mb-1.5">
                      Download or Copy for GitHub Commit
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-600 mb-4 leading-relaxed">
                      Download or copy your updated social media configuration
                      and replace{' '}
                      <code className="font-mono text-xs text-navy-900">
                        src/data/socialMedia.json
                      </code>{' '}
                      in your GitHub repository.
                    </p>
                    <div className="mt-auto flex flex-wrap items-center gap-2.5">
                      <button
                        type="button"
                        onClick={handleDownloadSocialJson}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-navy-900 hover:bg-navy-800 rounded-lg transition-colors"
                      >
                        <Download className="w-4 h-4" aria-hidden="true" />
                        <span>Download socialMedia.json</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleCopySocialJson}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-navy-900 bg-white border border-slate-300 hover:border-navy-900 rounded-lg transition-colors"
                      >
                        {copiedJson ? (
                          <>
                            <Check
                              className="w-4 h-4 text-emerald-700"
                              aria-hidden="true"
                            />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" aria-hidden="true" />
                            <span>Copy JSON</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 4 Official Social Media Account Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {socialData.profiles.map((profile) => {
            const accent = PLATFORM_ACCENT_STYLES[profile.platform];
            const safeProfileUrl = normalizeSocialUrl(profile.url);
            return (
              <div
                key={profile.platform}
                className={`flex flex-col rounded-xl bg-slate-50 border border-slate-200 p-5 transition-colors ${accent.hoverBorder}`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`w-10 h-10 rounded-lg inline-flex items-center justify-center shrink-0 ${accent.iconBg} ${accent.iconText}`}
                    >
                      <SocialPlatformIcon
                        platform={profile.platform}
                        className="w-5 h-5"
                      />
                    </span>
                    <div className="min-w-0">
                      <h3 className="font-display text-base font-bold text-navy-900 leading-tight">
                        {profile.name}
                      </h3>
                      <p className="text-xs font-mono text-slate-600 truncate mt-0.5">
                        {profile.handle}
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                  {profile.description}
                </p>

                <div className="mt-auto pt-3 border-t border-slate-200">
                  {safeProfileUrl ? (
                    <a
                      href={safeProfileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-between w-full text-xs sm:text-sm font-semibold text-navy-900 hover:text-amber-700 transition-colors"
                    >
                      <span>Follow on {profile.name}</span>
                      <ArrowUpRight
                        className="w-4 h-4 shrink-0"
                        aria-hidden="true"
                      />
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={openProfilesManager}
                      className="inline-flex items-center justify-between w-full text-xs sm:text-sm font-semibold text-amber-700 hover:text-navy-900 transition-colors"
                    >
                      <span>Connect {profile.name} URL</span>
                      <Link2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Reels & Shorts Feed Header + Filter Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 mb-6 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <Film className="w-5 h-5 text-amber-700 shrink-0" aria-hidden="true" />
            <h3 className="font-display text-xl sm:text-2xl font-bold text-navy-900">
              Showroom Reels &amp; Short Videos
            </h3>
          </div>

          <div
            role="tablist"
            aria-label="Filter reels by social platform"
            className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200 max-w-full overflow-x-auto self-start md:self-auto"
          >
            {REEL_FILTER_TABS.map((tab) => {
              const isSelected = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => {
                    setActiveFilter(tab.id);
                    setPlayingReelId(null);
                  }}
                  className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
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
                    ({countsByFilter[tab.id]})
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Vertical 9:16 Reels Showcase Grid */}
        {filteredReels.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
            <p className="font-display text-lg font-bold text-navy-900 mb-2">
              No reels added for this platform yet
            </p>
            <p className="text-sm text-slate-600 mb-5">
              Paste an Instagram Reel, YouTube Short, Facebook Reel, or X video
              link to showcase it right here.
            </p>
            <button
              type="button"
              onClick={() =>
                openAddReelManager(
                  activeFilter === 'all' ? 'instagram' : activeFilter,
                )
              }
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-navy-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>Add First Reel</span>
            </button>
          </div>
        ) : (
          <div
            data-testid="reels-grid"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {filteredReels.map((reel) => {
              const embedInfo = parseReelEmbedUrl(reel.reelUrl, reel.platform);
              const isPlaying = playingReelId === reel.id && embedInfo.canEmbed;
              const isConfirmingDelete = confirmDeleteReelId === reel.id;

              return (
                <article
                  key={reel.id}
                  data-testid={`reel-card-${reel.id}`}
                  className="flex flex-col rounded-xl bg-slate-50 border border-slate-200 overflow-hidden"
                >
                  {/* 9:16 Vertical Reel Viewport */}
                  <div className="relative aspect-[9/16] w-full bg-navy-950 overflow-hidden">
                    {isPlaying && embedInfo.embedUrl ? (
                      <div className="relative w-full h-full bg-black">
                        <iframe
                          src={embedInfo.embedUrl}
                          title={reel.title}
                          className="w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          loading="lazy"
                        />
                        <button
                          type="button"
                          onClick={() => setPlayingReelId(null)}
                          aria-label={`Close ${reel.title} player`}
                          className="absolute top-3 right-3 inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-navy-950/90 text-white hover:bg-navy-900 rounded-md border border-white/20"
                        >
                          <X className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Close</span>
                        </button>
                      </div>
                    ) : (
                      <>
                        <ResilientImage
                          src={reel.thumbnail}
                          alt={reel.title}
                          fallbackLabel={reel.title}
                          className="w-full h-full object-cover"
                        />

                        {/* Dark gradient for crisp legibility */}
                        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/95 via-navy-950/35 to-navy-950/50" />

                        {/* Top platform indicator + duration */}
                        <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-navy-950/85 text-white text-xs font-semibold border border-white/15">
                            <SocialPlatformIcon
                              platform={reel.platform}
                              className="w-3.5 h-3.5 text-amber-400"
                            />
                            <span>{REEL_PLATFORM_BADGE_LABELS[reel.platform]}</span>
                          </span>
                          {reel.duration && (
                            <span className="px-2 py-0.5 rounded bg-navy-950/85 text-slate-200 text-[11px] font-mono tabular-nums border border-white/15">
                              {reel.duration}
                            </span>
                          )}
                        </div>

                        {/* Center Play / Link Trigger */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          {embedInfo.canEmbed ? (
                            <button
                              type="button"
                              onClick={() => setPlayingReelId(reel.id)}
                              aria-label={`Play ${reel.title}`}
                              className="w-14 h-14 rounded-full bg-amber-400 hover:bg-amber-300 text-navy-950 inline-flex items-center justify-center shadow-lg transition-transform hover:scale-105"
                            >
                              <Play
                                className="w-6 h-6 fill-current ml-0.5"
                                aria-hidden="true"
                              />
                            </button>
                          ) : embedInfo.externalUrl ? (
                            <a
                              href={embedInfo.externalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`Watch ${reel.title} on ${SOCIAL_PLATFORM_LABELS[reel.platform]}`}
                              className="w-14 h-14 rounded-full bg-amber-400 hover:bg-amber-300 text-navy-950 inline-flex items-center justify-center shadow-lg transition-transform hover:scale-105"
                            >
                              <Play
                                className="w-6 h-6 fill-current ml-0.5"
                                aria-hidden="true"
                              />
                            </a>
                          ) : (
                            <button
                              type="button"
                              onClick={() => openEditReelManager(reel)}
                              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-navy-950 text-xs font-semibold shadow-lg transition-colors"
                            >
                              <Link2 className="w-4 h-4" aria-hidden="true" />
                              <span>Paste Reel Link</span>
                            </button>
                          )}
                        </div>

                        {/* Bottom reel title overlay */}
                        <div className="absolute bottom-0 inset-x-0 p-4">
                          <h4 className="font-display text-base font-bold text-white leading-snug mb-1">
                            {reel.title}
                          </h4>
                          <p className="text-xs text-slate-200 leading-relaxed line-clamp-2">
                            {reel.caption}
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Clean footer bar under each reel */}
                  <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-between gap-2">
                    {embedInfo.externalUrl ? (
                      <a
                        href={embedInfo.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-navy-900 hover:text-amber-700 transition-colors truncate"
                      >
                        <span>
                          Open on {SOCIAL_PLATFORM_LABELS[reel.platform]}
                        </span>
                        <ArrowUpRight
                          className="w-3.5 h-3.5 shrink-0"
                          aria-hidden="true"
                        />
                      </a>
                    ) : (
                      <span className="text-xs font-medium text-slate-500 truncate">
                        Ready for your reel URL
                      </span>
                    )}

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => openEditReelManager(reel)}
                        aria-label={`Edit ${reel.title}`}
                        className="p-1.5 text-slate-600 hover:text-navy-900 hover:bg-slate-100 rounded-md transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setConfirmDeleteReelId(
                            isConfirmingDelete ? null : reel.id,
                          )
                        }
                        aria-label={`Remove ${reel.title}`}
                        className="p-1.5 text-slate-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  {isConfirmingDelete && (
                    <div className="px-3 py-2 bg-red-50 border-t border-red-200 flex items-center justify-between gap-2 text-xs text-red-900">
                      <span className="font-medium">Remove reel?</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleDeleteReel(reel.id, reel.title)}
                          className="px-2 py-1 rounded bg-red-700 text-white font-semibold hover:bg-red-800"
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteReelId(null)}
                          className="px-2 py-1 rounded bg-white border border-red-200 text-red-800"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
