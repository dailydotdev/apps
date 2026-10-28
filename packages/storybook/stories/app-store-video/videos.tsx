import type { CSSProperties, ReactElement, ReactNode } from 'react';
import React, { memo, useLayoutEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import ActionButtons from '@dailydotdev/shared/src/components/cards/common/ActionButtons';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { UserVote } from '@dailydotdev/shared/src/graphql/posts';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { ReadingStreakIcon } from '@dailydotdev/shared/src/components/icons';
import LogoIcon from '@dailydotdev/shared/src/svg/LogoIcon';
import { realFeed } from '../hero-cover/realFeed';
import { realPosts } from '../hero-cover/realData';
import { Accent, Card, Headline, PhoneScreen } from './frames';
import type { Video } from './timeline';
import { easeInOut, easeOut, lerp, reveal, span } from './timeline';

// The three videos, one per autoplay slot:
//  1. Fetch (header, 21:9): Patchy runs in with the day's news in his mouth,
//     drops it, and it unrolls into a real card. Brand and charm, which only
//     a creative asset may carry.
//  2. Signal (search results, 3:2): the value as moving type. The noise of
//     2,000+ sources collapses into one feed and a long post shrinks to its
//     TLDR, so the purpose reads in a muted thumbnail.
//  3. Tap (app preview, 9:16): the app itself, each component lifted out as
//     it is tapped: upvote, TLDR, bookmark, topics, streak.

const asset = (name: string): string => `/app-store-video/${name}.webp`;

/** The lead card stays the same post through every video. */
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

const StaticCard = memo(Card);

/* ------------------------------------------------------------------ */
/* 1 · Fetch · header 21:9 · 9 s loop                                  */
/* ------------------------------------------------------------------ */

const Puffs = ({
  t,
  x,
  y,
}: {
  t: number;
  x: number;
  y: number;
}): ReactElement => (
  <>
    {[0, 1, 2].map((index) => {
      const phase = (t * 3 + index / 3) % 1;
      return (
        <span
          key={index}
          aria-hidden
          className="absolute rounded-max bg-white"
          style={{
            filter: 'blur(6px)',
            left: x - phase * 90 - index * 18,
            top: y - phase * 16,
            width: 14 + phase * 22,
            height: 14 + phase * 22,
            opacity: (1 - phase) * 0.18,
          }}
        />
      );
    })}
  </>
);

const fetchRender = (t: number): ReactNode => {
  // Patchy: runs in (0.2 to 1.9), lands and sits (1.9 to 7.1), runs off.
  const runIn = easeOut(span(t, 0.2, 1.9));
  const runOff = easeInOut(span(t, 7.1, 8.1));
  const isSitting = t >= 2.05 && t < 7.15;
  const bob = isSitting ? 0 : -Math.abs(Math.sin(t * 16)) * 12;
  const runX = runOff > 0 ? lerp(70, -520, runOff) : lerp(-560, 70, runIn);
  const sitScale = easeOut(span(t, 2.05, 2.4));
  const wag = isSitting ? Math.sin((t - 2) * 5) * 2.5 : 0;

  // The paper: flies from his mouth (2.0), lands at the card slot (2.7),
  // and unrolls into the card (2.75 to 3.3).
  const fly = easeOut(span(t, 2.0, 2.7));
  const unroll = easeInOut(span(t, 2.75, 3.3));
  const cardOut = easeInOut(span(t, 6.9, 7.6));
  const paperX = lerp(330, 880, fly);
  const paperY = lerp(190, 230, fly) - Math.sin(fly * Math.PI) * 150;

  const upvoted = t >= 4.9 && t < 8.6;

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* The card the paper becomes. */}
      <div
        className="absolute w-[21rem]"
        style={{
          left: 812,
          top: 50,
          opacity: unroll * (1 - cardOut),
          transform: `translateY(${
            (1 - unroll) * 120 + cardOut * 90
          }px) scale(${lerp(0.56, 0.78, unroll)})`,
          transformOrigin: 'top left',
          filter: `blur(${(1 - unroll) * 8}px)`,
        }}
      >
        <StaticCard post={withState(lead, { up: upvoted })} />
      </div>
      {t >= 2.0 && unroll < 1 && (
        <img
          src={asset('paper')}
          alt=""
          className="absolute w-28"
          style={{
            left: paperX,
            top: paperY,
            transform: `rotate(${fly * 400}deg) scale(${lerp(1, 0.4, unroll)})`,
            opacity: 1 - unroll,
          }}
        />
      )}
      {/* Patchy. */}
      {!isSitting && t < 8.1 && (
        <>
          <Puffs t={t} x={runX + 80} y={380} />
          <img
            src={asset('patchy-run')}
            alt=""
            className="absolute h-[19rem] max-w-none"
            style={{
              left: runX,
              top: 120 + bob,
              transform: runOff > 0 ? 'scaleX(-1)' : undefined,
            }}
          />
        </>
      )}
      {isSitting && (
        <img
          src={asset('patchy-sit')}
          alt=""
          className="absolute h-[22rem] max-w-none"
          style={{
            left: 40,
            top: 110,
            transform: `scale(${lerp(0.86, 1, sitScale)}) rotate(${wag}deg)`,
            transformOrigin: 'bottom center',
          }}
        />
      )}
      {/* The line, in the template's safe area. */}
      <div className="absolute left-1/2 top-1/2 flex w-[30rem] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-3 text-center">
        <div style={reveal(t, 2.6, 7.0)}>
          <Headline size={46} align="center">
            Fresh dev news,
          </Headline>
        </div>
        <div style={reveal(t, 2.85, 7.05)}>
          <Headline size={46} align="center">
            <Accent>fetched</Accent> daily.
          </Headline>
        </div>
        <p
          className="text-text-tertiary"
          style={{ fontSize: 20, ...reveal(t, 3.3, 7.1) }}
        >
          A TLDR on every post.
        </p>
      </div>
    </div>
  );
};

export const fetchVideo: Video = {
  id: 'fetch',
  duration: 9,
  poster: 5.2,
  loops: true,
  beats: [
    {
      at: 0.2,
      label: 'Dash in',
      note: 'Patchy sprints in from the left with a rolled newspaper, ears flying, dust puffs behind.',
    },
    {
      at: 1.9,
      label: 'Drop',
      note: 'He skids to a stop and sits. The paper flips out of his mouth and arcs to the right.',
    },
    {
      at: 2.75,
      label: 'Unroll',
      note: 'The paper unrolls into a real feed card while the line lands word by word.',
    },
    {
      at: 4.6,
      label: 'Wag',
      note: 'He sits proud and wags; the card gets an upvote. The poster frame sits here.',
    },
    {
      at: 7.0,
      frame: 7.45,
      label: 'Off he goes',
      note: 'He turns and dashes off for the next one; the card sinks and the loop restarts.',
    },
  ],
  render: fetchRender,
};

/* ------------------------------------------------------------------ */
/* 2 · Signal · search results 3:2 · 9 s loop                          */
/* ------------------------------------------------------------------ */

const logos = [
  ...new Set(
    [...realFeed.posts, ...realFeed.heroPosts].map((post) => post.source.image),
  ),
].slice(0, 28);

/** A fixed scatter, so every replay and every export is identical. */
const scatter = logos.map((image, index) => {
  const angle = index * 2.399963;
  const radius = 0.32 + (((index * 37) % 100) / 100) * 0.18;
  return {
    image,
    x: 0.5 + Math.cos(angle) * radius * 0.95,
    y: 0.62 + Math.sin(angle) * radius * 0.6,
    size: 34 + ((index * 53) % 4) * 8,
    delay: (index % 14) * 0.09,
    wobble: index * 1.7,
  };
});

/** A counter that rolls up to its value. */
const Count = ({ value }: { value: number }): ReactElement => (
  <span className="tabular-nums">
    {Math.round(value).toLocaleString('en-US')}
  </span>
);

const SignalSummary = ({ t }: { t: number }): ReactElement => {
  const squeeze = easeInOut(span(t, 4.3, 5.4));
  const stamp = easeOut(span(t, 5.2, 5.6));
  const summary = lead.summary ?? '';
  return (
    <div className="relative w-[26rem] rounded-16 border border-border-subtlest-secondary bg-background-default p-4 text-left">
      <div className="flex items-center gap-2">
        <img src={lead.source?.image} alt="" className="size-6 rounded-max" />
        <span className="font-bold text-text-primary typo-footnote">
          {lead.source?.name}
        </span>
        <span className="text-text-tertiary typo-footnote">
          {lead.readTime}m read
        </span>
      </div>
      <h3 className="mt-2 font-bold text-text-primary typo-title3">
        {lead.title}
      </h3>
      <div
        className="relative mt-2 overflow-hidden"
        style={{ maxHeight: lerp(160, 60, squeeze) }}
      >
        <p
          className="text-text-secondary"
          style={{ fontSize: 15, lineHeight: '20px' }}
        >
          {summary}
        </p>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-10"
          style={{
            opacity: 1 - squeeze,
            background:
              'linear-gradient(transparent, var(--theme-background-default))',
          }}
        />
      </div>
      <span
        className="absolute -right-3 -top-3 rounded-8 bg-accent-cabbage-default px-2 py-0.5 font-bold text-white typo-footnote"
        style={{
          opacity: stamp,
          transform: `scale(${lerp(1.6, 1, stamp)}) rotate(-6deg)`,
        }}
      >
        TLDR
      </span>
    </div>
  );
};

const signalRender = (t: number): ReactNode => {
  const gather = easeInOut(span(t, 2.3, 3.2));
  const fadeAll = span(t, 8.3, 8.9);
  const counter = easeOut(span(t, 0.3, 2.1)) * 2000;
  const cardIn = easeOut(span(t, 3.0, 3.6));
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ opacity: 1 - fadeAll }}
    >
      {scatter.map((logo) => {
        const enter = easeOut(span(t, logo.delay, logo.delay + 0.7));
        const jitterX = Math.sin(t * 7 + logo.wobble) * 4;
        const jitterY = Math.cos(t * 6 + logo.wobble) * 4;
        const x = lerp(logo.x * 900, 450, gather);
        const y = lerp(logo.y * 600, 300, gather);
        return (
          <img
            key={logo.image}
            src={logo.image}
            alt=""
            className="absolute rounded-max"
            style={{
              width: logo.size,
              height: logo.size,
              left: x - logo.size / 2 + jitterX * (1 - gather),
              top: y - logo.size / 2 + jitterY * (1 - gather),
              opacity: enter * (1 - gather) * 0.9,
              transform: `scale(${lerp(0.4, 1, enter) * lerp(1, 0.2, gather)})`,
            }}
          />
        );
      })}
      <div className="absolute inset-x-0 top-[3.5rem] flex flex-col items-center gap-1 text-center">
        <div className="relative h-[3.5rem] w-full">
          <div className="absolute inset-0" style={reveal(t, 0.1, 2.3)}>
            <Headline size={48} align="center">
              <Count value={counter} />+ sources
            </Headline>
          </div>
          <div className="absolute inset-0" style={reveal(t, 2.8)}>
            <Headline size={48} align="center">
              One <Accent>feed</Accent>.
            </Headline>
          </div>
        </div>
        <div style={reveal(t, 5.0)}>
          <Headline size={32} align="center">
            A TLDR on every post.
          </Headline>
        </div>
      </div>
      <div
        className="absolute left-1/2 top-[11.5rem] -translate-x-1/2"
        style={{
          opacity: cardIn,
          transform: `translateX(-50%) translateY(${
            (1 - cardIn) * 24
          }px) scale(${lerp(0.92, 1, cardIn)})`,
          filter: `blur(${(1 - cardIn) * 6}px)`,
        }}
      >
        <SignalSummary t={t} />
      </div>
    </div>
  );
};

export const signalVideo: Video = {
  id: 'signal',
  duration: 9,
  poster: 6.4,
  loops: true,
  beats: [
    {
      at: 0,
      label: 'The noise',
      note: 'Source logos pour in and jitter while the counter rolls from 0 to 2,000+.',
    },
    {
      at: 2.3,
      label: 'Collapse',
      note: 'Everything is pulled into the center and the line flips to "One feed."',
    },
    {
      at: 3.0,
      label: 'One post',
      note: 'A real post arrives with its whole summary.',
    },
    {
      at: 4.3,
      label: 'TLDR',
      note: 'The summary squeezes down to three lines and the TLDR stamp lands.',
    },
    {
      at: 5.6,
      label: 'Hold',
      note: 'The full promise holds for three seconds. Poster frame.',
    },
  ],
  render: signalRender,
};

/* ------------------------------------------------------------------ */
/* 3 · Tap · app preview 9:16 · 18 s, plays once                       */
/* ------------------------------------------------------------------ */

type TapStep = 'upvote' | 'tldr' | 'bookmark' | 'topics' | 'streak' | 'end';

const tapSteps: { step: TapStep; at: number; caption: string }[] = [
  { step: 'upvote', at: 0, caption: 'Upvote what’s good' },
  { step: 'tldr', at: 3, caption: 'Read the TLDR first' },
  { step: 'bookmark', at: 6, caption: 'Save it for later' },
  { step: 'topics', at: 9, caption: 'Jump to your topics' },
  { step: 'streak', at: 12, caption: 'Build a reading streak' },
  { step: 'end', at: 15, caption: '' },
];

/** Where a component sits inside the phone, found once it has rendered. */
const useSpot = (
  root: React.RefObject<HTMLDivElement>,
  selector: string,
): { x: number; y: number; w: number; h: number } | null => {
  const [spot, setSpot] = useState<{
    x: number;
    y: number;
    w: number;
    h: number;
  } | null>(null);
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

/** A piece of the app lifted out of the screen, larger, with depth. */
const Lift = ({
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
      transform: `${style.transform ?? ''} scale(${lerp(0.85, 1, p)})`,
      filter: `blur(${(1 - p) * 4}px)`,
      boxShadow: '0 1.5rem 3rem rgba(0,0,0,0.55)',
    }}
  >
    {children}
  </div>
);

const TapScene = ({ t }: { t: number }): ReactElement => {
  const root = useRef<HTMLDivElement>(null);
  const upvote = useSpot(root, `#post-${lead.id}-upvote-btn`);
  const bookmark = useSpot(root, `#post-${lead.id}-bookmark-btn`);
  const current = [...tapSteps].reverse().find((s) => t >= s.at) ?? tapSteps[0];
  const local = t - current.at;
  const lift = easeOut(span(local, 0.35, 0.8)) * (1 - span(local, 2.5, 2.9));
  const tap = span(local, 0.2, 0.75);
  const changed = local >= 0.75;

  const up = current.step !== 'upvote' || changed;
  const saved =
    ['topics', 'streak', 'end'].includes(current.step) ||
    (current.step === 'bookmark' && changed);
  const expanded = current.step === 'tldr' && changed;
  const aiLit =
    ['streak', 'end'].includes(current.step) ||
    (current.step === 'topics' && changed);
  const streak =
    ['end'].includes(current.step) || (current.step === 'streak' && changed)
      ? 54
      : 53;
  const post = withState(lead, { up, saved });
  const endIn = easeOut(span(t, 15, 15.6));

  const rowBox = upvote && { left: 6, top: upvote.y - 14, width: 348 };

  return (
    <div ref={root} className="relative">
      <PhoneScreen
        width={360}
        height={780}
        posts={[post, ...realPosts.slice(1)]}
        expanded={expanded}
        streak={streak}
        litChip={aiLit ? 'AI' : undefined}
      >
        {upvote && current.step === 'upvote' && (
          <Ripple
            x={upvote.x + upvote.w / 2}
            y={upvote.y + upvote.h / 2}
            p={tap}
          />
        )}
        {bookmark && current.step === 'bookmark' && (
          <Ripple
            x={bookmark.x + bookmark.w / 2}
            y={bookmark.y + bookmark.h / 2}
            p={tap}
          />
        )}
        {current.step === 'tldr' && upvote && (
          <Ripple x={60} y={upvote.y - 250} p={tap} />
        )}
        {current.step === 'topics' && <Ripple x={176} y={112} p={tap} />}
        {current.step === 'streak' && <Ripple x={292} y={72} p={tap} />}

        {(current.step === 'upvote' || current.step === 'bookmark') &&
          rowBox && (
            <Lift
              p={lift}
              style={{ ...rowBox, transform: 'translateY(-10px)' }}
            >
              <ActionButtons
                post={post}
                variant="list"
                className="justify-between"
              />
            </Lift>
          )}
        {current.step === 'topics' && (
          <Lift p={lift} style={{ left: 16, top: 140, width: 328 }}>
            <div className="flex flex-wrap gap-2">
              {['For you', 'Popular', 'AI', 'Web dev', 'DevOps', 'Rust'].map(
                (chip) => (
                  <span
                    key={chip}
                    className={classNames(
                      'rounded-10 border px-3 py-1.5 font-bold typo-callout',
                      chip === 'AI' && aiLit
                        ? 'border-accent-cabbage-default bg-accent-cabbage-default text-white'
                        : 'border-border-subtlest-secondary text-text-secondary',
                    )}
                  >
                    {chip}
                  </span>
                ),
              )}
            </div>
          </Lift>
        )}
        {current.step === 'streak' && (
          <Lift p={lift} style={{ right: 16, top: 104, width: 170 }}>
            <div className="flex items-center gap-3">
              <span
                className="flex"
                style={{
                  transform: `scale(${
                    1 + Math.sin(span(local, 0.75, 1.2) * Math.PI) * 0.25
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
                      -easeOut(span(local, 0.75, 1.15)) * 2.5
                    }rem)`,
                  }}
                >
                  <span>53</span>
                  <span>54</span>
                </span>
              </span>
            </div>
            <p className="mt-1 text-text-tertiary typo-footnote">day streak</p>
          </Lift>
        )}
        {current.step !== 'end' && (
          <div
            className="pointer-events-none absolute inset-x-0 bottom-24 flex justify-center px-5"
            style={{ ...reveal(local, 0.1, 2.6, 10), zIndex: 10 }}
          >
            <span
              className="rounded-14 bg-background-default px-4 py-2 text-center font-bold text-text-primary"
              style={{
                fontSize: 24,
                boxShadow: '0 0.5rem 2rem rgba(0,0,0,0.5)',
              }}
            >
              {current.caption}
            </span>
          </div>
        )}
        {current.step === 'end' && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-background-default px-8 text-center"
            style={{ opacity: endIn, zIndex: 20 }}
          >
            <LogoIcon className={{ container: 'h-14 w-auto' }} />
            <Headline size={32} align="center">
              Your dev feed,
              <br />
              one tap at a time
            </Headline>
            <p className="text-text-tertiary typo-callout">
              Free. Sign in with GitHub or Google.
            </p>
          </div>
        )}
      </PhoneScreen>
    </div>
  );
};

export const tapVideo: Video = {
  id: 'tap',
  duration: 18,
  poster: 1.6,
  loops: false,
  beats: [
    {
      at: 0,
      label: 'Upvote',
      note: 'A tap on upvote: the action row lifts out of the card and the count ticks up.',
    },
    {
      at: 3,
      label: 'TLDR',
      note: 'A tap on Show more: the summary opens in place.',
    },
    {
      at: 6,
      label: 'Bookmark',
      note: 'The action row lifts again and the bookmark fills.',
    },
    {
      at: 9,
      label: 'Topics',
      note: 'The topic chips lift out; AI lights up and the feed follows.',
    },
    {
      at: 12,
      label: 'Streak',
      note: 'The streak lifts out of the header and rolls from 53 to 54.',
    },
    {
      at: 15,
      label: 'End card',
      note: 'Logo, the line, and the login disclosure Apple asks for.',
    },
  ],
  render: (t) => <TapScene t={t} />,
};
