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
import { AppleIcon } from '@dailydotdev/shared/src/components/icons/Apple';
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
import { MailboxIllustration } from './MailboxIllustration';

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

const GooglePlayMark = (): ReactElement => (
  <svg viewBox="0 0 28 30" className="h-6 w-6" aria-hidden>
    <path
      d="M1.3.9 15.6 15 1.3 29.1C.9 28.7.7 28.1.7 27.4V2.6c0-.7.2-1.3.6-1.7Z"
      fill="#4285F4"
    />
    <path
      d="M20.4 19.8 15.6 15 1.3 29.1c.6.6 1.5.7 2.6.1l16.5-9.4Z"
      fill="#EA4335"
    />
    <path
      d="M20.4 10.2 3.9.8C2.8.2 1.9.3 1.3.9L15.6 15l4.8-4.8Z"
      fill="#34A853"
    />
    <path
      d="m20.4 10.2-4.8 4.8 4.8 4.8 4.9-2.8c1.7-1 1.7-3 0-4l-4.9-2.8Z"
      fill="#FBBC04"
    />
  </svg>
);

const storeBadges = [
  {
    id: 'ios',
    href: appStoreUrl,
    caption: 'Download on the',
    store: 'App Store',
    mark: <AppleIcon size={IconSize.Medium} className="text-white" />,
  },
  {
    id: 'android',
    href: playStoreUrl,
    caption: 'GET IT ON',
    store: 'Google Play',
    mark: <GooglePlayMark />,
  },
];

// The stores' own badges: black, a grey hairline, the store mark and its
// two-line wordmark.
const StoreButtons = (): ReactElement => (
  <div className="flex w-52 flex-col gap-3">
    {storeBadges.map((badge) => (
      <a
        key={badge.id}
        href={badge.href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-14 items-center gap-3 rounded-10 border bg-black px-4 text-white no-underline"
        style={{ borderColor: '#A6A6A6' }}
      >
        <span className="flex w-7 justify-center">{badge.mark}</span>
        <span className="flex flex-col items-start gap-0.5 leading-none">
          <span className="text-[0.625rem]">{badge.caption}</span>
          <span className="text-[1.25rem] font-bold tracking-tight">
            {badge.store}
          </span>
        </span>
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
      <MailboxIllustration className="mt-2 w-72" />
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

const useThemeClass = (): 'dark' | 'light' => {
  const read = () =>
    document.documentElement.classList.contains('light') ? 'light' : 'dark';
  const [theme, setTheme] = useState<'dark' | 'light'>(read);

  useEffect(() => {
    const observer = new MutationObserver(() => setTheme(read()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, []);

  return theme;
};

const ChangedSteps = (): ReactElement => {
  const theme = useThemeClass();

  return (
    <div className="flex min-h-dvh flex-col items-center gap-10 bg-background-default px-6 py-8 text-text-primary">
      <header className="flex w-full max-w-[60rem] flex-col gap-2">
        <span className="text-text-tertiary typo-callout">
          Day zero retention
        </span>
        <h1 className="font-bold typo-title1">Onboarding: what changes</h1>
        <p className="text-text-secondary typo-callout">
          Only the steps whose screen changes, live on the real funnel steps.
          The CV step also moves last, after the extension or reminder, but its
          screen stays as it is.
        </p>
      </header>
      {changedSteps.map((step) => {
        const scale = step.width > 1000 ? 0.75 : 0.85;

        return (
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
            <p className="w-full text-text-secondary typo-callout">
              {step.note}
            </p>
            <div
              className="relative shrink-0 overflow-hidden rounded-16 border border-border-subtlest-tertiary"
              style={{
                width: step.width * scale,
                height: step.height * scale,
              }}
            >
              <iframe
                title={step.title}
                src={`/iframe.html?id=day-zero-retention-live-onboarding--${step.id}&viewMode=story&globals=theme:${theme}`}
                style={{
                  width: step.width,
                  height: step.height,
                  border: 0,
                  transform: `scale(${scale})`,
                  transformOrigin: 'top left',
                }}
              />
            </div>
          </section>
        );
      })}
    </div>
  );
};

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
