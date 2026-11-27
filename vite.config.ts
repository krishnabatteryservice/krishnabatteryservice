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
