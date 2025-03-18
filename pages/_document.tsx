import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Meta tags for improved security */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="theme-color" content="#000000" />
        
        {/* Favicon and PWA manifests would go here */}
        <link rel="icon" href="/favicon.ico" />
        
        {/* Preconnect to external domains we use */}
        <link rel="preconnect" href="https://api.x.ai" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossOrigin="anonymous" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
