import { NextResponse } from 'next/server';

export async function GET() {
  // Get the current date in ISO format for lastmod
  const date = new Date().toISOString();

  // Static URLs - add more routes as needed
  const staticUrls = [
    '',                 // Homepage
    '/login',           // Login page
    '/register',        // Register page
    '/privacy',         // Privacy Policy
    '/terms',           // Terms of Service
    '/accessibility',   // Accessibility Statement
    '/chat',            // Chat page
    '/persona',         // Persona page
    '/persona/create',  // Create persona page
    '/tokens',          // Tokens page
    '/profile',         // Profile page
  ];

  // Generate XML for static URLs
  const staticUrlsXml = staticUrls
    .map(
      (url) => `
  <url>
    <loc>https://obai.com${url}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>${url === '' ? 'daily' : 'weekly'}</changefreq>
    <priority>${url === '' ? '1.0' : '0.8'}</priority>
  </url>`
    )
    .join('');

  // Build the complete sitemap XML
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrlsXml}
</urlset>`;

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
