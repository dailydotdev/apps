import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement } from 'react';
import React from 'react';
import { fn } from 'storybook/test';
import { FunnelAcquisition } from '@dailydotdev/shared/src/features/onboarding/steps/FunnelAcquisition';
import { FunnelUserRole } from '@dailydotdev/shared/src/features/onboarding/steps/FunnelUserRole';
import { FunnelStepType } from '@dailydotdev/shared/src/features/onboarding/types/funnel';
import { AcquisitionChannel } from '@dailydotdev/shared/src/graphql/users';
import { OnboardingChromeVariant } from '@dailydotdev/shared/src/lib/featureManagement';
import {
  bootAsUser,
  FunnelStepShell,
  PROFILE_HANDLERS,
} from './signupFunnel.mocks';
import type {
  PlaygroundScenario,
  PlaygroundSettings,
} from './identityPlayground';
import {
  getScenarioUser,
  PLAYGROUND_HANDLERS,
  PLAYGROUND_SCENARIOS,
  PlaygroundFrame as IdentityPlaygroundFrame,
  PlaygroundPanel,
} from './identityPlayground';

/**
 * The two identity steps a new user meets right after account details.
 *
 * 1. **How did you hear about us**: the acquisition question that otherwise
 *    only appears as a feed card behind a `?ua=true` query param, moved to
 *    where every new user passes. Writes `acquisitionChannel`.
 * 2. **Who are you**: a list of roles. The pick is saved as the profile's job
 *    `title`, except Something else, which saves nothing.
 *
 * Each step skips itself when its answer is already on the profile.
 *
 * Everything here renders the real step components; only auth, the GraphQL
 * writes and the funnel chrome are faked.
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
  title: 'Components/Onboarding/Identity steps',
  argTypes: chromeArgTypes,
  args: { chrome: OnboardingChromeVariant.Control },
  parameters: {
    layout: 'fullscreen',
    msw: { handlers: PROFILE_HANDLERS },
  },
};

export default meta;

type Story = StoryObj;

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- story fixtures
const baseStep: any = {
  isActive: true,
  transitions: [],
  onTransition: fn(),
  onRegisterStepToSkip: fn(),
};

/** A GitHub signup that just finished account details. */
const oauthUser = {
  name: 'Ido Shamun',
  username: 'ido',
  email: 'ido@acme.com',
  providers: ['github'],
  title: undefined,
  acquisitionChannel: undefined,
};

/**
 * A skipped step renders nothing, which in a story is indistinguishable from a
 * broken one. This reports what the step told the stepper.
 */
const SkipReport = ({
  children,
  label,
}: {
  children: (
    onRegisterStepToSkip: (type: FunnelStepType, shouldSkip: boolean) => void,
  ) => ReactElement;
  label: string;
}): ReactElement => {
  const [shouldSkip, setShouldSkip] = React.useState<boolean>();

  return (
    <div className="flex min-h-dvh flex-col">
      <p className="bg-surface-float px-6 py-3 text-text-tertiary typo-footnote">
        {shouldSkip === undefined
          ? `Waiting for the ${label} step to report…`
          : `The ${label} step reported shouldSkip: ${shouldSkip}${
              shouldSkip ? ' — the funnel renders the next step instead.' : ''
            }`}
      </p>
      <div className="flex flex-1 flex-col">
        {children((_, skip) => setShouldSkip(skip))}
      </div>
    </div>
  );
};

const hearAboutUsArgTypes: Meta['argTypes'] = {
  ...chromeArgTypes,
  iconStyle: {
    control: { type: 'inline-radio' },
    options: ['logo', 'tile'],
  },
  shuffle: { control: 'boolean' },
  explainer: { control: 'text' },
  skip: { control: 'text' },
};

interface HearAboutUsArgs extends StepArgs {
  iconStyle?: 'logo' | 'tile';
  explainer?: string;
  shuffle?: boolean;
  skip?: string;
}

const renderHearAboutUs = ({
  chrome,
  iconStyle,
  explainer,
  shuffle,
  skip,
}: HearAboutUsArgs) => {
  const step = {
    ...baseStep,
    id: 'acquisition',
    type: FunnelStepType.Acquisition,
    parameters: {
      headline: 'How did you hear about us?',
      iconStyle,
      explainer,
      shuffle,
      skip,
    },
  };

  return (
    <FunnelStepShell chrome={chrome} step={step} stepIndex={1} fullWidth>
      <FunnelAcquisition {...step} />
    </FunnelStepShell>
  );
};

const hearAboutUsArgs: HearAboutUsArgs = {
  iconStyle: 'logo',
  shuffle: false,
  explainer: '',
  skip: 'Skip',
};

export const HearAboutUs: Story = {
  name: '1. How did you hear about us',
  argTypes: hearAboutUsArgTypes,
  args: hearAboutUsArgs,
  beforeEach: () => bootAsUser(oauthUser),
  render: renderHearAboutUs,
};

export const HearAboutUsTiles: Story = {
  name: '1b. How did you hear about us · tile icons',
  argTypes: hearAboutUsArgTypes,
  args: { ...hearAboutUsArgs, iconStyle: 'tile' },
  parameters: {
    docs: {
      description: {
        story:
          'Every mark in the same favicon-style rounded square: the brand colour behind a white glyph, with Google on white the way its own favicon is. Set by `iconStyle: "tile"`; the other stories switch to it from the controls.',
      },
    },
  },
  beforeEach: () => bootAsUser(oauthUser),
  render: renderHearAboutUs,
};

export const HearAboutUsAnswered: Story = {
  name: '1c. Already answered, step skips',
  parameters: {
    docs: {
      description: {
        story:
          'A user who answered the feed card keeps their answer: the step reports itself skippable and renders nothing, so the funnel moves straight past it.',
      },
    },
  },
  beforeEach: () =>
    bootAsUser({ ...oauthUser, acquisitionChannel: AcquisitionChannel.Friend }),
  render: ({ chrome }: StepArgs) => {
    const step = {
      ...baseStep,
      id: 'acquisition-answered',
      type: FunnelStepType.Acquisition,
      parameters: { headline: 'How did you hear about us?' },
    };

    return (
      <SkipReport label="acquisition">
        {(onRegisterStepToSkip) => (
          <FunnelStepShell chrome={chrome} step={step} stepIndex={1} fullWidth>
            <FunnelAcquisition
              {...step}
              onRegisterStepToSkip={onRegisterStepToSkip}
            />
          </FunnelStepShell>
        )}
      </SkipReport>
    );
  },
};

const roleArgTypes: Meta['argTypes'] = {
  ...chromeArgTypes,
  headline: { control: 'text' },
  explainer: { control: 'text' },
};

interface RoleArgs extends StepArgs {
  headline?: string;
  explainer?: string;
}

export const WhoAreYou: Story = {
  name: '2. Who are you',
  argTypes: roleArgTypes,
  args: {
    headline: 'Who are you?',
    explainer: '',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Tap a role, then Continue: the same select-then-Continue rhythm as "How did you hear about us". Continue stays disabled until a role is selected. The role is saved as the profile\'s job title, except Something else, which moves on without saving anything.',
      },
    },
  },
  beforeEach: () => bootAsUser(oauthUser),
  render: ({ chrome, headline, explainer }: RoleArgs): ReactElement => {
    const step = {
      ...baseStep,
      id: 'user-role',
      type: FunnelStepType.UserRole,
      parameters: { headline, explainer },
    };

    return (
      <FunnelStepShell chrome={chrome} step={step} stepIndex={2} fullWidth>
        <FunnelUserRole {...step} />
      </FunnelStepShell>
    );
  },
};

export const WhoAreYouAnswered: Story = {
  name: '2b. Title on file, step skips',
  parameters: {
    docs: {
      description: {
        story:
          "A user who already has a job title (for example from the signup form's extra fields) keeps it: the step reports itself skippable and renders nothing, so a broader role never replaces it.",
      },
    },
  },
  beforeEach: () => bootAsUser({ ...oauthUser, title: 'Staff engineer' }),
  render: ({ chrome }: StepArgs) => {
    const step = {
      ...baseStep,
      id: 'user-role-answered',
      type: FunnelStepType.UserRole,
      parameters: { headline: 'Who are you?' },
    };

    return (
      <SkipReport label="user-role">
        {(onRegisterStepToSkip) => (
          <FunnelStepShell chrome={chrome} step={step} stepIndex={2} fullWidth>
            <FunnelUserRole
              {...step}
              onRegisterStepToSkip={onRegisterStepToSkip}
            />
          </FunnelStepShell>
        )}
      </SkipReport>
    );
  },
};

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

const MATRIX_STORIES = [
  { id: 'hear-about-us', label: 'How did you hear about us' },
  { id: 'who-are-you', label: 'Who are you' },
];

const VIEWPORTS = [
  { label: 'Mobile · 390', width: 390, height: 844, scale: 1 },
  { label: 'Tablet · 768', width: 768, height: 1024, scale: 0.7 },
  { label: 'Desktop · 1440', width: 1440, height: 900, scale: 0.45 },
];

export const ResponsiveMatrix: Story = {
  name: '★ Responsive matrix',
  parameters: {
    docs: {
      description: {
        story:
          'The two steps at three widths. They size themselves from the 440px funnel rail, the same as every other onboarding step, so the content column is identical on all three and only the space around it changes.',
      },
    },
  },
  render: () => {
    const theme = useThemeClass();
    const frames = VIEWPORTS.flatMap((viewport) =>
      MATRIX_STORIES.map((story) => ({ ...story, viewport })),
    );
    const [reloadKey, setReloadKey] = React.useState(0);
    // Mount the frames one at a time.
    //
    // Six iframes booting at once each pull the same module graph, and a cold
    // Vite server answers that by re-running dep optimization, which
    // invalidates the URLs the in-flight requests are already using. Every
    // frame then dies with "Failed to fetch dynamically imported module".
    // Staggering means the first frame warms the optimizer and the rest are
    // served from a settled graph.
    const [mounted, setMounted] = React.useState(1);
    React.useEffect(() => {
      setMounted(1);
    }, [reloadKey]);
    React.useEffect(() => {
      if (mounted >= frames.length) {
        return undefined;
      }
      const timeout = setTimeout(() => setMounted((count) => count + 1), 450);

      return () => clearTimeout(timeout);
    }, [frames.length, mounted]);

    return (
      <div className="flex h-dvh flex-col gap-6 overflow-auto bg-background-default p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="font-bold typo-title2">
              Identity steps — responsive
            </h1>
            <p className="text-text-tertiary typo-callout">
              Frames are live stories, scaled to fit. Interact with them the
              same way as the standalone pages.
            </p>
          </div>
          <button
            className="shrink-0 rounded-10 border border-border-subtlest-tertiary px-3 py-1.5 typo-callout"
            onClick={() => setReloadKey((key) => key + 1)}
            type="button"
          >
            Reload frames
          </button>
        </div>
        {VIEWPORTS.map(({ label, width, height, scale }) => (
          <section className="flex flex-col gap-2" key={label}>
            <h2 className="text-text-secondary typo-footnote">{label}</h2>
            <div className="flex gap-6 overflow-x-auto pb-4">
              {MATRIX_STORIES.map((story) => {
                const index = frames.findIndex(
                  (frame) =>
                    frame.id === story.id && frame.viewport.label === label,
                );

                return (
                  <figure
                    className="flex shrink-0 flex-col gap-2"
                    key={story.id}
                  >
                    <figcaption className="text-text-tertiary typo-footnote">
                      {story.label}
                    </figcaption>
                    <div
                      className="shrink-0 overflow-hidden"
                      style={{ width: width * scale, height: height * scale }}
                    >
                      <div
                        className="overflow-hidden rounded-16 border border-border-subtlest-tertiary"
                        style={{
                          width,
                          height,
                          transform: `scale(${scale})`,
                          transformOrigin: 'top left',
                        }}
                      >
                        {index < mounted ? (
                          <iframe
                            key={reloadKey}
                            title={`${story.label} — ${label}`}
                            src={`/iframe.html?id=components-onboarding-identity-steps--${story.id}&viewMode=story&globals=theme:${theme}`}
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
                      </div>
                    </div>
                  </figure>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    );
  },
};

export const Playground: Story = {
  name: '★ Playground',
  parameters: {
    // Also here, not only on the frame: see `isFromPlayground`.
    msw: { handlers: PLAYGROUND_HANDLERS },
    docs: {
      description: {
        story:
          "The real funnel stepper running the two steps in a device frame. Pick who is signing up and the step order, then click through the frame. The side panel shows each step's status, what landed on the profile, and every Freyja transition and API write as it happens.",
      },
    },
  },
  render: () => (
    <PlaygroundPanel frameStoryId="components-onboarding-identity-steps--playground-frame" />
  ),
};

export const PlaygroundFrame: Story = {
  name: '★ Playground · frame',
  argTypes: {
    scenario: {
      control: { type: 'select' },
      options: Object.keys(PLAYGROUND_SCENARIOS),
    },
    order: {
      control: { type: 'inline-radio' },
      options: ['acquisitionFirst', 'roleFirst'],
    },
    acquisitionSkip: { control: 'boolean' },
  },
  args: {
    scenario: 'newSignup',
    order: 'acquisitionFirst',
    acquisitionSkip: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          'The frame the playground renders, usable on its own with the controls below.',
      },
    },
    msw: { handlers: PLAYGROUND_HANDLERS },
  },
  beforeEach: ({ args }) =>
    bootAsUser(
      getScenarioUser(
        (args as PlaygroundSettings).scenario as PlaygroundScenario,
      ),
    ),
  render: (args) => (
    <IdentityPlaygroundFrame {...(args as PlaygroundSettings)} />
  ),
};
