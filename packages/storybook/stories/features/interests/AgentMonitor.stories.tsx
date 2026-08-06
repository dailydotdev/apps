import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { AgentDemoProviders } from '@dailydotdev/shared/src/features/interests/components/AgentDemoProviders';
import { AgentGlassComposer } from '@dailydotdev/shared/src/features/interests/components/AgentGlassComposer';
import { AgentReviewChips } from '@dailydotdev/shared/src/features/interests/components/AgentReviewChips';
import type { AgentMonitorItem } from '@dailydotdev/shared/src/features/interests/components/AgentMonitor';
import {
  AgentMonitor,
  toMonitorItems,
} from '@dailydotdev/shared/src/features/interests/components/AgentMonitor';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { FlexCol, FlexRow } from '@dailydotdev/shared/src/components/utilities';
import { mockAgents } from '@dailydotdev/shared/src/features/interests/mock';
import { mockFeedPosts } from '@dailydotdev/shared/src/features/interests/mockFeed';

const all = toMonitorItems(mockAgents);
const quiet: AgentMonitorItem[] = all.map((item) => ({
  ...item,
  state: item.state === 'new' ? 'hunting' : item.state,
  line: 'Hunting. Nothing yet.',
}));
const busy: AgentMonitorItem[] = [
  ...all,
  {
    id: 'demo-5',
    name: 'Rust in production',
    state: 'new',
    line: 'Found 3 write-ups from teams running it in anger, including one migration post-mortem.',
    at: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
  },
  {
    id: 'demo-6',
    name: 'Database internals',
    state: 'new',
    line: 'Kept 2 of 41. The rest were the same B-tree explainer with different diagrams.',
    at: new Date(Date.now() - 1000 * 60 * 21).toISOString(),
  },
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
  withChips,
}: {
  items: AgentMonitorItem[];
  defaultOpen?: boolean;
  withChips?: boolean;
}): ReactElement => {
  const [value, setValue] = useState('');
  const waiting = items.filter(({ state }) => state === 'new');

  return (
    <AgentGlassComposer
      value={value}
      onChange={setValue}
      onSubmit={() => undefined}
      pending={withChips ? <AgentReviewChips items={waiting} /> : undefined}
      status={<AgentMonitor items={items} defaultOpen={defaultOpen} />}
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
        Hover to open the list and the rotation stops. Every row is one agent
        on one line, so a dozen of them still fit in a glance.
      </Typography>
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
        note="Two came back while you were reading. The count on the bell is the whole notification: nothing in the chrome, no toast that leaves with the news."
      >
        <Field items={all} />
      </Stage>

      <Stage
        title="Open"
        note="One line per agent: who it is, what it found, its state, how long ago. Clicking a row opens that agent's conversation at the finding."
        tall
      >
        <Field items={all} defaultOpen />
      </Stage>

      <Stage
        title="Open, four with news"
        note="The list scrolls at eight rows. See all goes to the agents home."
        tall
      >
        <Field items={busy} defaultOpen />
      </Stage>

      <Stage
        title="Waiting for review"
        note="A finding is work with your name on it, so it comes out of the list and sits over the field with the action already on it. Dismissable one by one."
      >
        <Field items={all} withChips />
      </Stage>

      <Stage
        title="Waiting for review, four of them"
        note="Two at a time, then a count. Expanding shows the rest, the way a stack of pull requests does."
        tall
      >
        <Field items={busy} withChips />
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
