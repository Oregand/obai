import { NextResponse } from 'next/server';

export async function GET() {
  const robotsTxt = `
# https://www.robotstxt.org/robotstxt.html
User-agent: *
Allow: /

# Disallow admin routes
Disallow: /admin/
Disallow: /api/

# Host
Host: https://obai.com

# Sitemaps
Sitemap: https://obai.com/sitemap.xml
`;

  return new NextResponse(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}
