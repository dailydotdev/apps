import type { ReactElement } from 'react';
import React from 'react';
import { motion } from 'framer-motion';

interface LlmQuestionCardProps {
  question: string;
  options: string[];
  onSelect: (answer: string) => void;
}

export const LlmQuestionCard = ({
  question,
  options,
  onSelect,
}: LlmQuestionCardProps): ReactElement => (
  <motion.section
    key={question}
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -12 }}
    transition={{ duration: 0.18, ease: 'easeOut' }}
    className="flex w-full max-w-[36rem] flex-col rounded-16 border border-border-subtlest-secondary bg-background-subtle p-6 laptop:p-8"
  >
    <p className="mb-3 text-text-tertiary typo-footnote">One more thing…</p>
    <h2 className="mb-6 text-center font-bold text-text-primary typo-title2">
      {question}
    </h2>
    <div className="flex flex-col gap-3">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onSelect(option)}
          className="flex items-center gap-3 rounded-12 border border-border-subtlest-tertiary bg-background-default px-4 py-3 text-left text-text-secondary transition-colors hover:border-text-tertiary hover:text-text-primary"
        >
          <span className="typo-body">{option}</span>
        </button>
      ))}
    </div>
  </motion.section>
);
