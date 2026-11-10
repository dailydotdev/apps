import type { ReactElement } from 'react';
import React from 'react';
import { agentMarks } from './agentMarks';
import { AgentMark } from './AgentMark';
import { StartupsCrewOnBase, startupsPlazaSky } from './StartupsCrewOnBase';

// The first agents of the /startups/ page's list, in its order, and the last
// tile counts the rest of that list, so the row doesn't read as all we support.
const shownAgents: (keyof typeof agentMarks)[] = [
  'claude-code',
  'codex',
  'cursor',
  'chatgpt',
  'gemini',
  'copilot',
];
const MORE_AGENTS = 20;

const AgentTiles = (): ReactElement => (
  <div className="flex flex-wrap items-center justify-center gap-2">
    {shownAgents.map((key) => (
      <AgentMark
        key={key}
        mark={agentMarks[key]}
        className="size-8 rounded-10"
        glyphClassName="size-5"
      />
    ))}
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
        Works with literally any agent you use.
      </p>
      <AgentTiles />
    </div>
  </div>
);
