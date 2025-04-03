import type { ReactElement } from 'react';
import React, { useMemo, useState, useCallback } from 'react';
import type { FunnelStepQuiz } from '../types/funnel';
import {
  FunnelStepQuizQuestionType,
  FunnelStepTransitionType,
} from '../types/funnel';
import { FormInputRating } from '../../common/components/FormInputRating';
import { FormInputCheckboxGroup } from '../../common/components/FormInputCheckboxGroup';
import ConditionalWrapper from '../../../components/ConditionalWrapper';
import { FunnelStepCtaWrapper } from '../shared/FunnelStepCtaWrapper';

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

export const FunnelQuiz = ({
  id,
  question,
  onTransition,
}: FunnelStepQuiz): ReactElement => {
  const { type, text, options, imageUrl } = question;
  const isSingleChoice = checkIfSingleChoice(type);
  const [innerValue, setInnerValue] = useState<string | string[]>([]);
  const Component = useMemo(() => quizComponentsMap[type], [type]);
  const inputOptions = useMemo(
    () =>
      options.map((option) => ({
        label: option.label,
        value: option.label,
      })),
    [options],
  );

  const onChange = useCallback(
    (value: string | string[]) => {
      setInnerValue(value);

      if (isSingleChoice) {
        onTransition?.({
          type: FunnelStepTransitionType.Complete,
          details: { value },
        });
      }
    },
    [isSingleChoice, onTransition],
  );

  const onCtaClick = useCallback(() => {
    if (isSingleChoice || !innerValue.length) {
      return;
    }
    onTransition?.({
      type: FunnelStepTransitionType.Complete,
      details: { value: innerValue },
    });
  }, [isSingleChoice, innerValue, onTransition]);

  return (
    <ConditionalWrapper
      condition={!isSingleChoice}
      wrapper={(component) => (
        <FunnelStepCtaWrapper onClick={onCtaClick}>
          {component}
        </FunnelStepCtaWrapper>
      )}
    >
      {/* todo: add Step Headline component once ready */}
      <div className="flex flex-col gap-4">
        <h2>{text}</h2>
        {imageUrl && (
          <img
            alt="Question additional context"
            aria-hidden
            className="max-w-lg object-contain object-center"
            role="presentation"
            src={imageUrl}
          />
        )}
        <Component name={id} options={inputOptions} onValueChange={onChange} />
      </div>
    </ConditionalWrapper>
  );
};
