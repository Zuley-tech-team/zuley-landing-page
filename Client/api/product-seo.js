import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  const { id } = req.query;
  const API_URL = process.env.VITE_API_BASE_URL || 'http://localhost:8000';

  try {
    // Read the compiled index.html
    const indexPath = path.join(process.cwd(), 'dist', 'index.html');
    let html = fs.readFileSync(indexPath, 'utf8');

    // Fetch product details
    const productRes = await fetch(`${API_URL}/api/v1/products/sku/${id}`);
    
    if (productRes.ok) {
      const data = await productRes.json();
      const product = data.data; // Assuming your API returns { success: true, data: { ... } }
      
      if (product) {
        const title = `${product.name} | Zuley`;
        const description = product.features?.join(', ') || 'Shop premium personalized silver pens at Zuley.';
        const image = product.images?.[0] || product.image || 'https://zuley.in/og-image.svg';
        
        // Replace meta tags in the raw HTML
        html = html
          .replace(/<title>.*?<\/title>/, `<title>${title}</title>`)
          .replace(/<meta name="description" content=".*?"\s*\/>/, `<meta name="description" content="${description}" />`)
          .replace(/<meta property="og:title" content=".*?"\s*\/>/, `<meta property="og:title" content="${title}" />`)
          .replace(/<meta property="og:description" content=".*?"\s*\/>/, `<meta property="og:description" content="${description}" />`)
          .replace(/<meta property="og:image" content=".*?"\s*\/>/, `<meta property="og:image" content="${image}" />`)
          .replace(/<meta name="twitter:title" content=".*?"\s*\/>/, `<meta name="twitter:title" content="${title}" />`)
          .replace(/<meta name="twitter:description" content=".*?"\s*\/>/, `<meta name="twitter:description" content="${description}" />`)
          .replace(/<meta name="twitter:image" content=".*?"\s*\/>/, `<meta name="twitter:image" content="${image}" />`);
      }
    }

    // Serve the dynamically modified HTML
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate'); // Cache for performance
    res.status(200).send(html);
  } catch (error) {
    console.error('Error generating product SEO:', error);
    // Fallback to sending the original index.html if an error occurs
    try {
      const indexPath = path.join(process.cwd(), 'dist', 'index.html');
      const html = fs.readFileSync(indexPath, 'utf8');
      res.setHeader('Content-Type', 'text/html');
      res.status(200).send(html);
    } catch (e) {
      res.status(500).send('Internal Server Error');
    }
  }
}
