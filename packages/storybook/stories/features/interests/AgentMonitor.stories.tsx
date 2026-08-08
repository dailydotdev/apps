import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { AgentDemoProviders } from '@dailydotdev/shared/src/features/interests/components/AgentDemoProviders';
import { AgentGlassComposer } from '@dailydotdev/shared/src/features/interests/components/AgentGlassComposer';
import type {
  AgentMonitorItem,
  AgentMonitorState,
} from '@dailydotdev/shared/src/features/interests/components/AgentMonitor';
import {
  AgentMonitor,
  AgentState,
  stateLabel,
  toMonitorItems,
} from '@dailydotdev/shared/src/features/interests/components/AgentMonitor';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { FlexCol, FlexRow } from '@dailydotdev/shared/src/components/utilities';
import { recentMockAgents } from '@dailydotdev/shared/src/features/interests/mock';
import { mockFeedPosts } from '@dailydotdev/shared/src/features/interests/mockFeed';

const all = toMonitorItems(recentMockAgents());
const quiet: AgentMonitorItem[] = all.map((item) => ({
  ...item,
  state: item.state === 'waiting' ? 'watching' : item.state,
  line: 'Watching. Nothing new yet.',
}));
const busy: AgentMonitorItem[] = [
  ...all,
  {
    id: 'extra-1',
    name: 'Rust in production',
    state: 'waiting',
    line: 'Found 3 write-ups from teams running it in anger, including one migration post-mortem.',
    at: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
  },
  {
    id: 'extra-2',
    name: 'Database internals',
    state: 'waiting',
    line: 'Kept 2 of 41. The rest were the same B-tree explainer with different diagrams.',
    at: new Date(Date.now() - 1000 * 60 * 21).toISOString(),
  },
];

// The seven, in the order they matter: the one that wants you, the two that are
// fine, the one that has not started, then the three that are not working.
const states: { state: AgentMonitorState; note: string }[] = [
  { state: 'waiting', note: 'A run came back with something you have not seen.' },
  { state: 'running', note: 'Scanning right now. The only dot that moves.' },
  { state: 'watching', note: 'On schedule, between runs, nothing new.' },
  { state: 'starting', note: 'Spawned, but its first run has not happened.' },
  { state: 'failed', note: 'The last run did not finish. Needs you.' },
  { state: 'paused', note: 'Switched off by you. Nothing scheduled.' },
  { state: 'stopped', note: 'Retired. Hollow dot: it is not coming back on its own.' },
];

const Stage = ({
  title,
  note,
  tall,
  children,
}: {
  title: string;
  note: string;
  tall?: boolean;
  children: ReactNode;
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
        {note}
      </Typography>
    </FlexCol>
    <div
      className={`relative overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-default p-4 ${
        tall ? 'h-[30rem]' : 'h-64'
      }`}
    >
      <FlexCol className="gap-2">
        {mockFeedPosts.slice(0, 6).map((post) => (
          <FlexRow
            key={post.id}
            className="items-center gap-3 rounded-12 border border-border-subtlest-quaternary p-3"
          >
            <span className="size-8 shrink-0 rounded-8 bg-surface-float" />
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
              className="min-w-0 flex-1 truncate"
            >
              {post.title}
            </Typography>
          </FlexRow>
        ))}
      </FlexCol>
      <div className="absolute inset-x-4 bottom-4">{children}</div>
    </div>
  </FlexCol>
);

const Field = ({
  items,
  defaultOpen,
}: {
  items: AgentMonitorItem[];
  defaultOpen?: boolean;
}): ReactElement => {
  const [value, setValue] = useState('');

  return (
    <AgentGlassComposer
      value={value}
      onChange={setValue}
      onSubmit={() => undefined}
      pending={<AgentMonitor items={items} defaultOpen={defaultOpen} />}
    />
  );
};

const Monitor = (): ReactElement => (
  <FlexCol className="gap-10">
    <FlexCol className="gap-1">
      <Typography type={TypographyType.Title3} bold>
        Agent monitor
      </Typography>
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Tertiary}
      >
        Collapsed, the strip is a ticker: each agent's latest in rotation, with
        the bell on the right carrying the only number that asks for anything.
        Clicking it opens what came back, and a row under that list opens
        every agent whatever it is doing. Click out or press Escape to close;
        the rotation stops while it is open. Rows are built like a
        pull-request list: state as a coloured word, then whose it is, then
        what it says.
      </Typography>
    </FlexCol>

    <FlexCol className="gap-3">
      <FlexCol className="gap-0.5">
        <Typography type={TypographyType.Body} bold>
          Every state
        </Typography>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          One hue each, and only the running one animates. The word carries it
          for anyone who cannot tell the hues apart.
        </Typography>
      </FlexCol>
      <FlexCol className="divide-y divide-border-subtlest-quaternary rounded-16 border border-border-subtlest-tertiary">
        {states.map(({ state, note }) => (
          <FlexRow key={state} className="items-center gap-3 px-3 py-2.5">
            <span className="w-40 shrink-0">
              <AgentState state={state} />
            </span>
            <Typography
              type={TypographyType.Caption1}
              color={TypographyColor.Tertiary}
              className="min-w-0 flex-1"
            >
              {note}
            </Typography>
            <Typography
              type={TypographyType.Caption2}
              color={TypographyColor.Quaternary}
              className="hidden shrink-0 tablet:block"
            >
              {stateLabel[state]}
            </Typography>
          </FlexRow>
        ))}
      </FlexCol>
    </FlexCol>

    <div className="grid gap-8 laptop:grid-cols-2">
      <Stage
        title="Nothing to report"
        note="No agent has come back with anything, so the bell carries no number and the ticker is just what they are working on."
      >
        <Field items={quiet} />
      </Stage>

      <Stage
        title="Two came back"
        note="Two came back while you were reading. They stack over the ticker with the action already on them, and the bell counts them."
      >
        <Field items={all} />
      </Stage>

      <Stage
        title="Open"
        note="First press: only what came back, with a row under it for the rest. Clicking a row opens that agent's conversation at the finding."
        tall
      >
        <Field items={all} defaultOpen />
      </Stage>

      <Stage
        title="Open, four with news"
        note="Expanded with four waiting. The list scrolls once it is long enough."
        tall
      >
        <Field items={busy} defaultOpen />
      </Stage>

      <Stage
        title="Waiting for review, four of them"
        note="Two at a time, then a count on the ticker. Expanding swaps the stack for the whole list."
        tall
      >
        <Field items={busy} />
      </Stage>
    </div>
  </FlexCol>
);

const meta: Meta = {
  title: 'Features/Interests/AgentMonitor',
  parameters: { layout: 'fullscreen' },
  render: () => (
    <AgentDemoProviders>
      <div className="min-h-screen bg-background-default p-6 text-text-primary">
        <Monitor />
      </div>
    </AgentDemoProviders>
  ),
};

export default meta;

export const Default: StoryObj = {};
