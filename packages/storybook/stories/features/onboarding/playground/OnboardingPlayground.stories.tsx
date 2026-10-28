import type { PropsWithChildren, ReactElement } from 'react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Provider as JotaiProvider } from 'jotai';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import useFeedSettings from '@dailydotdev/shared/src/hooks/useFeedSettings';
import {
  generateQueryKey,
  RequestKey,
} from '@dailydotdev/shared/src/lib/query';
import { http, HttpResponse } from 'msw';
import { FunnelStepper } from '@dailydotdev/shared/src/features/onboarding/shared/FunnelStepper';
import type { FunnelStepReadingReminder } from '@dailydotdev/shared/src/features/onboarding/types/funnel';
import {
  FunnelStepTransitionType,
  FunnelStepType,
} from '@dailydotdev/shared/src/features/onboarding/types/funnel';
import type { FunnelSession } from '@dailydotdev/shared/src/features/onboarding/types/funnelBoot';
import { PushNotificationsContext } from '@dailydotdev/shared/src/contexts/PushNotificationContext';
import {
  Button,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { OnboardingChromeVariant } from '@dailydotdev/shared/src/lib/featureManagement';
import ExtensionProviders from '../../../extension/_providers';
import {
  ChromeArm,
  FEED_PREVIEW_HANDLER,
  FEED_SETTINGS_HANDLERS,
  PROFILE_HANDLERS,
  SeedFeedSettings,
  ThemeModeSync,
  bootAsUser,
  fakeIOSUserAgent,
  pushNotificationsMock,
} from '../signupFunnel.mocks';
import { Flow as ReadingCommitment } from '../reading-commitment/Flow';
import type { Platform } from '../reading-commitment/NotificationPreview';
import { ONBOARDING_FUNNEL } from './onboardingFunnel';

/**
 * The whole signup onboarding, as production runs it: the real FunnelStepper
 * on the live funnel (organic-v12), every step its production component,
 * except the reading-reminder step, which is the new reading commitment.
 *
 * It starts as a user who has just signed up, so the sign-up wall completes
 * itself, as it does in production (its screens live in Onboarding Fixes).
 * Platform steps skip themselves as they do for real: install the app only
 * on iOS phones, the browser extension only on desktop Chrome.
 */

interface PlaygroundArgs {
  /** Fakes an iPhone, so the install-the-app step shows. */
  isIOS: boolean;
}

const SESSION: FunnelSession = {
  id: 'playground',
  userId: 'playground',
  currentStep: ONBOARDING_FUNNEL.chapters[0].steps[0].id,
  steps: {},
};

const ReadingCommitmentStep = ({
  onTransition,
  platform,
}: FunnelStepReadingReminder & { platform: Platform }): ReactElement => {
  // The tags picked two steps back, so the push preview shows a post on them.
  const { feedSettings } = useFeedSettings();

  return (
    <ReadingCommitment
      platform={platform}
      tags={feedSettings?.includeTags}
      onFinish={() => onTransition({ type: FunnelStepTransitionType.Complete })}
    />
  );
};

/**
 * A new user has done nothing yet. Storybook never fetches the actions, and
 * the platform steps wait for them before deciding to skip.
 */
const SeedActions = ({ children }: PropsWithChildren): ReactElement | null => {
  const client = useQueryClient();
  const { user } = useAuthContext();
  const [isSeeded, setIsSeeded] = useState(false);

  useEffect(() => {
    client.setQueryData(generateQueryKey(RequestKey.Actions, user), {
      actions: [],
      serverLoaded: true,
    });
    setIsSeeded(true);
  }, [client, user]);

  return isSeeded ? <>{children}</> : null;
};

/** Where the app takes over once onboarding completes. */
const Finished = ({ onRestart }: { onRestart: () => void }): ReactElement => (
  <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background-default p-6 text-center">
    <h1 className="font-bold text-text-primary typo-title1">
      Onboarding complete
    </h1>
    <p className="max-w-80 text-text-secondary typo-callout">
      This is where daily.dev opens the feed.
    </p>
    <Button variant={ButtonVariant.Primary} onClick={onRestart}>
      Start over
    </Button>
  </div>
);

const Playground = ({ isIOS }: PlaygroundArgs): ReactElement => {
  const [run, setRun] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const platform: Platform = isIOS ? 'ios' : 'android';
  // Stable, so the stepper doesn't remount the step on every render.
  const overrides = useMemo(
    () => ({
      [FunnelStepType.ReadingReminder]: (props: FunnelStepReadingReminder) => (
        <ReadingCommitmentStep {...props} platform={platform} />
      ),
    }),
    [platform],
  );

  if (isFinished) {
    return (
      <Finished
        onRestart={() => {
          setIsFinished(false);
          setRun((current) => current + 1);
        }}
      />
    );
  }

  return (
    <ExtensionProviders>
      <ChromeArm variant={OnboardingChromeVariant.Control}>
        <ThemeModeSync>
          <PushNotificationsContext.Provider
            value={pushNotificationsMock as never}
          >
            <SeedFeedSettings>
              <SeedActions>
                {/* A fresh store per run, so the funnel starts from step one. */}
                <JotaiProvider key={run}>
                  <div className="flex min-h-dvh min-w-full flex-col">
                    <FunnelStepper
                      funnel={ONBOARDING_FUNNEL}
                      session={SESSION}
                      isOnboarding
                      onComplete={() => setIsFinished(true)}
                      stepComponentOverrides={overrides}
                    />
                  </div>
                </JotaiProvider>
              </SeedActions>
            </SeedFeedSettings>
          </PushNotificationsContext.Provider>
        </ThemeModeSync>
      </ChromeArm>
    </ExtensionProviders>
  );
};

const meta: Meta<PlaygroundArgs> = {
  title: 'Commitment onboarding/Playground',
  component: Playground,
  parameters: {
    layout: 'fullscreen',
    msw: {
      handlers: [
        ...PROFILE_HANDLERS,
        ...FEED_SETTINGS_HANDLERS,
        FEED_PREVIEW_HANDLER,
        // Step transitions are tracked server-side; the funnel moves on
        // either way.
        http.post('*/freyja/sessions/*/transition', () =>
          HttpResponse.json({}),
        ),
      ],
    },
  },
  args: { isIOS: false },
  argTypes: {
    isIOS: {
      control: 'boolean',
      description: 'Fakes an iPhone, so the install-the-app step shows.',
    },
  },
  // A user who just signed up: no role or acquisition answer yet, so those
  // steps show.
  beforeEach: ({ args }) => {
    bootAsUser({
      name: 'Tomer',
      username: 'tomer',
      infoConfirmed: true,
      title: undefined,
      acquisitionChannel: undefined,
    });
    if (args.isIOS) {
      fakeIOSUserAgent();
    }
  },
};

export default meta;

type Story = StoryObj<PlaygroundArgs>;

/** Runs at the canvas' own size; use the toolbar's viewports to resize. */
export const Live: Story = {};

const PLAYGROUND_ID = 'commitment-onboarding-playground--live';

const DEVICES = {
  mobile: { width: 390, height: 844, bezel: 10, radius: '3rem' },
  desktop: { width: 1440, height: 900, bezel: 0, radius: '1rem' },
};

/**
 * Loads the live playground in an iframe the device's size, so every
 * breakpoint and platform check sees that device. Scaled to fit.
 */
const DeviceFrame = ({
  device,
  args,
}: {
  device: keyof typeof DEVICES;
  args: string;
}): ReactElement => {
  const { width, height, bezel, radius } = DEVICES[device];
  const host = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [run, setRun] = useState(0);
  const outerWidth = width + bezel * 2;
  const outerHeight = height + bezel * 2;

  useEffect(() => {
    const element = host.current;
    if (!element) {
      return undefined;
    }
    const observer = new ResizeObserver(([entry]) =>
      setScale(
        Math.min(
          1,
          entry.contentRect.width / outerWidth,
          (window.innerHeight - 96) / outerHeight,
        ),
      ),
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [outerWidth, outerHeight]);

  return (
    <div className="flex min-h-dvh flex-col items-center gap-3 bg-background-subtle p-6">
      <div className="flex w-full max-w-[90rem] items-center justify-between">
        <span className="font-bold text-text-primary typo-callout">
          {device === 'mobile' ? 'iPhone, 390 × 844' : 'Desktop, 1440 × 900'}
        </span>
        <Button
          variant={ButtonVariant.Secondary}
          onClick={() => setRun((current) => current + 1)}
        >
          Restart
        </Button>
      </div>
      <div ref={host} className="w-full">
        <div
          className="mx-auto"
          style={{ width: outerWidth * scale, height: outerHeight * scale }}
        >
          <div
            className="overflow-hidden border-2 border-border-subtlest-tertiary bg-background-default shadow-3"
            style={{
              width: outerWidth,
              height: outerHeight,
              padding: bezel,
              borderRadius: radius,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
            }}
          >
            <iframe
              key={run}
              title={device}
              src={`iframe.html?id=${PLAYGROUND_ID}&viewMode=story&args=${args}`}
              width={width}
              height={height}
              className="block border-0"
              style={{ borderRadius: bezel ? '2.25rem' : 0 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export const Mobile: Story = {
  name: 'Mobile (iPhone)',
  parameters: { controls: { disable: true } },
  render: () => <DeviceFrame device="mobile" args="isIOS:!true" />,
};

export const Desktop: Story = {
  parameters: { controls: { disable: true } },
  render: () => <DeviceFrame device="desktop" args="isIOS:!false" />,
};
