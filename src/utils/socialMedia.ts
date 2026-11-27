export type SocialPlatform =
  | 'instagram'
  | 'facebook'
  | 'youtube'
  | 'google-business';
export type SocialReelFilter = 'all' | SocialPlatform;

export interface SocialProfile {
  platform: SocialPlatform;
  name: string;
  handle: string;
  url: string;
  description: string;
}

export interface SocialReel {
  id: string;
  platform: SocialPlatform;
  title: string;
  caption: string;
  reelUrl: string;
  thumbnail: string;
  duration: string;
}

export interface SocialMediaData {
  profiles: SocialProfile[];
  reels: SocialReel[];
}

export interface ReelDraft {
  platform: SocialPlatform;
  title: string;
  caption: string;
  reelUrl: string;
  thumbnail: string;
  duration: string;
}

export interface ReelEmbedInfo {
  embedUrl: string | null;
  externalUrl: string | null;
  platform: SocialPlatform;
  canEmbed: boolean;
}

export const SOCIAL_STORAGE_KEY = 'kbs_social_media_v1';

export const SOCIAL_PLATFORM_LABELS: Record<SocialPlatform, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  youtube: 'YouTube',
  'google-business': 'Google Business',
};

export const REEL_PLATFORM_BADGE_LABELS: Record<SocialPlatform, string> = {
  instagram: 'Instagram Reel',
  facebook: 'Facebook Reel',
  youtube: 'YouTube Short',
  'google-business': 'Google Business',
};

/**
 * Validates that a URL uses an explicit http or https scheme to block unsafe protocols.
 */
export function isSafeHttpUrl(rawUrl: string): boolean {
  const trimmed = rawUrl.trim();
  if (!trimmed) return false;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

/**
 * Normalizes a user-pasted social URL, adding https:// when omitted while blocking unsafe schemes.
 */
export function normalizeSocialUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  if (!trimmed) return '';
  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmed)) {
    return isSafeHttpUrl(trimmed) ? trimmed : '';
  }
  const candidate = `https://${trimmed}`;
  return isSafeHttpUrl(candidate) ? candidate : '';
}

/**
 * Parses a YouTube, Instagram, Facebook, or X video/reel URL into an iframe-safe embed URL when supported.
 */
export function parseReelEmbedUrl(
  rawUrl: string,
  fallbackPlatform: SocialPlatform,
): ReelEmbedInfo {
  const safeUrl = normalizeSocialUrl(rawUrl);
  if (!safeUrl) {
    return {
      embedUrl: null,
      externalUrl: null,
      platform: fallbackPlatform,
      canEmbed: false,
    };
  }

  let parsed: URL;
  try {
    parsed = new URL(safeUrl);
  } catch {
    return {
      embedUrl: null,
      externalUrl: null,
      platform: fallbackPlatform,
      canEmbed: false,
    };
  }

  const host = parsed.hostname.replace(/^www\./, '').toLowerCase();
  const pathname = parsed.pathname;

  // YouTube Shorts, Watch, and youtu.be
  if (
    host === 'youtube.com' ||
    host === 'm.youtube.com' ||
    host === 'youtu.be'
  ) {
    let videoId = '';
    if (host === 'youtu.be') {
      videoId = pathname.split('/').filter(Boolean)[0] ?? '';
    } else if (pathname.startsWith('/shorts/')) {
      videoId = pathname.split('/')[2] ?? '';
    } else if (pathname.startsWith('/embed/')) {
      videoId = pathname.split('/')[2] ?? '';
    } else {
      videoId = parsed.searchParams.get('v') ?? '';
    }

    if (/^[A-Za-z0-9_-]{6,20}$/.test(videoId)) {
      return {
        embedUrl: `https://www.youtube.com/embed/${videoId}?rel=0`,
        externalUrl: safeUrl,
        platform: 'youtube',
        canEmbed: true,
      };
    }
    return {
      embedUrl: null,
      externalUrl: safeUrl,
      platform: 'youtube',
      canEmbed: false,
    };
  }

  // Instagram Reels & Posts
  if (host === 'instagram.com' || host === 'm.instagram.com') {
    const match = pathname.match(/^\/(reel|reels|p)\/([A-Za-z0-9_-]+)/);
    if (match) {
      const kind = match[1] === 'p' ? 'p' : 'reel';
      const shortcode = match[2];
      return {
        embedUrl: `https://www.instagram.com/${kind}/${shortcode}/embed/`,
        externalUrl: safeUrl,
        platform: 'instagram',
        canEmbed: true,
      };
    }
    return {
      embedUrl: null,
      externalUrl: safeUrl,
      platform: 'instagram',
      canEmbed: false,
    };
  }

  // Facebook Reels & Videos
  if (
    host === 'facebook.com' ||
    host === 'm.facebook.com' ||
    host === 'fb.watch'
  ) {
    return {
      embedUrl: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(safeUrl)}&show_text=false`,
      externalUrl: safeUrl,
      platform: 'facebook',
      canEmbed: true,
    };
  }

  // Google Business Profile / Google Maps share links
  if (
    host === 'g.page' ||
    host === 'maps.app.goo.gl' ||
    host === 'business.google.com' ||
    (host === 'google.com' && pathname.startsWith('/maps'))
  ) {
    return {
      embedUrl: null,
      externalUrl: safeUrl,
      platform: 'google-business',
      canEmbed: false,
    };
  }

  return {
    embedUrl: null,
    externalUrl: safeUrl,
    platform: fallbackPlatform,
    canEmbed: false,
  };
}

/**
 * Generates a unique slug ID for newly added reels.
 */
export function generateReelId(title: string, timestamp: number = Date.now()): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32);
  return `reel-${slug || 'clip'}-${timestamp.toString(36)}`;
}

/**
 * Filters reels by selected social media platform tab.
 */
export function filterReelsByPlatform(
  reels: readonly SocialReel[],
  filter: SocialReelFilter,
): SocialReel[] {
  if (filter === 'all') {
    return [...reels];
  }
  return reels.filter((reel) => reel.platform === filter);
}

/**
 * Validates a new or edited reel draft strictly.
 */
export function validateReelDraft(draft: ReelDraft): {
  valid: boolean;
  errors: {title?: string; reelUrl?: string};
} {
  const errors: {title?: string; reelUrl?: string} = {};
  if (draft.title.trim().length < 2) {
    errors.title = 'Enter a short title for this reel (at least 2 characters).';
  }
  if (draft.reelUrl.trim() && !normalizeSocialUrl(draft.reelUrl)) {
    errors.reelUrl =
      'Enter a valid http(s) Instagram, Facebook, YouTube, or Google Business link.';
  }
  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Parses persisted social media configuration safely, falling back to canonical data on error.
 */
export function parseStoredSocialMedia(
  raw: string | null,
  fallback: SocialMediaData,
): SocialMediaData {
  if (!raw) {
    return {
      profiles: [...fallback.profiles],
      reels: [...fallback.reels],
    };
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) {
      return {
        profiles: [...fallback.profiles],
        reels: [...fallback.reels],
      };
    }
    const data = parsed as Partial<SocialMediaData>;
    const validPlatforms = new Set<SocialPlatform>([
      'instagram',
      'facebook',
      'youtube',
      'google-business',
    ]);

    const profiles = Array.isArray(data.profiles)
      ? data.profiles.filter(
          (p): p is SocialProfile =>
            typeof p === 'object' &&
            p !== null &&
            validPlatforms.has(p.platform) &&
            typeof p.name === 'string' &&
            typeof p.handle === 'string' &&
            typeof p.url === 'string' &&
            typeof p.description === 'string',
        )
      : [...fallback.profiles];

    const reels = Array.isArray(data.reels)
      ? data.reels.filter(
          (r): r is SocialReel =>
            typeof r === 'object' &&
            r !== null &&
            typeof r.id === 'string' &&
            validPlatforms.has(r.platform) &&
            typeof r.title === 'string' &&
            typeof r.caption === 'string' &&
            typeof r.reelUrl === 'string' &&
            typeof r.thumbnail === 'string',
        )
      : [...fallback.reels];

    return {
      profiles: profiles.length === 4 ? profiles : [...fallback.profiles],
      reels,
    };
  } catch {
    return {
      profiles: [...fallback.profiles],
      reels: [...fallback.reels],
    };
  }
}

/**
 * Restricts Social Media & Reels editing strictly to private owner mode
 * (?owner=1 or ?manage=1). Public visitors always get a read-only view.
 */
export function isSocialOwnerMode(search: string): boolean {
  const params = new URLSearchParams(search);
  const owner = params.get('owner');
  const manage = params.get('manage');
  return (
    owner === '1' ||
    owner === 'true' ||
    manage === '1' ||
    manage === 'true'
  );
}

