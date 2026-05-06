import type { ReactElement } from 'react';
import React from 'react';
import { motion } from 'framer-motion';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { Loader } from '@dailydotdev/shared/src/components/Loader';
import { questions } from './questions';

interface ResultPlaceholderProps {
  answers: Record<string, string>;
  onRestart: () => void;
}

const getAnswerLabel = (
  questionId: string,
  optionId: string,
): string | undefined =>
  questions[questionId]?.options.find((opt) => opt.id === optionId)?.label;

export const ResultPlaceholder = ({
  answers,
  onRestart,
}: ResultPlaceholderProps): ReactElement => {
  const recap = Object.entries(answers)
    .map(([questionId, optionId]) => ({
      prompt: questions[questionId]?.prompt,
      answer: getAnswerLabel(questionId, optionId),
    }))
    .filter((entry): entry is { prompt: string; answer: string } =>
      Boolean(entry.prompt && entry.answer),
    );

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="flex w-full max-w-[36rem] flex-col items-center gap-6 rounded-16 border border-border-subtlest-secondary bg-background-subtle p-6 laptop:p-8"
    >
      <Loader />
      <div className="flex flex-col items-center gap-2 text-center">
        <h2 className="font-bold text-text-primary typo-title2">
          Cooking up your developer persona…
        </h2>
        <p className="text-text-tertiary typo-body">
          Next, we&apos;ll ask a few sharper follow-ups based on what you
          picked.
        </p>
      </div>

      {recap.length > 0 && (
        <ul className="flex w-full flex-col gap-2">
          {recap.map(({ prompt, answer }) => (
            <li
              key={prompt}
              className="flex flex-col gap-1 rounded-12 border border-border-subtlest-tertiary bg-background-default px-4 py-3"
            >
              <span className="text-text-tertiary typo-footnote">{prompt}</span>
              <span className="text-text-primary typo-callout">{answer}</span>
            </li>
          ))}
        </ul>
      )}

      <Button
        type="button"
        variant={ButtonVariant.Secondary}
        size={ButtonSize.Medium}
        onClick={onRestart}
      >
        Start over
      </Button>
    </motion.section>
  );
};
