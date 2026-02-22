import type { ReactElement } from 'react';
import React, { useCallback, useRef, useState } from 'react';
import classNames from 'classnames';
import type { FunnelStepAIPersonalization } from '../types/funnel';
import { FunnelStepTransitionType } from '../types/funnel';
import { FunnelStepCtaWrapper } from '../shared';
import { StepHeadline } from '../shared/StepHeadline';
import { TextField } from '../../../components/fields/TextField';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { withIsActiveGuard } from '../shared/withActiveGuard';
import { GitHubIcon, MoveToIcon } from '../../../components/icons';
import { Button, ButtonVariant } from '../../../components/buttons/Button';
import { ButtonSize } from '../../../components/buttons/common';
import { IconSize } from '../../../components/Icon';

const DEMO_TAGS = [
  'Go',
  'Kubernetes',
  'AI Infrastructure',
  'FinTech',
  'Backend',
  'Distributed Systems',
];

const PLACEHOLDER_TEXT =
  'e.g., Building a fintech SaaS in Go, learning Kubernetes, curious about AI infra';

type ExtractionPhase =
  | 'idle'
  | 'highlighting'
  | 'thinking'
  | 'extracting'
  | 'done';

function ThinkingDots(): ReactElement {
  return (
    <div className="flex items-center gap-1.5 py-3">
      {[0, 1, 2].map((i) => (
        <span
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          className="size-2 animate-pulse rounded-full bg-text-tertiary"
          style={{ animationDelay: `${i * 200}ms` }}
        />
      ))}
    </div>
  );
}

function TagPill({
  label,
  index,
  visible,
  onRemove,
}: {
  label: string;
  index: number;
  visible: boolean;
  onRemove: () => void;
}): ReactElement {
  return (
    <span
      className={classNames(
        'inline-flex items-center gap-1.5 rounded-10 border border-border-subtlest-tertiary bg-surface-float px-3 py-1.5',
        'transition-all duration-500',
        visible
          ? 'translate-x-0 scale-100 opacity-100'
          : '-translate-x-4 scale-90 opacity-0',
      )}
      style={{
        transitionDelay: `${index * 200}ms`,
        transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
    >
      <Typography type={TypographyType.Callout} color={TypographyColor.Primary}>
        {label}
      </Typography>
      <button
        type="button"
        className="ml-0.5 size-4 rounded-full text-text-quaternary transition-colors hover:bg-surface-hover hover:text-text-primary"
        onClick={onRemove}
        aria-label={`Remove ${label}`}
      >
        &times;
      </button>
    </span>
  );
}

function AIPersonalizationComponent({
  onTransition,
}: FunnelStepAIPersonalization): ReactElement {
  const [inputValue, setInputValue] = useState('');
  const [phase, setPhase] = useState<ExtractionPhase>('idle');
  const [visibleTags, setVisibleTags] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagsRevealed, setTagsRevealed] = useState(false);
  const timeoutRefs = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimeouts = useCallback(() => {
    timeoutRefs.current.forEach(clearTimeout);
    timeoutRefs.current = [];
  }, []);

  const addTimeout = useCallback((fn: () => void, delay: number) => {
    const id = setTimeout(fn, delay);
    timeoutRefs.current.push(id);
    return id;
  }, []);

  const handleAnalyze = useCallback(() => {
    if (!inputValue.trim() || phase !== 'idle') {
      return;
    }

    clearTimeouts();

    // Phase 1: highlight sweep
    setPhase('highlighting');

    addTimeout(() => {
      // Phase 2: thinking dots
      setPhase('thinking');

      addTimeout(() => {
        // Phase 3: extract tags one by one
        setPhase('extracting');
        setTags(DEMO_TAGS);

        DEMO_TAGS.forEach((tag, i) => {
          addTimeout(() => {
            setVisibleTags((prev) => [...prev, tag]);

            if (i === DEMO_TAGS.length - 1) {
              addTimeout(() => {
                setPhase('done');
                setTagsRevealed(true);
              }, 400);
            }
          }, i * 200);
        });
      }, 1200);
    }, 600);
  }, [inputValue, phase, clearTimeouts, addTimeout]);

  const handleRemoveTag = useCallback((tagToRemove: string) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
    setVisibleTags((prev) => prev.filter((t) => t !== tagToRemove));
  }, []);

  const isDone = phase === 'done';

  return (
    <FunnelStepCtaWrapper
      cta={{ label: 'Continue' }}
      disabled={!isDone || tags.length === 0}
      onClick={() => onTransition({ type: FunnelStepTransitionType.Complete })}
      className={classNames(
        'transition-transform duration-300',
        isDone && tags.length > 0 && 'animate-[scale-pop_0.3s_ease-out]',
      )}
    >
      <div className="flex flex-col items-center gap-8 px-6 pt-8">
        <StepHeadline
          heading="What are you working on?"
          description="Tell us about your tech stack, projects, or what you're curious about"
        />

        {/* Input area */}
        <div className="relative w-full max-w-lg">
          <div
            className={classNames(
              'relative overflow-hidden rounded-14',
              phase === 'highlighting' &&
                'after:via-accent-cabbage-default/20 after:absolute after:inset-0 after:animate-[shimmer_0.6s_ease-out_forwards] after:bg-gradient-to-r after:from-transparent after:to-transparent',
            )}
          >
            <TextField
              className={{ container: 'w-full' }}
              inputId="ai-personalization-input"
              label="Describe your interests"
              placeholder={PLACEHOLDER_TEXT}
              value={inputValue}
              readOnly={phase !== 'idle'}
              valueChanged={setInputValue}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAnalyze();
                }
              }}
            />
          </div>

          {phase === 'idle' && inputValue.trim() && (
            <Button
              className="absolute right-2 top-1/2 -translate-y-1/2"
              icon={<MoveToIcon size={IconSize.Small} />}
              onClick={handleAnalyze}
              size={ButtonSize.Small}
              variant={ButtonVariant.Primary}
              aria-label="Analyze"
            />
          )}
        </div>

        {/* Thinking indicator */}
        {phase === 'thinking' && <ThinkingDots />}

        {/* Tags container */}
        {tags.length > 0 && (
          <div
            className={classNames(
              'flex max-w-lg flex-wrap justify-center gap-2',
              isDone && 'animate-[glow-pulse_2s_ease-in-out]',
            )}
          >
            {tags.map((tag, i) => (
              <TagPill
                key={tag}
                label={tag}
                index={i}
                visible={visibleTags.includes(tag)}
                onRemove={() => handleRemoveTag(tag)}
              />
            ))}
          </div>
        )}

        {/* Confirmation text */}
        {tagsRevealed && (
          <Typography
            className="animate-fade-in text-center"
            type={TypographyType.Body}
            color={TypographyColor.Secondary}
          >
            Your feed will be personalized with these interests
          </Typography>
        )}

        {/* GitHub alternative */}
        {phase === 'idle' && (
          <div className="flex items-center gap-2 text-text-tertiary">
            <GitHubIcon size={IconSize.Small} />
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
              className="cursor-pointer transition-colors hover:text-text-secondary"
            >
              Or connect GitHub for instant personalization
            </Typography>
          </div>
        )}
      </div>
    </FunnelStepCtaWrapper>
  );
}

export const FunnelAIPersonalization = withIsActiveGuard(
  AIPersonalizationComponent,
);
