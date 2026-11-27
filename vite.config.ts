import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import {defineConfig, loadEnv, type Plugin} from 'vite';

const VALID_CATEGORIES = new Set([
  'car-battery',
  'two-wheeler-battery',
  'home-inverter',
  'solutions-services',
]);

const MAX_BODY_BYTES = 12 * 1024 * 1024; // 12 MB total payload cap
const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2 MB per uploaded image
const MAX_CATALOG_ITEMS = 200;

interface IncomingCatalogItem {
  id: string;
  category: string;
  categoryLabel: string;
  title: string;
  summary: string;
  specPlaceholder: string;
  brandSlot: string;
  pricePlaceholder: string;
  warrantyPlaceholder: string;
  image: string;
  imageAlt: string;
  whatsappPrompt: string;
}

function sanitizeFilenameSlug(raw: string): string {
  const cleaned = raw
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
  return cleaned || 'battery';
}

function isValidCatalogEntry(entry: unknown): entry is IncomingCatalogItem {
  if (typeof entry !== 'object' || entry === null) return false;
  const item = entry as Record<string, unknown>;
  const stringFields = [
    'id',
    'category',
    'categoryLabel',
    'title',
    'summary',
    'specPlaceholder',
    'brandSlot',
    'pricePlaceholder',
    'warrantyPlaceholder',
    'image',
    'imageAlt',
    'whatsappPrompt',
  ];
  for (const field of stringFields) {
    if (typeof item[field] !== 'string') return false;
  }
  if (!VALID_CATEGORIES.has(item.category as string)) return false;
  if ((item.id as string).trim().length === 0) return false;
  if ((item.title as string).trim().length < 2) return false;
  return true;
}

function catalogFileSyncPlugin(rootDir: string): Plugin {
  return {
    name: 'catalog-file-sync',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/__api/catalog', (req, res, next) => {
        if (req.method !== 'POST') {
          if (req.method === 'GET') {
            try {
              const productsPath = path.resolve(rootDir, 'src/data/products.json');
              const content = fs.readFileSync(productsPath, 'utf-8');
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(content);
            } catch {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({error: 'Unable to read src/data/products.json'}));
            }
            return;
          }
          next();
          return;
        }

        const chunks: Buffer[] = [];
        let totalBytes = 0;
        let aborted = false;

        req.on('data', (chunk: Buffer) => {
          if (aborted) return;
          totalBytes += chunk.length;
          if (totalBytes > MAX_BODY_BYTES) {
            aborted = true;
            res.statusCode = 413;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({error: 'Payload exceeds 12 MB limit.'}));
            req.destroy();
            return;
          }
          chunks.push(chunk);
        });

        req.on('end', () => {
          if (aborted) return;
          try {
            const rawBody = Buffer.concat(chunks).toString('utf-8');
            const parsed: unknown = JSON.parse(rawBody);
            const itemsRaw =
              typeof parsed === 'object' &&
              parsed !== null &&
              Array.isArray((parsed as {items?: unknown}).items)
                ? (parsed as {items: unknown[]}).items
                : null;

            if (!itemsRaw) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({error: 'Expected JSON body with an "items" array.'}));
              return;
            }

            if (itemsRaw.length > MAX_CATALOG_ITEMS) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  error: `Catalog cannot exceed ${MAX_CATALOG_ITEMS} items.`,
                }),
              );
              return;
            }

            const catalogAssetsDir = path.resolve(rootDir, 'public/assets/catalog');
            const sanitizedItems: IncomingCatalogItem[] = [];
            let savedImagesCount = 0;

            for (const entry of itemsRaw) {
              if (!isValidCatalogEntry(entry)) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(
                  JSON.stringify({
                    error: 'One or more battery items are missing required valid fields.',
                  }),
                );
                return;
              }

              let imageUrl = entry.image.trim();
              const dataUriMatch = imageUrl.match(
                /^data:image\/(png|jpeg|jpg|webp);base64,([A-Za-z0-9+/=]+)$/,
              );

              if (dataUriMatch) {
                const rawExt = dataUriMatch[1].toLowerCase();
                const ext = rawExt === 'jpeg' ? 'jpg' : rawExt;
                const imgBuffer = Buffer.from(dataUriMatch[2], 'base64');
                if (imgBuffer.length > MAX_IMAGE_BYTES) {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(
                    JSON.stringify({
                      error: `Image for "${entry.title}" exceeds 2 MB limit.`,
                    }),
                  );
                  return;
                }
                const hash = crypto
                  .createHash('sha1')
                  .update(imgBuffer)
                  .digest('hex')
                  .slice(0, 8);
                const safeFilename = `${sanitizeFilenameSlug(entry.id)}-${hash}.${ext}`;
                fs.mkdirSync(catalogAssetsDir, {recursive: true});
                const destPath = path.resolve(catalogAssetsDir, safeFilename);
                if (!destPath.startsWith(catalogAssetsDir + path.sep)) {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({error: 'Invalid image path.'}));
                  return;
                }
                fs.writeFileSync(destPath, imgBuffer);
                imageUrl = `/assets/catalog/${safeFilename}`;
                savedImagesCount += 1;
              }

              sanitizedItems.push({
                id: entry.id.trim(),
                category: entry.category,
                categoryLabel: entry.categoryLabel.trim(),
                title: entry.title.trim(),
                summary: entry.summary.trim(),
                specPlaceholder: entry.specPlaceholder.trim(),
                brandSlot: entry.brandSlot.trim(),
                pricePlaceholder: entry.pricePlaceholder.trim(),
                warrantyPlaceholder: entry.warrantyPlaceholder.trim(),
                image: imageUrl,
                imageAlt: entry.imageAlt.trim(),
                whatsappPrompt: entry.whatsappPrompt.trim(),
              });
            }

            const productsPath = path.resolve(rootDir, 'src/data/products.json');
            fs.writeFileSync(
              productsPath,
              `${JSON.stringify(sanitizedItems, null, 2)}\n`,
              'utf-8',
            );

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                ok: true,
                filePath: 'src/data/products.json',
                items: sanitizedItems,
                savedImagesCount,
              }),
            );
          } catch {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({error: 'Invalid JSON payload.'}));
          }
        });
      });

      const validSocialPlatforms = new Set([
        'instagram',
        'facebook',
        'youtube',
        'google-business',
      ]);

      server.middlewares.use('/__api/social', (req, res, next) => {
        if (req.method === 'GET') {
          try {
            const socialPath = path.resolve(rootDir, 'src/data/socialMedia.json');
            const content = fs.readFileSync(socialPath, 'utf-8');
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(content);
          } catch {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({error: 'Unable to read src/data/socialMedia.json'}),
            );
          }
          return;
        }

        if (req.method !== 'POST') {
          next();
          return;
        }

        const chunks: Buffer[] = [];
        let totalBytes = 0;
        let aborted = false;

        req.on('data', (chunk: Buffer) => {
          if (aborted) return;
          totalBytes += chunk.length;
          if (totalBytes > MAX_BODY_BYTES) {
            aborted = true;
            res.statusCode = 413;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({error: 'Payload exceeds 12 MB limit.'}));
            req.destroy();
            return;
          }
          chunks.push(chunk);
        });

        req.on('end', () => {
          if (aborted) return;
          try {
            const rawBody = Buffer.concat(chunks).toString('utf-8');
            const parsed = JSON.parse(rawBody) as {
              profiles?: unknown;
              reels?: unknown;
            };
            if (!Array.isArray(parsed.profiles) || !Array.isArray(parsed.reels)) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  error: 'Expected JSON body with "profiles" and "reels" arrays.',
                }),
              );
              return;
            }
            if (parsed.reels.length > 100) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({error: 'Cannot exceed 100 reels.'}));
              return;
            }

            const sanitizedProfiles = [];
            for (const entry of parsed.profiles) {
              const p = entry as Record<string, unknown>;
              if (
                typeof p !== 'object' ||
                p === null ||
                typeof p.platform !== 'string' ||
                !validSocialPlatforms.has(p.platform) ||
                typeof p.name !== 'string' ||
                typeof p.handle !== 'string' ||
                typeof p.url !== 'string' ||
                typeof p.description !== 'string'
              ) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({error: 'Invalid social profile entry.'}));
                return;
              }
              sanitizedProfiles.push({
                platform: p.platform,
                name: p.name.trim(),
                handle: p.handle.trim(),
                url: p.url.trim(),
                description: p.description.trim(),
              });
            }

            const socialAssetsDir = path.resolve(rootDir, 'public/assets/social');
            const sanitizedReels = [];
            for (const entry of parsed.reels) {
              const r = entry as Record<string, unknown>;
              if (
                typeof r !== 'object' ||
                r === null ||
                typeof r.id !== 'string' ||
                typeof r.platform !== 'string' ||
                !validSocialPlatforms.has(r.platform) ||
                typeof r.title !== 'string' ||
                r.title.trim().length < 2 ||
                typeof r.caption !== 'string' ||
                typeof r.reelUrl !== 'string' ||
                typeof r.thumbnail !== 'string'
              ) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({error: 'Invalid reel entry.'}));
                return;
              }

              let thumbUrl = r.thumbnail.trim();
              const dataUriMatch = thumbUrl.match(
                /^data:image\/(png|jpeg|jpg|webp);base64,([A-Za-z0-9+/=]+)$/,
              );
              if (dataUriMatch) {
                const rawExt = dataUriMatch[1].toLowerCase();
                const ext = rawExt === 'jpeg' ? 'jpg' : rawExt;
                const imgBuffer = Buffer.from(dataUriMatch[2], 'base64');
                if (imgBuffer.length > MAX_IMAGE_BYTES) {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(
                    JSON.stringify({error: 'Reel cover image exceeds 2 MB limit.'}),
                  );
                  return;
                }
                const hash = crypto
                  .createHash('sha1')
                  .update(imgBuffer)
                  .digest('hex')
                  .slice(0, 8);
                const safeFilename = `${sanitizeFilenameSlug(r.id)}-${hash}.${ext}`;
                fs.mkdirSync(socialAssetsDir, {recursive: true});
                const destPath = path.resolve(socialAssetsDir, safeFilename);
                if (!destPath.startsWith(socialAssetsDir + path.sep)) {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({error: 'Invalid cover image path.'}));
                  return;
                }
                fs.writeFileSync(destPath, imgBuffer);
                thumbUrl = `/assets/social/${safeFilename}`;
              }

              sanitizedReels.push({
                id: r.id.trim(),
                platform: r.platform,
                title: r.title.trim(),
                caption: r.caption.trim(),
                reelUrl: r.reelUrl.trim(),
                thumbnail: thumbUrl,
                duration:
                  typeof r.duration === 'string' && r.duration.trim()
                    ? r.duration.trim()
                    : '0:30',
              });
            }

            const payloadToSave = {
              profiles: sanitizedProfiles,
              reels: sanitizedReels,
            };
            const socialPath = path.resolve(rootDir, 'src/data/socialMedia.json');
            fs.writeFileSync(
              socialPath,
              `${JSON.stringify(payloadToSave, null, 2)}\n`,
              'utf-8',
            );

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ok: true, data: payloadToSave}));
          } catch {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({error: 'Invalid JSON payload.'}));
          }
        });
      });
    },
  };
}

const MAX_VIDEO_BYTES = 50 * 1024 * 1024; // 50 MB per uploaded video
const VALID_SOCIAL_PLATFORMS = new Set([
  'instagram',
  'youtube',
  'facebook',
  'whatsapp',
  'x',
  'linkedin',
  'google',
  'website',
]);
const VALID_VIDEO_SOURCES = new Set([
  'uploaded',
  'youtube',
  'instagram',
  'facebook',
  'link',
]);
const ALLOWED_VIDEO_EXTS = new Set(['mp4', 'webm', 'mov', 'm4v']);

function isSafeExternalOrLocalUrl(raw: string, allowLocalVideo: boolean): boolean {
  const trimmed = raw.trim();
  if (!trimmed) return true;
  if (allowLocalVideo && trimmed.startsWith('/assets/videos/') && !trimmed.includes('..')) {
    return true;
  }
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

function socialMediaFileSyncPlugin(rootDir: string): Plugin {
  return {
    name: 'social-media-file-sync',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/__api/social-media/upload-video', (req, res, next) => {
        if (req.method !== 'POST') {
          next();
          return;
        }

        const rawNameHeader = req.headers['x-video-filename'];
        const rawFilename =
          typeof rawNameHeader === 'string'
            ? decodeURIComponent(rawNameHeader)
            : 'video.mp4';
        const extMatch = path.extname(rawFilename).toLowerCase().replace(/^\./, '');
        const ext = ALLOWED_VIDEO_EXTS.has(extMatch) ? extMatch : null;
        if (!ext) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(
            JSON.stringify({
              error: 'Unsupported video format. Please upload an MP4, WebM, MOV, or M4V video.',
            }),
          );
          return;
        }

        const chunks: Buffer[] = [];
        let totalBytes = 0;
        let aborted = false;

        req.on('data', (chunk: Buffer) => {
          if (aborted) return;
          totalBytes += chunk.length;
          if (totalBytes > MAX_VIDEO_BYTES) {
            aborted = true;
            res.statusCode = 413;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({error: 'Video file exceeds the 50 MB limit.'}));
            req.destroy();
            return;
          }
          chunks.push(chunk);
        });

        req.on('end', () => {
          if (aborted) return;
          try {
            const videoBuffer = Buffer.concat(chunks);
            if (videoBuffer.length === 0) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({error: 'Uploaded video file is empty.'}));
              return;
            }
            const baseSlug = sanitizeFilenameSlug(path.basename(rawFilename, path.extname(rawFilename)));
            const hash = crypto
              .createHash('sha1')
              .update(videoBuffer)
              .digest('hex')
              .slice(0, 8);
            const safeFilename = `${baseSlug}-${hash}.${ext}`;
            const videosDir = path.resolve(rootDir, 'public/assets/videos');
            fs.mkdirSync(videosDir, {recursive: true});
            const destPath = path.resolve(videosDir, safeFilename);
            if (!destPath.startsWith(videosDir + path.sep)) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({error: 'Invalid video destination path.'}));
              return;
            }
            fs.writeFileSync(destPath, videoBuffer);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                ok: true,
                url: `/assets/videos/${safeFilename}`,
                filename: safeFilename,
              }),
            );
          } catch {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({error: 'Failed to save uploaded video.'}));
          }
        });
      });

      server.middlewares.use('/__api/social-media', (req, res, next) => {
        if (req.url && req.url.startsWith('/upload-video')) {
          next();
          return;
        }
        const jsonPath = path.resolve(rootDir, 'src/data/socialMedia.json');

        if (req.method === 'GET') {
          try {
            const content = fs.readFileSync(jsonPath, 'utf-8');
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(content);
          } catch {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({error: 'Unable to read src/data/socialMedia.json'}));
          }
          return;
        }

        if (req.method !== 'POST') {
          next();
          return;
        }

        const chunks: Buffer[] = [];
        let totalBytes = 0;
        let aborted = false;

        req.on('data', (chunk: Buffer) => {
          if (aborted) return;
          totalBytes += chunk.length;
          if (totalBytes > 2 * 1024 * 1024) {
            aborted = true;
            res.statusCode = 413;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({error: 'Payload exceeds 2 MB limit.'}));
            req.destroy();
            return;
          }
          chunks.push(chunk);
        });

        req.on('end', () => {
          if (aborted) return;
          try {
            const parsed: unknown = JSON.parse(Buffer.concat(chunks).toString('utf-8'));
            if (typeof parsed !== 'object' || parsed === null) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({error: 'Invalid JSON payload.'}));
              return;
            }
            const payload = parsed as {socialPages?: unknown; videos?: unknown};
            if (!Array.isArray(payload.socialPages) || !Array.isArray(payload.videos)) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  error: 'Expected "socialPages" and "videos" arrays.',
                }),
              );
              return;
            }
            if (payload.socialPages.length > 30 || payload.videos.length > 50) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({error: 'Too many social pages or videos.'}));
              return;
            }

            const cleanPages = [];
            for (const entry of payload.socialPages) {
              if (typeof entry !== 'object' || entry === null) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({error: 'Invalid social page entry.'}));
                return;
              }
              const item = entry as Record<string, unknown>;
              if (
                typeof item.id !== 'string' ||
                typeof item.platform !== 'string' ||
                !VALID_SOCIAL_PLATFORMS.has(item.platform) ||
                typeof item.label !== 'string' ||
                typeof item.handle !== 'string' ||
                typeof item.url !== 'string' ||
                typeof item.description !== 'string' ||
                !isSafeExternalOrLocalUrl(item.url, false)
              ) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({error: 'Invalid social page fields or URL.'}));
                return;
              }
              cleanPages.push({
                id: item.id.trim(),
                platform: item.platform,
                label: item.label.trim(),
                handle: item.handle.trim(),
                url: item.url.trim(),
                description: item.description.trim(),
              });
            }

            const cleanVideos = [];
            for (const entry of payload.videos) {
              if (typeof entry !== 'object' || entry === null) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({error: 'Invalid video entry.'}));
                return;
              }
              const item = entry as Record<string, unknown>;
              if (
                typeof item.id !== 'string' ||
                typeof item.title !== 'string' ||
                typeof item.caption !== 'string' ||
                typeof item.sourceType !== 'string' ||
                !VALID_VIDEO_SOURCES.has(item.sourceType) ||
                typeof item.videoUrl !== 'string' ||
                typeof item.platformLabel !== 'string' ||
                typeof item.createdAt !== 'string' ||
                !item.videoUrl.trim() ||
                !isSafeExternalOrLocalUrl(item.videoUrl, true)
              ) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(
                  JSON.stringify({
                    error: 'Invalid video fields or unsupported video URL.',
                  }),
                );
                return;
              }
              cleanVideos.push({
                id: item.id.trim(),
                title: item.title.trim(),
                caption: item.caption.trim(),
                sourceType: item.sourceType,
                videoUrl: item.videoUrl.trim(),
                platformLabel: item.platformLabel.trim(),
                createdAt: item.createdAt.trim(),
              });
            }

            const savedData = {socialPages: cleanPages, videos: cleanVideos};
            fs.writeFileSync(jsonPath, `${JSON.stringify(savedData, null, 2)}\n`, 'utf-8');
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                ok: true,
                filePath: 'src/data/socialMedia.json',
                data: savedData,
              }),
            );
          } catch {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({error: 'Invalid JSON payload.'}));
          }
        });
      });
    },
  };
}

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, process.cwd(), '');
  const mapsApiKey =
    env.VITE_GOOGLE_MAPS_API_KEY ||
    process.env.VITE_GOOGLE_MAPS_API_KEY ||
    env.GOOGLE_MAPS_API_KEY ||
    process.env.GOOGLE_MAPS_API_KEY ||
    '';

  return {
    plugins: [
      react(),
      tailwindcss(),
      catalogFileSyncPlugin(__dirname),
      socialMediaFileSyncPlugin(__dirname),
      // Copies src/assets into dist/ so root-relative URLs like
      // "/src/assets/images/..." (e.g. generate_image output) still resolve
      // in production builds. Do not remove.
      {
        name: 'copy-unbundled-src-assets',
        apply: 'build',
        closeBundle(error?: Error): void {
          if (error) {
            return;
          }
          const distDir = path.resolve(__dirname, 'dist');
          const srcAssets = path.resolve(__dirname, 'src/assets');
          const distAssets = path.resolve(distDir, 'src/assets');
          if (fs.existsSync(distDir) && fs.existsSync(srcAssets)) {
            fs.cpSync(srcAssets, distAssets, {recursive: true, force: true});
          }
        },
      },
    ],
    define: {
      'import.meta.env.VITE_GOOGLE_MAPS_API_KEY': JSON.stringify(mapsApiKey),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
