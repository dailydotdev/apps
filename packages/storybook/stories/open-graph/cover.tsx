import React from 'react';
import type { CSSProperties, ReactNode } from 'react';
import LogoIcon from '@dailydotdev/shared/src/svg/LogoIcon';
import LogoText from '@dailydotdev/shared/src/svg/LogoText';
import { UpvoteIcon } from '@dailydotdev/shared/src/components/icons/Upvote';
import { DiscussIcon } from '@dailydotdev/shared/src/components/icons/Discuss';

/**
 * The locked "Layout A — clean" baseline cover, self-contained.
 * Source top-left, real daily.dev logo top-right, headline left, cover art
 * bottom-right (bottom-aligned with the actions bar), and a glass/blur
 * upvote + comment actions bar pinned bottom-left. This is the agreed base —
 * recognizability explorations build on it via the slot props.
 */

export const SANS =
  '-apple-system, "Helvetica Neue", Helvetica, Inter, Arial, "Segoe UI", system-ui, sans-serif';
export const MONO =
  '"SF Mono", "JetBrains Mono", "Fira Code", ui-monospace, Menlo, monospace';

export const INK = '#0B0E13';
export const CABBAGE = '#CE3DF3';
export const ONION = '#8A63F4';
export const AVOCADO = '#1DDC6F';
export const CHEESE = '#FFE923';
export const BLUECHEESE = '#2CDCE6';
export const BACON = '#FF5C5C';
export const TEXT = '#FFFFFF';
export const TERTIARY = '#A6AEBF';
export const SECONDARY = '#D7DCE6';
export const GRAD = `linear-gradient(135deg, ${CABBAGE}, ${ONION})`;
export const white = {
  ['--theme-text-primary' as string]: '#FFFFFF',
} as CSSProperties;

const COVER =
  'https://media.daily.dev/image/upload/s--P4t4XyoV--/f_auto/v1722860399/public/Placeholder%2001';

export interface CoverData {
  title: string;
  source: string;
  sourceColor: string;
  readTime: string;
  upvotes: string;
  comments: string;
  cover: string;
}
export const XD: CoverData = {
  title: 'How we cut edge cold-starts by 90% with Rust and Wasm',
  source: 'The Pragmatic Engineer',
  sourceColor: '#FF8E3B',
  readTime: '6m read',
  upvotes: '312',
  comments: '448',
  cover: COVER,
};

export const clamp = (lines: number): CSSProperties => ({
  display: '-webkit-box',
  WebkitLineClamp: lines,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
});

export const Root = ({
  children,
}: {
  children: ReactNode;
}): React.ReactElement => (
  <div
    style={{
      width: '100%',
      aspectRatio: '1200 / 630',
      containerType: 'inline-size',
      position: 'relative',
      overflow: 'hidden',
      borderRadius: '2cqw',
      background: INK,
      fontFamily: SANS,
    }}
  >
    {children}
  </div>
);

export const Ambient = ({ src }: { src: string }): React.ReactElement => (
  <>
    <img
      src={src}
      alt=""
      style={{
        position: 'absolute',
        inset: '-25%',
        width: '150%',
        height: '150%',
        objectFit: 'cover',
        filter: 'blur(13cqw) saturate(1.7) brightness(0.9)',
        zIndex: 0,
      }}
    />
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        background:
          'linear-gradient(180deg, rgba(7,9,13,0.5), rgba(7,9,13,0.78))',
      }}
    />
  </>
);

export const Logo = (): React.ReactElement => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '1.6cqw',
      ...white,
    }}
  >
    <span style={{ display: 'inline-flex', width: '5.25cqw', height: '3cqw' }}>
      <LogoIcon className={{ container: 'h-full w-full' }} />
    </span>
    <span style={{ display: 'inline-flex', width: '11.5cqw', height: '3cqw' }}>
      <LogoText className={{ container: 'h-full w-full' }} />
    </span>
  </span>
);

export const Source = ({ d }: { d: CoverData }): React.ReactElement => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '1.4cqw',
      minWidth: 0,
    }}
  >
    <span
      style={{
        width: '3.6cqw',
        height: '3.6cqw',
        borderRadius: '1cqw',
        background: d.sourceColor,
        flexShrink: 0,
      }}
    />
    <span
      style={{
        color: SECONDARY,
        fontSize: '2.3cqw',
        fontWeight: 500,
        ...clamp(1),
      }}
    >
      {d.source}
    </span>
    <span style={{ color: TERTIARY, fontSize: '2.1cqw', flexShrink: 0 }}>
      · {d.readTime}
    </span>
  </div>
);

const Stat = ({
  Cmp,
  count,
}: {
  Cmp: typeof UpvoteIcon;
  count: string;
}): React.ReactElement => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '1.1cqw' }}>
    <span
      style={{
        display: 'inline-flex',
        width: '3.6cqw',
        height: '3.6cqw',
        color: TEXT,
      }}
    >
      <Cmp style={{ width: '100%', height: '100%' }} />
    </span>
    <span
      style={{
        color: TEXT,
        fontSize: '2.5cqw',
        fontWeight: 600,
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {count}
    </span>
  </span>
);

// The glass/blur bar chrome — shared by the engagement bar and meta pills.
export const GlassBar = ({
  children,
  style,
}: {
  children: ReactNode;
  style?: CSSProperties;
}): React.ReactElement => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '2cqw 3cqw',
      borderRadius: '2.4cqw',
      background: 'rgba(255,255,255,0.1)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      border: '0.15cqw solid rgba(255,255,255,0.22)',
      boxShadow: 'inset 0 0.15cqw 0 rgba(255,255,255,0.12)',
      ...style,
    }}
  >
    {children}
  </div>
);

export const Actions = ({ d }: { d: CoverData }): React.ReactElement => (
  <GlassBar>
    <span style={{ display: 'flex', alignItems: 'center', gap: '3.4cqw' }}>
      <Stat Cmp={UpvoteIcon} count={d.upvotes} />
      <span
        style={{
          width: '0.15cqw',
          height: '3.4cqw',
          background: 'rgba(255,255,255,0.16)',
        }}
      />
      <Stat Cmp={DiscussIcon} count={d.comments} />
    </span>
  </GlassBar>
);

export const MetaPill = ({ text }: { text: string }): React.ReactElement => (
  <GlassBar>
    <span style={{ color: SECONDARY, fontSize: '2.5cqw', fontWeight: 600 }}>
      {text}
    </span>
  </GlassBar>
);

export interface StatItem {
  label: string;
  Cmp: typeof UpvoteIcon;
  value: string;
  color?: string;
}

// Glass bar with several icon+number stats (profile reputation/streak/posts,
// squad members/posts/upvotes) — same chrome as the engagement bar.
export const StatBar = ({
  stats,
}: {
  stats: StatItem[];
}): React.ReactElement => (
  <GlassBar>
    <span style={{ display: 'flex', alignItems: 'center', gap: '3cqw' }}>
      {stats.map((s, i) => (
        <React.Fragment key={s.label}>
          {i > 0 && (
            <span
              style={{
                width: '0.15cqw',
                height: '3.4cqw',
                background: 'rgba(255,255,255,0.16)',
              }}
            />
          )}
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '1.1cqw',
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                width: '3.4cqw',
                height: '3.4cqw',
                color: s.color ?? TEXT,
              }}
            >
              <s.Cmp secondary style={{ width: '100%', height: '100%' }} />
            </span>
            <span
              style={{
                color: TEXT,
                fontSize: '2.5cqw',
                fontWeight: 600,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {s.value}
            </span>
          </span>
        </React.Fragment>
      ))}
    </span>
  </GlassBar>
);

// White primary button (daily.dev primary on a dark surface).
export const PrimaryButton = ({
  children,
}: {
  children: ReactNode;
}): React.ReactElement => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '1.2cqw',
      padding: '2.2cqw 4cqw',
      borderRadius: '2.4cqw',
      background: '#FFFFFF',
      color: INK,
      fontSize: '2.8cqw',
      fontWeight: 800,
      boxShadow: '0 1.5cqw 4cqw rgba(0,0,0,0.35)',
    }}
  >
    {children}
  </span>
);

export const Headline = ({ d }: { d: CoverData }): React.ReactElement => (
  <span
    style={{
      color: TEXT,
      fontSize: '5.2cqw',
      fontWeight: 800,
      lineHeight: 1.07,
      letterSpacing: '-0.06cqw',
      textWrap: 'balance',
      ...clamp(3),
    }}
  >
    {d.title}
  </span>
);

// Headline/title for the generalized cover (any text, sized per use case).
export const Title = ({
  children,
  size = 5.2,
  lines = 3,
}: {
  children: ReactNode;
  size?: number;
  lines?: number;
}): React.ReactElement => (
  <span
    style={{
      color: TEXT,
      fontSize: `${size}cqw`,
      fontWeight: 800,
      lineHeight: 1.07,
      letterSpacing: '-0.06cqw',
      textWrap: 'balance',
      ...clamp(lines),
    }}
  >
    {children}
  </span>
);

export const Subtitle = ({
  children,
}: {
  children: ReactNode;
}): React.ReactElement => (
  <span
    style={{
      color: TERTIARY,
      fontSize: '2.8cqw',
      lineHeight: 1.3,
      textWrap: 'pretty',
      ...clamp(2),
    }}
  >
    {children}
  </span>
);

export const ArtBox = ({
  children,
}: {
  children?: ReactNode;
}): React.ReactElement => (
  <div
    style={{
      position: 'absolute',
      right: '5.5cqw',
      bottom: '5.5cqw',
      width: '32%',
      aspectRatio: '1',
      zIndex: 2,
    }}
  >
    <img
      src={XD.cover}
      alt=""
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        borderRadius: '4.5cqw',
        boxShadow: '0 4cqw 11cqw rgba(0,0,0,0.55)',
      }}
    />
    {children}
  </div>
);

export interface CoverProps {
  d?: CoverData;
  bg?: ReactNode;
  overlay?: ReactNode;
  logo?: ReactNode;
  art?: ReactNode;
  headlineNode?: ReactNode;
}

// The clean baseline cover. Pass slots to layer a recognizability signature
// without touching the locked structure.
export const Cover = ({
  d = XD,
  bg,
  overlay,
  logo,
  art,
  headlineNode,
}: CoverProps): React.ReactElement => (
  <Root>
    <Ambient src={d.cover} />
    {bg}
    {art ?? <ArtBox />}
    <div
      style={{
        position: 'absolute',
        top: '5.5cqw',
        left: '5.5cqw',
        right: '5.5cqw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '3cqw',
        zIndex: 2,
      }}
    >
      <Source d={d} />
      {logo ?? <Logo />}
    </div>
    <div
      style={{
        position: 'absolute',
        left: '5.5cqw',
        top: '15.5cqw',
        bottom: '5.5cqw',
        right: '40%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        zIndex: 2,
      }}
    >
      <span style={{ flex: 1, minWidth: 0 }}>
        {headlineNode ?? <Headline d={d} />}
      </span>
      <div style={{ display: 'flex' }}>
        <Actions d={d} />
      </div>
    </div>
    {overlay}
  </Root>
);

// Brand backdrop for covers with no cover image (profile/squad/tag/etc.).
const BrandBackdrop = (): React.ReactElement => (
  <>
    <div
      style={{ position: 'absolute', inset: 0, zIndex: 0, background: INK }}
    />
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        background: `radial-gradient(55cqw 55cqw at 100% 0%, ${CABBAGE}30, transparent 62%), radial-gradient(55cqw 55cqw at 0% 100%, ${ONION}26, transparent 62%)`,
      }}
    />
  </>
);

export interface OgCoverProps {
  // When true, fills its positioned parent (e.g. a platform preview frame).
  // Otherwise it is a self-sizing 1200×630 box.
  fill?: boolean;
  backdrop?: string;
  eyebrow?: ReactNode;
  title?: ReactNode;
  subtitle?: ReactNode;
  meta?: ReactNode;
  art?: ReactNode;
  logo?: ReactNode;
  // Where the left content column starts (raise it for content-dense covers).
  contentTop?: string;
}

/**
 * The generalized Layout A — same clean structure for every share type:
 * identity top-left, logo top-right, title + meta on the left, art bottom-right.
 */
export const OgCover = ({
  fill = false,
  backdrop,
  eyebrow,
  title,
  subtitle,
  meta,
  art,
  logo,
  contentTop = '15.5cqw',
}: OgCoverProps): React.ReactElement => {
  const body = (
    <>
      {backdrop ? <Ambient src={backdrop} /> : <BrandBackdrop />}
      {art && (
        <div
          style={{
            position: 'absolute',
            right: '5.5cqw',
            bottom: '5.5cqw',
            width: '32%',
            aspectRatio: '1',
            zIndex: 2,
          }}
        >
          {art}
        </div>
      )}
      <div
        style={{
          position: 'absolute',
          top: '5.5cqw',
          left: '5.5cqw',
          right: '5.5cqw',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '3cqw',
          zIndex: 2,
        }}
      >
        <span style={{ flex: 1, minWidth: 0 }}>{eyebrow}</span>
        {logo ?? <Logo />}
      </div>
      <div
        style={{
          position: 'absolute',
          left: '5.5cqw',
          top: contentTop,
          bottom: '5.5cqw',
          right: art ? '43%' : '12%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '3cqw',
          zIndex: 2,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2cqw' }}>
          {title}
          {subtitle}
        </div>
        {meta && <div style={{ display: 'flex' }}>{meta}</div>}
      </div>
    </>
  );
  if (fill) {
    return (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          containerType: 'inline-size',
          fontFamily: SANS,
          background: INK,
        }}
      >
        {body}
      </div>
    );
  }
  return <Root>{body}</Root>;
};

export interface CoverItem {
  id: string;
  name: string;
  Component: () => React.ReactElement;
}
export interface CoverCategory {
  category: string;
  blurb: string;
  items: CoverItem[];
}
