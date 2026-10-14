import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ComponentType, PropsWithChildren, ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { fn, userEvent, within } from 'storybook/test';
import { FunnelEditTags } from '@dailydotdev/shared/src/features/onboarding/steps/FunnelEditTags';
import { FunnelStepType } from '@dailydotdev/shared/src/features/onboarding/types/funnel';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { getFeedSettingsQueryKey } from '@dailydotdev/shared/src/hooks/useFeedSettings';
import type { FeedSettingsData } from '@dailydotdev/shared/src/graphql/feedSettings';
import { FEED_SETTINGS_HANDLERS, FunnelStepShell } from '../signupFunnel.mocks';
import {
  DEFAULT_PICKED_TAGS,
  REAL_FEED_PREVIEW_HANDLER,
  useSyncHandlerTags,
} from './previewData';
import type { VariantProps } from './TagStepFrame';
import { FeedPreviewOverview } from './FeedPreviewOverview';
import { ShortList } from './variants/ShortList';
import { SplitView } from './variants/SplitView';
import { PeekSheet } from './variants/PeekSheet';
import { ByTag } from './variants/ByTag';
import { RealCards } from './variants/RealCards';
import { AutoStrip } from './variants/AutoStrip';

const STARTING_TAGS = {
  five: DEFAULT_PICKED_TAGS,
  three: ['javascript', 'react', 'devops'],
  ten: [
    'javascript',
    'react',
    'devops',
    'ai',
    'webdev',
    'python',
    'rust',
    'security',
    'cloud',
    'open-source',
  ],
};

type StartingTags = keyof typeof STARTING_TAGS;

interface PreviewArgs {
  startingTags: StartingTags;
  initialOpen: boolean;
}

// The step union is resolved at runtime by `type`, as in SignupFunnelSteps.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const editTagsStep: any = {
  id: 'edit-tags',
  type: FunnelStepType.EditTags,
  isActive: true,
  transitions: [],
  onTransition: fn(),
  onRegisterStepToSkip: fn(),
  parameters: {
    headline: 'Pick tags that are relevant to you',
    minimumRequirement: 5,
  },
};

// The shell seeds five tags whenever the user changes; this swaps in the
// story's starting set after it, on the next tick.
const PickTags = ({
  tags,
  children,
}: PropsWithChildren<{ tags: string[] }>): ReactElement | null => {
  const client = useQueryClient();
  const { user } = useAuthContext();
  const [isSeeded, setIsSeeded] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      client.setQueryData<FeedSettingsData>(
        getFeedSettingsQueryKey(user),
        (data) =>
          data && {
            ...data,
            feedSettings: { ...data.feedSettings, includeTags: tags },
          },
      );
      setIsSeeded(true);
    });

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client, user]);

  return isSeeded ? <>{children}</> : null;
};

const TagStep = ({
  startingTags,
  children,
}: PropsWithChildren<{ startingTags: StartingTags }>): ReactElement => (
  // react-modal looks for the app root the webapp renders.
  <div id="__next">
    <FunnelStepShell fullWidth step={editTagsStep} stepIndex={2}>
      <PickTags tags={STARTING_TAGS[startingTags]}>{children}</PickTags>
    </FunnelStepShell>
  </div>
);

const ProductionStep = (): ReactElement => {
  useSyncHandlerTags();

  return <FunnelEditTags {...editTagsStep} />;
};

const meta: Meta<PreviewArgs> = {
  title: 'Components/Onboarding/Feed preview',
  argTypes: {
    startingTags: {
      control: {
        type: 'inline-radio',
        labels: {
          five: 'Five picked',
          three: 'Three picked (locked)',
          ten: 'Ten picked',
        },
      },
      options: Object.keys(STARTING_TAGS),
    },
    initialOpen: { control: 'boolean' },
  },
  args: { startingTags: 'five', initialOpen: false },
  parameters: {
    layout: 'fullscreen',
    msw: { handlers: [...FEED_SETTINGS_HANDLERS, REAL_FEED_PREVIEW_HANDLER] },
  },
};

export default meta;

type Story = StoryObj<PreviewArgs>;

export const StartHere: Story = {
  name: 'Start here',
  parameters: { controls: { disable: true } },
  render: () => <FeedPreviewOverview />,
};

export const Today: Story = {
  name: 'Today (production)',
  render: ({ startingTags }) => (
    <TagStep startingTags={startingTags}>
      <ProductionStep />
    </TagStep>
  ),
  play: async ({ args, canvasElement }) => {
    if (!args.initialOpen) {
      return;
    }

    const button = await within(canvasElement).findByText(
      'Show feed preview',
      {},
      { timeout: 10000 },
    );
    await userEvent.click(button);
    button.scrollIntoView({ block: 'start' });
  },
};

const variantStory = (
  name: string,
  Variant: ComponentType<VariantProps>,
): Story => ({
  name,
  render: ({ startingTags, initialOpen }) => (
    <TagStep startingTags={startingTags}>
      <Variant initialOpen={initialOpen} onContinue={fn()} />
    </TagStep>
  ),
});

export const A: Story = variantStory('A · Short list', ShortList);
export const B: Story = variantStory('B · Split view', SplitView);
export const C: Story = variantStory('C · Peek sheet', PeekSheet);
export const D: Story = variantStory('D · By tag', ByTag);
export const E: Story = variantStory('E · Real cards, contained', RealCards);
export const F: Story = variantStory('F · Auto strip', AutoStrip);

const FRAMES = [
  { id: 'today', label: 'Today' },
  { id: 'a', label: 'A · Short list' },
  { id: 'c', label: 'C · Peek sheet' },
  { id: 'd', label: 'D · By tag' },
  { id: 'e', label: 'E · Real cards' },
  { id: 'f', label: 'F · Auto strip' },
];

const PHONE = { width: 390, height: 844 };
// Frames boot one at a time: several cold iframes at once make Vite re-run
// dependency optimization and every frame fails to load.
const FRAME_STAGGER_MS = 600;

const PhoneFrames = (): ReactElement => {
  const [mounted, setMounted] = useState(1);
  const theme = document.documentElement.classList.contains('light')
    ? 'light'
    : 'dark';

  useEffect(() => {
    if (mounted >= FRAMES.length) {
      return undefined;
    }

    const timeout = setTimeout(
      () => setMounted((count) => count + 1),
      FRAME_STAGGER_MS,
    );

    return () => clearTimeout(timeout);
  }, [mounted]);

  return (
    <div className="flex min-h-dvh flex-col gap-4 bg-background-default p-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-bold typo-title2">Every variant on a phone</h1>
        <p className="text-text-tertiary typo-callout">
          390px, five tags picked, preview open. B is a laptop layout and shows
          A on phones, so it is left out here. Each frame scrolls.
        </p>
      </div>
      <div className="flex gap-6 overflow-x-auto pb-4">
        {FRAMES.map(({ id, label }, index) => (
          <figure key={id} className="flex shrink-0 flex-col gap-2">
            <figcaption className="text-text-secondary typo-footnote">
              {label}
            </figcaption>
            <div
              className="overflow-hidden rounded-16 border border-border-subtlest-tertiary"
              style={PHONE}
            >
              {index < mounted && (
                <iframe
                  src={`/iframe.html?id=components-onboarding-feed-preview--${id}&viewMode=story&globals=theme:${theme}&args=initialOpen:!true`}
                  style={{ ...PHONE, border: 0 }}
                  title={label}
                />
              )}
            </div>
          </figure>
        ))}
      </div>
    </div>
  );
};

export const OnAPhone: Story = {
  name: 'Every variant on a phone',
  parameters: { controls: { disable: true } },
  render: () => <PhoneFrames />,
};
