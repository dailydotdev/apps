import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import classNames from 'classnames';
import { graphql, HttpResponse } from 'msw';
import { FunnelProfileForm } from '@dailydotdev/shared/src/features/onboarding/steps/FunnelProfileForm';
import { FunnelAcquisition } from '@dailydotdev/shared/src/features/onboarding/steps/FunnelAcquisition';
import { FunnelUserRole } from '@dailydotdev/shared/src/features/onboarding/steps/FunnelUserRole';
import { FunnelEditTags } from '@dailydotdev/shared/src/features/onboarding/steps/FunnelEditTags';
import { FunnelContentTypes } from '@dailydotdev/shared/src/features/onboarding/steps/FunnelContentTypes';
import { FunnelReadingReminder } from '@dailydotdev/shared/src/features/onboarding/steps/FunnelReadingReminder';
import { FunnelInstallPwa } from '@dailydotdev/shared/src/features/onboarding/steps/FunnelInstallPwa';
import { FunnelUploadCv } from '@dailydotdev/shared/src/features/onboarding/steps/FunnelUploadCv';
import { FunnelPlusCards } from '@dailydotdev/shared/src/features/onboarding/steps/FunnelPlusCards';
import { FunnelBrowserExtension } from '@dailydotdev/shared/src/features/onboarding/steps/FunnelBrowserExtension';
import { FunnelStepType } from '@dailydotdev/shared/src/features/onboarding/types/funnel';
import { FunnelProgressContext } from '@dailydotdev/shared/src/features/onboarding/shared/FunnelStepDots';
import { featureOnboardingCommitment } from '@dailydotdev/shared/src/lib/featureManagement';
import { exportLinkedIn } from '@dailydotdev/shared/src/lib/image';
import type { LoggedUser } from '@dailydotdev/shared/src/lib/user';
import {
  useViewSize,
  ViewSize,
} from '@dailydotdev/shared/src/hooks/useViewSize';
import { defaultBootData, getBootMock } from '../../mock/boot';
import { FeatureOverrides } from '../../mock/GrowthBookProvider';
import {
  fakeIOSUserAgent,
  FEED_PREVIEW_HANDLER,
  FEED_SETTINGS_HANDLERS,
  FunnelStepShell,
  MockPlusPaymentProvider,
  PROFILE_HANDLERS,
} from '../features/onboarding/signupFunnel.mocks';
import { DeviceFrame, devices, Page, PageHeader } from '../feed-patchy/shell';
import type { CompanionPlacement } from './patchyCompanion';
import { companionPlacements, PatchyCompanion } from './patchyCompanion';

/**
 * Every screen of the signup onboarding funnel (`/onboarding`), in the order a
 * user meets them, so the Feed Patchy commitment step can be judged in
 * context. Each funnel step is the production component mounted through the
 * signup-funnel harness; the two auth screens before the funnel starts are
 * placeholders.
 */

type StepId =
  | 'signup'
  | 'verify-email'
  | 'account-details'
  | 'acquisition'
  | 'user-role'
  | 'tags'
  | 'content-types'
  | 'reading-reminder'
  | 'install-pwa'
  | 'upload-cv'
  | 'plus'
  | 'browser-extension';

interface FlowStep {
  id: StepId;
  name: string;
  shownTo: string;
  /** Set on the screens Storybook can't mount: why, shown in their place. */
  placeholder?: string;
  type?: FunnelStepType;
  parameters?: Record<string, unknown>;
  /** Why the funnel's own guard skips the step, shown when it does. */
  skipReason?: string;
  /**
   * Skipped below laptop width in production. The step's guard also waits on
   * the actions query, which never settles in Storybook, so it would render
   * on a phone; the screen applies the width check itself.
   */
  isLaptopOnly?: boolean;
  isFeedPatchy?: boolean;
}

// The order of the old "Signup funnel steps" and "Click audit" stories
// (removed in ee6341ce4), "with every step enabled". The live order is the
// Freyja funnel config, which is not in this repo.
const STEPS: FlowStep[] = [
  {
    id: 'signup',
    name: 'Sign up',
    shownTo: 'Everyone',
    placeholder:
      'The auth screen /onboarding shows before the funnel starts (the onboarding sign-up in pages/onboarding.tsx). It creates a real account through the auth flow, so it is not mounted here.',
  },
  {
    id: 'verify-email',
    name: 'Verify email',
    shownTo: 'Email signups only',
    placeholder:
      'The code screen of the email registration. It needs a pending registration from the real auth flow, so it is not mounted here.',
  },
  {
    id: 'account-details',
    name: 'Account details',
    shownTo: 'Everyone',
    type: FunnelStepType.ProfileForm,
    parameters: { headline: 'Tell us a bit about yourself' },
  },
  {
    id: 'acquisition',
    name: 'How did you hear about us',
    shownTo: 'Everyone who has not answered it before',
    type: FunnelStepType.Acquisition,
    parameters: {},
    skipReason: 'The profile already has an acquisition channel.',
  },
  {
    id: 'user-role',
    name: 'Who are you',
    shownTo: 'Everyone without a job title on file',
    type: FunnelStepType.UserRole,
    parameters: {},
    skipReason: 'The profile already has a job title.',
  },
  {
    id: 'tags',
    name: 'Pick tags',
    shownTo: 'Everyone',
    type: FunnelStepType.EditTags,
    parameters: {
      headline: 'Pick tags that are relevant to you',
      minimumRequirement: 5,
    },
  },
  {
    id: 'content-types',
    name: 'Content types',
    shownTo: 'Everyone',
    type: FunnelStepType.ContentTypes,
    parameters: {
      headline: 'What kind of posts would you like to see on your feed?',
    },
  },
  {
    id: 'reading-reminder',
    name: 'Reading reminder · Feed Patchy',
    shownTo: 'Everyone whose browser supports push',
    type: FunnelStepType.ReadingReminder,
    parameters: { headline: 'When do you need that reading nudge?' },
    skipReason: 'This browser does not support push notifications.',
    isFeedPatchy: true,
  },
  {
    id: 'install-pwa',
    name: 'Install PWA',
    shownTo: 'iOS Safari on a phone only',
    type: FunnelStepType.InstallPwa,
    parameters: { headline: 'Add daily.dev to Home Screen' },
    skipReason:
      'Only iOS Safari below 500px sees this step; the funnel skips it at this width.',
  },
  {
    id: 'upload-cv',
    name: 'Upload CV',
    shownTo: 'Everyone who has not uploaded a CV',
    type: FunnelStepType.UploadCv,
    parameters: {
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
    },
    skipReason: 'The user has already uploaded a CV.',
  },
  {
    id: 'plus',
    name: 'Plus',
    shownTo: 'Users without Plus',
    type: FunnelStepType.PlusCards,
    parameters: {
      headline: 'Fast-track your growth',
      explainer:
        "Work smarter, learn faster, and stay ahead with AI tools, custom feeds, and pro features. Because copy-pasting code isn't a long-term strategy.",
    },
  },
  {
    id: 'browser-extension',
    name: 'Browser extension',
    shownTo: 'Chrome, Brave and Edge on a laptop, without the extension',
    type: FunnelStepType.BrowserExtension,
    parameters: {
      headline: 'Transform every new tab into a learning powerhouse',
      explainer:
        'Unlock the power of every new tab with daily.dev extension. Personalized feed, developer communities, AI search and more!',
      cta: 'Add to {browser}',
      skip: 'Dare to skip? <strong>You might miss out</strong>.',
      showReviews: false,
    },
    isLaptopOnly: true,
    skipReason:
      'Only Chrome, Brave and Edge at laptop width see this step; the funnel skips it here.',
  },
];

const FUNNEL_STEPS = STEPS.filter((step) => !step.placeholder);

const stepComponents: Partial<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- the step union is resolved at runtime by `type`
  Record<FunnelStepType, React.ComponentType<any>>
> = {
  [FunnelStepType.ProfileForm]: FunnelProfileForm,
  [FunnelStepType.Acquisition]: FunnelAcquisition,
  [FunnelStepType.UserRole]: FunnelUserRole,
  [FunnelStepType.EditTags]: FunnelEditTags,
  [FunnelStepType.ContentTypes]: FunnelContentTypes,
  [FunnelStepType.ReadingReminder]: FunnelReadingReminder,
  [FunnelStepType.InstallPwa]: FunnelInstallPwa,
  [FunnelStepType.UploadCv]: FunnelUploadCv,
  [FunnelStepType.PlusCards]: FunnelPlusCards,
  [FunnelStepType.BrowserExtension]: FunnelBrowserExtension,
};

const meta: Meta = {
  title: 'Pages/Onboarding/All screens',
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj;

const screenStoryId = 'pages-onboarding-all-screens--screen';

/* ── The screen at full viewport ─────────────────────────────────────── */

const ScreenNote = ({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}): ReactElement => (
  <div className="flex min-h-dvh flex-1 items-center justify-center bg-background-default p-6 text-text-primary">
    <div className="flex max-w-sm flex-col gap-3 rounded-24 border border-dashed border-border-subtlest-secondary p-6">
      <span className="font-bold uppercase tracking-[0.12em] text-text-tertiary typo-caption1">
        {eyebrow}
      </span>
      <h1 className="font-bold typo-title2">{title}</h1>
      <p className="text-text-tertiary typo-callout">{children}</p>
    </div>
  </div>
);

const nextStepName = (id: StepId): string => {
  const index = STEPS.findIndex((step) => step.id === id);

  return STEPS[index + 1]?.name ?? 'the feed';
};

const LiveStep = ({ step }: { step: FlowStep }): ReactElement => {
  const [isDone, setIsDone] = useState(false);
  const [isGuardSkipped, setIsGuardSkipped] = useState(false);
  const isLaptop = useViewSize(ViewSize.Laptop);
  const isSkipped = isGuardSkipped || (!!step.isLaptopOnly && !isLaptop);
  const stepIndex = FUNNEL_STEPS.indexOf(step);
  const Component = step.type ? stepComponents[step.type] : undefined;
  const progress = useMemo(
    () => ({
      chapters: [{ steps: FUNNEL_STEPS.length }],
      position: { chapter: 0, step: stepIndex },
      isOnboarding: true,
    }),
    [stepIndex],
  );
  const props = {
    id: step.id,
    type: step.type,
    parameters: step.parameters,
    isActive: true,
    transitions: [],
    onTransition: () => setIsDone(true),
    onRegisterStepToSkip: (_type: FunnelStepType, shouldSkip: boolean) =>
      setIsGuardSkipped(shouldSkip),
  };

  if (!Component || isDone) {
    return (
      <ScreenNote eyebrow="Step complete" title={step.name}>
        The funnel would move on to {nextStepName(step.id)} here.
      </ScreenNote>
    );
  }

  return (
    <FeatureOverrides
      values={{ [featureOnboardingCommitment.id]: !!step.isFeedPatchy }}
    >
      <MockPlusPaymentProvider>
        <FunnelStepShell step={props} stepIndex={stepIndex} fullWidth>
          {isSkipped ? (
            <ScreenNote eyebrow="Skipped here" title={step.name}>
              {step.skipReason}
            </ScreenNote>
          ) : (
            <FunnelProgressContext.Provider value={progress}>
              <Component {...props} />
            </FunnelProgressContext.Provider>
          )}
        </FunnelStepShell>
      </MockPlusPaymentProvider>
    </FeatureOverrides>
  );
};

const FlowScreen = ({ id }: { id: StepId }): ReactElement => {
  const step = STEPS.find((item) => item.id === id) ?? STEPS[0];

  if (step.placeholder) {
    return (
      <ScreenNote eyebrow="Not mounted in Storybook" title={step.name}>
        {step.placeholder}
      </ScreenNote>
    );
  }

  return <LiveStep step={step} />;
};

/**
 * One step at the full viewport, picked by the `step` arg. The page below
 * loads it in device-sized iframes. Hidden from the sidebar.
 */
export const Screen: StoryObj<{ step: StepId; patchy: CompanionPlacement }> = {
  name: 'Screen',
  tags: ['!dev'],
  args: { step: 'reading-reminder', patchy: 'none' },
  argTypes: {
    step: { control: 'select', options: STEPS.map((step) => step.id) },
    patchy: {
      control: 'inline-radio',
      options: ['none', ...companionPlacements.map(({ id }) => id)],
    },
  },
  parameters: {
    msw: {
      handlers: [
        ...PROFILE_HANDLERS,
        ...FEED_SETTINGS_HANDLERS,
        FEED_PREVIEW_HANDLER,
        graphql.mutation('SubscribePersonalizedDigest', () =>
          HttpResponse.json({
            data: { subscribePersonalizedDigest: { preferredHour: 9 } },
          }),
        ),
        graphql.mutation('CompleteAction', () =>
          HttpResponse.json({ data: { completeAction: { _: true } } }),
        ),
      ],
    },
  },
  // As on the Feed Patchy pages: the boot mock's app theme is applied over
  // the toolbar's, so boot with the toolbar's theme. The user is fresh from
  // sign-up: no acquisition channel or title, the browser's timezone.
  beforeEach: ({ args, globals }) => {
    const theme = globals.theme === 'dark' ? 'dark' : 'light';
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    getBootMock.mockReturnValue({
      ...defaultBootData,
      user: {
        ...defaultBootData.user,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      } as LoggedUser,
      settings: {
        ...defaultBootData.settings,
        theme: theme === 'dark' ? 'darcula' : 'bright',
      },
      accessToken: { token: '1', expiresIn: '1' },
      visit: { sessionId: '1', visitId: '1' },
      feeds: [],
    });
    if (args.step === 'install-pwa') {
      fakeIOSUserAgent();
    }
  },
  render: ({ step, patchy }) => (
    <>
      <FlowScreen id={step} />
      <PatchyCompanion placement={patchy} />
    </>
  ),
};

/* ── The page ────────────────────────────────────────────────────────── */

type FlowDevice = 'phone' | 'web';

const deviceTabs: Array<{ id: FlowDevice; label: string }> = [
  { id: 'phone', label: 'Phone' },
  { id: 'web', label: 'Web' },
];

const screenUrl = (id: StepId, theme?: string): string =>
  `iframe.html?id=${screenStoryId}&viewMode=story&args=step:${id}${
    theme ? `&globals=theme:${theme}` : ''
  }`;

const AllScreensPage = ({ theme }: { theme?: string }): ReactElement => {
  const [device, setDevice] = useState<FlowDevice>('phone');
  // Twelve frames booting at once each pull the whole module graph, and Vite
  // answers the stampede with "Failed to fetch dynamically imported module".
  // Mounting them one after another lets the first warm the graph.
  const [mounted, setMounted] = useState(1);

  useEffect(() => {
    setMounted(1);
  }, [device]);

  useEffect(() => {
    if (mounted >= STEPS.length) {
      return undefined;
    }
    const timeout = setTimeout(() => setMounted((count) => count + 1), 1200);

    return () => clearTimeout(timeout);
  }, [mounted]);

  // The stagger narrows the stampede but can't close it: a frame scrolled
  // into view loads alongside its neighbors. A frame that lost the race
  // shows Storybook's error display, so reload it, a few times at most.
  const row = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const retries = new WeakMap<HTMLIFrameElement, number>();
    const interval = setInterval(() => {
      row.current?.querySelectorAll('iframe').forEach((frame) => {
        const body = frame.contentDocument?.body;
        const count = retries.get(frame) ?? 0;
        if (
          count < 3 &&
          body?.classList.contains('sb-show-errordisplay') &&
          body.innerText.includes('Failed to fetch dynamically imported module')
        ) {
          retries.set(frame, count + 1);
          frame.contentWindow?.location.reload();
        }
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Page>
      <PageHeader eyebrow="Onboarding · signup funnel" title="Every screen">
        <p>
          The signup onboarding on /onboarding, start to finish, with the
          reading-reminder step rendered as Feed Patchy (onboarding_commitment
          on). Every funnel step is the production component with its inputs
          faked: a fresh user with no acquisition channel or job title, push
          supported, the tag and content settings seeded. Sign up and Verify
          email come from the auth flow before the funnel starts, so they are
          placeholders.
        </p>
        <p>
          The order is the one the old “Signup funnel steps” and “Click audit”
          stories used for the funnel with every step enabled. Which steps run,
          and in what order, is set per funnel in Freyja, which is not in this
          repo, so a given signup meets a subset of these. Steps whose own guard
          skips them at this size say so in their frame.
        </p>
      </PageHeader>
      <div className="flex flex-col gap-6">
        <div
          role="tablist"
          className="flex w-fit gap-1 rounded-14 bg-surface-float p-1"
        >
          {deviceTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={tab.id === device}
              onClick={() => setDevice(tab.id)}
              className={classNames(
                'rounded-10 px-4 py-2 font-bold transition-colors typo-callout',
                tab.id === device
                  ? 'bg-background-default text-text-primary shadow-2'
                  : 'text-text-tertiary hover:text-text-primary',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <ol ref={row} className="flex snap-x gap-6 overflow-x-auto pb-6">
          {STEPS.map((step, index) => (
            <li
              key={step.id}
              className={classNames(
                'flex shrink-0 snap-start flex-col gap-3 rounded-24 border p-4',
                device === 'phone' ? 'w-80' : 'w-[38rem]',
                step.isFeedPatchy
                  ? 'border-accent-cabbage-default bg-surface-float'
                  : 'border-border-subtlest-tertiary',
              )}
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-text-tertiary typo-footnote">
                    {index + 1}
                  </span>
                  <a
                    href={screenUrl(step.id, theme)}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold hover:underline typo-callout"
                  >
                    {step.name}
                  </a>
                </div>
                <span className="text-text-tertiary typo-caption1">
                  {step.shownTo}
                </span>
                {step.isFeedPatchy && (
                  <span className="w-fit rounded-8 border border-accent-cabbage-default px-2 py-0.5 font-bold text-accent-cabbage-default typo-caption1">
                    Feed Patchy · onboarding_commitment on
                  </span>
                )}
                {step.placeholder && (
                  <span className="w-fit rounded-8 border border-border-subtlest-secondary px-2 py-0.5 text-text-tertiary typo-caption1">
                    Placeholder
                  </span>
                )}
              </div>
              {index < mounted ? (
                <DeviceFrame
                  key={device}
                  device={device}
                  storyId={screenStoryId}
                  args={`step:${step.id}`}
                  theme={theme}
                  label={devices[device].label}
                />
              ) : (
                <div
                  className="flex w-full items-center justify-center rounded-24 border-2 border-border-subtlest-tertiary text-text-quaternary typo-footnote"
                  style={{
                    aspectRatio: `${devices[device].width} / ${devices[device].height}`,
                  }}
                >
                  Loading…
                </div>
              )}
            </li>
          ))}
        </ol>
      </div>
    </Page>
  );
};

export const AllScreens: Story = {
  name: 'All screens',
  render: (_, { globals }) => <AllScreensPage theme={globals.theme} />,
};

/* ── Explore: Patchy along the way ──────────────────────────────────── */

const companionSteps: StepId[] = [
  'account-details',
  'acquisition',
  'user-role',
  'tags',
  'content-types',
];

const CompanionPage = ({ theme }: { theme?: string }): ReactElement => {
  const [placement, setPlacement] = useState<
    Exclude<CompanionPlacement, 'none'>
  >(companionPlacements[0].id);
  const current = companionPlacements.find(({ id }) => id === placement);

  return (
    <Page>
      <PageHeader
        eyebrow="Onboarding · exploration"
        title="Patchy along the way"
      >
        <p>
          Patchy keeps you company on the steps before he asks for the bone,
          with no popups: he sits at the edge of the screen, watches the step
          and reacts. Curious while you look, reading while you type, excited
          for a moment when you pick something, then happy.
        </p>
        <p>
          Each phone is the production step with Patchy drawn on top. Pick an
          option or type in a field to see him react.
        </p>
      </PageHeader>
      <div className="flex flex-col gap-2">
        <div
          role="tablist"
          className="flex w-fit gap-1 rounded-14 bg-surface-float p-1"
        >
          {companionPlacements.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={item.id === placement}
              onClick={() => setPlacement(item.id)}
              className={classNames(
                'rounded-10 px-4 py-2 font-bold transition-colors typo-callout',
                item.id === placement
                  ? 'bg-background-default text-text-primary shadow-2'
                  : 'text-text-tertiary hover:text-text-primary',
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
        <p className="text-text-tertiary typo-footnote">{current?.note}</p>
      </div>
      <div className="flex gap-6 overflow-x-auto pb-4">
        {companionSteps.map((id, index) => (
          <section
            key={`${placement}-${id}`}
            className="flex w-[22rem] shrink-0 flex-col gap-3"
          >
            <span className="font-bold typo-callout">
              {STEPS.findIndex((step) => step.id === id) + 1}.{' '}
              {STEPS.find((step) => step.id === id)?.name}
            </span>
            <StaggeredFrame delay={index * 1200}>
              <DeviceFrame
                device="phone"
                storyId={screenStoryId}
                args={`step:${id};patchy:${placement}`}
                theme={theme}
              />
            </StaggeredFrame>
          </section>
        ))}
      </div>
    </Page>
  );
};

/** Frames boot one after another, as on the All screens page. */
const StaggeredFrame = ({
  delay,
  children,
}: {
  delay: number;
  children: ReactNode;
}): ReactElement | null => {
  const [isReady, setIsReady] = useState(delay === 0);

  useEffect(() => {
    const timeout = window.setTimeout(() => setIsReady(true), delay);
    return () => window.clearTimeout(timeout);
  }, [delay]);

  return isReady ? <>{children}</> : null;
};

export const PatchyAlongTheWay: Story = {
  name: 'Explore: Patchy along the way',
  render: (_, { globals }) => <CompanionPage theme={globals.theme} />,
};
