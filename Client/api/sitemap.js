import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  const API_URL = process.env.VITE_API_BASE_URL || 'http://localhost:8000';
  
  try {
    const response = await fetch(`${API_URL}/sitemap.xml`);
    if (response.ok) {
      const xml = await response.text();
      res.setHeader('Content-Type', 'application/xml');
      // Cache for an hour to keep it extremely fast
      res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
      res.status(200).send(xml);
      return;
    }
  } catch (error) {
    console.error('Error fetching dynamic sitemap:', error);
  }

  // Fallback to the old static sitemap if backend fails
  try {
    const staticSitemapPath = path.join(process.cwd(), 'dist', 'sitemap.xml');
    const staticSitemap = fs.readFileSync(staticSitemapPath, 'utf8');
    res.setHeader('Content-Type', 'application/xml');
    res.status(200).send(staticSitemap);
  } catch (e) {
    res.status(404).send('Sitemap not found');
  }
}
