import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { agentMarks } from './agentMarks';
import { CrewOnBase, PLAZA_SKY } from './crewOnBase';

// Sign-up panels: what fills the box on the first step. Every word and number
// comes from the live /startups/ page or business.daily.dev (recruiter-landing:
// AgentTraffic, Laurels, TrustStrip, audience-quotes, social-proof). The
// companies and people are daily.dev customers through Ads, so nothing here
// says they use daily.dev for Startups.

const ASSETS = '/startups-onboarding';

// Tailwind in this repo has no white, so the panels set it directly.
const dim = { color: 'rgba(255,255,255,.7)' };

const Fill = ({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}): ReactElement => (
  <div
    className={classNames(
      'relative flex h-full flex-col overflow-hidden rounded-16 p-10',
      className,
    )}
    style={{ color: '#fff', ...style }}
  >
    {children}
  </div>
);

const Glows = (): ReactElement => (
  <>
    <div
      className="startups-glow startups-glow-a"
      style={{
        background: 'rgba(124,107,234,.5)',
        width: 460,
        height: 460,
        left: '-10%',
        top: '-8%',
      }}
    />
    <div
      className="startups-glow startups-glow-b"
      style={{
        background: 'rgba(186,86,225,.4)',
        width: 520,
        height: 520,
        right: '-14%',
        bottom: '-10%',
      }}
    />
  </>
);

/** 1. One big customer quote, with the person who said it. */
export const QuotePanel = (): ReactElement => (
  <Fill className="justify-center gap-8">
    <Glows />
    <blockquote className="relative text-balance font-bold tracking-tight typo-large-title">
      “daily.dev is a daily place for devs to go. It’s an awesome place to show
      up in front of people and not be too salesy.”
    </blockquote>
    <div className="relative flex items-center gap-3">
      <img
        src={`${ASSETS}/yahia-bakour.png`}
        alt=""
        className="size-12 rounded-full object-cover"
      />
      <div className="flex flex-col">
        <span className="font-bold typo-callout">Yahia Bakour</span>
        <span className="typo-footnote" style={dim}>
          Founder, context.dev
        </span>
      </div>
    </div>
  </Fill>
);

// Heights from the landing page's TrustStrip, so the marks carry the same weight.
const logos: [string, number][] = [
  ['cursor', 25],
  ['sentry', 24],
  ['datadog', 26],
  ['jetbrains-mono', 21],
  ['postman-mono', 27],
  ['posthog', 19],
  ['vanta', 20],
  ['snyk', 34],
  ['launchdarkly', 21],
  ['temporal', 30],
  ['appwrite', 21],
  ['retool', 20],
];

/** 2. The crew on top, the companies below, as on Retool's sign-up. */
export const LogosPanel = (): ReactElement => (
  <Fill className="!p-0">
    <img
      src={`${ASSETS}/cover-crowd.webp`}
      alt=""
      className="min-h-0 w-full flex-1 object-cover object-bottom"
    />
    <div className="flex flex-col gap-6 p-8">
      <p className="text-balance text-center font-bold typo-callout">
        Companies already reaching developers on daily.dev
      </p>
      <ul className="grid grid-cols-3 items-center justify-items-center gap-x-4 gap-y-6">
        {logos.map(([name, height]) => (
          <li key={name}>
            <img
              src={`${ASSETS}/logos/${name}.svg`}
              alt={name.replace('-mono', '')}
              style={{
                height,
                maxWidth: 110,
                filter: 'brightness(0) invert(1)',
                opacity: 0.8,
              }}
            />
          </li>
        ))}
      </ul>
    </div>
  </Fill>
);

const Stat = ({
  value,
  label,
  isBig,
}: {
  value: string;
  label: string;
  isBig?: boolean;
}): ReactElement => (
  <div className="relative flex flex-col gap-1">
    <span
      className={classNames(
        'font-bold tabular-nums tracking-tight',
        !isBig && 'typo-title1',
      )}
      style={isBig ? { fontSize: '3.25rem', lineHeight: 1 } : undefined}
    >
      {value}
    </span>
    <span className="text-pretty typo-callout" style={dim}>
      {label}
    </span>
  </div>
);

/** 3. The numbers from the landing page, biggest first. */
export const StatsPanel = (): ReactElement => (
  <Fill className="justify-center gap-10">
    <Glows />
    <Stat
      isBig
      value="8,198,476"
      label="AI agent requests to daily.dev in a month."
    />
    <div className="bg-white/10 relative h-px" />
    <div className="relative grid grid-cols-2 gap-8">
      <Stat value="#1" label="in AI answers, ahead of Hacker News and GitHub" />
      <Stat value="DR 77" label="Domain rating on Ahrefs, out of 100." />
      <Stat value="16K+" label="sites link to daily.dev" />
      <Stat value="6.4K" label="keywords in Google’s top 3" />
    </div>
    <p className="relative typo-callout" style={dim}>
      Where millions of developers and their AI agents discover what’s next.
    </p>
  </Fill>
);

const Laurel = ({
  top,
  bottom,
}: {
  top: string;
  bottom: string;
}): ReactElement => (
  <div className="flex flex-col items-center gap-1 text-center">
    <span className="font-bold typo-title2">{top}</span>
    <span className="typo-callout" style={dim}>
      {bottom}
    </span>
  </div>
);

/** 4. Awards, ratings and the crew celebrating. */
export const AwardsPanel = (): ReactElement => (
  <Fill className="items-center justify-between gap-6 !pb-0">
    <Glows />
    <div className="relative mt-4 flex flex-col items-center gap-8">
      <Laurel top="Product of the Year" bottom="Product Hunt" />
      <div className="bg-white/20 h-px w-16" />
      <Laurel top="4.9 ★ rating" bottom="Chrome Web Store" />
      <div className="bg-white/20 h-px w-16" />
      <Laurel top="20K+ stars" bottom="GitHub" />
    </div>
    <img
      src={`${ASSETS}/crew-cheer.webp`}
      alt=""
      className="relative min-h-0 w-[62%] flex-1 object-contain object-bottom"
    />
  </Fill>
);

// The agents the /startups/ page lists, in AGENT_IDS (recruiter-landing). These
// are the first few, and the last tile counts the rest, so the row doesn't read
// as all we support.
const shownAgents: (keyof typeof agentMarks)[] = [
  'claude-code',
  'cursor',
  'codex',
  'copilot',
  'windsurf',
  'cline',
];
const MORE_AGENTS = 21;

const AgentTiles = ({ isSmall }: { isSmall?: boolean }): ReactElement => {
  const tile = isSmall ? 'size-8 rounded-10' : 'size-12 rounded-12';

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {shownAgents.map((key) => {
        const mark = agentMarks[key];

        return (
          <span
            key={key}
            className={classNames('flex items-center justify-center', tile)}
            style={{ background: mark.tile, color: '#fff' }}
          >
            <svg
              viewBox={mark.glyph.viewBox}
              className={isSmall ? 'size-5' : 'size-7'}
              fill="currentColor"
              aria-hidden
            >
              {mark.glyph.paths.map((d) => (
                <path key={d} d={d} fillRule="evenodd" />
              ))}
            </svg>
          </span>
        );
      })}
      <span
        className={classNames(
          'flex items-center justify-center font-bold tabular-nums typo-caption1',
          tile,
        )}
        style={{ background: 'rgba(255,255,255,.14)', color: '#fff' }}
      >
        {`+${MORE_AGENTS}`}
      </span>
    </div>
  );
};

/** 5. All brand colour and one big line, from the landing page's headline. */
export const BrandPanel = (): ReactElement => (
  <Fill className="justify-between gap-8" style={{ background: '#D8B4FE' }}>
    <p
      className="text-balance font-bold leading-none tracking-tight"
      style={{ color: '#0F0F12', fontSize: '3.5rem' }}
    >
      Developer distribution channel, on autopilot.
    </p>
    <div className="flex flex-col gap-4">
      <AgentTiles />
      <p className="font-bold typo-callout" style={{ color: '#0F0F12' }}>
        Works with the agents you already use.
      </p>
    </div>
  </Fill>
);

/** The default: the line and the agents in the sky, and the crew on its base. */
export const CrewLinePanel = (): ReactElement => (
  <Fill className="items-center gap-4" style={{ background: PLAZA_SKY }}>
    <CrewOnBase />
    <div
      className="relative flex flex-col items-center gap-4 text-center"
      style={{ marginTop: '16%' }}
    >
      <p
        className="font-bold tracking-tight"
        style={{ fontSize: 'clamp(1.75rem, 5vh, 2.75rem)', lineHeight: 1.05 }}
      >
        Developer distribution
        <br />
        channel, on autopilot.
      </p>
      <p className="text-pretty typo-callout" style={dim}>
        Works with the agents you already use.
      </p>
      <AgentTiles isSmall />
    </div>
  </Fill>
);

/** 6. The crew on its own, with nothing to read. */
export const CrewPanel = (): ReactElement => (
  <Fill>
    <img
      src={`${ASSETS}/cover-crew.webp`}
      alt=""
      className="absolute inset-0 size-full object-cover object-bottom"
    />
  </Fill>
);
