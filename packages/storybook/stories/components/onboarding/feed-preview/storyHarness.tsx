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

export const STARTING_TAGS = {
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

export type StartingTags = keyof typeof STARTING_TAGS;

export interface PreviewArgs {
  startingTags: StartingTags;
  initialOpen: boolean;
}

// The step union is resolved at runtime by `type`, as in SignupFunnelSteps.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const editTagsStep: any = {
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

export const TagStep = ({
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

export const ProductionStep = (): ReactElement => {
  useSyncHandlerTags();

  return <FunnelEditTags {...editTagsStep} />;
};

export const baseMeta: Omit<Meta<PreviewArgs>, 'title'> = {
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

export const todayStory: StoryObj<PreviewArgs> = {
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

export const variantStory = (
  name: string,
  Variant: ComponentType<VariantProps>,
): StoryObj<PreviewArgs> => ({
  name,
  render: ({ startingTags, initialOpen }) => (
    <TagStep startingTags={startingTags}>
      <Variant initialOpen={initialOpen} onContinue={fn()} />
    </TagStep>
  ),
});
