import type { ReactElement } from 'react';
import React from 'react';
import { agentMarks } from './agentMarks';
import { StartupsCrewOnBase, startupsPlazaSky } from './StartupsCrewOnBase';

// The agents the /startups/ page lists. These are the first few, and the last
// tile counts the rest, so the row doesn't read as all we support.
const shownAgents: (keyof typeof agentMarks)[] = [
  'claude-code',
  'cursor',
  'codex',
  'copilot',
  'windsurf',
  'cline',
];
const MORE_AGENTS = 21;

const AgentTiles = (): ReactElement => (
  <div className="flex flex-wrap items-center justify-center gap-2">
    {shownAgents.map((key) => {
      const mark = agentMarks[key];

      return (
        <span
          key={key}
          className="flex size-8 items-center justify-center rounded-10"
          style={{ background: mark.tile, color: '#fff' }}
        >
          <svg
            viewBox={mark.glyph.viewBox}
            className="size-5"
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
      className="flex size-8 items-center justify-center rounded-10 font-bold tabular-nums typo-caption1"
      style={{ background: 'rgba(255,255,255,.14)', color: '#fff' }}
    >
      {`+${MORE_AGENTS}`}
    </span>
  </div>
);

/** The first step's box: what it is, and the crew standing on their base. */
export const StartupsSignupPanel = (): ReactElement => (
  <div
    className="relative flex h-full flex-col items-center overflow-hidden p-10"
    style={{ color: '#fff', background: startupsPlazaSky }}
  >
    <StartupsCrewOnBase />
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
      <p className="text-pretty typo-callout" style={{ opacity: 0.7 }}>
        Works with the agents you already use.
      </p>
      <AgentTiles />
    </div>
  </div>
);
