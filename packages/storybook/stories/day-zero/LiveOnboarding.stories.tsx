import type { PropsWithChildren, ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { useQueryClient } from '@tanstack/react-query';
import { graphql, http, HttpResponse } from 'msw';
import type { Meta, StoryObj } from '@storybook/react-vite';
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
import { GooglePlayIcon } from '@dailydotdev/shared/src/components/icons/GooglePlay';
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
import { GetAppQrCode } from '@dailydotdev/shared/src/features/getApp/components/GetAppQrCode';
import { FunnelEditTags } from '@dailydotdev/shared/src/features/onboarding/steps/FunnelEditTags';
import { FunnelContentTypes } from '@dailydotdev/shared/src/features/onboarding/steps/FunnelContentTypes';
import { FunnelPlusCards } from '@dailydotdev/shared/src/features/onboarding/steps/FunnelPlusCards';
import { FunnelBrowserExtension } from '@dailydotdev/shared/src/features/onboarding/steps/FunnelBrowserExtension';
import { FunnelReadingReminder } from '@dailydotdev/shared/src/features/onboarding/steps/FunnelReadingReminder';
import { FunnelUploadCv } from '@dailydotdev/shared/src/features/onboarding/steps/FunnelUploadCv';
import {
  FunnelStepCtaWrapper,
  funnelStepRail,
} from '@dailydotdev/shared/src/features/onboarding/shared/FunnelStepCtaWrapper';
import { FunnelProgressContext } from '@dailydotdev/shared/src/features/onboarding/shared/FunnelStepDots';
import { FunnelTargetId } from '@dailydotdev/shared/src/features/onboarding/types/funnelEvents';
import {
  FunnelStepTransitionType,
  FunnelStepType,
} from '@dailydotdev/shared/src/features/onboarding/types/funnel';
import { FunnelPaymentPricingContext } from '@dailydotdev/shared/src/contexts/payment/context';
import { exportLinkedIn } from '@dailydotdev/shared/src/lib/image';
import { NotificationPromptSource } from '@dailydotdev/shared/src/lib/log';
import { Portal } from '@dailydotdev/shared/src/components/tooltips/Portal';
import {
  FEED_PREVIEW_HANDLER,
  FEED_SETTINGS_HANDLERS,
  FunnelStepShell,
  MockPlusPaymentProvider,
} from '../components/onboarding/signupFunnel.mocks';
import { mockPricing } from '../components/onboarding/FunnelPricing.stories';

// The day 0 onboarding options running inside the real funnel steps. Each step
// story mounts the production step component; the walkthrough plays them in
// the proposed order inside a frame of the real device width, so every step's
// own responsive logic runs as it does in production.

type Device = 'desktop' | 'desktopNoExtension' | 'phone';

const MESSAGE_SOURCE = 'day-zero-live-onboarding';
const MINIMUM_TAGS = 5;

const reportTransition = (type: FunnelStepTransitionType): void => {
  window.parent?.postMessage({ source: MESSAGE_SOURCE, type }, '*');
};

const baseStep = {
  isActive: true,
  transitions: [],
  onTransition: ({ type }: { type: FunnelStepTransitionType }) =>
    reportTransition(type),
};

// The CV upload is a multipart GraphQL request, which the operation-name
// matcher cannot read, so any multipart POST resolves as a successful upload.
const UPLOAD_HANDLERS = [
  graphql.mutation('UploadResume', () =>
    HttpResponse.json({ data: { uploadResume: { _: true } } }),
  ),
  http.post(/graphql/, ({ request }) => {
    if (!request.headers.get('content-type')?.includes('multipart')) {
      return undefined;
    }

    return HttpResponse.json({ data: { uploadResume: { _: true } } });
  }),
];

const meta: Meta = {
  title: 'Day Zero Retention/Live onboarding',
  args: { device: 'desktop' },
  argTypes: {
    device: {
      control: { type: 'inline-radio' },
      options: ['desktop', 'desktopNoExtension', 'phone'],
    },
  },
  parameters: {
    layout: 'fullscreen',
    msw: {
      handlers: [
        ...FEED_SETTINGS_HANDLERS,
        FEED_PREVIEW_HANDLER,
        ...UPLOAD_HANDLERS,
      ],
    },
  },
};

export default meta;

type Story = StoryObj<{ device: Device }>;

interface FlowStep {
  id: string;
  label: string;
  change: 'Unchanged' | 'Changed' | 'Moved' | 'New';
  note: string;
}

const steps: Record<string, FlowStep> = {
  tags: {
    id: 'step-pick-tags',
    label: 'Pick tags',
    change: 'Changed',
    note: 'Pick 5 tags and a notifications ask docks above Continue.',
  },
  contentTypes: {
    id: 'step-content-types',
    label: 'Content types',
    change: 'Unchanged',
    note: 'Production step as it ships.',
  },
  plus: {
    id: 'step-plus',
    label: 'Plus',
    change: 'Unchanged',
    note: 'Production step as it ships.',
  },
  extension: {
    id: 'step-browser-extension',
    label: 'Browser extension',
    change: 'Unchanged',
    note: 'Production step as it ships. Now before the CV.',
  },
  phoneDoor: {
    id: 'step-phone-door',
    label: 'Phone door',
    change: 'New',
    note: 'Firefox and Safari get the app here instead of skipping the step.',
  },
  readingReminder: {
    id: 'step-reading-reminder',
    label: 'Reading reminder',
    change: 'Unchanged',
    note: 'Production step as it ships. Now before the CV.',
  },
  openInApp: {
    id: 'step-open-in-the-app',
    label: 'Open in the app',
    change: 'New',
    note: 'Replaces "Add to Home Screen" as the phone handoff.',
  },
  uploadCv: {
    id: 'step-upload-cv',
    label: 'Upload CV',
    change: 'Moved',
    note: 'Was step 3. Upload a file to see the next step, or skip it.',
  },
  cvInterest: {
    id: 'step-company-interest',
    label: 'Company interest',
    change: 'New',
    note: 'Only after a CV upload. Skipping the CV skips this too.',
  },
};

const flows: Record<Device, FlowStep[]> = {
  desktop: [
    steps.tags,
    steps.contentTypes,
    steps.plus,
    steps.extension,
    steps.uploadCv,
    steps.cvInterest,
  ],
  desktopNoExtension: [
    steps.tags,
    steps.contentTypes,
    steps.plus,
    steps.phoneDoor,
    steps.uploadCv,
    steps.cvInterest,
  ],
  phone: [
    steps.tags,
    steps.contentTypes,
    steps.plus,
    steps.readingReminder,
    steps.openInApp,
    steps.uploadCv,
    steps.cvInterest,
  ],
};

const devices: { id: Device; label: string; width: number; height: number }[] =
  [
    { id: 'desktop', label: 'Desktop Chrome', width: 1280, height: 800 },
    {
      id: 'desktopNoExtension',
      label: 'Desktop Firefox or Safari',
      width: 1280,
      height: 800,
    },
    { id: 'phone', label: 'Phone', width: 390, height: 844 },
  ];

// The shell lights the dots for the full production funnel; this pins them to
// the proposed flow so the progress reads as it would.
const Progress = ({
  index,
  total,
  children,
}: PropsWithChildren<{ index: number; total: number }>): ReactElement => (
  <FunnelProgressContext.Provider
    value={{
      chapters: [{ steps: total }],
      position: { chapter: 0, step: index },
      isOnboarding: true,
    }}
  >
    {children}
  </FunnelProgressContext.Provider>
);

const LiveStep = ({
  step,
  flowStep,
  device,
  children,
}: PropsWithChildren<{
  step: Record<string, unknown>;
  flowStep: FlowStep;
  device: Device;
}>): ReactElement => {
  const index = Math.max(0, flows[device].indexOf(flowStep));

  return (
    <FunnelStepShell step={step} stepIndex={index} fullWidth>
      <Progress index={index} total={flows[device].length}>
        {children}
      </Progress>
    </FunnelStepShell>
  );
};

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
              variant={ButtonVariant.Primary}
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
    skip={{
      cta: skip,
      onClick: () => reportTransition(FunnelStepTransitionType.Skip),
    }}
    onClick={async () => {
      await onCta?.();
      reportTransition(FunnelStepTransitionType.Complete);
    }}
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

const StoreButtons = (): ReactElement => (
  <div className="flex w-full max-w-[20rem] gap-2">
    <Button
      variant={ButtonVariant.Float}
      size={ButtonSize.Medium}
      className="flex-1"
      icon={<AppleIcon size={IconSize.XSmall} />}
    >
      App Store
    </Button>
    <Button
      variant={ButtonVariant.Float}
      size={ButtonSize.Medium}
      className="flex-1"
      icon={<GooglePlayIcon size={IconSize.Size16} />}
    >
      Google Play
    </Button>
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
    />
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

const changeTone: Record<FlowStep['change'], string> = {
  Unchanged: 'bg-surface-float text-text-tertiary',
  Changed: 'bg-overlay-float-cheese text-accent-cheese-default',
  Moved: 'bg-overlay-float-water text-accent-water-default',
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

const Walkthrough = (): ReactElement => {
  const theme = useThemeClass();
  const [device, setDevice] = useState<Device>('desktop');
  const [index, setIndex] = useState(0);
  const flow = flows[device];
  const step = flow[index];
  const frame = devices.find((item) => item.id === device);
  const scale = device === 'phone' ? 1 : 0.75;

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.data?.source !== MESSAGE_SOURCE) {
        return;
      }

      setIndex((current) => {
        const skipsInterest =
          flow[current] === steps.uploadCv &&
          event.data.type === FunnelStepTransitionType.Skip;
        const next = current + (skipsInterest ? 2 : 1);

        return Math.min(next, flow.length - 1);
      });
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [flow]);

  return (
    <div className="flex min-h-dvh flex-col items-center gap-6 bg-background-default px-6 py-8 text-text-primary">
      <header className="flex w-full max-w-[60rem] flex-col gap-2">
        <span className="text-text-tertiary typo-callout">
          Day zero retention
        </span>
        <h1 className="font-bold typo-title1">Live onboarding</h1>
        <p className="text-text-secondary typo-callout">
          The production onboarding steps in the proposed order. Click through
          with the steps&apos; own buttons.
        </p>
        <div className="flex flex-wrap gap-2 pt-2">
          {devices.map((item) => (
            <Button
              key={item.id}
              size={ButtonSize.Small}
              variant={
                item.id === device ? ButtonVariant.Primary : ButtonVariant.Float
              }
              onClick={() => {
                setDevice(item.id);
                setIndex(0);
              }}
            >
              {item.label}
            </Button>
          ))}
        </div>
      </header>

      <ol className="flex w-full max-w-[60rem] flex-wrap gap-2">
        {flow.map((item, itemIndex) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => setIndex(itemIndex)}
              className={classNames(
                'flex items-center gap-2 rounded-10 border px-3 py-1.5 typo-footnote',
                itemIndex === index
                  ? 'border-text-primary bg-surface-float font-bold'
                  : 'border-border-subtlest-tertiary text-text-tertiary hover:bg-surface-hover',
              )}
            >
              <span className="text-text-quaternary">{itemIndex + 1}</span>
              {item.label}
              {item.change !== 'Unchanged' && (
                <span
                  className={classNames(
                    'rounded-6 px-1.5 font-bold typo-caption2',
                    changeTone[item.change],
                  )}
                >
                  {item.change}
                </span>
              )}
            </button>
          </li>
        ))}
      </ol>

      <p className="w-full max-w-[60rem] text-text-secondary typo-callout">
        <span className="font-bold text-text-primary">{step.label}: </span>
        {step.note}
      </p>

      {frame && (
        <div
          className="relative shrink-0 overflow-hidden rounded-16 border border-border-subtlest-tertiary"
          style={{ width: frame.width * scale, height: frame.height * scale }}
        >
          <iframe
            key={`${device}-${step.id}`}
            title={step.label}
            src={`/iframe.html?id=day-zero-retention-live-onboarding--${step.id}&viewMode=story&args=device:${device}&globals=theme:${theme}`}
            style={{
              width: frame.width,
              height: frame.height,
              border: 0,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
            }}
          />
        </div>
      )}
    </div>
  );
};

export const LiveOnboarding: Story = {
  name: 'Live onboarding',
  render: () => <Walkthrough />,
};

export const StepPickTags: Story = {
  name: 'Step · Pick tags',
  render: ({ device }) => {
    const step = stepFor('edit-tags', FunnelStepType.EditTags, {
      headline: 'Pick tags that are relevant to you',
      minimumRequirement: MINIMUM_TAGS,
    });

    return (
      <LiveStep step={step} flowStep={steps.tags} device={device}>
        <StartWithNoTags>
          <FunnelEditTags {...step} />
          <TagsPushAsk />
        </StartWithNoTags>
      </LiveStep>
    );
  },
};

export const StepContentTypes: Story = {
  name: 'Step · Content types',
  render: ({ device }) => {
    const step = stepFor('content-types', FunnelStepType.ContentTypes, {
      headline: 'What kind of posts would you like to see on your feed?',
    });

    return (
      <LiveStep step={step} flowStep={steps.contentTypes} device={device}>
        <FunnelContentTypes {...step} />
      </LiveStep>
    );
  },
};

export const StepPlus: Story = {
  name: 'Step · Plus',
  render: ({ device }) => {
    const step = stepFor('plus-cards', FunnelStepType.PlusCards, {
      headline: 'Fast-track your growth',
      explainer:
        "Work smarter, learn faster, and stay ahead with AI tools, custom feeds, and pro features. Because copy-pasting code isn't a long-term strategy.",
    });

    return (
      <FunnelPaymentPricingContext.Provider value={{ pricing: mockPricing }}>
        <MockPlusPaymentProvider>
          <LiveStep step={step} flowStep={steps.plus} device={device}>
            <FunnelPlusCards {...step} />
          </LiveStep>
        </MockPlusPaymentProvider>
      </FunnelPaymentPricingContext.Provider>
    );
  },
};

export const StepBrowserExtension: Story = {
  name: 'Step · Browser extension',
  render: ({ device }) => {
    const step = stepFor('browser-extension', FunnelStepType.BrowserExtension, {
      headline: 'Transform every new tab into a learning powerhouse',
      explainer:
        'Unlock the power of every new tab with daily.dev extension. Personalized feed, developer communities, AI search and more!',
      cta: 'Add to {browser}',
      skip: 'Dare to skip? <strong>You might miss out</strong>.',
      showReviews: false,
    });

    return (
      <LiveStep step={step} flowStep={steps.extension} device={device}>
        <FunnelBrowserExtension {...step} />
      </LiveStep>
    );
  },
};

export const StepPhoneDoor: Story = {
  name: 'Step · Phone door',
  render: ({ device }) => (
    <LiveStep
      step={stepFor('composed', FunnelStepType.ProfileForm)}
      flowStep={steps.phoneDoor}
      device={device}
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

export const StepReadingReminder: Story = {
  name: 'Step · Reading reminder',
  render: ({ device }) => {
    const step = stepFor('reading-reminder', FunnelStepType.ReadingReminder, {
      headline: 'When do you need that reading nudge?',
    });

    return (
      <LiveStep step={step} flowStep={steps.readingReminder} device={device}>
        <FunnelReadingReminder {...step} />
      </LiveStep>
    );
  },
};

export const StepOpenInTheApp: Story = {
  name: 'Step · Open in the app',
  render: ({ device }) => (
    <LiveStep
      step={stepFor('composed', FunnelStepType.ProfileForm)}
      flowStep={steps.openInApp}
      device={device}
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

export const StepUploadCv: Story = {
  name: 'Step · Upload CV',
  render: ({ device }) => {
    const step = stepFor('upload-cv', FunnelStepType.UploadCv, {
      headline: 'Your next job should apply to you',
      description:
        'Upload your CV so we quietly match you with roles you might actually want. Nothing is shared without your ok.',
      dragDropDescription: 'Drag & Drop your CV or',
      ctaDesktop: 'Browse files',
      ctaMobile: 'Upload CV',
      linkedin: {
        cta: 'Go to your LinkedIn profile',
        image: exportLinkedIn,
        headline: 'Export from LinkedIn',
        explainer: "Here's how to get your CV from LinkedIn:",
        steps: [
          'Go to your LinkedIn profile',
          'Click "Resources" → "Save to PDF"',
          'Download the file and upload it here',
        ],
      },
    });

    return (
      <LiveStep step={step} flowStep={steps.uploadCv} device={device}>
        <FunnelUploadCv {...step} />
      </LiveStep>
    );
  },
};

export const StepCompanyInterest: Story = {
  name: 'Step · Company interest',
  render: ({ device }) => (
    <LiveStep
      step={stepFor('composed', FunnelStepType.ProfileForm)}
      flowStep={steps.cvInterest}
      device={device}
    >
      <CompanyInterestStep />
    </LiveStep>
  ),
};
