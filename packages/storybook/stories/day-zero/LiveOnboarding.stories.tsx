import type { PropsWithChildren, ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { useQueryClient } from '@tanstack/react-query';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { usePushNotificationContext } from '@dailydotdev/shared/src/contexts/PushNotificationContext';
import useFeedSettings, {
  getFeedSettingsQueryKey,
} from '@dailydotdev/shared/src/hooks/useFeedSettings';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import {
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/common';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { BellIcon } from '@dailydotdev/shared/src/components/icons/Bell';
import { VIcon } from '@dailydotdev/shared/src/components/icons/V';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  OnboardingHeadline,
  OnboardingSubheadline,
} from '@dailydotdev/shared/src/components/onboarding/common';
import { Portal } from '@dailydotdev/shared/src/components/tooltips/Portal';
import { GetAppQrCode } from '@dailydotdev/shared/src/features/getApp/components/GetAppQrCode';
import { FunnelEditTags } from '@dailydotdev/shared/src/features/onboarding/steps/FunnelEditTags';
import {
  FunnelStepCtaWrapper,
  funnelStepRail,
} from '@dailydotdev/shared/src/features/onboarding/shared/FunnelStepCtaWrapper';
import { FunnelProgressContext } from '@dailydotdev/shared/src/features/onboarding/shared/FunnelStepDots';
import { FunnelTargetId } from '@dailydotdev/shared/src/features/onboarding/types/funnelEvents';
import { FunnelStepType } from '@dailydotdev/shared/src/features/onboarding/types/funnel';
import { NotificationPromptSource } from '@dailydotdev/shared/src/lib/log';
import {
  appStoreUrl,
  playStoreUrl,
} from '@dailydotdev/shared/src/lib/constants';
import {
  FEED_PREVIEW_HANDLER,
  FEED_SETTINGS_HANDLERS,
  FunnelStepShell,
} from '../components/onboarding/signupFunnel.mocks';
import { LiveFrame } from './LiveFrame';

// The onboarding steps whose screen changes, each mounted on the real funnel
// step or built from the funnel's own step wrapper, and shown on the overview
// at the device width it ships on so its responsive logic runs as in
// production.

const MINIMUM_TAGS = 5;

const baseStep = { isActive: true, transitions: [], onTransition: fn() };

const meta: Meta = {
  title: 'Day Zero Retention/Live onboarding',
  parameters: {
    layout: 'fullscreen',
    msw: { handlers: [...FEED_SETTINGS_HANDLERS, FEED_PREVIEW_HANDLER] },
  },
};

export default meta;

type Story = StoryObj;

// The shell lights the dots for the full production funnel; this pins them to
// the step's position in the proposed flow.
const LiveStep = ({
  step,
  index,
  total,
  children,
}: PropsWithChildren<{
  step: Record<string, unknown>;
  index: number;
  total: number;
}>): ReactElement => (
  <FunnelStepShell step={step} stepIndex={index} fullWidth>
    <FunnelProgressContext.Provider
      value={{
        chapters: [{ steps: total }],
        position: { chapter: 0, step: index },
        isOnboarding: true,
      }}
    >
      {children}
    </FunnelProgressContext.Provider>
  </FunnelStepShell>
);

// The harness seeds five tags, and seeds them again whenever the booted user
// changes. A new user starts with none, so the seeded set is cleared each time
// it comes back, until the user picks something.
const HARNESS_TAGS = ['javascript', 'react', 'devops', 'ai', 'webdev'];

type FeedSettingsCache = {
  feedSettings?: { includeTags?: string[] } & Record<string, unknown>;
};

const isHarnessSeed = (tags: string[] = []): boolean =>
  tags.length === HARNESS_TAGS.length &&
  HARNESS_TAGS.every((tag) => tags.includes(tag));

const StartWithNoTags = ({
  children,
}: PropsWithChildren): ReactElement | null => {
  const client = useQueryClient();
  const { user } = useAuthContext();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const queryKey = getFeedSettingsQueryKey(user);
    let hasPicked = false;
    const clearSeed = () => {
      const data = client.getQueryData<FeedSettingsCache>(queryKey);
      const tags = data?.feedSettings?.includeTags ?? [];

      if (tags.length && !isHarnessSeed(tags)) {
        hasPicked = true;
      }

      if (data && !hasPicked && isHarnessSeed(tags)) {
        client.setQueryData(queryKey, {
          ...data,
          feedSettings: { ...data.feedSettings, includeTags: [] },
        });
      }
    };

    clearSeed();
    setIsReady(true);
    return client.getQueryCache().subscribe(clearSeed);
  }, [client, user]);

  return isReady ? <>{children}</> : null;
};

// FunnelStepCtaWrapper's `docked` slot sits in the sticky rail just above the
// glass bar. The tag step does not pass one, so this mounts a node in that
// exact position of the rendered step.
const useDockedSlot = (): HTMLElement | null => {
  const [slot, setSlot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    let node: HTMLElement | null = null;
    const attach = (): boolean => {
      const ctas = document.querySelectorAll<HTMLElement>(
        `[data-funnel-track="${FunnelTargetId.StepCta}"]`,
      );
      const bar = [...ctas]
        .map((cta) => cta.closest<HTMLElement>('.rounded-18'))
        .find(Boolean);

      if (!bar?.parentElement) {
        return false;
      }

      node = document.createElement('div');
      node.className = 'pointer-events-auto';
      bar.parentElement.insertBefore(node, bar);
      setSlot(node);
      return true;
    };

    if (attach()) {
      return () => node?.remove();
    }

    const observer = new MutationObserver(() => {
      if (attach()) {
        observer.disconnect();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      node?.remove();
    };
  }, []);

  return slot;
};

// The compact push ask from EnableNotificationsCta (deleted in #5893), wired
// to the push context so Enable runs the subscribe flow.
const TagsPushAsk = (): ReactElement | null => {
  const slot = useDockedSlot();
  const { feedSettings } = useFeedSettings();
  const { subscribe, isSubscribed } = usePushNotificationContext();
  const [isEnabled, setIsEnabled] = useState(false);
  const tagsCount = feedSettings?.includeTags?.length ?? 0;

  if (!slot || tagsCount < MINIMUM_TAGS || isSubscribed) {
    return null;
  }

  return (
    <Portal container={slot}>
      <div className="flex w-full items-center gap-2 rounded-8 bg-surface-float px-3 py-2">
        {isEnabled ? (
          <>
            <VIcon
              size={IconSize.Small}
              className="text-accent-avocado-default"
            />
            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Tertiary}
              className="flex-1"
            >
              You will hear when your tags have a big story
            </Typography>
          </>
        ) : (
          <>
            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Tertiary}
              className="flex-1"
            >
              Get notified when your tags have a big story
            </Typography>
            <Button
              type="button"
              size={ButtonSize.Small}
              variant={ButtonVariant.Secondary}
              icon={
                <BellIcon className="origin-top motion-safe:[animation:enable-notification-bell-ring_1.1s_ease-in-out_infinite]" />
              }
              onClick={async () =>
                setIsEnabled(
                  await subscribe(NotificationPromptSource.SourceSubscribe),
                )
              }
            >
              Enable
            </Button>
          </>
        )}
      </div>
    </Portal>
  );
};

const ComposedStep = ({
  headline,
  subheadline,
  cta,
  skip,
  onCta,
  children,
}: PropsWithChildren<{
  headline: string;
  subheadline: string;
  cta: string;
  skip: string;
  onCta?: () => Promise<unknown> | unknown;
}>): ReactElement => (
  <FunnelStepCtaWrapper
    isGlass
    cta={{ label: cta }}
    skip={{ cta: skip }}
    onClick={() => onCta?.()}
    containerClassName="flex w-full flex-1 flex-col items-center overflow-hidden"
  >
    <div
      className={classNames(
        funnelStepRail,
        'flex flex-col items-center gap-6 py-6 pt-3',
      )}
    >
      <div className="flex w-full flex-col gap-3">
        <OnboardingHeadline>{headline}</OnboardingHeadline>
        <OnboardingSubheadline>{subheadline}</OnboardingSubheadline>
      </div>
      {children}
    </div>
  </FunnelStepCtaWrapper>
);

// The stores' official badges: Apple's from developer.apple.com, Google's
// vector artwork from Wikimedia Commons, since Google only ships a padded PNG.
const storeBadges = [
  {
    id: 'ios',
    href: appStoreUrl,
    src: '/store-badges/app-store.svg',
    alt: 'Download on the App Store',
  },
  {
    id: 'android',
    href: playStoreUrl,
    src: '/store-badges/google-play.svg',
    alt: 'Get it on Google Play',
  },
];

const StoreButtons = (): ReactElement => (
  <div className="flex flex-col items-center gap-3">
    {storeBadges.map((badge) => (
      <a
        key={badge.id}
        href={badge.href}
        target="_blank"
        rel="noopener noreferrer"
      >
        <img src={badge.src} alt={badge.alt} className="h-auto w-40" />
      </a>
    ))}
  </div>
);

const CompanyInterestStep = (): ReactElement => {
  const { subscribe } = usePushNotificationContext();

  return (
    <ComposedStep
      headline="Your CV is in"
      subheadline="Want to know the moment a company is interested?"
      cta="Notify me"
      skip="Not now"
      onCta={() => subscribe(NotificationPromptSource.NotificationsPage)}
    >
      <img
        src="/images/day-zero-mailbox.webp"
        alt="A mailbox with its flag raised"
        className="mt-2 w-80"
      />
    </ComposedStep>
  );
};

// The step components each take their own slice of the FunnelStep union, so the
// fixtures are plain objects that every component reads what it needs from.
const stepFor = (
  id: string,
  type: FunnelStepType,
  parameters: Record<string, unknown> = {},
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- story fixtures
): any => ({
  ...baseStep,
  id,
  type,
  parameters,
});

const changedSteps = [
  {
    id: 'step-pick-tags',
    title: 'Pick tags',
    change: 'Changed',
    note: 'Pick 5 tags and a notifications ask docks above Continue.',
    width: 1280,
    height: 800,
  },
  {
    id: 'step-phone-door',
    title: 'Phone door',
    change: 'New',
    note: 'Desktop Firefox and Safari get the app here instead of skipping the extension step.',
    width: 1280,
    height: 800,
  },
  {
    id: 'step-open-in-the-app',
    title: 'Open in the app',
    change: 'New',
    note: 'Phones end onboarding on the app, replacing "Add to Home Screen".',
    width: 390,
    height: 844,
  },
  {
    id: 'step-company-interest',
    title: 'Company interest',
    change: 'New',
    note: 'Right after a CV upload, now the last step. Skipping the CV skips it.',
    width: 1280,
    height: 800,
  },
];

const changeTone: Record<string, string> = {
  Changed: 'bg-overlay-float-cheese text-accent-cheese-default',
  New: 'bg-overlay-float-avocado text-accent-avocado-default',
};

const ChangedSteps = (): ReactElement => (
  <div className="flex min-h-dvh flex-col items-center gap-10 bg-background-default px-6 py-8 text-text-primary">
    <header className="flex w-full max-w-[60rem] flex-col gap-2">
      <span className="text-text-tertiary typo-callout">
        Day zero retention
      </span>
      <h1 className="font-bold typo-title1">Onboarding: what changes</h1>
      <p className="text-text-secondary typo-callout">
        Only the steps whose screen changes, live on the real funnel steps. The
        CV step also moves last, after the extension or reminder, but its screen
        stays as it is.
      </p>
    </header>
    {changedSteps.map((step) => (
      <section
        key={step.id}
        className="flex w-full max-w-[60rem] flex-col items-center gap-3"
      >
        <div className="flex w-full items-center gap-2">
          <h2 className="font-bold typo-title3">{step.title}</h2>
          <span
            className={classNames(
              'rounded-6 px-1.5 font-bold typo-caption1',
              changeTone[step.change],
            )}
          >
            {step.change}
          </span>
        </div>
        <p className="w-full text-text-secondary typo-callout">{step.note}</p>
        <LiveFrame
          story={`live-onboarding--${step.id}`}
          width={step.width}
          height={step.height}
          maxScale={step.width > 1000 ? 0.75 : 0.85}
        />
      </section>
    ))}
  </div>
);

export const LiveOnboarding: Story = {
  name: 'Onboarding: what changes',
  render: () => <ChangedSteps />,
};

// `picked` opens the step with five tags already chosen, so a static capture
// shows the push ask.
export const StepPickTags: StoryObj<{ picked: boolean }> = {
  name: 'Step · Pick tags',
  args: { picked: false },
  render: ({ picked }) => {
    const step = stepFor('edit-tags', FunnelStepType.EditTags, {
      headline: 'Pick tags that are relevant to you',
      minimumRequirement: MINIMUM_TAGS,
    });

    return (
      <LiveStep step={step} index={0} total={6}>
        {picked ? (
          <>
            <FunnelEditTags {...step} />
            <TagsPushAsk />
          </>
        ) : (
          <StartWithNoTags>
            <FunnelEditTags {...step} />
            <TagsPushAsk />
          </StartWithNoTags>
        )}
      </LiveStep>
    );
  },
};

export const StepPhoneDoor: Story = {
  name: 'Step · Phone door',
  render: () => (
    <LiveStep
      step={stepFor('phone-door', FunnelStepType.ProfileForm)}
      index={3}
      total={6}
    >
      <ComposedStep
        headline="Where should your feed find you?"
        subheadline="Scan to open your feed on your phone. Your feed, bookmarks and streak come with you."
        cta="Continue"
        skip="I will just use the website"
      >
        <GetAppQrCode className="size-40" />
        <StoreButtons />
      </ComposedStep>
    </LiveStep>
  ),
};

export const StepOpenInTheApp: Story = {
  name: 'Step · Open in the app',
  render: () => (
    <LiveStep
      step={stepFor('open-in-the-app', FunnelStepType.ProfileForm)}
      index={4}
      total={7}
    >
      <ComposedStep
        headline="Your feed is ready"
        subheadline="Keep it on your home screen. The app opens on the feed you just built."
        cta="Open in the app"
        skip="Continue on the web"
      >
        <StoreButtons />
      </ComposedStep>
    </LiveStep>
  ),
};

export const StepCompanyInterest: Story = {
  name: 'Step · Company interest',
  render: () => (
    <LiveStep
      step={stepFor('company-interest', FunnelStepType.ProfileForm)}
      index={5}
      total={6}
    >
      <CompanyInterestStep />
    </LiveStep>
  ),
};
