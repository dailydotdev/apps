import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import Markdown from '../../../components/Markdown';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { FlexCol, FlexRow } from '../../../components/utilities';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { Radio } from '../../../components/fields/Radio';
import { Switch } from '../../../components/fields/Switch';
import { Slider } from '../../../components/fields/Slider';
import { TimerIcon, VIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import type {
  CreateInterestSettings,
  InterestOutputModes,
  InterestSources,
  UserInterest,
} from '../../../graphql/interests';
import {
  UserInterestCadence,
  defaultCreateInterestSettings,
} from '../../../graphql/interests';
import { useAgentShellHeight } from '../shell';
import { transcriptProse } from '../prose';
import { composerBar, composerColumn, composerFrame } from './AgentComposer';
import { AgentSendButton } from './AgentSendButton';
import { AgentThinkingOrb } from './AgentThinkingOrb';
import { cadenceOptions, outputOptions } from './AgentSettingsFields';

type Choice = { value: string; label: string; hint?: string };

type OnboardingSettings = CreateInterestSettings & {
  sources: InterestSources;
  outputModes: InterestOutputModes;
};

type Stage =
  | 'angle'
  | 'exclude'
  | 'brief'
  | 'settingsChoice'
  | 'cadence'
  | 'fomo'
  | 'delivery'
  | 'sources'
  | 'review'
  | 'done';

type Control =
  | { kind: 'chips'; choices: Choice[]; multi?: boolean }
  | { kind: 'actions'; choices: Choice[] }
  | { kind: 'brief' }
  | { kind: 'cadence' }
  | { kind: 'fomo' }
  | { kind: 'delivery' }
  | { kind: 'sources' }
  | { kind: 'review'; fromRecent?: boolean }
  | { kind: 'done' };

type Message = {
  id: string;
  role: 'user' | 'agent';
  html?: string;
  text?: string;
  control?: Control;
  answer?: string;
  isPending?: boolean;
};

const thinkMs = 900;
const maxFieldHeight = 120;

let sequence = 0;
const nextId = (): string => {
  sequence += 1;
  return `onb-${sequence}`;
};

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const angleChoices: Choice[] = [
  { value: 'shipped', label: 'Things that actually shipped' },
  { value: 'deep', label: 'Deep dives & source code' },
  { value: 'howto', label: 'Tutorials & how-tos' },
  { value: 'opinion', label: 'Opinions & debate' },
  { value: 'all', label: 'Everything, I’ll filter' },
];

const excludeChoices: Choice[] = [
  { value: 'beginner', label: 'Beginner intros' },
  { value: 'marketing', label: 'Vendor marketing' },
  { value: 'paywalled', label: 'Paywalled' },
  { value: 'talks', label: 'Conference talks' },
  { value: 'none', label: 'Nothing, keep it wide' },
];

const settingsChoices: Choice[] = [
  {
    value: 'recent',
    label: 'Load my recent settings',
    hint: 'Same as your last agent',
  },
  {
    value: 'defaults',
    label: 'Use the defaults',
    hint: 'Whenever it matters · balanced · feed + posts + notifications',
  },
  { value: 'stepwise', label: 'Ask me one by one' },
];

const sourceOptions = [
  { key: 'dailyDev', label: 'daily.dev', disabled: false },
  { key: 'web', label: 'The web', disabled: true },
  { key: 'github', label: 'GitHub', disabled: true },
] as const;

const labelsFor = (choices: Choice[], values: string[]): string[] =>
  choices
    .filter(({ value }) => values.includes(value))
    .map(({ label }) => label);

const fomoLabel = (threshold: number): string => {
  if (threshold > 0.7) {
    return 'Only the best';
  }
  if (threshold < 0.3) {
    return 'Show me everything';
  }
  return 'Balanced';
};

const cadenceLabel = (cadence?: UserInterestCadence): string =>
  cadenceOptions.find(({ value }) => value === cadence)?.label ??
  'Whenever it matters';

const deliveryLabel = (modes?: Partial<InterestOutputModes>): string =>
  outputOptions
    .filter(({ key }) => modes?.[key])
    .map(({ short }) => short)
    .join(', ') || 'nothing';

const sourcesLabel = (sources?: Partial<InterestSources>): string =>
  sourceOptions
    .filter(({ key }) => sources?.[key])
    .map(({ label }) => label)
    .join(', ') || 'nowhere';

const buildBrief = ({
  query,
  angles,
  excludes,
}: {
  query: string;
  angles: string[];
  excludes: string[];
}): string => {
  const wants = labelsFor(angleChoices, angles).filter(
    (label) => label !== 'Everything, I’ll filter',
  );
  const skips = labelsFor(excludeChoices, excludes).filter(
    (label) => label !== 'Nothing, keep it wide',
  );
  const parts = [`Track ${query}.`];

  if (wants.length) {
    parts.push(`Prioritise ${wants.join(', ').toLowerCase()}.`);
  }
  if (skips.length) {
    parts.push(`Skip ${skips.join(', ').toLowerCase()}.`);
  }
  parts.push('Only surface what a senior engineer would stop and read.');

  return parts.join(' ');
};

const settingsFromInterest = (interest: UserInterest): OnboardingSettings => ({
  cadence: interest.cadence,
  fomoThreshold: interest.fomoThreshold,
  outputModes: interest.outputModes,
  sources: interest.sources,
});

const baseSettings: OnboardingSettings = {
  ...defaultCreateInterestSettings,
  outputModes: {
    feed: true,
    post: true,
    digest: false,
    notification: true,
    ...defaultCreateInterestSettings.outputModes,
  },
  sources: { dailyDev: true, web: false, github: false },
};

const Bubble = ({
  children,
  answered,
}: {
  children: ReactNode;
  answered?: boolean;
}): ReactElement => (
  <FlexCol
    className={classNames(
      'gap-3 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4 transition-opacity',
      answered && 'opacity-60',
    )}
  >
    {children}
  </FlexCol>
);

const Answered = ({ text }: { text: string }): ReactElement => (
  <FlexRow className="items-center gap-1.5">
    <VIcon size={IconSize.Size16} className="text-status-success" />
    <Typography type={TypographyType.Footnote} color={TypographyColor.Tertiary}>
      {text}
    </Typography>
  </FlexRow>
);

const ContinueRow = ({
  label = 'Continue',
  onClick,
  secondary,
}: {
  label?: string;
  onClick: () => void;
  secondary?: { label: string; onClick: () => void };
}): ReactElement => (
  <FlexRow className="items-center gap-2 pt-1">
    <Button
      size={ButtonSize.Small}
      variant={ButtonVariant.Primary}
      onClick={onClick}
    >
      {label}
    </Button>
    {secondary && (
      <Button
        size={ButtonSize.Small}
        variant={ButtonVariant.Tertiary}
        onClick={secondary.onClick}
      >
        {secondary.label}
      </Button>
    )}
  </FlexRow>
);

const ChipsControl = ({
  choices,
  multi,
  answer,
  selected,
  onToggle,
  onAnswer,
}: {
  choices: Choice[];
  multi?: boolean;
  answer?: string;
  selected: string[];
  onToggle: (value: string) => void;
  onAnswer: (values: string[]) => void;
}): ReactElement => {
  if (answer) {
    return <Answered text={answer} />;
  }

  const toggle = (value: string) => {
    if (!multi) {
      onAnswer([value]);
      return;
    }
    onToggle(value);
  };

  return (
    <FlexCol className="gap-3">
      <FlexRow className="flex-wrap gap-2">
        {choices.map(({ value, label }) => {
          const isOn = selected.includes(value);
          return (
            <Button
              key={value}
              size={ButtonSize.Small}
              variant={isOn ? ButtonVariant.Primary : ButtonVariant.Float}
              pressed={isOn}
              aria-pressed={isOn}
              onClick={() => toggle(value)}
            >
              {label}
            </Button>
          );
        })}
      </FlexRow>
      {multi && (
        <FlexRow className="items-center gap-3">
          <Button
            size={ButtonSize.Small}
            variant={ButtonVariant.Primary}
            disabled={!selected.length}
            onClick={() => onAnswer(selected)}
          >
            Continue
          </Button>
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Quaternary}
          >
            or type your own below · Enter to continue
          </Typography>
        </FlexRow>
      )}
    </FlexCol>
  );
};

const ActionsControl = ({
  choices,
  answer,
  onAnswer,
}: {
  choices: Choice[];
  answer?: string;
  onAnswer: (value: string) => void;
}): ReactElement => {
  if (answer) {
    return <Answered text={answer} />;
  }

  return (
    <FlexCol className="gap-2">
      {choices.map(({ value, label, hint }) => (
        <button
          key={value}
          type="button"
          className="flex w-full items-center gap-3 rounded-12 border border-border-subtlest-tertiary px-3 py-2.5 text-left transition-colors hover:bg-surface-hover"
          onClick={() => onAnswer(value)}
        >
          {value === 'recent' && (
            <TimerIcon
              size={IconSize.Size16}
              className="shrink-0 text-text-tertiary"
            />
          )}
          <FlexCol className="min-w-0 flex-1">
            <Typography type={TypographyType.Callout} bold>
              {label}
            </Typography>
            {hint && (
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Tertiary}
                className="truncate"
              >
                {hint}
              </Typography>
            )}
          </FlexCol>
        </button>
      ))}
    </FlexCol>
  );
};

const BriefControl = ({
  brief,
  answer,
  onConfirm,
  onEdit,
}: {
  brief: string;
  answer?: string;
  onConfirm: () => void;
  onEdit: () => void;
}): ReactElement => (
  <FlexCol className="gap-3">
    <blockquote className="border-l-2 border-brand-default pl-3">
      <Typography type={TypographyType.Callout} className="!leading-relaxed">
        {brief}
      </Typography>
    </blockquote>
    {answer ? (
      <Answered text={answer} />
    ) : (
      <ContinueRow
        label="Looks right"
        onClick={onConfirm}
        secondary={{ label: 'Let me edit it', onClick: onEdit }}
      />
    )}
  </FlexCol>
);

const CadenceControl = ({
  value,
  answer,
  onChange,
  onConfirm,
}: {
  value: UserInterestCadence;
  answer?: string;
  onChange: (cadence: UserInterestCadence) => void;
  onConfirm: () => void;
}): ReactElement =>
  answer ? (
    <Answered text={answer} />
  ) : (
    <FlexCol className="gap-3">
      <Radio
        name="onboarding-cadence"
        value={value}
        options={cadenceOptions}
        onChange={onChange}
      />
      <ContinueRow onClick={onConfirm} />
    </FlexCol>
  );

const FomoControl = ({
  value,
  answer,
  onChange,
  onConfirm,
}: {
  value: number;
  answer?: string;
  onChange: (threshold: number) => void;
  onConfirm: () => void;
}): ReactElement =>
  answer ? (
    <Answered text={answer} />
  ) : (
    <FlexCol className="gap-3">
      <Slider
        min={0}
        max={1}
        step={0.05}
        value={[value]}
        onValueChange={([next]) => onChange(next)}
        thumbLabel="FOMO vs quality"
      />
      <FlexRow className="justify-between">
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Tertiary}
        >
          Show me everything
        </Typography>
        <Typography type={TypographyType.Caption1} bold>
          {fomoLabel(value)}
        </Typography>
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Tertiary}
        >
          Only the best
        </Typography>
      </FlexRow>
      <ContinueRow onClick={onConfirm} />
    </FlexCol>
  );

const DeliveryControl = ({
  value,
  answer,
  onChange,
  onConfirm,
}: {
  value: InterestOutputModes;
  answer?: string;
  onChange: (modes: Partial<InterestOutputModes>) => void;
  onConfirm: () => void;
}): ReactElement =>
  answer ? (
    <Answered text={answer} />
  ) : (
    <FlexCol className="gap-3">
      {outputOptions.map(({ key, label, hint }) => (
        <FlexCol key={key} className="gap-0.5">
          <Switch
            inputId={`onboarding-output-${key}`}
            name={`onboarding-output-${key}`}
            checked={!!value[key]}
            onToggle={() => onChange({ [key]: !value[key] })}
          >
            {label}
          </Switch>
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
            className="pl-14"
          >
            {hint}
          </Typography>
        </FlexCol>
      ))}
      <ContinueRow onClick={onConfirm} />
    </FlexCol>
  );

const SourcesControl = ({
  value,
  answer,
  onChange,
  onConfirm,
}: {
  value: InterestSources;
  answer?: string;
  onChange: (sources: Partial<InterestSources>) => void;
  onConfirm: () => void;
}): ReactElement =>
  answer ? (
    <Answered text={answer} />
  ) : (
    <FlexCol className="gap-3">
      {sourceOptions.map(({ key, label, disabled }) => (
        <Switch
          key={key}
          inputId={`onboarding-source-${key}`}
          name={`onboarding-source-${key}`}
          checked={!!value[key]}
          disabled={disabled}
          onToggle={() => onChange({ [key]: !value[key] })}
        >
          {label}
          {disabled && (
            <span className="ml-2 text-text-quaternary typo-caption1">
              soon
            </span>
          )}
        </Switch>
      ))}
      <ContinueRow onClick={onConfirm} />
    </FlexCol>
  );

const ReviewControl = ({
  brief,
  settings,
  answer,
  onChange,
  onConfirm,
}: {
  brief: string;
  settings: OnboardingSettings;
  answer?: string;
  onChange: (next: Partial<OnboardingSettings>) => void;
  onConfirm: () => void;
}): ReactElement => {
  const [editing, setEditing] = useState<
    'cadence' | 'fomo' | 'delivery' | 'sources'
  >();

  const rows: {
    key: 'cadence' | 'fomo' | 'delivery' | 'sources';
    label: string;
    value: string;
  }[] = [
    {
      key: 'cadence',
      label: 'When it reports',
      value: cadenceLabel(settings.cadence),
    },
    {
      key: 'fomo',
      label: 'FOMO vs quality',
      value: fomoLabel(settings.fomoThreshold ?? 0.5),
    },
    {
      key: 'delivery',
      label: 'What it delivers',
      value: deliveryLabel(settings.outputModes),
    },
    {
      key: 'sources',
      label: 'Where it looks',
      value: sourcesLabel(settings.sources),
    },
  ];

  return (
    <FlexCol className="gap-3">
      <blockquote className="border-l-2 border-brand-default pl-3">
        <Typography type={TypographyType.Callout} className="!leading-relaxed">
          {brief}
        </Typography>
      </blockquote>
      <FlexCol className="divide-y divide-border-subtlest-tertiary rounded-12 border border-border-subtlest-tertiary">
        {rows.map(({ key, label, value }) => (
          <FlexCol key={key}>
            <FlexRow className="items-center gap-3 px-3 py-2">
              <span className="w-32 shrink-0 text-text-quaternary typo-caption1">
                {label}
              </span>
              <span className="min-w-0 flex-1 truncate text-text-primary typo-footnote">
                {value}
              </span>
              {!answer && (
                <Button
                  size={ButtonSize.XSmall}
                  variant={ButtonVariant.Tertiary}
                  onClick={() =>
                    setEditing((current) => (current === key ? undefined : key))
                  }
                >
                  {editing === key ? 'Done' : 'Change'}
                </Button>
              )}
            </FlexRow>
            {editing === key && (
              <div className="border-t border-border-subtlest-tertiary px-3 py-3">
                {key === 'cadence' && (
                  <Radio
                    name="review-cadence"
                    value={settings.cadence ?? UserInterestCadence.Auto}
                    options={cadenceOptions}
                    onChange={(cadence) => onChange({ cadence })}
                  />
                )}
                {key === 'fomo' && (
                  <Slider
                    min={0}
                    max={1}
                    step={0.05}
                    value={[settings.fomoThreshold ?? 0.5]}
                    onValueChange={([next]) =>
                      onChange({ fomoThreshold: next })
                    }
                    thumbLabel="FOMO vs quality"
                  />
                )}
                {key === 'delivery' && (
                  <FlexCol className="gap-2">
                    {outputOptions.map(({ key: mode, label: modeLabel }) => (
                      <Switch
                        key={mode}
                        inputId={`review-output-${mode}`}
                        name={`review-output-${mode}`}
                        checked={!!settings.outputModes[mode]}
                        onToggle={() =>
                          onChange({
                            outputModes: {
                              ...settings.outputModes,
                              [mode]: !settings.outputModes[mode],
                            },
                          })
                        }
                      >
                        {modeLabel}
                      </Switch>
                    ))}
                  </FlexCol>
                )}
                {key === 'sources' && (
                  <FlexCol className="gap-2">
                    {sourceOptions.map(
                      ({ key: source, label: sourceLabel, disabled }) => (
                        <Switch
                          key={source}
                          inputId={`review-source-${source}`}
                          name={`review-source-${source}`}
                          checked={!!settings.sources[source]}
                          disabled={disabled}
                          onToggle={() =>
                            onChange({
                              sources: {
                                ...settings.sources,
                                [source]: !settings.sources[source],
                              },
                            })
                          }
                        >
                          {sourceLabel}
                        </Switch>
                      ),
                    )}
                  </FlexCol>
                )}
              </div>
            )}
          </FlexCol>
        ))}
      </FlexCol>
      {answer ? (
        <Answered text={answer} />
      ) : (
        <ContinueRow label="Spawn the agent" onClick={onConfirm} />
      )}
    </FlexCol>
  );
};

const Thinking = (): ReactElement => (
  <FlexRow className="items-center gap-2" aria-live="polite">
    <span className="shrink-0 text-text-primary">
      <AgentThinkingOrb size={22} />
    </span>
    <Typography type={TypographyType.Footnote} bold>
      Thinking
    </Typography>
  </FlexRow>
);

export const AgentOnboardingScreen = ({
  query,
  recentInterest,
  isStandalone,
  onSpawn,
}: {
  query: string;
  recentInterest?: UserInterest;
  isStandalone?: boolean;
  onSpawn?: (input: { query: string; settings: OnboardingSettings }) => void;
}): ReactElement => {
  const shellHeight = useAgentShellHeight(isStandalone);
  const fieldRef = useRef<HTMLTextAreaElement>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const [stage, setStage] = useState<Stage>('angle');
  const [angles, setAngles] = useState<string[]>([]);
  const [excludes, setExcludes] = useState<string[]>([]);
  const [brief, setBrief] = useState('');
  const [settings, setSettings] = useState<OnboardingSettings>(baseSettings);
  const [draft, setDraft] = useState('');
  const [picked, setPicked] = useState<string[]>([]);
  const [messages, setMessages] = useState<Message[]>([
    { id: nextId(), role: 'user', text: query },
    {
      id: nextId(),
      role: 'agent',
      html: `<p>Got it. Before I start hunting, a couple of quick questions so we're on the same page — then I'll play the brief back to you.</p><p>First: what do you actually want out of this?</p>`,
      control: { kind: 'chips', choices: angleChoices, multi: true },
    },
  ]);

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const transcript = transcriptRef.current;
      if (transcript) {
        transcript.scrollTop = transcript.scrollHeight;
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [messages.length]);

  const isThinking = !!messages.at(-1)?.isPending;

  const resize = () => {
    const field = fieldRef.current;
    if (!field) {
      return;
    }
    field.style.height = 'auto';
    field.style.height = `${Math.min(field.scrollHeight, maxFieldHeight)}px`;
  };

  const answerCurrent = (answer: string) =>
    setMessages((current) =>
      current.map((message, index) =>
        index === current.length - 1 && message.control
          ? { ...message, answer }
          : message,
      ),
    );

  const say = (
    userText: string | undefined,
    next: Message,
    nextStage: Stage,
  ) => {
    const pendingId = nextId();
    setMessages((current) => [
      ...current,
      ...(userText
        ? [{ id: nextId(), role: 'user' as const, text: userText }]
        : []),
      { id: pendingId, role: 'agent', isPending: true },
    ]);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setMessages((current) =>
        current.map((message) =>
          message.id === pendingId ? { ...next, id: pendingId } : message,
        ),
      );
      setPicked([]);
      setStage(nextStage);
    }, thinkMs);
  };

  const askExclude = (text: string) =>
    say(
      text,
      {
        id: '',
        role: 'agent',
        html: `<p>Anything I should keep out of your way?</p>`,
        control: { kind: 'chips', choices: excludeChoices, multi: true },
      },
      'exclude',
    );

  const showBrief = (text: string | undefined, nextBrief: string) => {
    setBrief(nextBrief);
    say(
      text,
      {
        id: '',
        role: 'agent',
        html: `<p>Here's how I'd frame the brief:</p>`,
        control: { kind: 'brief' },
      },
      'brief',
    );
  };

  const askSettings = (text: string) =>
    say(
      text,
      {
        id: '',
        role: 'agent',
        html: `<p>Now, how should I run? I can reuse what you set up last time, go with the defaults, or we walk through it.</p>`,
        control: { kind: 'actions', choices: settingsChoices },
      },
      'settingsChoice',
    );

  const askCadence = (text: string) =>
    say(
      text,
      {
        id: '',
        role: 'agent',
        html: `<p>How often do you want to hear from me? <em>Whenever it matters</em> lets me keep looking on my own and only reach out when something clears your bar.</p>`,
        control: { kind: 'cadence' },
      },
      'cadence',
    );

  const askFomo = (text: string) =>
    say(
      text,
      {
        id: '',
        role: 'agent',
        html: `<p>How picky should I be? Slide left and you'll see more, including the borderline stuff. Slide right and only the very best gets through.</p>`,
        control: { kind: 'fomo' },
      },
      'fomo',
    );

  const askDelivery = (text: string) =>
    say(
      text,
      {
        id: '',
        role: 'agent',
        html: `<p>Where should what I find land?</p>`,
        control: { kind: 'delivery' },
      },
      'delivery',
    );

  const askSources = (text: string) =>
    say(
      text,
      {
        id: '',
        role: 'agent',
        html: `<p>Last one: where do I look? Web and GitHub discovery are coming next.</p>`,
        control: { kind: 'sources' },
      },
      'sources',
    );

  const showReview = (text: string, fromRecent?: boolean) =>
    say(
      text,
      {
        id: '',
        role: 'agent',
        html: fromRecent
          ? `<p>Loaded from <strong>${escapeHtml(
              recentInterest?.title ??
                recentInterest?.query ??
                'your last agent',
            )}</strong>. Here's the full picture — change anything before I start.</p>`
          : `<p>Here's the full picture. Change anything before I start.</p>`,
        control: { kind: 'review', fromRecent },
      },
      'review',
    );

  const finish = () => {
    onSpawn?.({ query: brief, settings });
    say(
      'Spawn it',
      {
        id: '',
        role: 'agent',
        html: `<p>Spawned. I'll run ${cadenceLabel(
          settings.cadence,
        ).toLowerCase()} and deliver to your ${deliveryLabel(
          settings.outputModes,
        )}. First pass is starting now — I'll only ping you when something clears your bar.</p>`,
        control: { kind: 'done' },
      },
      'done',
    );
  };

  const answerChips = (values: string[]) => {
    if (stage === 'angle') {
      const text = labelsFor(angleChoices, values).join(', ');
      answerCurrent(text);
      setAngles(values);
      askExclude(text);
      return;
    }
    const text = labelsFor(excludeChoices, values).join(', ');
    answerCurrent(text);
    setExcludes(values);
    showBrief(text, buildBrief({ query, angles, excludes: values }));
  };

  const answerSettingsChoice = (value: string) => {
    const label =
      settingsChoices.find((choice) => choice.value === value)?.label ?? value;
    answerCurrent(label);
    if (value === 'recent' && recentInterest) {
      setSettings(settingsFromInterest(recentInterest));
      showReview(label, true);
      return;
    }
    if (value === 'defaults') {
      setSettings(baseSettings);
      showReview(label);
      return;
    }
    askCadence(label);
  };

  const confirmBrief = () => {
    answerCurrent('Looks right');
    askSettings('Looks right');
  };

  const confirmCadence = () => {
    const text = cadenceLabel(settings.cadence);
    answerCurrent(text);
    askFomo(text);
  };

  const confirmFomo = () => {
    const text = fomoLabel(settings.fomoThreshold ?? 0.5);
    answerCurrent(text);
    askDelivery(text);
  };

  const confirmDelivery = () => {
    const text = deliveryLabel(settings.outputModes);
    answerCurrent(text);
    askSources(text);
  };

  const confirmSources = () => {
    const text = sourcesLabel(settings.sources);
    answerCurrent(text);
    showReview(text);
  };

  const confirmReview = () => {
    answerCurrent('Spawned');
    finish();
  };

  const advance = () => {
    if (isThinking) {
      return;
    }
    if (stage === 'angle') {
      answerChips(picked.length ? picked : ['all']);
      return;
    }
    if (stage === 'exclude') {
      answerChips(picked.length ? picked : ['none']);
      return;
    }
    if (stage === 'brief') {
      confirmBrief();
      return;
    }
    if (stage === 'settingsChoice') {
      answerSettingsChoice('stepwise');
      return;
    }
    if (stage === 'cadence') {
      confirmCadence();
      return;
    }
    if (stage === 'fomo') {
      confirmFomo();
      return;
    }
    if (stage === 'delivery') {
      confirmDelivery();
      return;
    }
    if (stage === 'sources') {
      confirmSources();
      return;
    }
    if (stage === 'review') {
      confirmReview();
    }
  };

  const submitText = () => {
    const trimmed = draft.trim();
    if (isThinking) {
      return;
    }
    if (!trimmed) {
      advance();
      return;
    }
    setDraft('');
    if (fieldRef.current) {
      fieldRef.current.style.height = 'auto';
    }

    if (stage === 'angle') {
      answerCurrent(trimmed);
      askExclude(trimmed);
      return;
    }
    if (stage === 'exclude') {
      answerCurrent(trimmed);
      showBrief(
        trimmed,
        `${buildBrief({ query, angles, excludes })} Also: ${trimmed}.`,
      );
      return;
    }
    if (stage === 'brief') {
      answerCurrent('Edited');
      showBrief(trimmed, trimmed);
      return;
    }
    if (stage === 'done') {
      say(
        trimmed,
        {
          id: '',
          role: 'agent',
          html: `<p>Noted. This surface is a mockup, so nothing actually ran.</p>`,
        },
        'done',
      );
      return;
    }

    say(
      trimmed,
      {
        id: '',
        role: 'agent',
        html: `<p>Noted — I'll fold that into the brief. Pick an option above to keep going.</p>`,
      },
      stage,
    );
  };

  const renderControl = (message: Message): ReactNode => {
    const { control, answer } = message;
    if (!control) {
      return null;
    }

    if (control.kind === 'chips') {
      return (
        <ChipsControl
          choices={control.choices}
          multi={control.multi}
          answer={answer}
          selected={picked}
          onToggle={(value) =>
            setPicked((current) =>
              current.includes(value)
                ? current.filter((item) => item !== value)
                : [...current, value],
            )
          }
          onAnswer={answerChips}
        />
      );
    }

    if (control.kind === 'actions') {
      return (
        <ActionsControl
          choices={control.choices}
          answer={answer}
          onAnswer={answerSettingsChoice}
        />
      );
    }

    if (control.kind === 'brief') {
      return (
        <BriefControl
          brief={brief}
          answer={answer}
          onConfirm={confirmBrief}
          onEdit={() => {
            setDraft(brief);
            fieldRef.current?.focus();
          }}
        />
      );
    }

    if (control.kind === 'cadence') {
      return (
        <CadenceControl
          value={settings.cadence ?? UserInterestCadence.Auto}
          answer={answer}
          onChange={(cadence) =>
            setSettings((current) => ({ ...current, cadence }))
          }
          onConfirm={confirmCadence}
        />
      );
    }

    if (control.kind === 'fomo') {
      return (
        <FomoControl
          value={settings.fomoThreshold ?? 0.5}
          answer={answer}
          onChange={(fomoThreshold) =>
            setSettings((current) => ({ ...current, fomoThreshold }))
          }
          onConfirm={confirmFomo}
        />
      );
    }

    if (control.kind === 'delivery') {
      return (
        <DeliveryControl
          value={settings.outputModes}
          answer={answer}
          onChange={(modes) =>
            setSettings((current) => ({
              ...current,
              outputModes: { ...current.outputModes, ...modes },
            }))
          }
          onConfirm={confirmDelivery}
        />
      );
    }

    if (control.kind === 'sources') {
      return (
        <SourcesControl
          value={settings.sources}
          answer={answer}
          onChange={(sources) =>
            setSettings((current) => ({
              ...current,
              sources: { ...current.sources, ...sources },
            }))
          }
          onConfirm={confirmSources}
        />
      );
    }

    if (control.kind === 'review') {
      return (
        <ReviewControl
          brief={brief}
          settings={settings}
          answer={answer}
          onChange={(next) =>
            setSettings((current) => ({ ...current, ...next }))
          }
          onConfirm={confirmReview}
        />
      );
    }

    return (
      <FlexRow className="items-center gap-2 pt-1">
        <Button size={ButtonSize.Small} variant={ButtonVariant.Primary}>
          Open the agent
        </Button>
        <Button size={ButtonSize.Small} variant={ButtonVariant.Tertiary}>
          Back to your agents
        </Button>
      </FlexRow>
    );
  };

  const placeholder = (() => {
    if (stage === 'brief') {
      return 'Rewrite the brief in your own words…';
    }
    if (stage === 'done') {
      return 'Tell it what to do next…';
    }
    return 'Or type your own answer…';
  })();

  return (
    <FlexCol className={classNames('w-full', shellHeight)}>
      <FlexRow className="h-12 shrink-0 items-center gap-2 border-b border-border-subtlest-tertiary px-3 tablet:px-4 laptop:mt-[calc(0.5rem+1px)]">
        <Typography type={TypographyType.Footnote} bold>
          New agent
        </Typography>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Quaternary}
          className="min-w-0 flex-1 truncate"
        >
          {query || 'Setting up'}
        </Typography>
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Quaternary}
        >
          Mockup
        </Typography>
      </FlexRow>

      <div className="relative min-h-0 flex-1">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-px z-1 h-8 bg-gradient-to-b from-background-default to-transparent"
        />
        <div
          ref={transcriptRef}
          className="agent-scroll h-full overflow-y-auto px-5 tablet:px-8 laptop:px-10"
        >
          <FlexCol className="mx-auto w-full max-w-[45rem] gap-6 pb-14 pt-6">
            {messages.map((message) => {
              if (message.role === 'user') {
                return (
                  <FlexCol
                    key={message.id}
                    className="agent-turn-in items-end gap-1"
                  >
                    <div className="max-w-[85%] rounded-12 rounded-br-4 bg-surface-float px-3 py-2 tablet:max-w-[30rem]">
                      <Typography
                        type={TypographyType.Callout}
                        className="!leading-normal"
                      >
                        {message.text}
                      </Typography>
                    </div>
                  </FlexCol>
                );
              }

              return (
                <FlexCol
                  key={message.id}
                  className="agent-turn-in min-w-0 gap-3"
                >
                  {message.isPending && <Thinking />}
                  {message.html && (
                    <Markdown
                      className={transcriptProse}
                      content={message.html}
                    />
                  )}
                  {message.control && (
                    <Bubble answered={!!message.answer}>
                      {renderControl(message)}
                    </Bubble>
                  )}
                </FlexCol>
              );
            })}
          </FlexCol>
        </div>
      </div>

      <div className={composerBar}>
        <FlexCol className={classNames(composerColumn, composerFrame)}>
          <FlexRow className="items-center gap-1.5">
            <textarea
              ref={fieldRef}
              id="agent-onboarding"
              name="agent-onboarding"
              rows={1}
              aria-label="Reply to the agent"
              placeholder={placeholder}
              value={draft}
              className="min-w-0 flex-1 resize-none self-center bg-transparent text-text-primary outline-none typo-callout placeholder:text-text-quaternary"
              onChange={(event) => {
                setDraft(event.target.value);
                resize();
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  submitText();
                }
              }}
            />
            <AgentSendButton
              label="Send"
              className="self-center"
              disabled={isThinking || stage === 'done'}
              onClick={submitText}
            />
          </FlexRow>
        </FlexCol>
      </div>
    </FlexCol>
  );
};
