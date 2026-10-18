import type { CSSProperties, ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import LogoIcon from '@dailydotdev/shared/src/svg/LogoIcon';
import { asset, charmArt } from '../assets';
import { byId } from '../catalog';
import { FrameStyles, FrameThumb } from '../frames';
import { sampleData } from '../data';
import { HeaderBar, PostCard } from '../FeedMocks';
import { Avatar, ME } from '../people';
import { HERO, HERO_CLAIM, Thumb } from './mocks';

export const DECK = ['rank.topicReader', 'persona.week', 'achievement.unlocked', 'reading.grid', 'posts.top'];

const WHITE_MARK = { '--theme-text-primary': '#FFFFFF' } as CSSProperties;

/** Keyframes shared by the concepts. Scoped with an rd- prefix. */
export const ConceptStyles = (): ReactElement => (
  <style>{`
@keyframes rdFoil { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } }
@keyframes rdTear { 0% { transform: translate(0,0) rotate(0); opacity: 1; } 60% { transform: translate(18px,-44px) rotate(-14deg); opacity: 1; } 100% { transform: translate(40px,-90px) rotate(-26deg); opacity: 0; } }
@keyframes rdPackDrop { 0% { transform: translateY(0) scale(1); opacity: 1; } 100% { transform: translateY(36px) scale(.92); opacity: 0; } }
@keyframes rdFan { 0% { transform: translate(-50%, 40px) rotate(0) scale(.6); opacity: 0; } 100% { transform: translate(-50%, 0) rotate(var(--rot)) translateX(var(--dx)) scale(var(--sc)); opacity: 1; } }
@keyframes rdBob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
@keyframes rdPulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(206,61,243,.45); } 70% { box-shadow: 0 0 0 12px rgba(206,61,243,0); } }
@keyframes rdSlideUp { 0% { transform: translate(-50%, 0); } 100% { transform: translate(-50%, -62%); } }
@keyframes rdFlap { 0% { transform: rotateX(0deg); } 100% { transform: rotateX(-178deg); } }
.rd-foil {
  background: linear-gradient(115deg, #2A0B3D 0%, #5A1E75 18%, #CE3DF3 34%, #FF9157 46%, #FFE24C 52%, #57E087 60%, #4A7EEE 72%, #2A0B3D 90%);
  background-size: 220% 100%;
  animation: rdFoil 6s linear infinite;
}
.rd-foil-quiet {
  background: linear-gradient(115deg, #1a0a26 0%, #2A0B3D 30%, #3b1454 55%, #2A0B3D 80%, #1a0a26 100%);
}
.rd-tear { animation: rdTear .55s cubic-bezier(.2,.8,.2,1) forwards; }
.rd-packdrop { animation: rdPackDrop .5s .35s ease-in forwards; }
.rd-fan { animation: rdFan .7s cubic-bezier(.2,.9,.25,1.05) forwards; }
.rd-bob { animation: rdBob 2.4s ease-in-out infinite; }
.rd-pulse { animation: rdPulse 2s ease-out infinite; }
.rd-flap { transform-origin: top center; animation: rdFlap .7s cubic-bezier(.3,.7,.2,1) forwards; }
.rd-slideup { animation: rdSlideUp .7s .35s cubic-bezier(.2,.8,.2,1) forwards; }
@media (prefers-reduced-motion: reduce) { .rd-foil, .rd-bob, .rd-pulse { animation: none; } }
  `}</style>
);

/* -------------------------------------------------------------------------- */
/* 1 · The pack                                                                */
/* -------------------------------------------------------------------------- */

type PackState = 'sealed' | 'open';

/**
 * Five cards arrive as a sealed foil pack in slot one. Tear the strip and
 * they fan out, hero in front. The pack is the deck's own metaphor made
 * physical, and opening it is the kind of thing people film.
 */
export const PackOpening = ({
  initial = 'sealed',
  quiet = false,
}: {
  initial?: PackState;
  quiet?: boolean;
}): ReactElement => {
  const [state, setState] = useState<PackState>(initial);
  const [tearing, setTearing] = useState(false);

  const open = () => {
    if (state === 'open' || tearing) return;
    setTearing(true);
    window.setTimeout(() => {
      setState('open');
      setTearing(false);
    }, 820);
  };

  return (
    <div className="relative flex h-[22rem] w-full items-end justify-center overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-surface-float">
      <ConceptStyles />
      <FrameStyles />
      {state === 'sealed' ? (
        <button
          type="button"
          onClick={open}
          className="absolute left-1/2 top-1/2 flex h-[15.5rem] w-[11rem] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-between rounded-14 p-3 text-white"
          style={{ boxShadow: '0 30px 50px -24px rgba(42,11,61,.7), inset 0 0 0 1px rgba(255,255,255,.18)' }}
        >
          <span className={classNames('absolute inset-0 rounded-14', quiet ? 'rd-foil-quiet' : 'rd-foil')} />
          <span
            className={classNames(
              'absolute inset-x-0 top-0 flex h-9 items-center justify-center rounded-t-14 border-b border-dashed border-white/40',
              tearing && 'rd-tear',
            )}
            style={{ background: 'rgba(255,255,255,.14)' }}
          >
            <span className="font-mono uppercase tracking-[0.18em] typo-caption2">tear to open</span>
          </span>
          <span className={classNames('relative mt-11 flex flex-col items-center gap-2', tearing && 'rd-packdrop')}>
            <span className="flex h-12 w-12 items-center justify-center rounded-12 bg-black/25 [&_svg]:h-7 [&_svg]:w-7" style={WHITE_MARK}>
              <LogoIcon />
            </span>
            <span className="font-bold typo-title2">Week 37</span>
            <span className="font-mono uppercase tracking-[0.16em] text-white/80 typo-caption2">5 cards · 1 rare</span>
          </span>
          <span className={classNames('relative mb-1 flex items-center gap-2 text-white/85 typo-caption1', tearing && 'rd-packdrop')}>
            <Avatar person={ME} size={18} />
            @mayabuilds
          </span>
        </button>
      ) : (
        <>
          <div className="absolute left-1/2 top-[2.2rem] h-[15rem] w-0">
            {DECK.map((id, index) => {
              const mid = (DECK.length - 1) / 2;
              const offset = index - mid;
              const isHero = index === 0;
              const order = isHero ? 10 : 5 - Math.abs(offset);
              return (
                <div
                  key={id}
                  className="rd-fan absolute left-0 top-0 origin-bottom"
                  style={
                    {
                      '--rot': `${(index - 2) * 9}deg`,
                      '--dx': `${(index - 2) * 54}px`,
                      '--sc': isHero ? 1 : 0.86,
                      zIndex: order,
                      animationDelay: `${index * 70}ms`,
                      opacity: 0,
                    } as CSSProperties
                  }
                >
                  <FrameThumb width={isHero ? 104 : 88} candidate={byId(id)} data={sampleData[id]} />
                </div>
              );
            })}
          </div>
          <div className="relative z-20 mb-3 flex flex-col items-center gap-2 rounded-16 bg-surface-float/95 px-4 pt-2">
            <span className="rounded-[999px] bg-background-default px-3 py-1 font-mono uppercase tracking-[0.14em] text-text-tertiary typo-caption2">
              rare pull · Emerald · 0.9% have it
            </span>
            <span className="rounded-12 bg-text-primary px-4 py-2 font-bold text-surface-invert typo-callout">
              Open your Replay
            </span>
          </div>
        </>
      )}
      {state === 'open' && (
        <button
          type="button"
          onClick={() => setState('sealed')}
          className="absolute right-3 top-3 z-30 text-text-quaternary typo-caption2 underline"
        >
          reseal
        </button>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 2 · The sealed envelope                                                     */
/* -------------------------------------------------------------------------- */

export const SealedEnvelope = (): ReactElement => {
  const [open, setOpen] = useState(false);
  return (
    <button
      type="button"
      onClick={() => setOpen((v) => !v)}
      className="relative flex h-[21rem] w-full flex-col items-center justify-end overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-surface-float pb-5"
      style={{ perspective: 900 }}
    >
      <ConceptStyles />
      <FrameStyles />
      <div className={classNames('absolute left-1/2 top-[6.25rem] -translate-x-1/2', open && 'rd-slideup')} style={{ zIndex: 2 }}>
        <FrameThumb width={100} candidate={HERO} data={sampleData[HERO.id]} />
      </div>
      <div
        className="absolute left-1/2 top-[7.5rem] h-[8rem] w-[15rem] -translate-x-1/2 rounded-b-14"
        style={{ background: 'linear-gradient(180deg, #F6F1FB 0%, #E9DDF3 100%)', zIndex: 3, boxShadow: '0 24px 40px -22px rgba(42,11,61,.55)' }}
      >
        <span className="absolute inset-x-6 top-12 h-px bg-[#D9C9E6]" />
        <span className="absolute inset-x-6 top-[4rem] h-px w-2/3 bg-[#D9C9E6]" />
        <span className="absolute bottom-3 right-4 font-mono uppercase tracking-[0.16em] text-[#8E1FB0] typo-caption2">
          for @mayabuilds
        </span>
      </div>
      <div
        className={classNames('absolute left-1/2 top-[7.5rem] h-[5rem] w-[15rem] -translate-x-1/2', open && 'rd-flap')}
        style={{
          zIndex: open ? 1 : 4,
          background: 'linear-gradient(180deg, #E9DDF3 0%, #D8C4EA 100%)',
          clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
        }}
      />
      {!open && (
        <span
          className="rd-pulse absolute left-1/2 top-[10.8rem] flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-[999px] text-white [&_svg]:h-6 [&_svg]:w-6"
          style={{ ...WHITE_MARK, zIndex: 5, background: 'radial-gradient(circle at 35% 30%, #E07CFF, #8E1FB0 70%)', boxShadow: '0 6px 14px -6px rgba(142,31,176,.8)' }}
        >
          <LogoIcon />
        </span>
      )}
      <span className="relative z-10 flex flex-col items-center gap-1">
        <span className="font-bold text-text-primary typo-callout">{open ? HERO_CLAIM : 'Your week 37 is in.'}</span>
        <span className="text-text-quaternary typo-caption1">{open ? 'Tap to read all five' : 'Break the seal'}</span>
      </span>
    </button>
  );
};

/* -------------------------------------------------------------------------- */
/* 3 · Charm, peeking                                                          */
/* -------------------------------------------------------------------------- */

export const MascotHint = ({ minimized: initial = false }: { minimized?: boolean }): ReactElement => {
  const [minimized, setMinimized] = useState(initial);
  return (
    <div className="relative h-[34rem] w-full overflow-hidden rounded-[1.75rem] bg-background-default">
      <ConceptStyles />
      <div className="flex flex-col gap-3 p-3">
        <HeaderBar unread={false} />
        <PostCard index={0} />
        <PostCard index={1} />
        <PostCard index={2} />
      </div>
      {minimized ? (
        <button
          type="button"
          onClick={() => setMinimized(false)}
          className="rd-bob absolute bottom-4 right-4 flex h-14 w-14 items-center justify-center rounded-[999px] border-2 border-accent-cabbage-default bg-surface-float shadow-3"
        >
          <img src={charmArt.inviteFriends} alt="" className="h-12 w-12 object-contain" />
          <span className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-[999px] border-2 border-background-default bg-accent-cabbage-default" />
        </button>
      ) : (
        <div className="absolute bottom-3 right-3 z-20 flex items-end gap-2">
          <div className="relative mb-10 max-w-[13.5rem] rounded-16 rounded-br-4 border border-border-subtlest-tertiary bg-background-default p-3 shadow-3">
            <span className="block font-bold text-text-primary typo-footnote">{HERO_CLAIM}</span>
            <span className="mt-0.5 block text-text-tertiary typo-caption1">Your week 37 Replay is in. Want the other four?</span>
            <span className="mt-2 flex items-center gap-2">
              <span className="rounded-8 bg-text-primary px-2.5 py-1 font-bold text-surface-invert typo-caption1">Show me</span>
              <button type="button" onClick={() => setMinimized(true)} className="text-text-quaternary typo-caption1">
                Later
              </button>
            </span>
          </div>
          <img src={charmArt.inviteFriends} alt="" className="rd-bob h-32 w-32 object-contain drop-shadow-xl" />
        </div>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 4 · The chapter band                                                        */
/* -------------------------------------------------------------------------- */

export const ChapterBand = (): ReactElement => (
  <div
    className="col-span-3 flex items-center gap-6 overflow-hidden rounded-16 border border-border-subtlest-tertiary p-5"
    style={{
      background:
        'radial-gradient(60% 140% at 0% 50%, rgba(206,61,243,.18) 0%, transparent 60%), var(--theme-surface-float)',
    }}
  >
    <FrameStyles />
    <div className="flex w-[17rem] shrink-0 flex-col gap-2">
      <span className="font-mono uppercase tracking-[0.14em] text-text-quaternary typo-caption2">Your week 37 · 5 cards</span>
      <span className="text-text-primary typo-title3">{HERO_CLAIM}</span>
      <span className="text-text-tertiary typo-footnote">Between last week&apos;s posts and this week&apos;s: what you did with them.</span>
      <span className="mt-1 w-fit rounded-10 bg-text-primary px-3 py-1.5 font-bold text-surface-invert typo-caption1">Open</span>
    </div>
    <div className="relative flex min-w-0 flex-1 items-center gap-3 overflow-hidden">
      {DECK.map((id, index) => (
        <div key={id} style={{ opacity: index === 0 ? 1 : 0.92 - index * 0.12 }}>
          <FrameThumb width={index === 0 ? 112 : 88} candidate={byId(id)} data={sampleData[id]} />
        </div>
      ))}
      <span className="pointer-events-none absolute inset-y-0 right-0 w-24" style={{ background: 'linear-gradient(90deg, transparent, var(--theme-surface-float))' }} />
    </div>
  </div>
);

/* -------------------------------------------------------------------------- */
/* 5 · The masthead                                                            */
/* -------------------------------------------------------------------------- */

export const Masthead = ({ collapsed = false }: { collapsed?: boolean }): ReactElement => {
  if (collapsed) {
    return (
      <div className="flex w-full items-center gap-3 rounded-12 px-4 py-2 text-white" style={{ background: 'linear-gradient(90deg, #2A0B3D, #5A1E75)' }}>
        <span className="flex h-5 w-5 [&_svg]:h-full [&_svg]:w-full" style={WHITE_MARK}>
          <LogoIcon />
        </span>
        <span className="flex-1 font-bold typo-footnote">{HERO_CLAIM}</span>
        <span className="rounded-8 bg-white/15 px-2.5 py-1 font-bold typo-caption1">Open</span>
      </div>
    );
  }
  return (
    <div
      className="relative flex w-full items-center overflow-hidden rounded-16 px-6 py-5 text-white"
      style={{
        minHeight: '11rem',
        background: `linear-gradient(100deg, rgba(42,11,61,.96) 0%, rgba(42,11,61,.78) 50%, rgba(42,11,61,.5) 100%), url("${asset.heroArt}") center/cover`,
      }}
    >
      <FrameStyles />
      <div className="flex max-w-[30rem] flex-col gap-2">
        <span className="font-mono uppercase tracking-[0.16em] text-white/60 typo-caption2">Replay · week 37</span>
        <span className="typo-mega3">{HERO_CLAIM}</span>
        <span className="text-white/75 typo-footnote">Five cards about your week. Forty seconds. Every one of them posts.</span>
        <span className="mt-1 w-fit rounded-12 bg-white px-4 py-2 font-bold text-[#2A0B3D] typo-callout">Open your Replay</span>
      </div>
      <div className="absolute -bottom-10 right-8 rotate-6">
        <FrameThumb width={150} candidate={HERO} data={sampleData[HERO.id]} />
      </div>
      <div className="absolute -bottom-14 right-40 -rotate-6 opacity-70">
        <FrameThumb width={120} candidate={byId('persona.week')} data={sampleData['persona.week']} />
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 6 · The live standing                                                       */
/* -------------------------------------------------------------------------- */

export type LiveState = 'live' | 'sealing' | 'sealed';

export const LiveStanding = ({ state }: { state: LiveState }): ReactElement => {
  const copy: Record<LiveState, { eyebrow: string; figure: string; label: string; foot: string; cta?: string }> = {
    live: { eyebrow: 'Wednesday · live', figure: 'Top 4%', label: 'of Kubernetes readers this week', foot: 'Up from top 6% on Monday · 3 days left' },
    sealing: { eyebrow: 'Sunday · seals in 6h', figure: 'Top 3%', label: 'of Kubernetes readers this week', foot: 'Two more reads keep you in the top 3%' },
    sealed: { eyebrow: 'Monday · week 37 sealed', figure: 'Top 2%', label: 'of Kubernetes readers', foot: 'Your five cards are in.', cta: 'Open your Replay' },
  };
  const c = copy[state];
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const filled = state === 'live' ? 3 : 7;
  return (
    <div className="flex w-[17rem] flex-col gap-3 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4">
      <FrameStyles />
      <div className="flex items-center justify-between">
        <span className="font-mono uppercase tracking-[0.12em] text-text-quaternary typo-caption2">{c.eyebrow}</span>
        {state !== 'sealed' && <span className="h-2 w-2 rounded-[999px] bg-accent-avocado-default rd-pulse" />}
      </div>
      <div className="flex items-end gap-3">
        {state === 'sealed' && <Thumb id={HERO.id} width={48} />}
        <div className="flex flex-col">
          <span className="font-bold text-text-primary typo-mega3" style={{ color: state === 'sealed' ? '#CE3DF3' : undefined }}>
            {c.figure}
          </span>
          <span className="text-text-tertiary typo-footnote">{c.label}</span>
        </div>
      </div>
      <div className="flex items-center gap-1">
        {days.map((d, i) => (
          <span key={`${d}-${i}`} className="flex flex-1 flex-col items-center gap-1">
            <span className={classNames('h-1.5 w-full rounded-[999px]', i < filled ? 'bg-accent-cabbage-default' : 'bg-border-subtlest-secondary')} />
            <span className="text-text-quaternary typo-caption2">{d}</span>
          </span>
        ))}
      </div>
      <span className="text-text-tertiary typo-caption1">{c.foot}</span>
      {c.cta && <span className="w-full rounded-10 bg-text-primary py-2 text-center font-bold text-surface-invert typo-caption1">{c.cta}</span>}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 7 · The inline deck                                                         */
/* -------------------------------------------------------------------------- */

export const InlineDeck = (): ReactElement => {
  const [index, setIndex] = useState(0);
  const done = index >= DECK.length;
  if (done) {
    return (
      <div className="flex w-full items-center gap-3 rounded-16 border border-border-subtlest-tertiary bg-surface-float px-4 py-3">
        <span className="h-2 w-2 rounded-[999px] bg-accent-cabbage-default" />
        <span className="flex-1 font-bold text-text-primary typo-footnote">Week 37, seen. Post your best card?</span>
        <span className="rounded-10 bg-text-primary px-3 py-1.5 font-bold text-surface-invert typo-caption1">Copy image</span>
        <button type="button" onClick={() => setIndex(0)} className="text-text-quaternary typo-caption2 underline">
          reset
        </button>
      </div>
    );
  }
  return (
    <div className="relative flex h-[19rem] w-full items-center justify-center overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-surface-float">
      <FrameStyles />
      <div className="relative h-[15rem] w-[9rem]">
        {DECK.slice(index, index + 3)
          .map((id, i) => ({ id, i }))
          .reverse()
          .map(({ id, i }) => (
            <button
              key={id}
              type="button"
              onClick={() => i === 0 && setIndex((v) => v + 1)}
              className="absolute left-0 top-0 transition-transform duration-300"
              style={{ transform: `translate(${i * 14}px, ${i * -8}px) rotate(${i * 3}deg) scale(${1 - i * 0.04})`, zIndex: 10 - i, opacity: 1 - i * 0.18 }}
            >
              <FrameThumb width={144} candidate={byId(id)} data={sampleData[id]} />
            </button>
          ))}
      </div>
      <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-1.5">
        {DECK.map((id, i) => (
          <span key={id} className={classNames('h-1.5 rounded-[999px]', i === index ? 'w-4 bg-text-primary' : 'w-1.5 bg-border-subtlest-secondary')} />
        ))}
      </div>
      <span className="absolute left-4 top-4 text-text-quaternary typo-caption1">Tap the card to flip through · {index + 1} of 5</span>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 8 · Pull to reveal                                                          */
/* -------------------------------------------------------------------------- */

export const PullToReveal = ({ pulled = false }: { pulled?: boolean }): ReactElement => (
  <div className="relative h-[30rem] w-full overflow-hidden rounded-[1.75rem] bg-background-default">
    <FrameStyles />
    <div
      className="absolute inset-x-0 top-0 flex flex-col items-center justify-end gap-2 pb-3"
      style={{ height: pulled ? '14rem' : '3.25rem', background: 'linear-gradient(180deg, #2A0B3D, #5A1E75)' }}
    >
      {pulled ? (
        <>
          <div className="-mb-16 opacity-95">
            <FrameThumb width={110} candidate={HERO} data={sampleData[HERO.id]} />
          </div>
          <span className="relative z-10 rounded-[999px] bg-black/30 px-3 py-1 text-white typo-caption1">Release to open your Replay</span>
        </>
      ) : (
        <span className="font-mono uppercase tracking-[0.16em] text-white/70 typo-caption2">↓ week 37 is in</span>
      )}
    </div>
    <div className="absolute inset-x-0 flex flex-col gap-3 bg-background-default p-3 transition-all" style={{ top: pulled ? '14rem' : '2.5rem', borderRadius: '1.25rem 1.25rem 0 0' }}>
      <HeaderBar unread />
      <PostCard index={0} />
      <PostCard index={1} />
    </div>
  </div>
);

/* -------------------------------------------------------------------------- */
/* 9 · The stamped post                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Strava prints a goal banner on the activity that completed it. The Replay
 * equivalent: the post that tipped the person into the top 2% carries the
 * claim as a ribbon, in the feed, where it happened. The Replay is one tap
 * behind it.
 */
export const StampedPost = (): ReactElement => (
  <article className="relative flex w-full flex-col gap-3 overflow-hidden rounded-16 border border-accent-cabbage-default/60 bg-surface-float p-4">
    <FrameStyles />
    <div
      className="-mx-4 -mt-4 mb-1 flex items-center gap-3 px-4 py-2.5 text-white"
      style={{ background: 'linear-gradient(90deg, #2A0B3D 0%, #5A1E75 55%, #CE3DF3 130%)' }}
    >
      <span className="flex h-5 w-5 [&_svg]:h-full [&_svg]:w-full" style={WHITE_MARK}>
        <LogoIcon />
      </span>
      <span className="flex-1 font-bold typo-footnote">This one put you in the top 2% of Kubernetes readers.</span>
      <span className="rounded-8 bg-white/15 px-2.5 py-1 font-bold typo-caption1">Your Replay →</span>
    </div>
    <div className="flex items-center gap-2">
      <Avatar person={ME} size={24} />
      <span className="truncate text-text-tertiary typo-caption1">Cloudflare Blog · read Thursday, 11:52pm</span>
    </div>
    <h3 className="font-bold text-text-primary typo-callout">What actually happens when you run kubectl apply</h3>
    <div className="flex items-center gap-3">
      <div className="h-24 flex-1 rounded-10 bg-surface-hover" />
      <div className="-rotate-6">
        <Thumb id={HERO.id} width={56} />
      </div>
    </div>
    <div className="flex items-center gap-3 text-text-quaternary typo-caption2">
      <span>19 upvotes</span>
      <span>3 comments</span>
      <span className="ml-auto font-bold text-accent-cabbage-default">Read #29 of your week</span>
    </div>
  </article>
);

export const Inspiration = ({ children }: { children: ReactNode }): ReactElement => (
  <span className="inline-flex items-center gap-2 rounded-8 bg-surface-hover px-2.5 py-1 text-text-tertiary typo-caption1">
    <span className="font-mono uppercase tracking-[0.1em] text-text-quaternary typo-caption2">borrowed from</span>
    {children}
  </span>
);
