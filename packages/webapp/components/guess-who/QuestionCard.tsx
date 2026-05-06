import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { motion } from 'framer-motion';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons/Arrow';
import type { Question } from './questions';

interface QuestionCardProps {
  question: Question;
  selectedOptionId?: string;
  step: number;
  totalSteps: number;
  onSelect: (optionId: string) => void;
  onBack?: () => void;
}

export const QuestionCard = ({
  question,
  selectedOptionId,
  step,
  totalSteps,
  onSelect,
  onBack,
}: QuestionCardProps): ReactElement => (
  <motion.section
    key={question.id}
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -12 }}
    transition={{ duration: 0.18, ease: 'easeOut' }}
    className="flex w-full max-w-[36rem] flex-col rounded-16 border border-border-subtlest-secondary bg-background-subtle p-6 laptop:p-8"
  >
    <header className="mb-6 flex items-center gap-3">
      <p className="text-text-tertiary typo-footnote">
        Question {step} of {totalSteps}
      </p>
      <div className="flex flex-1 gap-1">
        {Array.from({ length: totalSteps }, (_, index) => index).map(
          (index) => (
            <span
              key={`step-${index}`}
              className={classNames(
                'h-1.5 flex-1 rounded-4 transition-colors',
                index < step
                  ? 'bg-brand-default'
                  : 'bg-border-subtlest-tertiary',
              )}
            />
          ),
        )}
      </div>
    </header>

    <h2 className="mb-6 text-center font-bold text-text-primary typo-title2">
      {question.prompt}
    </h2>

    <div className="flex flex-col gap-3">
      {question.options.map((option) => {
        const selected = selectedOptionId === option.id;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onSelect(option.id)}
            className={classNames(
              'flex items-center gap-3 rounded-12 border px-4 py-3 text-left transition-colors',
              selected
                ? 'border-brand-default bg-brand-float text-text-primary'
                : 'border-border-subtlest-tertiary bg-background-default text-text-secondary hover:border-text-tertiary hover:text-text-primary',
            )}
          >
            {option.emoji && (
              <span aria-hidden className="text-2xl">
                {option.emoji}
              </span>
            )}
            <span className="typo-body">{option.label}</span>
          </button>
        );
      })}
    </div>

    {onBack && (
      <div className="mt-6 flex">
        <Button
          type="button"
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Small}
          icon={<ArrowIcon className="-rotate-90" />}
          onClick={onBack}
        >
          Back
        </Button>
      </div>
    )}
  </motion.section>
);
