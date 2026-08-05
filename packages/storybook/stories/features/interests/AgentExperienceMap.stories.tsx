import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { FlexCol } from '@dailydotdev/shared/src/components/utilities';
import { AgentTable } from '@dailydotdev/shared/src/features/interests/components/blocks/AgentTable';

/**
 * The parity map: every chat/agent capability in Claude Code and Codex,
 * against what the daily.dev agent workspace does about it. This page is the
 * decision record — what shipped, what was translated into our own idiom,
 * what waits on the backend, and what we deliberately left out.
 */

const columns = [
  'Capability',
  'Claude Code / Codex pattern',
  'daily.dev agent',
];

const shipped: string[][] = [
  [
    'Split workspace',
    'Conversation left; browser / terminal / files open in a right panel',
    'AgentWorkspace: transcript left, posts / feeds / activity / debug in a resizable right panel',
  ],
  [
    'Panel tabs',
    'Chip tabs per open surface, close on hover, keyboard dismiss',
    'Chip tabs with raised selected state, per-tab close, panel close, Esc',
  ],
  [
    'Run control',
    'Session chip opens a Remote Control popover with an on/off switch',
    'Agent tile opens the run popover: status dot, toggle (off also stops the run), cadence, last run',
  ],
  [
    'Working status strip',
    '✳ spinner · elapsed · what it is doing',
    'AgentThinkingStrip: the logo as a live particle field · Working · elapsed · run label',
  ],
  [
    'Composer working glow',
    'Border beam runs the input while a turn is in flight',
    'The border-beam package itself (md · colorful · strength 1), client-mounted',
  ],
  [
    'Send ↔ Stop',
    'Send morphs into a stop square during a run',
    'Float icon button: send plane ↔ drawn stop square',
  ],
  [
    'Message queueing',
    'Prompts sent mid-run queue and fire as runs finish',
    'Queued prompts render as dashed bubbles with remove; drain in order; Stop clears the queue',
  ],
  [
    'Interrupt & stop states',
    'Stopped turns stay in the transcript as a record',
    '"Stopped." / "Interrupted." notes replace the pending turn; activity logs the stop',
  ],
  [
    'Error turn + retry',
    'Failed turns show an error row with retry',
    'ErrorTurn: warning row with a Retry button that re-sends the command',
  ],
  [
    'Reply actions',
    'Copy / rate a reply, revealed on hover',
    'Copy (flattens blocks to text), thumbs up / down, hover-revealed per turn',
  ],
  [
    'Scroll behavior',
    'Follows only when pinned to the tail; "new message" pill otherwise',
    'Pinned-only autoscroll + floating "New reply" pill above the composer',
  ],
  [
    'Turn arrival motion',
    'New turns ease in rather than popping',
    'agent-turn-in: 240ms rise-and-settle, reduced-motion aware',
  ],
  [
    'Keyboard',
    'Enter sends, Shift+Enter breaks, Esc stops the run',
    'Same three; Esc prefers stopping a run over closing a panel tab',
  ],
  [
    'Rich reply blocks',
    'Markdown, code with copy/run, tables, file embeds',
    'AgentBlocks: transcript prose, code block, table, embed card, post card, pick list',
  ],
  [
    'Usage meter',
    'Usage panel off the composer: allowances, resets, limits',
    'AgentUsageMeter: run allowances, warning tier, Plus upsell, own-API-key route',
  ],
  [
    'Empty / first-run state',
    'Session header orients before the first turn',
    'AgentIntro: identity tile, cadence, counts, last run',
  ],
];

const adapted: string[][] = [
  [
    'Slash commands',
    'Typed "/" menu of workflow commands',
    'Labelled quick-action chips under the composer — same reach, zero recall burden for a non-terminal audience',
  ],
  [
    'Tool-call disclosure',
    'Each tool invocation is an expandable row in the turn',
    'The Activity tab is the run log; inline per-step rows wait for real step data from the backend',
  ],
  [
    'Session usage economics',
    'Token counts and cost per turn',
    'Run counts against a plan allowance — tokens are not a concept our audience carries',
  ],
];

const deferred: string[][] = [
  [
    'Streaming replies',
    'Tokens render as they generate',
    'Needs a streaming backend; the thinking strip and turn motion stand in until then',
  ],
  [
    'Session history / resume',
    'Past sessions listed and resumable',
    'Needs the conversations API; the agent list page is the entry point today',
  ],
  [
    '@-mention context',
    'Attach files or context to the prompt',
    'Attaching posts/tags needs search; post cards already flow the other way',
  ],
  [
    'Live activity push',
    'Background events surface as they happen',
    'Activity is poll-rendered mock data until the backend emits events',
  ],
];

const ignored: string[][] = [
  [
    'Diff viewer / file tree / terminal',
    'Core of a coding agent',
    'No code-editing use case; the Debug tab covers raw state',
  ],
  [
    'Plan mode & permission prompts',
    'Gate destructive actions behind approval',
    'The agent only curates content — nothing it does needs a permission gate',
  ],
  [
    'Model / effort pickers',
    'Choose model and reasoning depth per turn',
    'One agent, one brain: a picker would only add doubt',
  ],
  [
    'Checkpoints / rewind',
    'Restore the workspace to an earlier state',
    'Feed curation has no state worth rewinding; re-prompting is cheaper than restoring',
  ],
  [
    'Voice input',
    'Dictate prompts',
    'Not part of the product’s input story on any surface',
  ],
];

const Section = ({
  title,
  hook,
  rows,
}: {
  title: string;
  hook: string;
  rows: string[][];
}): ReactElement => (
  <FlexCol className="gap-3">
    <FlexCol className="gap-0.5">
      <Typography type={TypographyType.Body} bold>
        {title}
      </Typography>
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
      >
        {hook}
      </Typography>
    </FlexCol>
    <AgentTable columns={columns} rows={rows} />
  </FlexCol>
);

const Page = (): ReactNode => (
  <div className="min-h-screen bg-background-default p-6 text-text-primary">
    <FlexCol className="mx-auto max-w-[70rem] gap-8">
      <FlexCol className="gap-1">
        <Typography type={TypographyType.Title3} bold>
          Agent experience map — Claude Code & Codex vs daily.dev
        </Typography>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          The decision record for the agent workspace: which of their patterns
          shipped, which were translated into our idiom, which wait on the
          backend, and which we ruled out on purpose.
        </Typography>
      </FlexCol>

      <Section
        title="Shipped"
        hook="Their pattern, in our design system, working in the demo today."
        rows={shipped}
      />
      <Section
        title="Adapted"
        hook="The job is covered, but through a mechanism that fits our audience better than a literal port."
        rows={adapted}
      />
      <Section
        title="Deferred"
        hook="Wanted, and blocked on backend capabilities — not on design."
        rows={deferred}
      />
      <Section
        title="Ignored"
        hook="Deliberately not building; each would add surface without serving a feed agent."
        rows={ignored}
      />
    </FlexCol>
  </div>
);

const meta: Meta = {
  title: 'Features/Interests/AgentExperienceMap',
  parameters: { layout: 'fullscreen' },
  render: () => <Page />,
};

export default meta;

export const Default: StoryObj = {};
