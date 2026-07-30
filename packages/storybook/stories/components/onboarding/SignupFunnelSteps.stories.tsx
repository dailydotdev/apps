import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { fn } from 'storybook/test';
import Feed from '@dailydotdev/shared/src/components/Feed';
import { FeedLayoutProvider } from '@dailydotdev/shared/src/contexts/FeedContext';
import { PREVIEW_FEED_QUERY } from '@dailydotdev/shared/src/graphql/feed';
import {
  OtherFeedPage,
  RequestKey,
} from '@dailydotdev/shared/src/lib/query';
import { FunnelProfileForm } from '@dailydotdev/shared/src/features/onboarding/steps/FunnelProfileForm';
import { FunnelEditTags } from '@dailydotdev/shared/src/features/onboarding/steps/FunnelEditTags';
import { FunnelContentTypes } from '@dailydotdev/shared/src/features/onboarding/steps/FunnelContentTypes';
import { FunnelReadingReminder } from '@dailydotdev/shared/src/features/onboarding/steps/FunnelReadingReminder';
import { FunnelInstallPwa } from '@dailydotdev/shared/src/features/onboarding/steps/FunnelInstallPwa';
import { FunnelBrowserExtension } from '@dailydotdev/shared/src/features/onboarding/steps/FunnelBrowserExtension';
import { FunnelUploadCv } from '@dailydotdev/shared/src/features/onboarding/steps/FunnelUploadCv';
import { FunnelPlusCards } from '@dailydotdev/shared/src/features/onboarding/steps/FunnelPlusCards';
import { exportLinkedIn } from '@dailydotdev/shared/src/lib/image';
import { FunnelPaymentPricingContext } from '@dailydotdev/shared/src/contexts/payment/context';
import { mockPricing } from './FunnelPricing.stories';
import { FunnelStepType } from '@dailydotdev/shared/src/features/onboarding/types/funnel';
import { OnboardingChromeVariant } from '@dailydotdev/shared/src/lib/featureManagement';
import {
  FunnelStepShell,
  fakeIOSUserAgent,
  FEED_PREVIEW_HANDLER,
  FEED_SETTINGS_HANDLERS,
  MockPlusPaymentProvider,
} from './signupFunnel.mocks';
import {
  OnboardingHeadline,
  OnboardingSubheadline,
} from '@dailydotdev/shared/src/components/onboarding/common';

/**
 * The steps a user walks through after registering on `/onboarding`, mounted
 * one per story so the CTA placement can be compared across them. The two
 * overview stories put them side by side in equal-width frames — mobile at
 * 390px, desktop at 1440px — and every step's CTA bar should hit the same left
 * and right edge.
 */
/**
 * Every step story takes the experiment arm as an arg, so the overview pages can
 * render the same nine steps twice — once per arm — by appending it to the
 * iframe URL.
 */
interface StepArgs {
  chrome?: OnboardingChromeVariant;
}

const chromeArgTypes: Meta['argTypes'] = {
  chrome: {
    control: { type: 'inline-radio' },
    options: Object.values(OnboardingChromeVariant),
  },
};

const meta: Meta = {
  title: 'Components/Onboarding/Signup funnel steps',
  argTypes: chromeArgTypes,
  args: { chrome: OnboardingChromeVariant.Gradient },
  // No `themes` parameter on purpose: it fights the global decorator, and the
  // funnel's own always-dark steps then invert into the wrong direction. Use
  // the toolbar's theme switcher instead.
  parameters: {
    layout: 'fullscreen',
    // The feed-settings mutations are optimistic: `onMutate` flips the card and
    // `onError` rolls it straight back. Without a resolving endpoint every
    // toggle would snap back a frame later and the steps could not be clicked
    // through at all. These resolve the writes so selection sticks.
    msw: { handlers: FEED_SETTINGS_HANDLERS },
  },
};

export default meta;

type Story = StoryObj;

// The step components take their own slice of the FunnelStep union; the stories
// build plain objects and let each component read what it needs.
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- story fixtures
const baseStep: any = {
  isActive: true,
  transitions: [],
  onTransition: fn(),
  onRegisterStepToSkip: fn(),
};

export const AccountDetails: Story = {
  name: '1. Account details',
  render: ({ chrome }: StepArgs) => {
    const step = {
      ...baseStep,
      id: 'profile-form',
      type: FunnelStepType.ProfileForm,
      parameters: { headline: 'Tell us a bit about yourself' },
    };

    return (
      <FunnelStepShell chrome={chrome} step={step} stepIndex={0} fullWidth>
        <FunnelProfileForm {...step} />
      </FunnelStepShell>
    );
  },
};

export const PickTags: Story = {
  name: '3. Pick tags',
  // Five tags are pre-selected, so raising the requirement above 5 shows the
  // gated state where the CTA bar fades out until enough tags are picked.
  argTypes: {
    ...chromeArgTypes,
    minimumRequirement: { control: { type: 'number', min: 1 } },
  },
  args: { minimumRequirement: 5 },
  render: ({
    chrome,
    minimumRequirement,
  }: StepArgs & { minimumRequirement?: number }) => {
    const step = {
      ...baseStep,
      id: 'edit-tags',
      type: FunnelStepType.EditTags,
      parameters: {
        headline: 'Pick tags that are relevant to you',
        minimumRequirement,
      },
    };

    return (
      <FunnelStepShell chrome={chrome} step={step} stepIndex={2} fullWidth>
        <FunnelEditTags {...step} />
      </FunnelStepShell>
    );
  },
};

export const ContentTypes: Story = {
  name: '4. Content types',
  render: ({ chrome }: StepArgs) => {
    const step = {
      ...baseStep,
      id: 'content-types',
      type: FunnelStepType.ContentTypes,
      parameters: {
        headline: 'What kind of posts would you like to see on your feed?',
      },
    };

    return (
      <FunnelStepShell chrome={chrome} step={step} stepIndex={3} fullWidth>
        <FunnelContentTypes {...step} />
      </FunnelStepShell>
    );
  },
};

export const ReadingReminder: Story = {
  name: '5. Reading reminder',
  parameters: {
    // The step renders on mobile only (`ViewSize.MobileXL` is true below 500px).
    docs: { description: { story: 'Renders below 500px viewport width.' } },
  },
  render: ({ chrome }: StepArgs) => {
    const step = {
      ...baseStep,
      id: 'reading-reminder',
      type: FunnelStepType.ReadingReminder,
      parameters: { headline: 'When do you need that reading nudge?' },
    };

    return (
      <FunnelStepShell chrome={chrome} step={step} stepIndex={4}>
        <FunnelReadingReminder {...step} />
      </FunnelStepShell>
    );
  },
};

export const InstallPwa: Story = {
  name: '6. Install PWA',
  decorators: [
    (Story) => {
      // iOS Safari only; faked so the step can be reviewed on desktop.
      fakeIOSUserAgent();
      return <Story />;
    },
  ],
  render: ({ chrome }: StepArgs) => {
    const step = {
      ...baseStep,
      id: 'install-pwa',
      type: FunnelStepType.InstallPwa,
      parameters: { headline: 'Add daily.dev to Home Screen' },
    };

    return (
      <FunnelStepShell chrome={chrome} step={step} stepIndex={5} fullWidth>
        <FunnelInstallPwa {...step} />
      </FunnelStepShell>
    );
  },
};

export const BrowserExtension: Story = {
  name: '9. Browser extension',
  render: ({ chrome }: StepArgs) => {
    const step = {
      ...baseStep,
      id: 'browser-extension',
      type: FunnelStepType.BrowserExtension,
      parameters: {
        headline: 'Transform every new tab into a learning powerhouse',
        explainer:
          'Unlock the power of every new tab with daily.dev extension. Personalized feed, developer communities, AI search and more!',
        cta: 'Add to {browser}',
        skip: 'Dare to skip? <strong>You might miss out</strong>.',
        showReviews: false,
      },
    };

    return (
      <FunnelStepShell chrome={chrome} step={step} stepIndex={8} fullWidth>
        <FunnelBrowserExtension {...step} />
      </FunnelStepShell>
    );
  },
};

export const UploadCv: Story = {
  name: '7. Upload CV',
  render: ({ chrome }: StepArgs) => {
    const step = {
      ...baseStep,
      id: 'upload-cv',
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
            'Click "Resources" \u2192 "Save to PDF"',
            'Download the file and upload it here',
          ],
        },
      },
    };

    return (
      <FunnelStepShell chrome={chrome} step={step} stepIndex={6} fullWidth>
        <FunnelUploadCv {...step} />
      </FunnelStepShell>
    );
  },
};

export const PlusCards: Story = {
  name: '8. Plus',
  render: ({ chrome }: StepArgs) => {
    const step = {
      ...baseStep,
      id: 'plus-cards',
      type: FunnelStepType.PlusCards,
      parameters: {
        headline: 'Fast-track your growth',
        explainer:
          "Work smarter, learn faster, and stay ahead with AI tools, custom feeds, and pro features. Because copy-pasting code isn't a long-term strategy.",
      },
    };

    return (
      <FunnelPaymentPricingContext.Provider value={{ pricing: mockPricing }}>
        <MockPlusPaymentProvider>
          <FunnelStepShell chrome={chrome} step={step} stepIndex={7} fullWidth>
            <FunnelPlusCards {...step} />
          </FunnelStepShell>
        </MockPlusPaymentProvider>
      </FunnelPaymentPricingContext.Provider>
    );
  },
};

// The rail caps at 440px of content inside a 32rem (512px) box, so that is
// where every CTA should start and end. Below 512px the cap does nothing and
// only the rail's px-6 is left.
const railInset = (frameWidth: number) =>
  Math.max(24, (frameWidth - 512) / 2 + 24);

const useThemeClass = (): 'dark' | 'light' => {
  const [theme, setTheme] = React.useState<'dark' | 'light'>('light');

  React.useEffect(() => {
    const read = () =>
      setTheme(
        document.documentElement.classList.contains('dark') ? 'dark' : 'light',
      );
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  return theme;
};

// The order a user actually meets them.
const OVERVIEW_STEPS = [
  { id: 'account-details', label: '1. Account details' },
  { id: 'verify-email', label: '2. Verify email' },
  { id: 'pick-tags', label: '3. Pick tags' },
  { id: 'content-types', label: '4. Content types' },
  // Both of these render on mobile only in the real funnel, so their desktop
  // frames are legitimately empty.
  { id: 'reading-reminder', label: '5. Reading reminder', isMobileOnly: true },
  { id: 'install-pwa', label: '6. Install PWA', isMobileOnly: true },
  { id: 'upload-cv', label: '7. Upload CV' },
  { id: 'plus-cards', label: '8. Plus' },
  { id: 'browser-extension', label: '9. Browser extension' },
];

interface StepFramesProps {
  // Which arm of the onboarding-chrome experiment the frames render.
  arm?: OnboardingChromeVariant;
  width: number;
  height: number;
  // Desktop frames are rendered at their real width and scaled down, so six of
  // them can still be compared side by side.
  scale?: number;
  showGuides?: boolean;
  title: string;
  description: string;
}

const StepFrames = ({
  arm = OnboardingChromeVariant.Gradient,
  width,
  height,
  scale = 1,
  showGuides,
  title,
  description,
}: StepFramesProps): ReactElement => {
  // The frames are separate documents, so the toolbar's theme has to be
  // forwarded to them explicitly. The theme decorator sets the class after the
  // story renders, hence the observer rather than a render-time read.
  const theme = useThemeClass();
  const inset = railInset(width);
  const [reloadKey, setReloadKey] = React.useState(0);
  // Mount the frames one at a time.
  //
  // Nine iframes booting at once each pull the same module graph, and a cold
  // Vite server answers that by re-running dep optimization — which invalidates
  // the URLs the in-flight requests are already using. Every frame then dies
  // with "Failed to fetch dynamically imported module". Reloading them together
  // just repeats the stampede. Staggering means the first frame warms the
  // optimizer and the rest are served from a settled graph.
  const [mounted, setMounted] = React.useState(1);
  React.useEffect(() => {
    setMounted(1);
  }, [reloadKey]);
  React.useEffect(() => {
    if (mounted >= OVERVIEW_STEPS.length) {
      return undefined;
    }
    const timeout = setTimeout(() => setMounted((count) => count + 1), 450);

    return () => clearTimeout(timeout);
  }, [mounted]);
  // ViewSize.MobileXL — the cut-off the mobile-only steps guard on.
  const isMobileFrame = width < 500;

  return (
    <div className="flex h-dvh flex-col gap-4 overflow-auto bg-background-default p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-bold typo-title2">{title}</h1>
          <p className="text-text-tertiary typo-callout">{description}</p>
        </div>
        <button
          type="button"
          className="shrink-0 rounded-10 border border-border-subtlest-tertiary px-3 py-1.5 typo-callout"
          onClick={() => setReloadKey((key) => key + 1)}
        >
          Reload frames
        </button>
      </div>
      <div className="flex gap-6 overflow-x-auto pb-4">
        {OVERVIEW_STEPS.map(({ id, label, isMobileOnly }, frameIndex) => (
          <figure key={id} className="flex shrink-0 flex-col gap-2">
            <figcaption className="text-text-secondary typo-footnote">
              {label}
              {isMobileOnly && !isMobileFrame && (
                <span className="text-text-quaternary">
                  {' '}
                  — mobile only, skipped here
                </span>
              )}
            </figcaption>
            <div
              className="shrink-0 overflow-hidden"
              style={{ width: width * scale, height: height * scale }}
            >
              <div
                className="relative overflow-hidden rounded-16 border border-border-subtlest-tertiary"
                style={{
                  width,
                  height,
                  transform: `scale(${scale})`,
                  transformOrigin: 'top left',
                }}
              >
                {frameIndex < mounted ? (
                  <iframe
                    key={reloadKey}
                    title={`${label} — ${width}px`}
                    src={`/iframe.html?id=components-onboarding-signup-funnel-steps--${id}&viewMode=story&globals=theme:${theme}&args=chrome:${arm}`}
                    style={{ width, height, border: 0 }}
                  />
                ) : (
                  <div
                    className="flex items-center justify-center text-text-quaternary typo-footnote"
                    style={{ width, height }}
                  >
                    Loading…
                  </div>
                )}
                {showGuides && (
                  <>
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-y-0 border-l border-dashed border-accent-cabbage-default"
                      style={{ left: inset }}
                    />
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-y-0 border-l border-dashed border-accent-cabbage-default"
                      style={{ right: inset }}
                    />
                  </>
                )}
              </div>
            </div>
          </figure>
        ))}
      </div>
    </div>
  );
};

const overviewArgTypes = { showGuides: { control: 'boolean' } };

export const MobileOverview: Story = {
  name: '★ Mobile overview — control (gradient)',
  argTypes: overviewArgTypes,
  args: { showGuides: true },
  render: ({ showGuides }: { showGuides?: boolean }) => (
    <StepFrames
      arm={OnboardingChromeVariant.Gradient}
      width={390}
      height={844}
      showGuides={showGuides}
      title="Signup funnel — mobile · control"
      description="The onboarding_chrome control arm: the giveback funnel's brand gradient, no progress dots. Everything else — the 440px rail, the type scale, the glass CTA, the logo strip — is baseline and ships either way."
    />
  ),
};

export const MobileOverviewAura: Story = {
  name: '★ Mobile overview — variant (aura + dots)',
  argTypes: overviewArgTypes,
  args: { showGuides: true },
  render: ({ showGuides }: { showGuides?: boolean }) => (
    <StepFrames
      arm={OnboardingChromeVariant.Aura}
      width={390}
      height={844}
      showGuides={showGuides}
      title="Signup funnel — mobile · variant"
      description="The onboarding_chrome variant arm: the animated edge-aura frame plus the progress dots under the CTA. Compare against the control page above."
    />
  ),
};

export const DesktopOverview: Story = {
  name: '★ Desktop overview — control (gradient)',
  argTypes: overviewArgTypes,
  args: { showGuides: true },
  render: ({ showGuides }: { showGuides?: boolean }) => (
    <StepFrames
      arm={OnboardingChromeVariant.Gradient}
      width={1440}
      height={900}
      scale={0.45}
      showGuides={showGuides}
      title="Signup funnel — desktop · control"
      description="The same steps in a 1440×900 frame, scaled to 45% so they sit side by side. The CTA rail keeps its width, so the bar stays the same size as on mobile while the content around it spreads out."
    />
  ),
};

export const DesktopOverviewAura: Story = {
  name: '★ Desktop overview — variant (aura + dots)',
  argTypes: overviewArgTypes,
  args: { showGuides: true },
  render: ({ showGuides }: { showGuides?: boolean }) => (
    <StepFrames
      arm={OnboardingChromeVariant.Aura}
      width={1440}
      height={900}
      scale={0.45}
      showGuides={showGuides}
      title="Signup funnel — desktop · variant"
      description="The aura arm at desktop width. The ring hugs the viewport edge, so it reads very differently here than in a phone frame."
    />
  ),
};

/**
 * Walk the funnel the way a user does — one step filling the frame, with the
 * flow's own controls plus a next/back rail so a step that gates its CTA (the
 * tag minimum) can still be stepped past.
 */
const FunnelPlayground = ({
  device,
}: {
  device: 'mobile' | 'desktop';
}): ReactElement => {
  const theme = useThemeClass();
  const [index, setIndex] = React.useState(0);
  const [reloadKey, setReloadKey] = React.useState(0);
  const isMobile = device !== 'desktop';
  const width = isMobile ? 390 : 1280;
  const height = isMobile ? 844 : 800;
  const step = OVERVIEW_STEPS[index];
  const skipped = !isMobile && step.isMobileOnly;

  return (
    <div className="flex h-dvh flex-col items-center gap-4 overflow-auto bg-background-default p-6">
      <div className="flex w-full max-w-4xl flex-col gap-1">
        <h1 className="font-bold typo-title2">Signup funnel — playground</h1>
        <p className="text-text-tertiary typo-callout">
          Step {index + 1} of {OVERVIEW_STEPS.length} — {step.label.slice(3)}
          {skipped && ' (mobile only: the real funnel skips it here)'}
        </p>
      </div>

      <div className="flex w-full max-w-4xl items-center gap-2">
        <button
          type="button"
          className="btn btn-tertiary rounded-10 border border-border-subtlest-tertiary px-3 py-1.5 typo-callout disabled:opacity-32"
          disabled={index === 0}
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
        >
          ← Back
        </button>
        <div className="flex flex-1 items-center gap-1.5">
          {OVERVIEW_STEPS.map((item, i) => (
            <button
              key={item.id}
              type="button"
              aria-label={item.label}
              onClick={() => setIndex(i)}
              className={`h-1.5 flex-1 rounded-50 transition-colors ${
                i <= index ? 'bg-text-primary' : 'bg-border-subtlest-tertiary'
              }`}
            />
          ))}
        </div>
        <button
          type="button"
          className="btn btn-tertiary rounded-10 border border-border-subtlest-tertiary px-3 py-1.5 typo-callout disabled:opacity-32"
          disabled={index === OVERVIEW_STEPS.length - 1}
          onClick={() =>
            setIndex((i) => Math.min(OVERVIEW_STEPS.length - 1, i + 1))
          }
        >
          Next →
        </button>
      </div>

      <div
        className="relative shrink-0 overflow-hidden rounded-16 border border-border-subtlest-tertiary"
        style={{ width, height }}
      >
        <iframe
          key={step.id}
          title={step.label}
          src={`/iframe.html?id=components-onboarding-signup-funnel-steps--${step.id}&viewMode=story&globals=theme:${theme}`}
          style={{ width, height, border: 0 }}
        />
      </div>
    </div>
  );
};

export const PlaygroundMobile: Story = {
  name: '★ Playground — mobile',
  render: () => <FunnelPlayground device="mobile" />,
};

export const PlaygroundDesktop: Story = {
  name: '★ Playground — desktop',
  render: () => <FunnelPlayground device="desktop" />,
};

/**
 * The aura's step-change pulse, on its own. The other playgrounds swap an
 * iframe per step, which remounts the canvas — here ONE background stays
 * mounted and only the step id changes, which is exactly what fires the swell
 * in the real funnel.
 */
export const PulsePlayground: Story = {
  name: '★ Pulse playground',
  render: ({ chrome }: StepArgs) => {
    const [index, setIndex] = React.useState(0);
    const [nonce, setNonce] = React.useState(0);
    const label = OVERVIEW_STEPS[index].label;
    const step = {
      ...baseStep,
      // Changing this id is the pulse trigger.
      id: `${OVERVIEW_STEPS[index].id}-${nonce}`,
      type: FunnelStepType.ProfileForm,
      parameters: {},
    };

    const go = (delta: number) =>
      setIndex(
        (i) => (i + delta + OVERVIEW_STEPS.length) % OVERVIEW_STEPS.length,
      );

    return (
      <FunnelStepShell chrome={chrome} step={step} stepIndex={index} fullWidth>
        <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
          <OnboardingHeadline>Watch the edges</OnboardingHeadline>
          <OnboardingSubheadline>
            On every step change the ring draws inward and brightens, as if it
            is pulling the screen into itself, then releases with a small
            overshoot. Move between steps, or re-fire it on the same step.
          </OnboardingSubheadline>
          <p className="text-text-tertiary typo-callout">
            Now showing: {label}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              className="rounded-10 border border-border-subtlest-tertiary px-3 py-1.5 typo-callout"
              onClick={() => go(-1)}
            >
              ← Previous step
            </button>
            <button
              type="button"
              className="rounded-10 border border-border-subtlest-tertiary px-3 py-1.5 typo-callout"
              onClick={() => go(1)}
            >
              Next step →
            </button>
            <button
              type="button"
              className="rounded-10 bg-text-primary px-3 py-1.5 text-surface-invert typo-callout"
              onClick={() => setNonce((n) => n + 1)}
            >
              Inhale again
            </button>
          </div>
          <p className="max-w-[27.5rem] text-text-quaternary typo-footnote">
            The engine pauses when the tab is in the background and holds a
            single static frame under prefers-reduced-motion, so keep this tab
            focused while you watch.
          </p>
        </div>
      </FunnelStepShell>
    );
  },
};

/**
 * How many cards the tag step's feed preview should show per row.
 *
 * The preview inherits its column count from the viewport, so on a wide screen
 * it asked for six columns and then divided its own narrower box by six — the
 * cards landed far under the 21.25rem (340px) they are designed at, which is
 * what crushed the titles and thumbnails. Capping the columns alone is not
 * enough either: three columns stretched across a 1999px screen makes 629px
 * cards. So each arm caps the columns AND the width that many cards need.
 *
 * View this at 1600px or wider, where the two arms actually differ: both render
 * cards at their natural 340px, and the question is only how much of the screen
 * the preview fills.
 */
const previewWidthClass: Record<number, string> = {
  // N x 340px card + (N-1) x 32px gutter + the feed's own 48px padding.
  3: 'max-w-[70.75rem]',
  4: 'max-w-[94rem]',
};

export const FeedPreviewColumns: StoryObj<{ columns: number }> = {
  name: '★ Feed preview — 3 vs 4 per row',
  parameters: {
    msw: { handlers: [...FEED_SETTINGS_HANDLERS, FEED_PREVIEW_HANDLER] },
  },
  argTypes: {
    columns: { control: { type: 'inline-radio' }, options: [3, 4] },
  },
  args: { columns: 3 },
  render: ({ columns }: { columns: number }) => {
    const step = {
      ...baseStep,
      id: 'edit-tags',
      type: FunnelStepType.EditTags,
      parameters: { headline: 'Pick tags that are relevant to you' },
    };

    return (
      <FunnelStepShell step={step} stepIndex={2} fullWidth>
        <FeedLayoutProvider maxNumCards={columns}>
          {/* Production reaches this geometry by breaking the feed out of the
              512px rail and capping it, which nets out to a centred box of the
              capped width — that is what this reproduces, without the breakout
              maths. */}
          <div
            className={classNames(
              'mx-auto w-full pt-6',
              previewWidthClass[columns],
            )}
          >
            <Feed
              className="px-6"
              feedName={OtherFeedPage.Preview}
              feedQueryKey={[RequestKey.FeedPreview, `columns-${columns}`]}
              query={PREVIEW_FEED_QUERY}
              showSearch={false}
              allowPin
            />
          </div>
        </FeedLayoutProvider>
      </FunnelStepShell>
    );
  },
};
