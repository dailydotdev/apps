import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type {
  PersonaQuizOption,
  PersonaQuizQuestion,
} from '../../types/funnel';
import { Image } from '../../../../components/image/Image';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../../components/typography/Typography';

interface PersonaQuizQuestionProps {
  question: PersonaQuizQuestion;
  step: number;
  totalSteps: number;
  onSelect: (option: PersonaQuizOption) => void;
}

export const PersonaQuizQuestionView = ({
  question,
  step,
  totalSteps,
  onSelect,
}: PersonaQuizQuestionProps): ReactElement => (
  <div
    className={classNames(
      'flex w-full flex-1 flex-col gap-6 px-4 py-6 tablet:mx-auto laptop:gap-8',
      question.cols === 3 ? 'tablet:max-w-lg' : 'tablet:max-w-md',
    )}
  >
    <header className="flex flex-col gap-2">
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
      >
        {`Question ${step} of ${totalSteps}`}
      </Typography>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-border-subtlest-tertiary">
        <div
          className="h-full rounded-full bg-gradient-to-r from-accent-bacon-default to-accent-cabbage-default transition-all duration-500"
          style={{ width: `${Math.min(100, (step / totalSteps) * 100)}%` }}
        />
      </div>
    </header>

    <div className="relative overflow-hidden rounded-24 border border-border-subtlest-tertiary bg-surface-float p-6 backdrop-blur tablet:p-8">
      <div className="mb-4 flex items-center justify-center gap-2">
        <span aria-hidden className="text-2xl">
          🧞
        </span>
        <Typography
          type={TypographyType.Footnote}
          className="uppercase tracking-wider text-accent-cabbage-default"
        >
          Picturing you…
        </Typography>
      </div>

      <Typography
        tag={TypographyTag.H2}
        type={TypographyType.Title1}
        color={TypographyColor.Primary}
        bold
        className="text-center"
      >
        {question.prompt}
      </Typography>

      {question.imageUrl && (
        <div className="mt-6 grid place-items-center">
          <Image
            alt="Question additional context"
            aria-hidden
            className="mx-auto w-full max-w-md object-contain object-center"
            role="presentation"
            src={question.imageUrl}
          />
        </div>
      )}

      <div
        className={classNames('mt-7 grid gap-3', {
          'grid-cols-1': !question.cols || question.cols === 1,
          'grid-cols-2': question.cols === 2,
          'grid-cols-3': question.cols === 3,
        })}
      >
        {question.options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onSelect(option)}
            className={classNames(
              'hover:bg-accent-cabbage-default/10 flex min-w-0 gap-2 rounded-12 border border-border-subtlest-tertiary bg-background-default text-text-secondary transition-all hover:-translate-y-0.5 hover:border-accent-cabbage-default hover:text-text-primary',
              question.cols === 3
                ? 'flex-col items-center px-2 py-2.5 text-center'
                : 'items-center gap-3 px-4 py-3 text-left',
            )}
          >
            {option.emoji && (
              <span
                aria-hidden
                className={classNames(
                  'shrink-0 leading-none',
                  question.cols === 3 ? 'text-xl' : 'text-2xl',
                )}
              >
                {option.emoji}
              </span>
            )}
            <Typography
              type={
                question.cols === 3
                  ? TypographyType.Callout
                  : TypographyType.Body
              }
              color={TypographyColor.Primary}
              className={classNames(
                'min-w-0 break-words',
                question.cols !== 3 && 'flex-1',
              )}
            >
              {option.label}
            </Typography>
          </button>
        ))}
      </div>
    </div>
  </div>
);
