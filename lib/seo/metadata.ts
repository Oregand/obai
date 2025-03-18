import { Metadata } from 'next';

// Default metadata
const defaultMetadata: Metadata = {
  title: {
    default: 'OBAI - Role Play with AI Personas',
    template: '%s | OBAI'
  },
  description: 'Chat with custom AI personas powered by Grok 3. Create and share unique AI characters for immersive conversations.',
  keywords: [
    'AI chat',
    'AI personas',
    'Grok AI',
    'role play',
    'AI characters',
    'AI conversations',
    'custom AI'
  ],
  authors: [{ name: 'OBAI Team' }],
  creator: 'OBAI',
  publisher: 'OBAI',
  formatDetection: {
    email: false,
    telephone: false,
    address: false,
  },
  metadataBase: new URL('https://obai.com'), // Update with your actual domain
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://obai.com',
    siteName: 'OBAI',
    title: 'OBAI - Role Play with AI Personas',
    description: 'Chat with custom AI personas powered by Grok 3. Create and share unique AI characters for immersive conversations.',
    images: [
      {
        url: 'https://obai.com/images/og-image.jpg', // Update with your actual image path
        width: 1200,
        height: 630,
        alt: 'OBAI - Role Play with AI Personas',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OBAI - Role Play with AI Personas',
    description: 'Chat with custom AI personas powered by Grok 3. Create and share unique AI characters for immersive conversations.',
    creator: '@obai',
    images: ['https://obai.com/images/twitter-image.jpg'], // Update with your actual image path
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
    other: {
      rel: 'apple-touch-icon-precomposed',
      url: '/apple-touch-icon-precomposed.png',
    },
  },
  manifest: '/site.webmanifest',
  category: 'technology',
};

// Function to generate metadata for specific pages
export function generateMetadata(
  title?: string,
  description?: string,
  path?: string,
  ogImage?: string,
  noIndex?: boolean
): Metadata {
  // Create a copy of the default metadata
  const metadata = { ...defaultMetadata };

  // Override with provided values
  if (title) {
    metadata.title = title;
    if (metadata.openGraph) metadata.openGraph.title = title;
    if (metadata.twitter) metadata.twitter.title = title;
  }

  if (description) {
    metadata.description = description;
    if (metadata.openGraph) metadata.openGraph.description = description;
    if (metadata.twitter) metadata.twitter.description = description;
  }

  if (path && metadata.openGraph) {
    metadata.openGraph.url = `https://obai.com${path}`;
  }

  if (ogImage && metadata.openGraph && metadata.openGraph.images && Array.isArray(metadata.openGraph.images)) {
    metadata.openGraph.images = [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: title || 'OBAI',
      },
    ];
  }

  if (ogImage && metadata.twitter) {
    metadata.twitter.images = [ogImage];
  }

  // Set noindex if specified
  if (noIndex) {
    metadata.robots = {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    };
  }

  return metadata;
}

// Generate JSON-LD structured data for different page types
export function generateJsonLd(type: 'website' | 'person' | 'product' | 'article', data: any) {
  switch (type) {
    case 'website':
      return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        url: 'https://obai.com',
        name: 'OBAI',
        description: 'Chat with custom AI personas powered by Grok 3',
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://obai.com/search?q={search_term_string}',
          'query-input': 'required name=search_term_string',
        },
      };
    case 'person':
      return {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: data.name,
        description: data.description,
        image: data.image,
      };
    case 'product':
      return {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: data.name,
        description: data.description,
        image: data.image,
        offers: {
          '@type': 'Offer',
          price: data.price,
          priceCurrency: data.currency || 'USD',
          availability: 'https://schema.org/InStock',
        },
      };
    case 'article':
      return {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: data.title,
        description: data.description,
        image: data.image,
        datePublished: data.datePublished,
        dateModified: data.dateModified,
        author: {
          '@type': 'Person',
          name: data.author,
        },
      };
    default:
      return null;
  }
}

export default defaultMetadata;
