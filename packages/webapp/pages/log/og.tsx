import type { ReactElement } from 'react';
import React from 'react';
import Head from 'next/head';
import Logo, { LogoPosition } from '@dailydotdev/shared/src/components/Logo';

// Design system colors
const PALETTE = {
  pepper90: '#0E1217',
  bun40: '#FF8E3B',
  cheese40: '#FFE923',
  cabbage40: '#CE3DF3',
  lettuce40: '#ACF535',
  water40: '#427EF7',
  blueCheese40: '#2CDCE6',
  onion10: '#9D70F8',
  salt0: '#FFFFFF',
};

// Decorative star positions for the OG image
const STARS = [
  {
    id: 'star-1',
    top: '12%',
    left: '8%',
    size: '2rem',
    char: '✦',
    color: PALETTE.cheese40,
  },
  {
    id: 'star-2',
    top: '18%',
    right: '12%',
    size: '1.5rem',
    char: '★',
    color: PALETTE.lettuce40,
  },
  {
    id: 'star-3',
    bottom: '22%',
    left: '10%',
    size: '1.75rem',
    char: '✶',
    color: PALETTE.cabbage40,
  },
  {
    id: 'star-4',
    bottom: '15%',
    right: '8%',
    size: '2rem',
    char: '✦',
    color: PALETTE.bun40,
  },
  {
    id: 'star-5',
    top: '45%',
    left: '5%',
    size: '1.25rem',
    char: '★',
    color: PALETTE.blueCheese40,
  },
  {
    id: 'star-6',
    top: '50%',
    right: '6%',
    size: '1.5rem',
    char: '◆',
    color: PALETTE.onion10,
  },
  {
    id: 'star-7',
    bottom: '40%',
    left: '3%',
    size: '1rem',
    char: '✧',
    color: PALETTE.water40,
  },
  {
    id: 'star-8',
    bottom: '35%',
    right: '4%',
    size: '1.25rem',
    char: '✦',
    color: PALETTE.cheese40,
  },
];

export default function LogOGImage(): ReactElement {
  return (
    <>
      <Head>
        <title>Log 2025 OG Image | daily.dev</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <div
        style={{
          width: '1200px',
          height: '630px',
          background: PALETTE.pepper90,
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily:
            'Helvetica Neue, Helvetica, Inter, Arial, Segoe UI, system-ui, sans-serif',
        }}
      >
        {/* Background burst effect */}
        <div
          style={{
            position: 'absolute',
            inset: '-50%',
            background: `repeating-conic-gradient(
              from 0deg at 50% 50%,
              ${PALETTE.pepper90} 0deg 10deg,
              rgba(206, 61, 243, 0.06) 10deg 20deg
            )`,
          }}
        />

        {/* Decorative stars */}
        {STARS.map((star) => (
          <div
            key={star.id}
            style={{
              position: 'absolute',
              top: star.top,
              left: star.left,
              right: star.right,
              bottom: star.bottom,
              fontSize: star.size,
              color: star.color,
              zIndex: 1,
            }}
          >
            {star.char}
          </div>
        ))}

        {/* Main content */}
        <div
          style={{
            position: 'relative',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            padding: '0 60px',
          }}
        >
          {/* Logo */}
          <div
            style={{
              marginBottom: '40px',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <Logo
              position={LogoPosition.Empty}
              linkDisabled
              logoClassName={{ container: 'h-10' }}
            />
          </div>

          {/* Year label */}
          <div
            style={{
              fontSize: '1.5rem',
              letterSpacing: '0.3em',
              color: PALETTE.cheese40,
              textTransform: 'uppercase',
              marginBottom: '16px',
              fontWeight: 500,
            }}
          >
            YOUR YEAR IN REVIEW
          </div>

          {/* Main title */}
          <div
            style={{
              fontSize: '10rem',
              fontWeight: 700,
              color: PALETTE.salt0,
              lineHeight: 0.9,
              textShadow: `
                6px 6px 0 ${PALETTE.bun40},
                12px 12px 0 ${PALETTE.cabbage40}
              `,
              marginBottom: '20px',
            }}
          >
            2025
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: '3.5rem',
              fontWeight: 700,
              color: PALETTE.lettuce40,
              textShadow: '3px 3px 0 rgba(0, 0, 0, 0.3)',
              letterSpacing: '0.15em',
            }}
          >
            LOG
          </div>

          {/* Divider */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              margin: '32px 0',
            }}
          >
            <div
              style={{
                width: '60px',
                height: '4px',
                background: PALETTE.cheese40,
              }}
            />
            <div
              style={{
                color: PALETTE.cabbage40,
                fontSize: '1rem',
              }}
            >
              ◆
            </div>
            <div
              style={{
                width: '60px',
                height: '4px',
                background: PALETTE.cheese40,
              }}
            />
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: '1.25rem',
              color: 'rgba(255, 255, 255, 0.7)',
              fontFamily:
                'Fira Code, SF Mono, Consolas, Menlo, Courier New, monospace',
              letterSpacing: '0.1em',
            }}
          >
            Discover your developer archetype
          </div>
        </div>

        {/* Bottom URL */}
        <div
          style={{
            position: 'absolute',
            bottom: '24px',
            left: 0,
            right: 0,
            textAlign: 'center',
            fontSize: '1rem',
            color: 'rgba(255, 255, 255, 0.5)',
            fontFamily:
              'Fira Code, SF Mono, Consolas, Menlo, Courier New, monospace',
            letterSpacing: '0.05em',
          }}
        >
          app.daily.dev/log
        </div>
      </div>
    </>
  );
}

// Disable the default layout for screenshot
LogOGImage.getLayout = (page: ReactElement) => page;
