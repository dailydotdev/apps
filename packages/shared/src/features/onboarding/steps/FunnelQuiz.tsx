import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import type { FunnelStepQuiz } from '../types/funnel';
import { FunnelStepQuizQuestionType } from '../types/funnel';
import { FormInputRating } from '../../common/components/FormInputRating';
import { FormInputCheckboxGroup } from '../../common/components/FormInputCheckboxGroup';

const quizComponentsMap = {
  [FunnelStepQuizQuestionType.Rating]: FormInputRating,
  [FunnelStepQuizQuestionType.Radio]: FormInputCheckboxGroup,
  [FunnelStepQuizQuestionType.Checkbox]: FormInputCheckboxGroup,
};

const checkIfSingleChoice = (type: FunnelStepQuizQuestionType): boolean => {
  return (
    type === FunnelStepQuizQuestionType.Radio ||
    type === FunnelStepQuizQuestionType.Rating
  );
};

export const FunnelQuiz = ({ id, question }: FunnelStepQuiz): ReactElement => {
  const { type, text, options, imageUrl } = question;
  const isSingleChoice = checkIfSingleChoice(type);
  const Component = useMemo(() => quizComponentsMap[type], [type]);
  const inputOptions = useMemo(
    () =>
      options.map((option) => ({
        label: option.label,
        value: option.label,
      })),
    [options],
  );

  const onChange = (value: unknown) => {
    if (isSingleChoice) {
      console.log('Selected single choice value:', value);
      // transition
      console.log('Transitioning to next step...');
      return;
    }

    console.log('Selected value:', value);
  };

  return (
    <section>
      <h2>{text}</h2>
      {imageUrl && (
        <img
          alt="Question additional context"
          aria-hidden
          role="presentation"
          src={imageUrl}
        />
      )}
      <Component name={id} options={inputOptions} onValueChange={onChange} />
    </section>
  );
};
