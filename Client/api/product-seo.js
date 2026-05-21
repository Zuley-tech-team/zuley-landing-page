import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve the dist directory relative to this file — process.cwd() is unreliable
// in Vercel's serverless runtime. __dirname points to /api, so we go one level up.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_PATH = path.join(__dirname, '..', 'dist', 'index.html');

// Use API_BASE_URL (without the VITE_ prefix) in your Vercel Environment Variables.
// VITE_ vars are build-time only and are NOT available inside serverless functions at runtime.
const API_URL = process.env.API_BASE_URL || process.env.VITE_API_BASE_URL || 'https://api.zuley.in';

export default async function handler(req, res) {
  const { id } = req.query;

  let html;
  try {
    html = fs.readFileSync(DIST_PATH, 'utf8');
  } catch (e) {
    console.error('Failed to read dist/index.html:', e);
    return res.status(500).send('Internal Server Error');
  }

  try {
    // Correct API path: /api/v1/products/:sku (no extra "sku/" segment)
    const productRes = await fetch(`${API_URL}/api/v1/products/${encodeURIComponent(id)}`, {
      signal: AbortSignal.timeout(5000), // fail fast so we don't block the response
    });

    if (productRes.ok) {
      const data = await productRes.json();
      const product = data.data;

      if (product) {
        const title = `${product.name} | Zuley`;
        const description = product.features?.join(', ') || 'Shop premium personalized silver pens at Zuley.';
        const image = product.images?.[0] || product.image || 'https://zuley.in/og-image.svg';

        html = html
          .replace(/<title>.*?<\/title>/, `<title>${title}</title>`)
          .replace(/<meta name="description" content=".*?"\s*\/?>/, `<meta name="description" content="${description}" />`)
          .replace(/<meta property="og:title" content=".*?"\s*\/?>/, `<meta property="og:title" content="${title}" />`)
          .replace(/<meta property="og:description" content=".*?"\s*\/?>/, `<meta property="og:description" content="${description}" />`)
          .replace(/<meta property="og:image" content=".*?"\s*\/?>/, `<meta property="og:image" content="${image}" />`)
          .replace(/<meta name="twitter:title" content=".*?"\s*\/?>/, `<meta name="twitter:title" content="${title}" />`)
          .replace(/<meta name="twitter:description" content=".*?"\s*\/?>/, `<meta name="twitter:description" content="${description}" />`)
          .replace(/<meta name="twitter:image" content=".*?"\s*\/?>/, `<meta name="twitter:image" content="${image}" />`);
      }
    }
  } catch (fetchError) {
    // Product fetch failed — still serve index.html so the SPA can load normally
    console.error('Product SEO fetch failed, serving generic HTML:', fetchError);
  }

  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
  res.status(200).send(html);
}

