import React from 'react';
import Head from 'next/head';

const TITLE = 'Log 2025 | daily.dev';
const DESCRIPTION =
  'Your stats. Your story. Discover your developer archetype.';
const IMAGE_URL =
  'https://media.daily.dev/image/upload/s--S6QRV0hA--/f_auto,q_auto/v1765881331/public/log_2025';

export default function LogPageHead(): React.ReactElement {
  return (
    <Head>
      <title>{TITLE}</title>
      <meta name="description" content={DESCRIPTION} />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, viewport-fit=cover"
      />
      {/* Open Graph */}
      <meta property="og:title" content={TITLE} />
      <meta property="og:description" content={DESCRIPTION} />
      <meta property="og:image" content={IMAGE_URL} />
      <meta property="og:type" content="website" />
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={TITLE} />
      <meta name="twitter:description" content={DESCRIPTION} />
      <meta name="twitter:image" content={IMAGE_URL} />
    </Head>
  );
}
