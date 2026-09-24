import type { ComponentType, ReactElement, ReactNode } from 'react';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Provider, useAtomValue } from 'jotai';
import { graphql, http, HttpResponse } from 'msw';
import { FunnelStepper } from '@dailydotdev/shared/src/features/onboarding/shared/FunnelStepper';
import { funnelPositionAtom } from '@dailydotdev/shared/src/features/onboarding/store/funnel.store';
import { FunnelAcquisition } from '@dailydotdev/shared/src/features/onboarding/steps/FunnelAcquisition';
import { FunnelUserRole } from '@dailydotdev/shared/src/features/onboarding/steps/FunnelUserRole';
import type {
  FunnelJSON,
  FunnelStep,
} from '@dailydotdev/shared/src/features/onboarding/types/funnel';
import {
  FunnelStepTransitionType,
  FunnelStepType,
  NEXT_STEP_ID,
} from '@dailydotdev/shared/src/features/onboarding/types/funnel';
import type { FunnelSession } from '@dailydotdev/shared/src/features/onboarding/types/funnelBoot';
import { AcquisitionChannel } from '@dailydotdev/shared/src/graphql/users';
import { OnboardingChromeVariant } from '@dailydotdev/shared/src/lib/featureManagement';
import type { LoggedUser } from '@dailydotdev/shared/src/lib/user';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { defaultBootData } from '../../../mock/boot';
import ExtensionProviders from '../../extension/_providers';
import { ChromeArm, ThemeModeSync } from './signupFunnel.mocks';
import { ProposedFunnelProfileForm } from './accountDetailsProposal';

/**
 * The identity-steps playground: the real `FunnelStepper` running the proposed
 * steps in a device frame, with the controls and the live readout around it.
 *
 * The frame is a separate story rendered in an iframe, so the steps respond to
 * the frame's width (the `tablet:`/`laptop:` breakpoints read the viewport, not
 * a wrapper's width). The frame reports back over `postMessage`:
 * - every guard decision, via the stepper's own `stepComponentOverrides`
 * - every Freyja transition, by intercepting the POST the stepper makes
 * - every profile write, by intercepting the GraphQL mutations
 *
 * Two behaviours are proposals simulated here rather than shipped in shared
 * code: account details dropping itself (`accountDetailsProposal.tsx`), and
 * moving past a step that has nothing to ask on arrival (`withGuardReport`).
 */

const MESSAGE_SOURCE = 'identity-steps-playground';

type PlaygroundEvent =
  | { kind: 'step'; stepId: string }
  | { kind: 'guard'; stepId: string; shouldSkip: boolean }
  | {
      kind: 'transition';
      fromStep: string;
      toStep: string | null;
      transitionEvent: FunnelStepTransitionType;
      inputs?: Record<string, unknown>;
    }
  | { kind: 'api'; name: string; payload: Record<string, unknown> }
  | { kind: 'complete' };

const report = (event: PlaygroundEvent): void => {
  globalThis.parent?.postMessage({ source: MESSAGE_SOURCE, ...event }, '*');
};

const MOCKS_READY_URL = '/__identity-steps-playground/ready';

export const PLAYGROUND_HANDLERS = [
  http.get(MOCKS_READY_URL, () => HttpResponse.json({ ready: true })),
  graphql.mutation('AddUserAcquisitionChannel', ({ variables }) => {
    report({
      kind: 'api',
      name: 'addUserAcquisitionChannel',
      payload: variables,
    });
    return HttpResponse.json({
      data: { addUserAcquisitionChannel: { _: true } },
    });
  }),
  graphql.mutation('UpdateUserProfile', ({ variables }) => {
    report({ kind: 'api', name: 'updateUserProfile', payload: variables.data });
    return HttpResponse.json({
      data: {
        updateUserProfile: { ...defaultBootData.user, ...variables.data },
      },
    });
  }),
  graphql.query('GenerateUniqueUsername', ({ variables }) =>
    HttpResponse.json({
      data: {
        generateUniqueUsername: String(variables.name ?? 'dev')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, ''),
      },
    }),
  ),
  http.post('*/freyja/sessions/:sessionId/transition', async ({ request }) => {
    const payload = (await request.json()) as Omit<
      Extract<PlaygroundEvent, { kind: 'transition' }>,
      'kind'
    >;
    report({ kind: 'transition', ...payload });
    return new HttpResponse(null, { status: 204 });
  }),
];

type ProfileFields = Pick<
  LoggedUser,
  'username' | 'title' | 'experienceLevel' | 'acquisitionChannel'
>;

export const PLAYGROUND_SCENARIOS = {
  github: {
    label: 'New GitHub signup',
    description: 'Name, email and username came from GitHub. Nothing else.',
    expected:
      'Both questions, then account details drops itself: it has nothing left to ask.',
    profile: {} as Partial<ProfileFields>,
  },
  noUsername: {
    label: 'New signup, no username yet',
    description: 'Name and email only, so account details still has a job.',
    expected:
      'Both questions, then account details appears with no experience dropdown.',
    profile: { username: undefined } as Partial<ProfileFields>,
  },
  heardBefore: {
    label: 'Already told us how they found us',
    description: 'Answered the feed card before, so acquisitionChannel is set.',
    expected:
      '"How did you hear about us" skips itself, even as the very first step.',
    profile: {
      acquisitionChannel: AcquisitionChannel.Friend,
    } as Partial<ProfileFields>,
  },
  returning: {
    label: 'Profile already complete',
    description: 'Every answer is already on file.',
    expected: 'Every step skips; the funnel completes on arrival.',
    profile: {
      acquisitionChannel: AcquisitionChannel.Friend,
      title: 'Developer',
      experienceLevel: 'MORE_THAN_4_YEARS',
    } as Partial<ProfileFields>,
  },
} as const;

export type PlaygroundScenario = keyof typeof PLAYGROUND_SCENARIOS;
type PlaygroundOrder = 'acquisitionFirst' | 'roleFirst';

export const getScenarioUser = (
  scenario: PlaygroundScenario,
): Partial<LoggedUser> => ({
  title: undefined,
  experienceLevel: undefined,
  acquisitionChannel: undefined,
  ...PLAYGROUND_SCENARIOS[scenario].profile,
});

export interface PlaygroundSettings {
  scenario: PlaygroundScenario;
  order: PlaygroundOrder;
  skipWhenComplete: boolean;
  acquisitionSkip: boolean;
  chrome: OnboardingChromeVariant;
}

const STEP_LABELS: Record<string, string> = {
  acquisition: 'How did you hear about us',
  'user-role': 'Who are you + experience',
  'account-details': 'Account details',
};

const buildFunnel = ({
  order,
  skipWhenComplete,
  acquisitionSkip,
}: PlaygroundSettings): FunnelJSON => {
  const next = [
    { on: FunnelStepTransitionType.Complete, destination: NEXT_STEP_ID },
    { on: FunnelStepTransitionType.Skip, destination: NEXT_STEP_ID },
  ];
  const acquisition = {
    id: 'acquisition',
    type: FunnelStepType.Acquisition,
    parameters: {
      headline: 'How did you hear about us?',
      skip: acquisitionSkip ? 'Skip' : undefined,
    },
    transitions: next,
  };
  const role = {
    id: 'user-role',
    type: FunnelStepType.UserRole,
    parameters: {
      headline: 'Who are you?',
      explainer: 'So your feed starts from the right place.',
    },
    transitions: next,
  };
  const accountDetails = {
    id: 'account-details',
    type: FunnelStepType.ProfileForm,
    parameters: { headline: 'Tell us a bit about yourself', skipWhenComplete },
    transitions: next,
  };
  const steps = (order === 'roleFirst'
    ? [role, acquisition, accountDetails]
    : [acquisition, role, accountDetails]) as unknown as FunnelStep[];

  return {
    id: 'identity-steps-playground',
    version: 1,
    parameters: {},
    entryPoint: steps[0].id,
    chapters: [{ id: 'identity', steps }],
  };
};

const getFunnelStepIds = (order: PlaygroundOrder): string[] =>
  buildFunnel({ order } as PlaygroundSettings).chapters[0].steps.map(
    ({ id }) => id,
  );

// Wraps a step so its guard decision reaches the playground on its way to the
// stepper. Built once per type: a new component per render would remount the
// step and throw away its state.
//
// The stepper only reads guards when it navigates, so a step that has nothing
// to ask once it is on screen (the entry step, or one whose answer the previous
// step just saved) would render blank. The wrapper moves past it with a Skip
// transition; in production that belongs in `FunnelStepper`.
const withGuardReport = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- steps are selected by type at runtime, as the stepper does
  Step: ComponentType<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): ComponentType<any> =>
  function ReportingStep(props) {
    const { id, isActive, onRegisterStepToSkip, onTransition } = props;
    const shouldSkipRef = useRef(false);
    const wasActiveRef = useRef(false);
    const onReport = useCallback(
      (type: FunnelStepType, shouldSkip: boolean) => {
        shouldSkipRef.current = shouldSkip;
        report({ kind: 'guard', stepId: id, shouldSkip });
        onRegisterStepToSkip?.(type, shouldSkip);
      },
      [id, onRegisterStepToSkip],
    );

    useEffect(() => {
      const isArrival = isActive && !wasActiveRef.current;
      wasActiveRef.current = !!isActive;

      if (isArrival && shouldSkipRef.current) {
        onTransition({ type: FunnelStepTransitionType.Skip, details: {} });
      }
    }, [isActive, onTransition]);

    return <Step {...props} onRegisterStepToSkip={onReport} />;
  };

const STEP_OVERRIDES = {
  [FunnelStepType.Acquisition]: withGuardReport(FunnelAcquisition),
  [FunnelStepType.UserRole]: withGuardReport(FunnelUserRole),
  [FunnelStepType.ProfileForm]: withGuardReport(ProposedFunnelProfileForm),
};

const PositionReport = ({ funnel }: { funnel: FunnelJSON }): null => {
  const position = useAtomValue(funnelPositionAtom);
  const stepId = funnel.chapters[position.chapter]?.steps[position.step]?.id;

  useEffect(() => {
    if (stepId) {
      report({ kind: 'step', stepId });
    }
  }, [stepId]);

  return null;
};

const session = { id: 'playground', steps: {} } as unknown as FunnelSession;

/**
 * In a nested iframe the MSW service worker can start answering a beat after
 * the story renders, so requests the steps make on their first render would
 * slip past the mocks. Wait until a probe comes back from the mock layer — an
 * unmocked probe gets Vite's HTML fallback, which fails to parse — before
 * mounting the funnel.
 */
const useMocksReady = (): boolean => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    let timeout: ReturnType<typeof setTimeout>;
    const probe = async () => {
      try {
        const response = await fetch(MOCKS_READY_URL);
        const body = await response.json();

        if (body?.ready) {
          if (!isCancelled) {
            setIsReady(true);
          }
          return;
        }
      } catch {
        // Not mocked yet.
      }

      if (!isCancelled) {
        timeout = setTimeout(probe, 100);
      }
    };
    probe();

    return () => {
      isCancelled = true;
      clearTimeout(timeout);
    };
  }, []);

  return isReady;
};

export const PlaygroundFrame = (settings: PlaygroundSettings): ReactElement => {
  const funnel = useMemo(() => buildFunnel(settings), [settings]);
  const [isComplete, setIsComplete] = useState(false);
  const isMocksReady = useMocksReady();

  if (!isMocksReady) {
    return <div className="min-h-dvh bg-background-default" />;
  }

  return (
    <ExtensionProviders>
      <Provider>
        <ChromeArm variant={settings.chrome}>
          <ThemeModeSync>
            {isComplete ? (
              <div className="flex min-h-dvh flex-col items-center justify-center gap-2 bg-background-default p-6 text-center">
                <p className="font-bold typo-title2">Funnel complete</p>
                <p className="text-text-tertiary typo-callout">
                  The next step would be the tag picker.
                </p>
              </div>
            ) : (
              <>
                <PositionReport funnel={funnel} />
                <FunnelStepper
                  funnel={funnel}
                  session={session}
                  isOnboarding
                  stepComponentOverrides={STEP_OVERRIDES}
                  onComplete={() => {
                    report({ kind: 'complete' });
                    setIsComplete(true);
                  }}
                />
              </>
            )}
          </ThemeModeSync>
        </ChromeArm>
      </Provider>
    </ExtensionProviders>
  );
};

type StepStatus =
  | 'waiting'
  | 'onScreen'
  | 'answered'
  | 'skippedByUser'
  | 'skippedAuto'
  | 'notReached';

const STATUS_COPY: Record<StepStatus, { label: string; className: string }> = {
  waiting: { label: 'Waiting', className: 'text-text-quaternary' },
  onScreen: {
    label: 'On screen',
    className: 'text-accent-cabbage-default',
  },
  answered: { label: 'Answered', className: 'text-accent-avocado-default' },
  skippedByUser: {
    label: 'Skipped by user',
    className: 'text-accent-cheese-default',
  },
  skippedAuto: {
    label: 'Skipped · nothing to ask',
    className: 'text-accent-blueCheese-default',
  },
  notReached: { label: 'Not reached', className: 'text-text-quaternary' },
};

interface LogEntry {
  at: number;
  title: string;
  detail?: string;
}

interface FunnelReadout {
  activeStepId?: string;
  visited: string[];
  guards: Record<string, boolean>;
  transitions: Record<string, FunnelStepTransitionType>;
  writes: Partial<ProfileFields>;
  isComplete: boolean;
  log: LogEntry[];
}

const emptyReadout = (): FunnelReadout => ({
  visited: [],
  guards: {},
  transitions: {},
  writes: {},
  isComplete: false,
  log: [],
});

const formatValues = (values?: Record<string, unknown>): string | undefined => {
  const entries = Object.entries(values ?? {}).filter(
    ([, value]) => value !== undefined,
  );

  return entries.length
    ? entries.map(([key, value]) => `${key}: ${String(value)}`).join(' · ')
    : undefined;
};

const applyEvent = (
  readout: FunnelReadout,
  event: PlaygroundEvent,
  at: number,
): FunnelReadout => {
  const log = (title: string, detail?: string) => [
    ...readout.log,
    { at, title, detail },
  ];

  switch (event.kind) {
    case 'step':
      return {
        ...readout,
        activeStepId: event.stepId,
        visited: readout.visited.includes(event.stepId)
          ? readout.visited
          : [...readout.visited, event.stepId],
      };
    case 'guard':
      if (readout.guards[event.stepId] === event.shouldSkip) {
        return readout;
      }

      return {
        ...readout,
        guards: { ...readout.guards, [event.stepId]: event.shouldSkip },
        log: event.shouldSkip
          ? log(
              `${STEP_LABELS[event.stepId]} has nothing to ask`,
              'Its guard reported shouldSkip: true',
            )
          : readout.log,
      };
    case 'transition':
      return {
        ...readout,
        transitions: {
          ...readout.transitions,
          [event.fromStep]: event.transitionEvent,
        },
        log: log(
          `Freyja transition · ${event.fromStep} → ${event.toStep ?? 'finish'}`,
          [event.transitionEvent, formatValues(event.inputs)]
            .filter(Boolean)
            .join(' · '),
        ),
      };
    case 'api':
      return {
        ...readout,
        writes: { ...readout.writes, ...event.payload },
        log: log(`API · ${event.name}`, formatValues(event.payload)),
      };
    case 'complete':
      return {
        ...readout,
        isComplete: true,
        activeStepId: undefined,
        log: log('Funnel complete'),
      };
    default:
      return readout;
  }
};

const getStatus = (
  stepId: string,
  stepIds: string[],
  readout: FunnelReadout,
): StepStatus => {
  const transition = readout.transitions[stepId];
  const isSkipped = !!readout.guards[stepId];

  if (transition) {
    if (isSkipped) {
      return 'skippedAuto';
    }

    return transition === FunnelStepTransitionType.Skip
      ? 'skippedByUser'
      : 'answered';
  }

  if (readout.activeStepId === stepId) {
    return isSkipped ? 'skippedAuto' : 'onScreen';
  }

  const index = stepIds.indexOf(stepId);
  const isPassed =
    readout.isComplete ||
    readout.visited.some((visited) => stepIds.indexOf(visited) > index);

  if (!isPassed) {
    return 'waiting';
  }

  return isSkipped ? 'skippedAuto' : 'notReached';
};

const DEVICES = {
  mobile: { label: 'Mobile', width: 390, height: 844, scale: 0.8 },
  tablet: { label: 'Tablet', width: 768, height: 1024, scale: 0.62 },
  desktop: { label: 'Desktop', width: 1440, height: 900, scale: 0.46 },
} as const;

type Device = keyof typeof DEVICES;

const Section = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}): ReactElement => (
  <section className="flex flex-col gap-2">
    <h2 className="font-bold uppercase text-text-quaternary typo-caption1">
      {title}
    </h2>
    {children}
  </section>
);

const Segmented = <Value extends string>({
  options,
  value,
  onChange,
}: {
  options: Array<{ value: Value; label: string }>;
  value: Value;
  onChange: (value: Value) => void;
}): ReactElement => (
  <div className="flex flex-wrap gap-1">
    {options.map((option) => (
      <Button
        key={option.value}
        onClick={() => onChange(option.value)}
        size={ButtonSize.Small}
        type="button"
        variant={
          option.value === value ? ButtonVariant.Primary : ButtonVariant.Float
        }
      >
        {option.label}
      </Button>
    ))}
  </div>
);

const useToolbarTheme = (): 'dark' | 'light' => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const read = () =>
      setTheme(
        document.documentElement.classList.contains('light') ? 'light' : 'dark',
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

const toArgs = (settings: PlaygroundSettings): string =>
  Object.entries(settings)
    .map(([key, value]) =>
      typeof value === 'boolean' ? `${key}:!${value}` : `${key}:${value}`,
    )
    .join(';');

const PROFILE_FIELDS: Array<keyof ProfileFields> = [
  'acquisitionChannel',
  'title',
  'experienceLevel',
  'username',
];

export const PlaygroundPanel = ({
  frameStoryId,
}: {
  frameStoryId: string;
}): ReactElement => {
  const toolbarTheme = useToolbarTheme();
  const [theme, setTheme] = useState<'dark' | 'light'>();
  const [device, setDevice] = useState<Device>('mobile');
  const [settings, setSettings] = useState<PlaygroundSettings>({
    scenario: 'github',
    order: 'acquisitionFirst',
    skipWhenComplete: true,
    acquisitionSkip: false,
    chrome: OnboardingChromeVariant.Control,
  });
  const [runId, setRunId] = useState(0);
  const [readout, setReadout] = useState<FunnelReadout>(emptyReadout);
  const startedAtRef = useRef(Date.now());
  const frameRef = useRef<HTMLIFrameElement>(null);
  const activeTheme = theme ?? toolbarTheme;
  const frame = DEVICES[device];
  const stepIds = getFunnelStepIds(settings.order);
  const scenario = PLAYGROUND_SCENARIOS[settings.scenario];
  const startingProfile = {
    username: 'ido',
    ...getScenarioUser(settings.scenario),
  } as Partial<ProfileFields>;
  const runKey = `${toArgs(settings)}|${activeTheme}|${device}|${runId}`;

  const update = <Key extends keyof PlaygroundSettings>(
    key: Key,
    value: PlaygroundSettings[Key],
  ) => setSettings((current) => ({ ...current, [key]: value }));

  useEffect(() => {
    setReadout(emptyReadout());
    startedAtRef.current = Date.now();
  }, [runKey]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      // MSW's worker answers a nested frame's requests from the top-level page
      // when the frame's own client is not active yet, so API and transition
      // reports can come from this window as well as from the frame.
      const isFromPlayground =
        event.source === frameRef.current?.contentWindow ||
        event.source === globalThis.window;

      if (!isFromPlayground || event.data?.source !== MESSAGE_SOURCE) {
        return;
      }

      const at = Date.now() - startedAtRef.current;
      setReadout((current) => applyEvent(current, event.data, at));
    };

    globalThis.addEventListener('message', onMessage);

    return () => globalThis.removeEventListener('message', onMessage);
  }, []);

  const src = `/iframe.html?id=${frameStoryId}&viewMode=story&args=${toArgs(
    settings,
  )}&globals=theme:${activeTheme}`;

  return (
    <div className="flex min-h-dvh flex-col gap-6 bg-background-default p-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-bold typo-title2">Identity steps · playground</h1>
          <p className="text-text-tertiary typo-callout">
            The real funnel stepper running the new steps. Pick who is signing
            up, click through the frame, and watch what the funnel decides and
            what it writes.
          </p>
        </div>
        <Button
          onClick={() => setRunId((id) => id + 1)}
          size={ButtonSize.Small}
          type="button"
          variant={ButtonVariant.Secondary}
        >
          Restart run
        </Button>
      </header>

      <div className="flex flex-wrap items-start gap-6">
        <aside className="flex flex-col gap-6" style={{ width: '18rem' }}>
          <Section title="Who is signing up">
            <div className="flex flex-col gap-2">
              {(
                Object.entries(PLAYGROUND_SCENARIOS) as Array<
                  [PlaygroundScenario, (typeof PLAYGROUND_SCENARIOS)['github']]
                >
              ).map(([key, option]) => {
                const isSelected = key === settings.scenario;

                return (
                  <button
                    className={`flex flex-col gap-0.5 rounded-12 border p-3 text-left ${
                      isSelected
                        ? 'border-accent-cabbage-default bg-surface-float'
                        : 'border-border-subtlest-tertiary'
                    }`}
                    key={key}
                    onClick={() => update('scenario', key)}
                    type="button"
                  >
                    <span className="font-bold typo-callout">
                      {option.label}
                    </span>
                    <span className="text-text-tertiary typo-footnote">
                      {option.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </Section>

          <Section title="Step order">
            <Segmented
              onChange={(value) => update('order', value)}
              options={[
                { value: 'acquisitionFirst', label: 'Heard about us first' },
                { value: 'roleFirst', label: 'Who are you first' },
              ]}
              value={settings.order}
            />
          </Section>

          <Section title="Account details">
            <Segmented
              onChange={(value) => update('skipWhenComplete', value === 'on')}
              options={[
                { value: 'on', label: 'Drop when complete' },
                { value: 'off', label: 'Always show (today)' },
              ]}
              value={settings.skipWhenComplete ? 'on' : 'off'}
            />
          </Section>

          <Section title="How did you hear about us">
            <Segmented
              onChange={(value) => update('acquisitionSkip', value === 'on')}
              options={[
                { value: 'off', label: 'Required' },
                { value: 'on', label: 'Skippable' },
              ]}
              value={settings.acquisitionSkip ? 'on' : 'off'}
            />
          </Section>

          <Section title="Device">
            <Segmented
              onChange={setDevice}
              options={(Object.keys(DEVICES) as Device[]).map((key) => ({
                value: key,
                label: DEVICES[key].label,
              }))}
              value={device}
            />
          </Section>

          <Section title="Theme">
            <Segmented
              onChange={setTheme}
              options={[
                { value: 'dark', label: 'Dark' },
                { value: 'light', label: 'Light' },
              ]}
              value={activeTheme}
            />
          </Section>

          <Section title="Onboarding chrome experiment">
            <Segmented
              onChange={(value) => update('chrome', value)}
              options={[
                { value: OnboardingChromeVariant.Control, label: 'Control' },
                { value: OnboardingChromeVariant.Aura, label: 'Aura' },
              ]}
              value={settings.chrome}
            />
          </Section>
        </aside>

        <div className="flex flex-col gap-2">
          <p className="text-text-tertiary typo-footnote">
            {frame.label} · {frame.width}×{frame.height} · live, click through
            it
          </p>
          <div
            className="shrink-0 overflow-hidden rounded-16 border border-border-subtlest-tertiary"
            style={{
              width: frame.width * frame.scale,
              height: frame.height * frame.scale,
            }}
          >
            <iframe
              key={runKey}
              ref={frameRef}
              src={src}
              style={{
                width: frame.width,
                height: frame.height,
                border: 0,
                transform: `scale(${frame.scale})`,
                transformOrigin: 'top left',
              }}
              title="Identity steps funnel"
            />
          </div>
        </div>

        <aside
          className="flex flex-1 flex-col gap-6"
          style={{ minWidth: '18rem', maxWidth: '26rem' }}
        >
          <Section title="Expected">
            <p className="text-text-secondary typo-callout">
              {scenario.expected}
            </p>
          </Section>

          <Section title="Steps">
            <ol className="flex flex-col gap-1">
              {stepIds.map((stepId, index) => {
                const status = STATUS_COPY[getStatus(stepId, stepIds, readout)];

                return (
                  <li
                    className="flex items-center justify-between gap-3 rounded-10 bg-surface-float px-3 py-2"
                    key={stepId}
                  >
                    <span className="typo-callout">
                      {index + 1}. {STEP_LABELS[stepId]}
                    </span>
                    <span
                      className={`shrink-0 typo-footnote ${status.className}`}
                    >
                      {status.label}
                    </span>
                  </li>
                );
              })}
              <li className="flex items-center justify-between gap-3 rounded-10 px-3 py-2">
                <span className="text-text-tertiary typo-callout">
                  Tag picker
                </span>
                <span
                  className={`typo-footnote ${
                    readout.isComplete
                      ? 'text-accent-avocado-default'
                      : 'text-text-quaternary'
                  }`}
                >
                  {readout.isComplete ? 'Next up' : 'Waiting'}
                </span>
              </li>
            </ol>
          </Section>

          <Section title="Profile">
            <table className="w-full typo-footnote">
              <thead>
                <tr className="text-left text-text-quaternary">
                  <th className="pb-1 font-normal">Field</th>
                  <th className="pb-1 font-normal">Before</th>
                  <th className="pb-1 font-normal">Written</th>
                </tr>
              </thead>
              <tbody>
                {PROFILE_FIELDS.map((field) => {
                  const written = readout.writes[field];

                  return (
                    <tr key={field}>
                      <td className="py-1 pr-2 text-text-tertiary">{field}</td>
                      <td className="py-1 pr-2">
                        {startingProfile[field] ?? '—'}
                      </td>
                      <td
                        className={`py-1 ${
                          written ? 'font-bold text-accent-avocado-default' : ''
                        }`}
                      >
                        {written ?? '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Section>

          <Section title="Event log">
            <ol className="flex flex-col gap-2">
              {readout.log.length === 0 && (
                <li className="text-text-quaternary typo-footnote">
                  Nothing yet. Interact with the frame.
                </li>
              )}
              {readout.log.map((entry, index) => (
                <li
                  className="flex flex-col border-l-2 border-border-subtlest-tertiary pl-3"
                  // eslint-disable-next-line react/no-array-index-key -- append-only log
                  key={index}
                >
                  <span className="typo-footnote">
                    <span className="tabular-nums text-text-quaternary">
                      {(entry.at / 1000).toFixed(1)}s{' '}
                    </span>
                    {entry.title}
                  </span>
                  {entry.detail && (
                    <span className="break-words text-text-tertiary typo-caption1">
                      {entry.detail}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </Section>
        </aside>
      </div>
    </div>
  );
};
