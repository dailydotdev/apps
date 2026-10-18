import type { CSSProperties, ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import LogoIcon from '@dailydotdev/shared/src/svg/LogoIcon';
import { sampleData } from '../data';
import { FrameStyles, FrameThumb } from '../frames';
import { HERO, HERO_CLAIM } from './mocks';

const WHITE_MARK = { '--theme-text-primary': '#FFFFFF' } as CSSProperties;
type Entry = { onOpen: () => void };

/**
 * The sky: the person's week as colour above the feed. One idea, many
 * skies. The palette is the week's topics, each topic keeps its colour from
 * week to week so the band becomes recognisable, and the share of the week
 * each topic took is the share of the band it gets.
 */
export const TOPICS = [
  { name: 'Kubernetes', share: 0.63, hue: '#4A7EEE', reads: 29 },
  { name: 'Rust', share: 0.15, hue: '#DD5143', reads: 7 },
  { name: 'Postgres', share: 0.09, hue: '#29D8E5', reads: 4 },
  { name: 'Go', share: 0.08, hue: '#57E087', reads: 4 },
  { name: 'AI', share: 0.05, hue: '#CE3DF3', reads: 3 },
];

/** Reads per day, Monday to Sunday, and the dominant topic that day. */
export const DAYS = [
  { day: 'M', reads: 4, hue: '#4A7EEE' },
  { day: 'T', reads: 12, hue: '#4A7EEE' },
  { day: 'W', reads: 9, hue: '#4A7EEE' },
  { day: 'T', reads: 7, hue: '#DD5143' },
  { day: 'F', reads: 8, hue: '#4A7EEE' },
  { day: 'S', reads: 2, hue: '#29D8E5' },
  { day: 'S', reads: 5, hue: '#CE3DF3' },
];

export const SkyStyles = (): ReactElement => (
  <style>{`
@keyframes skDrift { 0% { transform: translateX(-6%) scale(1); } 100% { transform: translateX(6%) scale(1.08); } }
@keyframes skTwinkle { 0%, 100% { opacity: .35; } 50% { opacity: 1; } }
@keyframes skRise { 0% { transform: translateY(70%); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
@keyframes skGrow { 0% { transform: scaleX(0); } 100% { transform: scaleX(1); } }
.sk-drift > * { animation: skDrift 14s ease-in-out infinite alternate; }
.sk-drift > :nth-child(2) { animation-duration: 19s; animation-direction: alternate-reverse; }
.sk-drift > :nth-child(3) { animation-duration: 23s; }
.sk-star { animation: skTwinkle 3.2s ease-in-out infinite; }
.sk-rise { animation: skRise 1.4s cubic-bezier(.2,.8,.2,1) both; }
.sk-grow { transform-origin: left center; animation: skGrow 1.2s cubic-bezier(.2,.8,.2,1) both; }
.sk-seg { transition: flex-grow .35s cubic-bezier(.2,.8,.2,1), filter .2s; }
.sk-seg:hover { filter: brightness(1.15); }
@media (prefers-reduced-motion: reduce) { .sk-drift > *, .sk-star, .sk-rise, .sk-grow { animation: none; } }
  `}</style>
);

const Play = (): ReactElement => (
  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[999px] bg-white/25">
    <span className="h-0 w-0 border-y-[5px] border-l-[8px] border-y-transparent border-l-white" />
  </span>
);

/* 1 · The spectrum: GitHub's language bar, for your week. */
export const SpectrumSky = ({ onOpen, labels = 'hover' }: Entry & { labels?: 'hover' | 'always' | 'none' }): ReactElement => {
  const [hover, setHover] = useState<number | null>(null);
  return (
    <button type="button" onClick={onOpen} className="flex w-full flex-col gap-1.5 text-left" onMouseLeave={() => setHover(null)}>
      <span className="flex h-3 w-full overflow-hidden rounded-[999px]">
        {TOPICS.map((topic, index) => (
          <span
            key={topic.name}
            className="sk-seg h-full"
            style={{ flexGrow: hover === index ? topic.share * 1.6 : topic.share, background: topic.hue }}
            onMouseEnter={() => setHover(index)}
          />
        ))}
      </span>
      <span className="flex items-center gap-4 px-0.5 text-text-tertiary typo-caption1">
        {labels !== 'none' &&
          TOPICS.map((topic, index) => (
            <span key={topic.name} className={classNames('flex items-center gap-1.5 transition-opacity', labels === 'hover' && hover !== null && hover !== index && 'opacity-40')}>
              <span className="h-2 w-2 rounded-[999px]" style={{ background: topic.hue }} />
              {topic.name}
              <span className="text-text-quaternary" style={{ fontVariantNumeric: 'tabular-nums' }}>{Math.round(topic.share * 100)}%</span>
            </span>
          ))}
        <span className="ml-auto flex items-center gap-2 font-bold text-text-primary">
          Week 37 · 5 cards
          <span className="h-0 w-0 border-y-[4px] border-l-[6px] border-y-transparent border-l-current" />
        </span>
      </span>
    </button>
  );
};

/* 2 · The aurora: the landing page's blurred orbs, in the week's hues. */
export const AuroraSky = ({ onOpen, height = 88 }: Entry & { height?: number }): ReactElement => (
  <button type="button" onClick={onOpen} className="relative w-full overflow-hidden rounded-16 text-left text-white" style={{ height, background: '#0F0F12' }}>
    <span className="sk-drift absolute inset-0">
      {TOPICS.slice(0, 3).map((topic, index) => (
        <span
          key={topic.name}
          className="absolute rounded-[999px]"
          style={{ left: `${index * 34 - 8}%`, top: '-60%', width: `${34 + topic.share * 60}%`, height: '220%', background: topic.hue, filter: 'blur(38px)', opacity: 0.55, mixBlendMode: 'screen' }}
        />
      ))}
    </span>
    <span className="absolute inset-0 flex items-center justify-between px-5">
      <span className="flex flex-col">
        <span className="font-mono uppercase tracking-[0.16em] typo-caption2" style={{ color: 'rgba(255,255,255,.65)' }}>Week 37, in its colours</span>
        <span className="font-bold typo-title3">{HERO_CLAIM}</span>
      </span>
      <Play />
    </span>
  </button>
);

/* 3 · The horizon: seven days, dawn to dusk, the sun where Monday is. */
export const HorizonSky = ({ onOpen }: Entry): ReactElement => {
  const max = Math.max(...DAYS.map((d) => d.reads));
  return (
    <button type="button" onClick={onOpen} className="relative flex h-24 w-full overflow-hidden rounded-16 text-left" style={{ background: 'linear-gradient(180deg, #1A0A26 0%, #2A0B3D 60%, #5A1E75 100%)' }}>
      <SkyStyles />
      {DAYS.map((d, index) => {
        const glow = 0.25 + (d.reads / max) * 0.75;
        return (
          <span key={`${d.day}-${index}`} className="relative flex flex-1 flex-col items-center justify-end pb-2">
            <span className="absolute inset-x-0 bottom-0 top-0" style={{ background: `linear-gradient(180deg, transparent 20%, ${d.hue} 140%)`, opacity: glow }} />
            <span className="relative font-mono text-white typo-caption2" style={{ opacity: 0.85 }}>{d.day}</span>
          </span>
        );
      })}
      <span className="sk-rise absolute bottom-2 left-[7%] flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-[999px] text-white [&_svg]:h-5 [&_svg]:w-5" style={{ ...WHITE_MARK, background: 'radial-gradient(circle at 40% 35%, #FFE24C, #FF9157 70%)', boxShadow: '0 0 30px 6px rgba(255,145,87,.5)' }}>
        <LogoIcon />
      </span>
      <span className="absolute right-4 top-3 flex items-center gap-3 text-white">
        <span className="flex flex-col text-right">
          <span className="font-bold typo-footnote">Tuesday was your brightest day</span>
          <span className="typo-caption2" style={{ color: 'rgba(255,255,255,.65)' }}>12 reads, all Kubernetes · your week is in</span>
        </span>
        <Play />
      </span>
    </button>
  );
};

/* 4 · The night sky: every read is a star, placed by day and hour. */
const GRID = sampleData['reading.grid']?.matrix;
export const NightSky = ({ onOpen }: Entry): ReactElement => {
  const cols = GRID?.cols ?? 7;
  const cells = GRID?.cells ?? [];
  const rows = Math.ceil(cells.length / cols);
  return (
    <button type="button" onClick={onOpen} className="relative flex h-24 w-full overflow-hidden rounded-16 text-left" style={{ background: 'radial-gradient(120% 100% at 50% 120%, #2A0B3D 0%, #0F0F12 60%)' }}>
      <SkyStyles />
      {cells.map((cell, index) => {
        if (!cell) return null;
        const x = ((index % cols) + 0.5) / cols;
        const y = (Math.floor(index / cols) + 0.5) / rows;
        return (
          <span
            key={index}
            className="sk-star absolute rounded-[999px]"
            style={{ left: `${8 + x * 60}%`, top: `${10 + y * 70}%`, width: 2 + cell * 1.4, height: 2 + cell * 1.4, background: '#F6F7F9', boxShadow: `0 0 ${cell * 4}px rgba(255,255,255,.8)`, animationDelay: `${(index % 9) * 0.35}s` }}
          />
        );
      })}
      <span className="absolute left-[71%] top-3 h-8 w-8 rounded-[999px]" style={{ background: 'radial-gradient(circle at 35% 35%, #F6F7F9, #BED2FF 65%)', boxShadow: '0 0 24px 4px rgba(190,210,255,.5)' }} />
      <span className="absolute inset-y-0 right-4 flex items-center gap-3 text-white">
        <span className="flex flex-col text-right">
          <span className="font-bold typo-footnote">47 reads. 81% after 11pm.</span>
          <span className="typo-caption2" style={{ color: 'rgba(255,255,255,.65)' }}>The Night Owl Infra Digger · open your week</span>
        </span>
        <Play />
      </span>
    </button>
  );
};

/* 5 · The forecast: a week of weather, where reads are the weather. */
const Weather = ({ reads, hue }: { reads: number; hue: string }): ReactElement => {
  if (reads >= 10) return <span className="h-5 w-5 rounded-[999px]" style={{ background: `radial-gradient(circle at 40% 35%, #FFE24C, ${hue})`, boxShadow: `0 0 14px ${hue}` }} />;
  if (reads >= 6) return <span className="relative h-5 w-6"><span className="absolute left-0 top-1 h-4 w-4 rounded-[999px]" style={{ background: hue }} /><span className="absolute right-0 top-2 h-3 w-4 rounded-[999px] bg-white/80" /></span>;
  if (reads >= 3) return <span className="mt-1 h-3 w-6 rounded-[999px] bg-white/70" />;
  return <span className="mt-2 h-1.5 w-5 rounded-[999px] bg-white/30" />;
};
export const ForecastSky = ({ onOpen }: Entry): ReactElement => (
  <button type="button" onClick={onOpen} className="flex w-full items-stretch overflow-hidden rounded-16 text-left text-white" style={{ background: 'linear-gradient(90deg, #1A1633 0%, #2A0B3D 100%)' }}>
    {DAYS.map((d, index) => (
      <span key={`${d.day}-${index}`} className={classNames('flex flex-1 flex-col items-center gap-1 py-2.5', index === 1 && 'bg-white/10')}>
        <span className="font-mono typo-caption2" style={{ color: 'rgba(255,255,255,.6)' }}>{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}</span>
        <Weather reads={d.reads} hue={d.hue} />
        <span className="font-bold typo-caption1" style={{ fontVariantNumeric: 'tabular-nums' }}>{d.reads}</span>
      </span>
    ))}
    <span className="flex w-[15rem] shrink-0 flex-col justify-center gap-0.5 border-l border-white/10 px-4">
      <span className="font-bold typo-footnote">Bright Tuesday, quiet Saturday.</span>
      <span className="typo-caption2" style={{ color: 'rgba(255,255,255,.65)' }}>Your week 37 forecast is in · 5 cards</span>
    </span>
    <span className="flex items-center pr-4">
      <Play />
    </span>
  </button>
);

/* 6 · The hairline: four pixels at the very top of the page. */
export const HairlineSky = ({ onOpen, expanded = false }: Entry & { expanded?: boolean }): ReactElement => {
  const [hover, setHover] = useState(expanded);
  return (
    <button type="button" onClick={onOpen} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(expanded)} className="relative block w-full text-left">
      <span className="flex w-full overflow-hidden" style={{ height: hover ? 28 : 4, transition: 'height .3s cubic-bezier(.2,.8,.2,1)' }}>
        {TOPICS.map((topic) => (
          <span key={topic.name} className="relative flex h-full items-center justify-center overflow-hidden" style={{ flexGrow: topic.share, background: topic.hue }}>
            {hover && <span className="truncate px-2 font-mono uppercase tracking-[0.12em] text-white typo-caption2">{topic.name} {Math.round(topic.share * 100)}%</span>}
          </span>
        ))}
      </span>
      {!hover && (
        <span className="absolute left-1/2 top-full flex -translate-x-1/2 items-center gap-1.5 rounded-b-8 px-2 py-0.5 font-mono uppercase tracking-[0.12em] text-white typo-caption2" style={{ background: '#2A0B3D', fontSize: 9 }}>
          week 37 is in
        </span>
      )}
    </button>
  );
};

/* 7 · The header takes the sky. */
export const headerSkyStyle: CSSProperties = {
  background: 'linear-gradient(90deg, rgba(74,126,238,.18) 0%, rgba(221,81,67,.14) 63%, rgba(41,216,229,.14) 78%, rgba(87,224,135,.14) 87%, rgba(206,61,243,.18) 100%), var(--theme-background-default)',
};
export const HeaderSkyChip = ({ onOpen }: Entry): ReactElement => (
  <button type="button" onClick={onOpen} className="flex items-center gap-2 rounded-10 bg-background-default/80 px-2.5 py-1 text-left shadow-2">
    <span className="flex h-2 w-16 overflow-hidden rounded-[999px]">
      {TOPICS.map((topic) => (
        <span key={topic.name} style={{ flexGrow: topic.share, background: topic.hue }} />
      ))}
    </span>
    <span className="font-bold text-text-primary typo-caption1">Your week is in</span>
  </button>
);

/* 8 · The masthead sky: tall on Monday, the hairline after. */
export const MastheadSky = ({ onOpen }: Entry): ReactElement => (
  <button type="button" onClick={onOpen} className="relative flex w-full items-end overflow-hidden rounded-16 px-6 pb-5 pt-10 text-left text-white" style={{ minHeight: '11rem', background: 'linear-gradient(180deg, #0F0F12 0%, #1A0A26 45%, #5A1E75 100%)' }}>
    <SkyStyles />
    <FrameStyles />
    <span className="sk-drift absolute inset-0">
      {TOPICS.map((topic, index) => (
        <span key={topic.name} className="absolute rounded-[999px]" style={{ left: `${index * 22 - 10}%`, bottom: '-80%', width: `${20 + topic.share * 50}%`, height: '160%', background: topic.hue, filter: 'blur(44px)', opacity: 0.45, mixBlendMode: 'screen' }} />
      ))}
    </span>
    <span className="absolute inset-x-0 bottom-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,.5), transparent)' }} />
    <span className="relative flex flex-1 flex-col gap-2">
      <span className="font-mono uppercase tracking-[0.16em] typo-caption2" style={{ color: 'rgba(255,255,255,.65)' }}>Week 37 · your sky</span>
      <span className="typo-mega3">{HERO_CLAIM}</span>
      <span className="flex items-center gap-3 typo-footnote" style={{ color: 'rgba(255,255,255,.75)' }}>
        <span className="flex h-2 w-24 overflow-hidden rounded-[999px]">
          {TOPICS.map((topic) => (
            <span key={topic.name} style={{ flexGrow: topic.share, background: topic.hue }} />
          ))}
        </span>
        Kubernetes, Rust, Postgres, Go, AI · five cards
      </span>
    </span>
    <span className="relative -mb-16 mr-2 rotate-6">
      <FrameThumb width={132} candidate={HERO} data={sampleData[HERO.id]} />
    </span>
  </button>
);

/* 9 · The sky that builds all week, then seals. */
export const GrowingSky = ({ onOpen, day }: Entry & { day: 1 | 3 | 7 | 8 }): ReactElement => {
  const shown = DAYS.slice(0, Math.min(7, day));
  const sealed = day === 8;
  const label = day === 1 ? 'Monday · the week begins' : day === 3 ? 'Wednesday · building' : day === 7 ? 'Sunday · seals tonight' : 'Monday · week 37 sealed';
  return (
    <button type="button" onClick={sealed ? onOpen : undefined} className={classNames('flex w-full items-center gap-4 rounded-12 border px-3 py-2 text-left', sealed ? 'border-accent-cabbage-default bg-overlay-float-cabbage' : 'border-border-subtlest-tertiary bg-surface-float')}>
      <SkyStyles />
      <span className="flex h-3 w-full max-w-[28rem] gap-px overflow-hidden rounded-[999px] bg-border-subtlest-tertiary">
        {DAYS.map((d, index) => {
          const on = index < shown.length;
          return (
            <span
              key={`${d.day}-${index}`}
              className="h-full"
              style={{ flex: 1, background: on ? d.hue : 'transparent', opacity: on ? 0.45 + (d.reads / 12) * 0.55 : 1, transition: `background-color .5s ${index * 80}ms, opacity .5s ${index * 80}ms` }}
            />
          );
        })}
      </span>
      <span className="flex flex-col leading-tight">
        <span className="font-bold text-text-primary typo-footnote">{label}</span>
        <span className="text-text-tertiary typo-caption2">{sealed ? `${HERO_CLAIM} Open your week.` : `${shown.reduce((n, d) => n + d.reads, 0)} reads so far · top ${day === 1 ? 6 : day === 3 ? 4 : 3}% in Kubernetes`}</span>
      </span>
      {sealed && (
        <span className="ml-auto">
          <span className="rounded-8 bg-text-primary px-2.5 py-1 font-bold text-surface-invert typo-caption1">Open</span>
        </span>
      )}
    </button>
  );
};
