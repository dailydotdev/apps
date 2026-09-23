import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement } from 'react';
import React from 'react';
import { fn } from 'storybook/test';
import { FunnelAcquisition } from '@dailydotdev/shared/src/features/onboarding/steps/FunnelAcquisition';
import { FunnelUserRole } from '@dailydotdev/shared/src/features/onboarding/steps/FunnelUserRole';
import { FunnelProfileForm } from '@dailydotdev/shared/src/features/onboarding/steps/FunnelProfileForm';
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
 * Two steps proposed for the signup onboarding, plus the account-details step
 * they are meant to empty out.
 *
 * 1. **How did you hear about us** — the acquisition question that today only
 *    appears as a feed card behind a `?ua=true` query param, moved to where
 *    every new user actually passes.
 * 2. **Who are you** — a role grid, and, once a role is picked, the experience
 *    question the account-details form asks. Between them they write `title`
 *    and `experienceLevel` to the profile.
 *
 * With those two on the profile, an OAuth signup (Google/GitHub, which supply
 * name, email and avatar) has nothing left for the account-details form to
 * ask, so that step can drop itself — `skipWhenComplete` on the profileForm
 * step. The last two stories show that side by side.
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

/** A GitHub signup: name, email and avatar came from the provider. */
const oauthUser = {
  name: 'Ido Shamun',
  username: 'ido',
  email: 'ido@acme.com',
  providers: ['github'],
  title: undefined,
  experienceLevel: undefined,
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

export const HearAboutUs: Story = {
  name: '1. How did you hear about us',
  argTypes: {
    ...chromeArgTypes,
    shuffle: { control: 'boolean' },
    explainer: { control: 'text' },
    skip: { control: 'text' },
  },
  args: {
    shuffle: false,
    explainer: '',
    skip: '',
  },
  beforeEach: () => bootAsUser(oauthUser),
  render: ({
    chrome,
    explainer,
    shuffle,
    skip,
  }: StepArgs & { explainer?: string; shuffle?: boolean; skip?: string }) => {
    const step = {
      ...baseStep,
      id: 'acquisition',
      type: FunnelStepType.Acquisition,
      parameters: {
        headline: 'How did you hear about us?',
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
  },
};

export const HearAboutUsTrimmed: Story = {
  name: '1b. Trimmed option set',
  parameters: {
    docs: {
      description: {
        story:
          'A campaign funnel that already knows most of the answer can cut the list down in Freyja. "Other" always stays last, whatever the order or the shuffle.',
      },
    },
  },
  beforeEach: () => bootAsUser(oauthUser),
  render: ({ chrome }: StepArgs) => {
    const step = {
      ...baseStep,
      id: 'acquisition-trimmed',
      type: FunnelStepType.Acquisition,
      parameters: {
        headline: 'Where did you find us?',
        explainer: 'It helps us stop wasting money in the wrong places.',
        options: [
          AcquisitionChannel.Friend,
          AcquisitionChannel.YouTube,
          AcquisitionChannel.SearchEngine,
          AcquisitionChannel.Other,
        ],
        shuffle: false,
        skip: 'Skip',
      },
    };

    return (
      <FunnelStepShell chrome={chrome} step={step} stepIndex={1} fullWidth>
        <FunnelAcquisition {...step} />
      </FunnelStepShell>
    );
  },
};

export const HearAboutUsAnswered: Story = {
  name: '1c. Already answered — step skips',
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
  experienceHeadline: { control: 'text' },
};

interface RoleArgs extends StepArgs {
  headline?: string;
  explainer?: string;
  experienceHeadline?: string;
}

export const WhoAreYou: Story = {
  name: '2. Who are you',
  argTypes: roleArgTypes,
  args: {
    headline: 'Who are you?',
    explainer: 'So your feed starts from the right place.',
    experienceHeadline: 'How long have you been doing this?',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Picking a role opens the experience question underneath and scrolls it into view; the roles stay on screen, so changing your mind is one tap. The CTA stays disabled until both are answered, and an engineering role drops the "I\'m not an engineer" option.',
      },
    },
  },
  beforeEach: () => bootAsUser(oauthUser),
  render: ({
    chrome,
    headline,
    explainer,
    experienceHeadline,
  }: RoleArgs): ReactElement => {
    const step = {
      ...baseStep,
      id: 'user-role',
      type: FunnelStepType.UserRole,
      parameters: {
        headline,
        explainer,
        experience: { headline: experienceHeadline },
      },
    };

    return (
      <FunnelStepShell chrome={chrome} step={step} stepIndex={2} fullWidth>
        <FunnelUserRole {...step} />
      </FunnelStepShell>
    );
  },
};

export const WhoAreYouNonTechnical: Story = {
  name: '2b. Non-technical role',
  parameters: {
    docs: {
      description: {
        story:
          'A trimmed role list, and a non-engineering role — which keeps "I\'m not an engineer" in the follow-up, exactly as the account-details dropdown offers it.',
      },
    },
  },
  beforeEach: () => bootAsUser(oauthUser),
  render: ({ chrome }: StepArgs): ReactElement => {
    const step = {
      ...baseStep,
      id: 'user-role-trimmed',
      type: FunnelStepType.UserRole,
      parameters: {
        headline: 'Who are you?',
        roles: [
          { value: 'Developer', label: 'Developer', isTechnical: true },
          { value: 'Designer', label: 'Designer' },
          { value: 'Founder', label: 'Founder' },
          { value: 'Other', label: 'Something else' },
        ],
      },
    };

    return (
      <FunnelStepShell chrome={chrome} step={step} stepIndex={2} fullWidth>
        <FunnelUserRole {...step} />
      </FunnelStepShell>
    );
  },
};

export const AccountDetailsToday: Story = {
  name: '3. Account details — today',
  parameters: {
    docs: {
      description: {
        story:
          'What a Google/GitHub signup sees now. Email, name and username arrive filled from the provider; the experience dropdown is the only thing the screen is really asking for.',
      },
    },
  },
  beforeEach: () => bootAsUser(oauthUser),
  render: ({ chrome }: StepArgs) => {
    const step = {
      ...baseStep,
      id: 'profile-form',
      type: FunnelStepType.ProfileForm,
      parameters: { headline: 'Tell us a bit about yourself' },
    };

    return (
      <FunnelStepShell chrome={chrome} step={step} stepIndex={3} fullWidth>
        <FunnelProfileForm {...step} />
      </FunnelStepShell>
    );
  },
};

export const AccountDetailsWithoutExperience: Story = {
  name: '3b. Account details — no experience dropdown',
  parameters: {
    docs: {
      description: {
        story:
          'An email signup who answered the user-role step: the form still has a username to confirm, but the experience dropdown is gone, because the role step already asked it in the words of the role they picked. `RegistrationFieldsForm` drops the field and its validation with it.',
      },
    },
  },
  beforeEach: () =>
    bootAsUser({
      ...oauthUser,
      providers: [],
      username: undefined,
      title: 'Designer',
      experienceLevel: 'NOT_ENGINEER',
    }),
  render: ({ chrome }: StepArgs) => {
    const step = {
      ...baseStep,
      id: 'profile-form-no-experience',
      type: FunnelStepType.ProfileForm,
      parameters: { headline: 'Tell us a bit about yourself' },
    };

    return (
      <FunnelStepShell chrome={chrome} step={step} stepIndex={3} fullWidth>
        <FunnelProfileForm {...step} />
      </FunnelStepShell>
    );
  },
};

export const AccountDetailsSkipped: Story = {
  name: '3c. Account details — dropped',
  parameters: {
    docs: {
      description: {
        story:
          'The same user after the role step wrote `title` and `experienceLevel`. With `skipWhenComplete` set on the profileForm step, the form has nothing left to ask and takes itself out of the funnel.',
      },
    },
  },
  beforeEach: () =>
    bootAsUser({
      ...oauthUser,
      title: 'Developer',
      experienceLevel: 'MORE_THAN_4_YEARS',
    }),
  render: ({ chrome }: StepArgs) => {
    const step = {
      ...baseStep,
      id: 'profile-form-skipped',
      type: FunnelStepType.ProfileForm,
      parameters: {
        headline: 'Tell us a bit about yourself',
        skipWhenComplete: true,
      },
    };

    return (
      <SkipReport label="profileForm">
        {(onRegisterStepToSkip) => (
          <FunnelStepShell chrome={chrome} step={step} stepIndex={3} fullWidth>
            <FunnelProfileForm
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
  { id: 'account-details-today', label: 'Account details — today' },
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
          'The three steps at three widths. They size themselves from the 440px funnel rail, the same as every other onboarding step, so the content column is identical on all three and only the space around it changes.',
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
    // Nine iframes booting at once each pull the same module graph, and a cold
    // Vite server answers that by re-running dep optimization — which
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
          "The real funnel stepper running the new steps in a device frame. Pick who is signing up, the step order, and whether account details drops itself, then click through the frame. The side panel shows each step's status, what landed on the profile, and every Freyja transition and API write as it happens.",
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
    skipWhenComplete: { control: 'boolean' },
    acquisitionSkip: { control: 'boolean' },
  },
  args: {
    scenario: 'github',
    order: 'acquisitionFirst',
    skipWhenComplete: true,
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
