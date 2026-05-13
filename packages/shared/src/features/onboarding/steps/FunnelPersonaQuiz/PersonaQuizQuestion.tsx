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
      'flex w-full flex-1 flex-col gap-6 px-4 py-6 tablet:mx-auto laptop:gap-10',
      question.cols === 3 ? 'tablet:max-w-lg' : 'tablet:max-w-md',
    )}
  >
    <header className="flex items-center gap-3">
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
      >
        {`Question ${step} of ${totalSteps}`}
      </Typography>
      <div className="flex flex-1 gap-1">
        {Array.from({ length: totalSteps }, (_, index) => (
          <span
            key={`step-${index}`}
            className={classNames(
              'h-1.5 flex-1 rounded-4 transition-colors',
              index < step ? 'bg-brand-default' : 'bg-border-subtlest-tertiary',
            )}
          />
        ))}
      </div>
    </header>

    <Typography
      tag={TypographyTag.H2}
      type={TypographyType.Title2}
      color={TypographyColor.Primary}
      bold
      className="text-center"
    >
      {question.prompt}
    </Typography>

    {question.imageUrl && (
      <div className="grid place-items-center">
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
      className={classNames('grid gap-3', {
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
            'flex min-w-0 gap-2 rounded-12 border border-border-subtlest-tertiary bg-background-default text-text-secondary transition-colors hover:border-text-tertiary hover:text-text-primary',
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
              question.cols === 3 ? TypographyType.Callout : TypographyType.Body
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
);
