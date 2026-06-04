import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { FunnelStepPersonaQuiz } from '../types/funnel';
import { FunnelStepTransitionType } from '../types/funnel';
import { withIsActiveGuard } from '../shared/withActiveGuard';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { ColorName as ButtonColor } from '../../../styles/colors';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { usePersonaQuiz } from './persona/usePersonaQuiz';
import type { DeveloperPersona } from './persona/data';

// Placeholder until the Patchy mascot creative is ready.
const MASCOT_EMOJI = '🧞';

type PersonaCardSize = 'medium' | 'small';

interface PersonaCardProps {
  persona: DeveloperPersona;
  onSelect: (personaId: string) => void;
  size?: PersonaCardSize;
}

const PersonaCard = ({
  persona,
  onSelect,
  size = 'medium',
}: PersonaCardProps): ReactElement => (
  <button
    key={persona.id}
    type="button"
    onClick={() => onSelect(persona.id)}
    className="flex flex-col items-center gap-2 rounded-16 border-2 border-border-subtlest-tertiary bg-surface-float p-6 text-center transition-all hover:-translate-y-1 hover:border-accent-cabbage-default tablet:p-8"
  >
    <span
      className={
        size === 'small' ? 'text-4xl leading-none' : 'text-5xl leading-none'
      }
      style={{ color: persona.color }}
    >
      {persona.emoji}
    </span>
    <Typography
      type={size === 'small' ? TypographyType.Body : TypographyType.Title3}
      bold
    >
      {persona.name}
    </Typography>
    <Typography
      type={TypographyType.Footnote}
      color={TypographyColor.Secondary}
    >
      {persona.tagline}
    </Typography>
  </button>
);

function FunnelPersonaQuizComponent({
  parameters: { headline, explainer, cta },
  onTransition,
}: FunnelStepPersonaQuiz): ReactElement {
  const {
    phase,
    questionText,
    isThinking,
    tiebreakPersonas,
    triplebreakPersonas,
    modifiers,
    selectedModifierIds,
    personas,
    result,
    isManual,
    questionsAnswered,
    start,
    answer,
    chooseTiebreak,
    pickManually,
    selectPersona,
    toggleModifier,
    confirmModifiers,
  } = usePersonaQuiz();

  const handleComplete = () => {
    onTransition({
      type: FunnelStepTransitionType.Complete,
      details: {
        persona: result?.persona.id,
        modifiers: result?.modifiers ?? [],
        confidence: isManual ? undefined : result?.confidence,
        questions: questionsAnswered,
        manual: isManual,
      },
    });
  };

  if (phase === 'intro') {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-10 text-center">
        <span
          className="text-[6rem] leading-none"
          style={{ filter: 'drop-shadow(0 0 40px rgba(192,132,252,.45))' }}
        >
          {MASCOT_EMOJI}
        </span>
        <div className="flex max-w-3xl flex-col gap-4">
          <Typography
            tag={TypographyTag.H1}
            type={TypographyType.LargeTitle}
            bold
          >
            {headline || 'Let Patchy guess what kind of dev you are'}
          </Typography>
          <Typography
            type={TypographyType.Body}
            color={TypographyColor.Secondary}
          >
            {explainer ||
              'A few quick yes/no questions. Patchy handles the rest.'}
          </Typography>
        </div>
        <div className="flex flex-col items-center gap-3">
          <Button
            variant={ButtonVariant.Primary}
            size={ButtonSize.XLarge}
            onClick={start}
            type="button"
          >
            {cta || 'Game on!'}
          </Button>
          <Button
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Medium}
            onClick={pickManually}
            type="button"
          >
            Nah, I&apos;ll pick myself
          </Button>
        </div>
      </div>
    );
  }

  if (phase === 'picker') {
    return (
      <div className="flex flex-1 flex-col items-center gap-6 px-6 py-10 text-center">
        <Typography tag={TypographyTag.H2} type={TypographyType.Title1} bold>
          Who are you, really?
        </Typography>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Secondary}
        >
          Pick your type. Patchy will pretend it knew all along.
        </Typography>
        <div className="flex w-full max-w-xl flex-col gap-2">
          {personas.map((persona) => (
            <button
              key={persona.id}
              type="button"
              onClick={() => selectPersona(persona.id)}
              className="flex w-full items-center gap-4 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4 text-left transition-colors hover:border-accent-cabbage-default"
            >
              <span
                className="shrink-0 text-4xl leading-none"
                style={{ color: persona.color }}
              >
                {persona.emoji}
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <Typography type={TypographyType.Body} bold>
                  {persona.name}
                </Typography>
                <Typography
                  type={TypographyType.Footnote}
                  color={TypographyColor.Secondary}
                >
                  {persona.tagline}
                </Typography>
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (phase === 'tiebreak') {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-10 text-center">
        <span className="text-6xl leading-none">{MASCOT_EMOJI}</span>
        <Typography tag={TypographyTag.H2} type={TypographyType.Title1} bold>
          I&apos;m torn between these two.
        </Typography>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Secondary}
        >
          Which one feels more like you?
        </Typography>
        <div className="grid w-full max-w-2xl grid-cols-1 gap-4 tablet:grid-cols-2">
          {tiebreakPersonas.map((persona) => (
            <PersonaCard
              key={persona.id}
              persona={persona}
              onSelect={chooseTiebreak}
            />
          ))}
        </div>
      </div>
    );
  }

  if (phase === 'triplebreak') {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-10 text-center">
        <span className="text-6xl leading-none">{MASCOT_EMOJI}</span>
        <Typography tag={TypographyTag.H2} type={TypographyType.Title1} bold>
          You&apos;re a tough one. Could be any of these three.
        </Typography>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Secondary}
        >
          Pick the one that fits best.
        </Typography>
        <div className="grid w-full max-w-3xl grid-cols-1 gap-4 tablet:grid-cols-3">
          {triplebreakPersonas.map((persona) => (
            <PersonaCard
              key={persona.id}
              persona={persona}
              onSelect={chooseTiebreak}
              size="small"
            />
          ))}
        </div>
        <Button
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Medium}
          onClick={pickManually}
          type="button"
        >
          None of these. Let me pick.
        </Button>
      </div>
    );
  }

  if (phase === 'modifiers' && result) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-10 text-center">
        <span className="text-6xl leading-none">{MASCOT_EMOJI}</span>
        <Typography tag={TypographyTag.H2} type={TypographyType.Title1} bold>
          One more thing.
        </Typography>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Secondary}
          className="max-w-md"
        >
          Tick any of these that describe you. They tune your feed beyond
          your persona.
        </Typography>
        <div className="flex w-full max-w-xl flex-col gap-3">
          {modifiers.map((modifier) => {
            const checked = selectedModifierIds.includes(modifier.id);
            return (
              <button
                key={modifier.id}
                type="button"
                role="checkbox"
                aria-checked={checked}
                onClick={() => toggleModifier(modifier.id)}
                className={classNames(
                  'flex w-full items-center gap-4 rounded-16 border-2 p-4 text-left transition-colors',
                  checked
                    ? 'border-accent-cabbage-default bg-surface-float'
                    : 'border-border-subtlest-tertiary bg-surface-float hover:border-text-quaternary',
                )}
              >
                <span className="shrink-0 text-4xl leading-none">
                  {modifier.emoji}
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <Typography type={TypographyType.Body} bold>
                    {modifier.label}
                  </Typography>
                  <Typography
                    type={TypographyType.Footnote}
                    color={TypographyColor.Secondary}
                  >
                    {modifier.description}
                  </Typography>
                </span>
                <span
                  className={classNames(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-6 border-2 text-sm font-bold',
                    checked
                      ? 'border-accent-cabbage-default bg-accent-cabbage-default text-text-primary'
                      : 'border-border-subtlest-tertiary',
                  )}
                  aria-hidden
                >
                  {checked ? '✓' : ''}
                </span>
              </button>
            );
          })}
        </div>
        <Button
          variant={ButtonVariant.Primary}
          size={ButtonSize.XLarge}
          onClick={confirmModifiers}
          type="button"
        >
          {selectedModifierIds.length === 0 ? 'None of these — continue' : 'Continue →'}
        </Button>
      </div>
    );
  }

  if (phase === 'reveal' && result) {
    const { persona, modifiers: selectedIds } = result;
    const appliedModifiers = modifiers.filter((m) =>
      selectedIds.includes(m.id),
    );
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-10 text-center">
        <span
          className="text-[6rem] leading-none"
          style={{
            color: persona.color,
            filter: `drop-shadow(0 0 60px ${persona.color})`,
          }}
        >
          {persona.emoji}
        </span>
        <Typography
          tag={TypographyTag.H1}
          type={TypographyType.LargeTitle}
          bold
          style={{ color: persona.color }}
        >
          {persona.name}
        </Typography>
        <Typography
          type={TypographyType.Body}
          color={TypographyColor.Secondary}
          className="max-w-md"
        >
          {persona.tagline}
        </Typography>
        {appliedModifiers.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2">
            {appliedModifiers.map((modifier) => (
              <span
                key={modifier.id}
                className="flex items-center gap-1 rounded-full border border-border-subtlest-tertiary bg-surface-float px-3 py-1 text-sm"
              >
                <span aria-hidden>{modifier.emoji}</span>
                <Typography type={TypographyType.Footnote}>
                  {modifier.label}
                </Typography>
              </span>
            ))}
          </div>
        )}
        <div className="mt-2 flex flex-col items-center gap-3">
          <Button
            variant={ButtonVariant.Primary}
            size={ButtonSize.XLarge}
            onClick={handleComplete}
            type="button"
          >
            {cta || "Yes, that's me!"}
          </Button>
          <Button
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Medium}
            onClick={pickManually}
            type="button"
          >
            Nah, I&apos;ll pick myself
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-1 flex-col items-center justify-center gap-10 px-6 py-10 text-center">
      <span
        className="pointer-events-none absolute left-6 top-1/2 hidden -translate-y-1/2 text-[12rem] leading-none laptop:block"
        style={{ filter: 'drop-shadow(0 0 50px rgba(192,132,252,.45))' }}
      >
        {MASCOT_EMOJI}
      </span>
      <div className="flex w-full max-w-xl flex-col gap-8">
        <Typography
          tag={TypographyTag.H2}
          type={TypographyType.LargeTitle}
          bold
        >
          {questionText}
        </Typography>
        <div className="mx-auto flex w-full max-w-xs flex-col gap-3">
          <Button
            className="w-full"
            variant={ButtonVariant.Primary}
            color={ButtonColor.Avocado}
            size={ButtonSize.Large}
            type="button"
            disabled={isThinking}
            onClick={() => answer(1)}
          >
            Yes
          </Button>
          <Button
            className="w-full"
            variant={ButtonVariant.Secondary}
            size={ButtonSize.Large}
            type="button"
            disabled={isThinking}
            onClick={() => answer(0.5)}
          >
            Not sure
          </Button>
          <Button
            className="w-full"
            variant={ButtonVariant.Primary}
            color={ButtonColor.Ketchup}
            size={ButtonSize.Large}
            type="button"
            disabled={isThinking}
            onClick={() => answer(0)}
          >
            No
          </Button>
        </div>
      </div>
    </div>
  );
}

export const FunnelPersonaQuiz = withIsActiveGuard(FunnelPersonaQuizComponent);
