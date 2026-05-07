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

interface ThemedQuestionProps {
  question: Question;
  selectedOptionId?: string;
  step: number;
  totalSteps: number;
  onSelect: (optionId: string) => void;
  onBack?: () => void;
}

export const ThemedQuestion = ({
  question,
  selectedOptionId,
  step,
  totalSteps,
  onSelect,
  onBack,
}: ThemedQuestionProps): ReactElement => (
  <motion.section
    key={question.id}
    initial={{ opacity: 0, x: 24 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -24 }}
    transition={{ duration: 0.22, ease: 'easeOut' }}
    className="djinn-question z-10 relative flex w-full flex-col"
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
                'djinn-progress-tick h-1.5 flex-1 rounded-4 transition-colors',
                index < step && 'djinn-progress-tick--active',
              )}
            />
          ),
        )}
      </div>
    </header>

    <h2 className="mb-6 font-bold text-text-primary typo-title2">
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
              'djinn-option flex items-center gap-3 rounded-12 px-4 py-3 text-left',
              selected && 'djinn-option--selected',
            )}
          >
            {option.emoji && (
              <span aria-hidden className="text-2xl">
                {option.emoji}
              </span>
            )}
            <span className="text-text-primary typo-body">{option.label}</span>
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
