import type { CSSProperties, ReactElement, ReactNode } from 'react';
import React, { useLayoutEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import ActionButtons from '@dailydotdev/shared/src/components/cards/common/ActionButtons';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { UserVote } from '@dailydotdev/shared/src/graphql/posts';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { ReadingStreakIcon } from '@dailydotdev/shared/src/components/icons';
import LogoIcon from '@dailydotdev/shared/src/svg/LogoIcon';
import LogoText from '@dailydotdev/shared/src/svg/LogoText';
import { realPosts } from '../hero-cover/realData';
import { PhoneScreen } from './frames';
import type { Video } from './timeline';
import { easeInOut, easeOut, lerp, span } from './timeline';

// The listing's own hero cover, the developer and Patchy at the daily.dev
// portal, put in motion the way Discord's listing moves: 3D objects
// drifting in depth, a slow push into the art, heavy all-caps lines that
// pop in word by word, a whip zoom into the app, and caption bands that
// swap phrases over the real screen.

const asset = (name: string): string => `/app-store-video/${name}.webp`;

/** The cover art is 2400 × 686; where its landmarks sit, as fractions. */
const ART = { ratio: 2400 / 686, dev: 0.63, portal: { x: 0.77, y: 0.5 } };

/** Discord's caption face: heavy, wide, all caps. */
export const BrandFont = (): ReactElement => (
  <link
    rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@800&display=block"
  />
);

const capsStyle: CSSProperties = {
  fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
  fontWeight: 800,
  textTransform: 'uppercase',
  letterSpacing: '-0.01em',
  lineHeight: 0.98,
  color: 'white',
  textShadow: '0 0.25rem 1.5rem rgba(0,0,0,0.45)',
};

/**
 * Words that pop in one after another (a quick scale up from small with
 * the blur clearing), and leave together.
 */
const PopLines = ({
  t,
  at,
  out = Infinity,
  lines,
  size,
  accentLine,
}: {
  t: number;
  at: number;
  out?: number;
  lines: string[];
  size: number;
  accentLine?: number;
}): ReactElement => {
  const leave = Number.isFinite(out) ? easeInOut(span(t, out, out + 0.25)) : 0;
  let index = 0;
  return (
    <div
      style={{
        ...capsStyle,
        fontSize: size,
        textAlign: 'center',
        opacity: 1 - leave,
        transform: `translateY(${leave * -12}px)`,
      }}
    >
      {lines.map((line, lineIndex) => (
        <div key={line}>
          {line.split(' ').map((word) => {
            const start = at + index * 0.07;
            index += 1;
            const p = easeOut(span(t, start, start + 0.3));
            return (
              <span
                key={`${word}-${start}`}
                className="inline-block"
                style={{
                  margin: '0 0.11em',
                  opacity: p,
                  transform: `scale(${lerp(0.6, 1, p)}) translateY(${
                    (1 - p) * 0.3
                  }em)`,
                  filter: `blur(${(1 - p) * 8}px)`,
                  color:
                    lineIndex === accentLine
                      ? 'var(--theme-accent-cabbage-subtler)'
                      : undefined,
                }}
              >
                {word}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* The cover art and what floats in front of it                        */
/* ------------------------------------------------------------------ */

const Art = ({
  t,
  height,
  devAt,
  push,
}: {
  t: number;
  height: number;
  /** Where the developer stands, as a fraction of the canvas width. */
  devAt: number;
  /** Extra zoom toward the portal, 0 for none. */
  push: number;
}): ReactElement => {
  const width = height * ART.ratio;
  const glow = 0.55 + Math.sin(t * 1.6) * 0.25;
  return (
    <div
      className="absolute top-0"
      style={{
        left: `calc(${devAt * 100}% - ${ART.dev * width}px)`,
        width,
        height,
        transform: `scale(${1 + push})`,
        transformOrigin: `${ART.portal.x * 100}% ${ART.portal.y * 100}%`,
      }}
    >
      <img src={asset('cover-art')} alt="" className="size-full max-w-none" />
      {/* The portal breathes. */}
      <div
        aria-hidden
        className="absolute rounded-max"
        style={{
          left: `${ART.portal.x * 100 - 7}%`,
          top: `${ART.portal.y * 100 - 22}%`,
          width: '14%',
          height: '44%',
          opacity: glow,
          mixBlendMode: 'screen',
          background:
            'radial-gradient(closest-side, rgba(255,214,170,0.75), rgba(255,140,220,0.35) 55%, transparent)',
        }}
      />
    </div>
  );
};

/** Stars in the sky over the hills, each on its own twinkle. */
const Stars = ({
  t,
  w,
  h,
}: {
  t: number;
  w: number;
  h: number;
}): ReactElement => (
  <>
    {Array.from({ length: 22 }, (_, index) => {
      const x = ((index * 0.6180339) % 1) * w;
      const y = ((index * 0.6493422) % 1) * h * 0.5;
      const twinkle =
        0.25 +
        0.75 * (0.5 + 0.5 * Math.sin(t * (1.3 + (index % 5) * 0.4) + index));
      const size = 1.5 + (index % 3);
      return (
        <span
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          aria-hidden
          className="absolute rounded-max bg-white"
          style={{
            left: x,
            top: y,
            width: size,
            height: size,
            opacity: twinkle * 0.8,
          }}
        />
      );
    })}
  </>
);

const objects = ['obj-hashtag', 'obj-rss', 'paper'];

interface Floater {
  x: number;
  y: number;
  depth: number;
  obj: number;
  spin: number;
}

/**
 * Discord's opener: objects floating at different depths. Near ones are
 * big, fast and out of focus; far ones small, slow and sharp. Every path
 * repeats over `period`, so the loop has no seam.
 */
const Floaters = ({
  t,
  w,
  h,
  period,
  burst = 0,
  layout,
}: {
  t: number;
  w: number;
  h: number;
  period: number;
  /** 0 to 1: everything rushes toward the camera, for a whip into the app. */
  burst?: number;
  layout: Floater[];
}): ReactElement => (
  <>
    {layout.map((item, index) => {
      const phase = (t / period + index / layout.length) % 1;
      const drift = Math.sin(phase * Math.PI * 2);
      const size = lerp(46, 150, item.depth) * (1 + burst * 2.5);
      const x =
        item.x * w +
        drift * lerp(10, 40, item.depth) +
        (item.x - 0.5) * w * burst * 1.6;
      const y =
        item.y * h +
        Math.cos(phase * Math.PI * 2) * lerp(6, 22, item.depth) +
        (item.y - 0.5) * h * burst * 1.6;
      return (
        <img
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          src={asset(objects[item.obj])}
          alt=""
          className="absolute max-w-none"
          style={{
            left: x - size / 2,
            top: y - size / 2,
            width: size,
            filter: `blur(${lerp(0, 5, item.depth ** 2) + burst * 10}px)`,
            transform: `rotate(${item.spin + drift * 12}deg)`,
            opacity: 1 - burst,
          }}
        />
      );
    })}
  </>
);

/* ------------------------------------------------------------------ */
/* 1 · The cover · header 21:9 and search 3:2 · 10 s loop              */
/* ------------------------------------------------------------------ */

const headerLayout: Floater[] = [
  { x: 0.08, y: 0.22, depth: 0.85, obj: 0, spin: -14 },
  { x: 0.2, y: 0.78, depth: 0.35, obj: 1, spin: 10 },
  { x: 0.33, y: 0.12, depth: 0.15, obj: 2, spin: 24 },
  { x: 0.58, y: 0.86, depth: 0.55, obj: 0, spin: 8 },
  { x: 0.92, y: 0.12, depth: 0.3, obj: 1, spin: -18 },
];

const coverRender =
  (w: number, h: number, devAt: number, size: number) =>
  (t: number): ReactNode => {
    const breathe = (1 - Math.cos((t / 10) * Math.PI * 2)) / 2;
    return (
      <div className="absolute inset-0 overflow-hidden">
        <BrandFont />
        <Art t={t} height={h} devAt={devAt} push={breathe * 0.05} />
        <Stars t={t} w={w * 0.6} h={h} />
        <Floaters t={t} w={w} h={h} period={10} layout={headerLayout} />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
          <div
            className="flex items-center gap-2"
            style={{
              opacity: easeOut(span(t, 0.05, 0.45)) * (1 - span(t, 9.55, 9.8)),
            }}
          >
            <LogoIcon className={{ container: 'h-7 w-auto' }} />
            <LogoText className={{ container: 'h-6 w-auto' }} />
          </div>
          <PopLines
            t={t}
            at={0.25}
            out={9.55}
            lines={['Where developers', 'discover what’s next']}
            accentLine={1}
            size={size}
          />
        </div>
      </div>
    );
  };

export const coverHeader: Video = {
  id: 'cover-header',
  duration: 10,
  poster: 4,
  loops: true,
  beats: [
    {
      at: 0,
      label: 'Pop in',
      note: 'The logo fades up and the line pops in word by word, heavy and all caps.',
    },
    {
      at: 1.5,
      label: 'Drift',
      note: 'The hashtag, RSS and newspaper objects float at three depths; near ones blur.',
    },
    {
      at: 4,
      label: 'Push',
      note: 'The camera eases toward the portal while it breathes light. Poster frame.',
    },
    {
      at: 7,
      label: 'Settle',
      note: 'The push eases back so the end meets the start.',
    },
    {
      at: 9.5,
      label: 'Loop',
      note: 'The line lifts away and pops in again.',
      frame: 9.7,
    },
  ],
  render: coverRender(1120, 480, 0.86, 48),
};

export const coverSearch: Video = {
  ...coverHeader,
  id: 'cover-search',
  render: coverRender(900, 600, 0.74, 52),
};

/* ------------------------------------------------------------------ */
/* 2 · The Discord cut · app preview 9:16 · 22 s                       */
/* ------------------------------------------------------------------ */

const lead = realPosts[0];

const withState = (
  post: Post,
  state: { up?: boolean; saved?: boolean },
): Post => ({
  ...post,
  numUpvotes: (post.numUpvotes ?? 0) + (state.up ? 1 : 0),
  bookmarked: !!state.saved,
  userState: {
    ...post.userState,
    vote: state.up ? UserVote.Up : UserVote.None,
  } as Post['userState'],
});

type Scene = 'open' | 'feed' | 'tldr' | 'yours' | 'save' | 'streak' | 'end';

interface Caption {
  at: number;
  lines: string[];
}

/** Each scene and the phrases its caption band swaps through. */
const scenes: { scene: Scene; at: number; captions: Caption[] }[] = [
  { scene: 'open', at: 0, captions: [] },
  {
    scene: 'feed',
    at: 2.6,
    captions: [
      { at: 0.2, lines: ['The whole', 'dev world'] },
      { at: 2.0, lines: ['In one', 'feed'] },
    ],
  },
  {
    scene: 'tldr',
    at: 6.4,
    captions: [
      { at: 0.2, lines: ['A TLDR on', 'every post'] },
      { at: 2.0, lines: ['Skim it,', 'then dive in'] },
    ],
  },
  {
    scene: 'yours',
    at: 10.2,
    captions: [{ at: 0.2, lines: ['A feed that’s', 'all yours'] }],
  },
  {
    scene: 'save',
    at: 13.2,
    captions: [{ at: 0.2, lines: ['Save it', 'for later'] }],
  },
  {
    scene: 'streak',
    at: 15.6,
    captions: [{ at: 0.2, lines: ['Keep your', 'streak going'] }],
  },
  { scene: 'end', at: 18.4, captions: [] },
];

interface Spot {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Where a component sits inside the phone, found once it has rendered. */
const useSpot = (
  root: React.RefObject<HTMLDivElement>,
  selector: string,
): Spot | null => {
  const [spot, setSpot] = useState<Spot | null>(null);
  useLayoutEffect(() => {
    const element = root.current?.querySelector(selector);
    const box = root.current?.getBoundingClientRect();
    if (!element || !box) {
      return;
    }
    const rect = element.getBoundingClientRect();
    setSpot({
      x: rect.left - box.left,
      y: rect.top - box.top,
      w: rect.width,
      h: rect.height,
    });
  }, [root, selector]);
  return spot;
};

const Ripple = ({
  x,
  y,
  p,
}: {
  x: number;
  y: number;
  p: number;
}): ReactElement | null =>
  p <= 0 || p >= 1 ? null : (
    <span
      aria-hidden
      className="absolute rounded-max border-2 border-white"
      style={{
        zIndex: 7,
        left: x - 28,
        top: y - 28,
        width: 56,
        height: 56,
        opacity: (1 - p) * 0.9,
        transform: `scale(${lerp(0.3, 1.4, p)})`,
        background: 'rgba(255,255,255,0.18)',
      }}
    />
  );

/** A piece of the app that pops out of the screen, Discord style. */
const Pop = ({
  p,
  style,
  children,
}: {
  p: number;
  style: CSSProperties;
  children: ReactNode;
}): ReactElement => (
  <div
    className="absolute rounded-16 border border-border-subtlest-secondary bg-background-default p-3"
    style={{
      zIndex: 6,
      ...style,
      opacity: p,
      transform: `${style.transform ?? ''} scale(${lerp(0.7, 1.06, p)})`,
      boxShadow: '0 1.5rem 3rem rgba(0,0,0,0.6)',
    }}
  >
    {children}
  </div>
);

/** The lower third: the screen blurs and darkens under a huge caption. */
const CaptionBand = ({
  local,
  captions,
}: {
  local: number;
  captions: Caption[];
}): ReactElement | null => {
  if (!captions.length) {
    return null;
  }
  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 h-[15rem]"
      style={{ zIndex: 8 }}
    >
      <div
        className="absolute inset-0"
        style={{
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          maskImage: 'linear-gradient(transparent, black 35%)',
          WebkitMaskImage: 'linear-gradient(transparent, black 35%)',
          background: 'linear-gradient(transparent, rgba(14,18,23,0.85) 55%)',
        }}
      />
      <div className="absolute inset-x-0 bottom-[4.5rem] px-5">
        {captions.map((caption, index) => {
          const next = captions[index + 1];
          if (local < caption.at - 0.05 || (next && local >= next.at)) {
            return null;
          }
          return (
            <PopLines
              key={caption.lines.join()}
              t={local}
              at={caption.at}
              out={next ? next.at - 0.2 : Infinity}
              lines={caption.lines}
              size={42}
            />
          );
        })}
      </div>
    </div>
  );
};

const openLayout: Floater[] = [
  { x: 0.14, y: 0.09, depth: 0.7, obj: 0, spin: -16 },
  { x: 0.86, y: 0.12, depth: 0.45, obj: 1, spin: 12 },
  { x: 0.2, y: 0.6, depth: 0.3, obj: 2, spin: 30 },
  { x: 0.84, y: 0.64, depth: 0.85, obj: 0, spin: 14 },
  { x: 0.55, y: 0.52, depth: 0.2, obj: 1, spin: -8 },
];

/** Where the developer stands when the portal is centered in portrait. */
const PORTAL_CENTER = 0.5 - ((ART.portal.x - ART.dev) * 780 * ART.ratio) / 360;

const ArtFrame = ({
  t,
  push,
  devAt,
  children,
}: {
  t: number;
  push: number;
  devAt: number;
  children?: ReactNode;
}): ReactElement => (
  <div className="absolute inset-0 overflow-hidden bg-background-default">
    <Art t={t} height={780} devAt={devAt} push={push} />
    <Stars t={t} w={360} h={780} />
    {children}
  </div>
);

const line = ['Where developers', 'discover what’s next'];

/** The cover as the first and last shot of the preview. */
const CoverShot = ({
  t,
  local,
  isOpen,
}: {
  t: number;
  local: number;
  isOpen: boolean;
}): ReactElement => {
  // Opening: the camera pans from Patchy and the developer across to the
  // portal, then dives in. Closing: it pulls out of the portal and pans
  // back to them.
  const zoom = isOpen
    ? easeInOut(span(t, 1.9, 2.6))
    : 1 - easeOut(span(local, 0, 0.6));
  const pan = isOpen
    ? easeInOut(span(local, 0.4, 2.0))
    : 1 - easeInOut(span(local, 0.5, 2.2));
  const devAt = lerp(0.42, PORTAL_CENTER, pan);
  const settle = 0.04 * (1 - easeOut(span(local, 0, 2)));
  return (
    <ArtFrame t={t} push={settle + zoom * 2.2} devAt={devAt}>
      <Floaters
        t={t}
        w={360}
        h={780}
        period={6}
        burst={zoom}
        layout={openLayout}
      />
      <div
        className="absolute inset-x-0 top-[9rem] flex flex-col items-center gap-5 px-6"
        style={{ opacity: 1 - zoom, filter: `blur(${zoom * 12}px)` }}
      >
        <div
          className="flex items-center gap-2"
          style={{ opacity: easeOut(span(local, 0.1, 0.5)) }}
        >
          <LogoIcon className={{ container: 'h-9 w-auto' }} />
          <LogoText className={{ container: 'h-8 w-auto' }} />
        </div>
        <PopLines
          t={local}
          at={isOpen ? 0.5 : 0.4}
          lines={line}
          accentLine={1}
          size={36}
        />
        {!isOpen && (
          <p
            className="text-center text-white typo-callout"
            style={{ opacity: easeOut(span(local, 1.4, 1.9)) }}
          >
            Free. Sign in with GitHub or Google.
          </p>
        )}
      </div>
    </ArtFrame>
  );
};

const DiscordCut = ({ t }: { t: number }): ReactElement => {
  const root = useRef<HTMLDivElement>(null);
  const upvote = useSpot(root, `#post-${lead.id}-upvote-btn`);
  const current = [...scenes].reverse().find((s) => t >= s.at) ?? scenes[0];
  const local = t - current.at;
  const index = scenes.indexOf(current);
  const nextAt = scenes[index + 1]?.at ?? 22;
  const length = nextAt - current.at;

  if (current.scene === 'open' || current.scene === 'end') {
    return (
      <div ref={root} className="relative h-[48.75rem] w-[22.5rem]">
        <BrandFont />
        <CoverShot t={t} local={local} isOpen={current.scene === 'open'} />
      </div>
    );
  }

  // A whip between scenes: the outgoing screen slides and smears, the
  // incoming one lands from the other side.
  const whipIn = 1 - easeOut(span(local, 0, 0.3));
  const whipOut = easeInOut(span(local, length - 0.18, length));
  const appStyle: CSSProperties = {
    transform: `translateX(${whipIn * 70 - whipOut * 70}px)`,
    filter: `blur(${Math.max(whipIn, whipOut) * 10}px)`,
  };

  const pop =
    easeOut(span(local, 0.45, 0.8)) *
    (1 - span(local, length - 0.5, length - 0.2));
  const tap = span(local, 0.3, 0.8);
  const changed = local >= 0.8;
  const saved = index > 4 || (current.scene === 'save' && changed);
  const post = withState(lead, { up: index > 2, saved });

  return (
    <div
      ref={root}
      className="relative h-[48.75rem] w-[22.5rem] overflow-hidden"
    >
      <BrandFont />
      <div style={appStyle}>
        <PhoneScreen
          width={360}
          height={780}
          posts={[post, ...realPosts.slice(1)]}
          expanded={current.scene === 'tldr' && changed}
          streak={current.scene === 'streak' && changed ? 54 : 53}
          litChip={
            index > 3 || (current.scene === 'yours' && changed)
              ? 'AI'
              : undefined
          }
          scroll={
            current.scene === 'feed'
              ? easeInOut(span(local, 0.3, 3.6)) * 320
              : 0
          }
        >
          {current.scene === 'tldr' && upvote && (
            <Ripple x={60} y={upvote.y - 250} p={tap} />
          )}
          {current.scene === 'yours' && <Ripple x={176} y={112} p={tap} />}
          {current.scene === 'save' && upvote && (
            <Ripple x={upvote.x + 222} y={upvote.y + upvote.h / 2} p={tap} />
          )}
          {current.scene === 'streak' && <Ripple x={292} y={72} p={tap} />}

          {current.scene === 'yours' && (
            <Pop p={pop} style={{ left: 16, top: 140, width: 328 }}>
              <div className="flex flex-wrap gap-2">
                {['For you', 'Popular', 'AI', 'Web dev', 'DevOps', 'Rust'].map(
                  (chip) => (
                    <span
                      key={chip}
                      className={classNames(
                        'rounded-10 border px-3 py-1.5 font-bold typo-callout',
                        chip === 'AI' && changed
                          ? 'border-accent-cabbage-default bg-accent-cabbage-default text-white'
                          : 'border-border-subtlest-secondary text-text-secondary',
                      )}
                    >
                      {chip}
                    </span>
                  ),
                )}
              </div>
            </Pop>
          )}
          {current.scene === 'save' && upvote && (
            <Pop
              p={pop}
              style={{
                left: 6,
                top: upvote.y - 14,
                width: 348,
                transform: 'translateY(-10px)',
              }}
            >
              <ActionButtons
                post={post}
                variant="list"
                className="justify-between"
              />
            </Pop>
          )}
          {current.scene === 'streak' && (
            <Pop p={pop} style={{ right: 16, top: 104, width: 170 }}>
              <div className="flex items-center gap-3">
                <span
                  className="flex"
                  style={{
                    transform: `scale(${
                      1 + Math.sin(span(local, 0.8, 1.25) * Math.PI) * 0.25
                    })`,
                  }}
                >
                  <ReadingStreakIcon
                    secondary
                    size={IconSize.XXLarge}
                    className="text-accent-bacon-default"
                  />
                </span>
                <span
                  className="relative h-10 overflow-hidden font-bold text-text-primary"
                  style={{ fontSize: 34, lineHeight: '2.5rem' }}
                >
                  <span
                    className="flex flex-col tabular-nums"
                    style={{
                      transform: `translateY(${
                        -easeOut(span(local, 0.8, 1.2)) * 2.5
                      }rem)`,
                    }}
                  >
                    <span>53</span>
                    <span>54</span>
                  </span>
                </span>
              </div>
              <p className="mt-1 text-text-tertiary typo-footnote">
                day streak
              </p>
            </Pop>
          )}
          <CaptionBand local={local} captions={current.captions} />
        </PhoneScreen>
      </div>
    </div>
  );
};

export const discordPreview: Video = {
  id: 'discord-cut',
  duration: 22,
  poster: 4.0,
  loops: false,
  beats: [
    {
      at: 0,
      label: 'Cover',
      note: 'The hero cover with the logo; 3D objects float at three depths and the line pops in.',
      frame: 1.5,
    },
    {
      at: 1.9,
      label: 'Whip in',
      note: 'The camera dives into the portal and the objects rush past, into the app.',
      frame: 2.3,
    },
    {
      at: 2.6,
      label: 'Feed',
      note: 'The feed scrolls; the band swaps "The whole dev world" for "In one feed".',
      frame: 3.4,
    },
    {
      at: 6.4,
      label: 'TLDR',
      note: 'A tap on Show more opens the summary: "A TLDR on every post", then "Skim it, then dive in".',
      frame: 8.8,
    },
    {
      at: 10.2,
      label: 'Yours',
      note: 'The topic chips pop out of the screen and AI lights up: "A feed that’s all yours".',
      frame: 11.6,
    },
    {
      at: 13.2,
      label: 'Save',
      note: 'The action row pops out and the bookmark fills: "Save it for later".',
      frame: 14.6,
    },
    {
      at: 15.6,
      label: 'Streak',
      note: 'The streak pops out and rolls to 54: "Keep your streak going".',
      frame: 17.0,
    },
    {
      at: 18.4,
      label: 'Back to the cover',
      note: 'Whip back out to the cover: the line, and the login disclosure Apple asks for.',
      frame: 20.5,
    },
  ],
  render: (t) => <DiscordCut t={t} />,
};
