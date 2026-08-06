import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { AgentDemoProviders } from '@dailydotdev/shared/src/features/interests/components/AgentDemoProviders';
import { AgentGlassComposer } from '@dailydotdev/shared/src/features/interests/components/AgentGlassComposer';
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
        The counts live under the field, on the same pane of glass. Hover the
        strip to look, click it to keep it open. Every row is one agent talking
        to you, so the panel reads like a small inbox rather than a status
        table.
      </Typography>
    </FlexCol>

    <div className="grid gap-8 laptop:grid-cols-2">
      <Stage
        title="Nothing to report"
        note="No agent has come back with anything. The strip is a count of work in progress and nothing more."
      >
        <Field items={quiet} />
      </Stage>

      <Stage
        title="Two came back"
        note="The purple count is the whole notification. No bell, no red dot in the chrome, no toast that leaves with the news."
      >
        <Field items={all} />
      </Stage>

      <Stage
        title="Open"
        note="One row per agent: who it is, what it found, how long ago. Clicking a row opens that agent's conversation at the finding."
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
