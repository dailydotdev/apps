import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { AgentDemoProviders } from '@dailydotdev/shared/src/features/interests/components/AgentDemoProviders';
import { AgentGlassComposer } from '@dailydotdev/shared/src/features/interests/components/AgentGlassComposer';
import { AgentMark } from '@dailydotdev/shared/src/features/interests/components/AgentMark';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { FlexCol, FlexRow } from '@dailydotdev/shared/src/components/utilities';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { MagicIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { UserInterestStatus } from '@dailydotdev/shared/src/graphql/interests';
import { mockFeedPosts } from '@dailydotdev/shared/src/features/interests/mockFeed';

// Plain CSS: a story file's new arbitrary Tailwind classes are not compiled
// until Storybook restarts, and these need keyframes anyway.
const styles = `
.arv-shimmer {
  background: linear-gradient(
    90deg,
    transparent,
    var(--theme-accent-cabbage-default),
    transparent
  );
  animation: arv-shimmer 1.8s linear infinite;
}
@keyframes arv-shimmer {
  from { transform: translateX(-100%); }
  to { transform: translateX(100%); }
}

.arv-orbit::before {
  content: '';
  position: absolute;
  inset: -3px;
  border-radius: 999px;
  background: conic-gradient(
    from 0deg,
    transparent 0deg,
    var(--theme-accent-cabbage-default) 90deg,
    transparent 200deg
  );
  animation: arv-spin 1.4s linear infinite;
  mask: radial-gradient(farthest-side, transparent calc(100% - 2px), #000 0);
  -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 2px), #000 0);
}
@keyframes arv-spin {
  to { transform: rotate(1turn); }
}

.arv-line-in {
  animation: arv-line-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
}
@keyframes arv-line-in {
  from { opacity: 0; transform: translateY(6px); filter: blur(4px); }
}

.arv-fill {
  animation: arv-fill 2.4s ease-in-out infinite;
  transform-origin: left center;
}
@keyframes arv-fill {
  0% { transform: scaleX(0); }
  70%, 100% { transform: scaleX(1); }
}

.arv-breathe {
  animation: arv-breathe 3.6s ease-in-out infinite;
}
@keyframes arv-breathe {
  0%, 100% { opacity: 0.28; }
  50% { opacity: 0.6; }
}

.arv-beam::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px;
  background: conic-gradient(
    from 0deg,
    transparent 0deg,
    var(--theme-accent-cabbage-default) 60deg,
    var(--theme-accent-blueCheese-default) 110deg,
    transparent 190deg
  );
  animation: arv-spin 2.6s linear infinite;
  mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  mask-composite: exclude;
  -webkit-mask-composite: xor;
}

.arv-dock-in {
  animation: arv-line-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@media (prefers-reduced-motion: reduce) {
  .arv-shimmer, .arv-orbit::before, .arv-fill, .arv-breathe { animation: none; }
}
`;

const runningAgents = [
  'Cool zig projects',
  'What is actually shipping in AI agents',
  'Local-first sync',
];

const Stage = ({
  index,
  title,
  note,
  children,
}: {
  index: number;
  title: string;
  note: string;
  children: ReactNode;
}): ReactElement => (
  <FlexCol className="gap-3">
    <FlexCol className="gap-0.5">
      <Typography type={TypographyType.Body} bold>
        {`${index}. ${title}`}
      </Typography>
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
      >
        {note}
      </Typography>
    </FlexCol>
    <div className="relative h-56 overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-default p-4">
      <FlexCol className="gap-2">
        {mockFeedPosts.slice(0, 3).map((post) => (
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
  status,
  className,
}: {
  status?: ReactNode;
  className?: string;
}): ReactElement => {
  const [value, setValue] = useState('');

  return (
    <AgentGlassComposer
      value={value}
      onChange={setValue}
      onSubmit={() => undefined}
      status={status}
      className={className}
    />
  );
};

const useTick = (ms: number): number => {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTick((current) => current + 1), ms);

    return () => clearInterval(timer);
  }, [ms]);

  return tick;
};

const Hairline = (): ReactElement => (
  <div className="relative">
    <span className="pointer-events-none absolute inset-x-6 top-0 z-1 h-px overflow-hidden">
      <span className="arv-shimmer block h-px w-full" />
    </span>
    <Field />
  </div>
);

const Strip = (): ReactElement => {
  const seconds = useTick(1000);

  return (
    <Field
      status={
        <FlexRow className="items-center gap-2 px-2 pt-0.5">
          <span className="size-1.5 shrink-0 animate-pulse rounded-6 bg-brand-default" />
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
            className="min-w-0 flex-1 truncate"
          >
            {`Hunting ${runningAgents[0]}`}
          </Typography>
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Quaternary}
            className="tabular-nums"
          >
            {`0:${`${seconds % 60}`.padStart(2, '0')}`}
          </Typography>
          <Button size={ButtonSize.XSmall} variant={ButtonVariant.Subtle}>
            Stop
          </Button>
        </FlexRow>
      }
    />
  );
};

const Counter = (): ReactElement => {
  const tick = useTick(700);

  return (
    <Field
      status={
        <FlexRow className="items-center gap-2 px-2 pt-0.5">
          <span className="size-1.5 shrink-0 animate-pulse rounded-6 bg-brand-default" />
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
            className="min-w-0 flex-1 truncate tabular-nums"
          >
            <strong className="text-text-primary">{40 + tick * 7}</strong>
            {' posts read · '}
            <strong className="text-text-primary">
              {Math.floor(tick / 3)}
            </strong>
            {' kept'}
          </Typography>
        </FlexRow>
      }
    />
  );
};

const Orbit = (): ReactElement => (
  <div className="relative">
    <span className="arv-orbit pointer-events-none absolute bottom-5 left-5 z-1 block size-4 rounded-6" />
    <Field />
  </div>
);

const Stack = (): ReactElement => (
  <Field
    status={
      <FlexRow className="items-center gap-2 px-2 pt-0.5">
        <FlexRow className="shrink-0 items-center">
          {runningAgents.map((name, index) => (
            <span
              key={name}
              className="rounded-10 border-2 border-background-default"
              style={{ marginLeft: index ? '-0.65rem' : 0 }}
            >
              <AgentMark status={UserInterestStatus.Active} isWorking />
            </span>
          ))}
        </FlexRow>
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Tertiary}
          className="min-w-0 flex-1 truncate"
        >
          {`${runningAgents.length} agents hunting right now`}
        </Typography>
      </FlexRow>
    }
  />
);

// Stood in with a rotating conic edge; the product uses the workspace
// composer's BorderBeam.
const Beam = (): ReactElement => (
  <div className="arv-beam relative rounded-20 p-px">
    <Field />
  </div>
);

const Docked = (): ReactElement => (
  <FlexCol className="gap-1.5">
    <FlexRow className="arv-dock-in justify-center">
      <FlexRow className="items-center gap-2 rounded-12 border border-border-subtlest-secondary bg-background-subtle py-1 pl-1.5 pr-2 shadow-2">
        <AgentMark status={UserInterestStatus.Active} />
        <Typography type={TypographyType.Caption1}>
          <strong>{runningAgents[0]}</strong>
          {' found 6 things'}
        </Typography>
        <Button size={ButtonSize.XSmall} variant={ButtonVariant.Subtle}>
          Open
        </Button>
      </FlexRow>
    </FlexRow>
    <Field />
  </FlexCol>
);

const steps = [
  'reading TigerBeetle post-mortem…',
  'scoring against your bar…',
  'dropping 4 duplicate release posts…',
  'writing up what survived…',
];

const Ticker = (): ReactElement => {
  const tick = useTick(1900);
  const line = steps[tick % steps.length];

  return (
    <Field
      status={
        <FlexRow className="items-center gap-2 overflow-hidden px-2 pt-0.5">
          <MagicIcon
            size={IconSize.Size16}
            className="shrink-0 text-brand-default"
          />
          <Typography
            key={line}
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
            className="arv-line-in min-w-0 flex-1 truncate"
          >
            {line}
          </Typography>
        </FlexRow>
      }
    />
  );
};

const Segments = (): ReactElement => (
  <Field
    status={
      <FlexCol className="gap-1 px-2 pt-1">
        <FlexRow className="items-center gap-2">
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
            className="min-w-0 flex-1 truncate"
          >
            Scoring 128 posts
          </Typography>
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Quaternary}
          >
            step 2 of 3
          </Typography>
        </FlexRow>
        <FlexRow className="gap-1">
          {['scan', 'score', 'write'].map((step, index) => (
            <span
              key={step}
              className="h-0.5 flex-1 overflow-hidden rounded-2 bg-surface-float"
            >
              <span
                className={index === 1 ? 'arv-fill block h-0.5' : 'block h-0.5'}
                style={{
                  background: 'var(--theme-accent-cabbage-default)',
                  transform: index === 0 ? 'scaleX(1)' : undefined,
                  transformOrigin: 'left center',
                  opacity: index === 2 ? 0 : 1,
                }}
              />
            </span>
          ))}
        </FlexRow>
      </FlexCol>
    }
  />
);

const Ambient = (): ReactElement => (
  <div className="relative">
    <span
      aria-hidden
      className="arv-breathe pointer-events-none absolute inset-x-8 bottom-0 top-3 rounded-24"
      style={{
        background:
          'radial-gradient(60% 100% at 50% 100%, var(--theme-accent-cabbage-default), transparent 70%)',
        filter: 'blur(26px)',
      }}
    />
    <span className="pointer-events-none absolute -top-2 left-3 z-1">
      <span className="relative">
        <AgentMark status={UserInterestStatus.Active} isWorking />
        <span className="absolute -right-1 -top-1 rounded-6 bg-brand-default px-1 text-white typo-caption2">
          6
        </span>
      </span>
    </span>
    <Field />
  </div>
);

const variants: { title: string; note: string; render: () => ReactElement }[] =
  [
    {
      title: 'Hairline',
      note: 'A single travelling line on the frame edge. The least you can say and still say something is happening.',
      render: () => <Hairline />,
    },
    {
      title: 'Status strip',
      note: 'What it is hunting, how long it has been at it, and a stop. The plain baseline every other variant has to beat.',
      render: () => <Strip />,
    },
    {
      title: 'Live counters',
      note: 'The work as numbers climbing in place. Reads as effort spent on your behalf, which is the thing worth showing.',
      render: () => <Counter />,
    },
    {
      title: 'Orbiting mark',
      note: 'No extra row: the mark already in the field grows a spinner. Costs zero height, which matters over a feed.',
      render: () => <Orbit />,
    },
    {
      title: 'Agent stack',
      note: 'Several agents as overlapping marks. Scales to a dozen without the strip growing.',
      render: () => <Stack />,
    },
    {
      title: 'Border beam',
      note: 'The frame is the indicator, no words at all. Same beam the workspace composer uses while a run is in flight.',
      render: () => <Beam />,
    },
    {
      title: 'Docked result',
      note: 'The finish, not the running: a pill that lands on the frame and waits, instead of a toast that leaves with the news.',
      render: () => <Docked />,
    },
    {
      title: 'Live ticker',
      note: 'One line of what it is doing right now, swapping every couple of seconds. Watching it think builds more trust than a spinner.',
      render: () => <Ticker />,
    },
    {
      title: 'Run segments',
      note: 'Scan, score, write as three real stages. Turns "still going" into "two thirds done".',
      render: () => <Segments />,
    },
    {
      title: 'Ambient bloom',
      note: 'No text: the glow under the glass breathes while it works and the mark carries the count. Furthest from a loading spinner.',
      render: () => <Ambient />,
    },
  ];

const RunningStates = (): ReactElement => (
  <FlexCol className="gap-10">
    <FlexCol className="gap-1">
      <Typography type={TypographyType.Title3} bold>
        Ten ways to say an agent is running
      </Typography>
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Tertiary}
      >
        All ten sit in the same glass field docked over the feed, so the only
        thing that differs is the treatment. Two won: the status strip, which
        moved under the field and grew into the agent monitor, and the docked
        result, which is what the monitor's panel does when it opens. The rest
        stay here as the record of what was considered.
      </Typography>
    </FlexCol>
    <div className="grid gap-8 laptop:grid-cols-2">
      {variants.map((variant, index) => (
        <Stage
          key={variant.title}
          index={index + 1}
          title={variant.title}
          note={variant.note}
        >
          {variant.render()}
        </Stage>
      ))}
    </div>
  </FlexCol>
);

const meta: Meta = {
  title: 'Features/Interests/AgentRunningStates',
  parameters: { layout: 'fullscreen' },
  render: () => (
    <AgentDemoProviders>
      {/* eslint-disable-next-line react/no-danger */}
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="min-h-screen bg-background-default p-6 text-text-primary">
        <RunningStates />
      </div>
    </AgentDemoProviders>
  ),
};

export default meta;

export const Default: StoryObj = {};
