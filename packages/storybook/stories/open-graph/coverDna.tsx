import React from 'react';
import type { CSSProperties } from 'react';
import LogoIcon from '@dailydotdev/shared/src/svg/LogoIcon';
import LogoText from '@dailydotdev/shared/src/svg/LogoText';
import { Cover, Logo, GRAD, CABBAGE, ONION, white } from './cover';
import type { CoverCategory } from './cover';

/**
 * 20 fresh recognizability treatments on the locked clean baseline — four
 * "systems" for making a cover instantly read as daily.dev:
 *   A. Frame & edge   B. Brand color skin   C. Background brand mark
 *   D. Brand lockup (the logo treatment top-right)
 * Each changes exactly one thing; the rest of the clean cover is untouched.
 */

// ============================ A · FRAME & EDGE =============================
const Keyline = (): React.ReactElement => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      zIndex: 4,
      borderRadius: '2cqw',
      padding: '0.45cqw',
      background: GRAD,
      WebkitMask:
        'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
      WebkitMaskComposite: 'xor',
      maskComposite: 'exclude',
      pointerEvents: 'none',
    }}
  />
);
const BottomBar = (): React.ReactElement => (
  <div
    style={{
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      height: '1.3cqw',
      background: GRAD,
      zIndex: 4,
    }}
  />
);
const LeftSpine = (): React.ReactElement => (
  <div
    style={{
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: '1.4cqw',
      background: GRAD,
      zIndex: 4,
    }}
  />
);
const bar = (s: CSSProperties): React.ReactElement => (
  <span
    style={{
      position: 'absolute',
      background: GRAD,
      borderRadius: '1cqw',
      ...s,
    }}
  />
);
const Brackets = (): React.ReactElement => (
  <div
    style={{ position: 'absolute', inset: 0, zIndex: 4, pointerEvents: 'none' }}
  >
    {bar({ top: '3cqw', left: '3cqw', width: '11cqw', height: '0.7cqw' })}
    {bar({ top: '3cqw', left: '3cqw', width: '0.7cqw', height: '11cqw' })}
    {bar({ bottom: '3cqw', right: '3cqw', width: '11cqw', height: '0.7cqw' })}
    {bar({ bottom: '3cqw', right: '3cqw', width: '0.7cqw', height: '11cqw' })}
  </div>
);
const InsetFrame = (): React.ReactElement => (
  <div
    style={{
      position: 'absolute',
      inset: '2.4cqw',
      zIndex: 4,
      borderRadius: '1.4cqw',
      border: '0.18cqw solid rgba(255,255,255,0.45)',
      pointerEvents: 'none',
    }}
  />
);
const A1 = (): React.ReactElement => <Cover overlay={<Keyline />} />;
const A2 = (): React.ReactElement => <Cover overlay={<BottomBar />} />;
const A3 = (): React.ReactElement => <Cover overlay={<LeftSpine />} />;
const A4 = (): React.ReactElement => <Cover overlay={<Brackets />} />;
const A5 = (): React.ReactElement => <Cover overlay={<InsetFrame />} />;

// ============================ B · BRAND COLOR SKIN ========================
const Duotone = (): React.ReactElement => (
  <>
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 1,
        background: GRAD,
        mixBlendMode: 'color',
        opacity: 0.72,
      }}
    />
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 1,
        background:
          'linear-gradient(180deg, rgba(8,11,16,0.2), rgba(8,11,16,0.55))',
      }}
    />
  </>
);
const SoftWash = (): React.ReactElement => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      zIndex: 1,
      background: GRAD,
      opacity: 0.16,
    }}
  />
);
const CornerGlow = (): React.ReactElement => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      zIndex: 1,
      background: `radial-gradient(40cqw 40cqw at 100% 0%, ${CABBAGE}55, transparent 60%), radial-gradient(40cqw 40cqw at 0% 100%, ${ONION}44, transparent 60%)`,
    }}
  />
);
const Vignette = (): React.ReactElement => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      zIndex: 4,
      boxShadow: `inset 0 0 16cqw 5cqw ${CABBAGE}22, inset 0 0 6cqw 2cqw ${ONION}22`,
      borderRadius: '2cqw',
      pointerEvents: 'none',
    }}
  />
);
const TopFlood = (): React.ReactElement => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      zIndex: 1,
      background: `linear-gradient(180deg, ${CABBAGE}3a, transparent 38%)`,
    }}
  />
);
const B1 = (): React.ReactElement => <Cover bg={<Duotone />} />;
const B2 = (): React.ReactElement => <Cover bg={<SoftWash />} />;
const B3 = (): React.ReactElement => <Cover bg={<CornerGlow />} />;
const B4 = (): React.ReactElement => <Cover overlay={<Vignette />} />;
const B5 = (): React.ReactElement => <Cover bg={<TopFlood />} />;

// ============================ C · BACKGROUND BRAND MARK ===================
const MonogramWatermark = (): React.ReactElement => (
  <div
    style={{
      position: 'absolute',
      left: '-5cqw',
      bottom: '-8cqw',
      width: '50cqw',
      height: '29cqw',
      opacity: 0.09,
      zIndex: 1,
      ...white,
    }}
  >
    <LogoIcon className={{ container: 'h-full w-full' }} />
  </div>
);
const CenterEmboss = (): React.ReactElement => (
  <div
    style={{
      position: 'absolute',
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%)',
      width: '46cqw',
      height: '27cqw',
      opacity: 0.06,
      zIndex: 1,
      ...white,
    }}
  >
    <LogoIcon className={{ container: 'h-full w-full' }} />
  </div>
);
const Sheen = (): React.ReactElement => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      zIndex: 1,
      background: `linear-gradient(115deg, transparent 40%, ${CABBAGE}22 50%, transparent 60%)`,
    }}
  />
);
const DotGrid = (): React.ReactElement => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      zIndex: 1,
      backgroundImage:
        'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)',
      backgroundSize: '3.2cqw 3.2cqw',
    }}
  />
);
const GhostWordmark = (): React.ReactElement => (
  <span
    style={{
      position: 'absolute',
      left: '3cqw',
      bottom: '-3.5cqw',
      zIndex: 1,
      fontSize: '17cqw',
      fontWeight: 900,
      letterSpacing: '-0.5cqw',
      color: 'rgba(255,255,255,0.045)',
      whiteSpace: 'nowrap',
    }}
  >
    daily.dev
  </span>
);
const C1 = (): React.ReactElement => <Cover bg={<MonogramWatermark />} />;
const C2 = (): React.ReactElement => <Cover bg={<CenterEmboss />} />;
const C3 = (): React.ReactElement => <Cover bg={<Sheen />} />;
const C4 = (): React.ReactElement => <Cover bg={<DotGrid />} />;
const C5 = (): React.ReactElement => <Cover bg={<GhostWordmark />} />;

// ============================ D · BRAND LOCKUP (top-right) ================
const Mark = ({
  h = 3,
  color = '#fff',
}: {
  h?: number;
  color?: string;
}): React.ReactElement => (
  <span
    style={{
      display: 'inline-flex',
      width: `${h * 1.75}cqw`,
      height: `${h}cqw`,
      ['--theme-text-primary' as string]: color,
    }}
  >
    <LogoIcon className={{ container: 'h-full w-full' }} />
  </span>
);
const Word = ({ h = 3 }: { h?: number }): React.ReactElement => (
  <span
    style={{
      display: 'inline-flex',
      width: `${h * 3.85}cqw`,
      height: `${h}cqw`,
      ...white,
    }}
  >
    <LogoText className={{ container: 'h-full w-full' }} />
  </span>
);
const LogoPill = (): React.ReactElement => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '1.4cqw 2.6cqw',
      borderRadius: '99cqw',
      background: 'rgba(255,255,255,0.1)',
      border: '0.12cqw solid rgba(255,255,255,0.2)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
    }}
  >
    <Logo />
  </span>
);
const LogoUnderline = (): React.ReactElement => (
  <span
    style={{
      display: 'inline-flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      gap: '1cqw',
    }}
  >
    <Logo />
    <span
      style={{
        width: '100%',
        height: '0.8cqw',
        borderRadius: '1cqw',
        background: GRAD,
      }}
    />
  </span>
);
const LogoTile = (): React.ReactElement => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '1.6cqw' }}>
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '6.4cqw',
        height: '6.4cqw',
        borderRadius: '1.8cqw',
        background: GRAD,
      }}
    >
      <Mark h={2.6} />
    </span>
    <Word h={3} />
  </span>
);
const LogoDot = (): React.ReactElement => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '1.6cqw' }}>
    <span
      style={{
        width: '2cqw',
        height: '2cqw',
        borderRadius: '50%',
        background: GRAD,
        boxShadow: `0 0 1.8cqw ${CABBAGE}`,
      }}
    />
    <Logo />
  </span>
);
const LogoRail = (): React.ReactElement => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '1.8cqw' }}>
    <span
      style={{
        width: '0.7cqw',
        height: '5.4cqw',
        borderRadius: '1cqw',
        background: GRAD,
      }}
    />
    <Logo />
  </span>
);
const D1 = (): React.ReactElement => <Cover logo={<LogoPill />} />;
const D2 = (): React.ReactElement => <Cover logo={<LogoUnderline />} />;
const D3 = (): React.ReactElement => <Cover logo={<LogoTile />} />;
const D4 = (): React.ReactElement => <Cover logo={<LogoDot />} />;
const D5 = (): React.ReactElement => <Cover logo={<LogoRail />} />;

export const COVER_DNA: CoverCategory[] = [
  {
    category: 'Frame & edge',
    blurb:
      'A consistent border/edge brands every cover (the way a card chrome does). Cleanest, most system-like.',
    items: [
      { id: 'a1', name: 'Gradient keyline', Component: A1 },
      { id: 'a2', name: 'Bottom brand bar', Component: A2 },
      { id: 'a3', name: 'Left brand spine', Component: A3 },
      { id: 'a4', name: 'Corner brackets', Component: A4 },
      { id: 'a5', name: 'Inset frame', Component: A5 },
    ],
  },
  {
    category: 'Brand color skin',
    blurb:
      'A consistent color treatment of the imagery — ownable at thumbnail size.',
    items: [
      { id: 'b1', name: 'Brand duotone', Component: B1 },
      { id: 'b2', name: 'Soft brand wash', Component: B2 },
      { id: 'b3', name: 'Corner glow', Component: B3 },
      { id: 'b4', name: 'Brand vignette', Component: B4 },
      { id: 'b5', name: 'Top flood', Component: B5 },
    ],
  },
  {
    category: 'Background brand mark',
    blurb: 'The mark/wordmark lives quietly behind the content as a watermark.',
    items: [
      { id: 'c1', name: 'Monogram watermark', Component: C1 },
      { id: 'c2', name: 'Center emboss', Component: C2 },
      { id: 'c3', name: 'Diagonal sheen', Component: C3 },
      { id: 'c4', name: 'Dot grid', Component: C4 },
      { id: 'c5', name: 'Ghost wordmark', Component: C5 },
    ],
  },
  {
    category: 'Brand lockup (the logo, top-right)',
    blurb:
      'A consistent treatment of the logo where it already sits — restrained.',
    items: [
      { id: 'd1', name: 'Logo pill', Component: D1 },
      { id: 'd2', name: 'Logo underline', Component: D2 },
      { id: 'd3', name: 'Logo tile', Component: D3 },
      { id: 'd4', name: 'Brand dot', Component: D4 },
      { id: 'd5', name: 'Brand rail', Component: D5 },
    ],
  },
];
