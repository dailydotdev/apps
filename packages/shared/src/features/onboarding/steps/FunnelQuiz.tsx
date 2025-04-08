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
import { FunnelStepBackground } from '../shared/FunnelStepBackground';
import StepHeadline from '../shared/StepHeadline';
import { Image } from '../../../components/image/Image';

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
  explainer,
  onTransition,
}: FunnelStepQuiz): ReactElement => {
  const { type, text, options, imageUrl } = question;
  const isSingleChoice = checkIfSingleChoice(type);
  const [stepValue, setStepValue] = useState<string | string[]>([]);
  const Component = useMemo(() => quizComponentsMap[type], [type]);
  const inputOptions = useMemo(
    () =>
      options.map((option) => ({
        label: option.label,
        value: option.value ?? option.label,
        image: option.image,
      })),
    [options],
  );

  const onChange = useCallback(
    (input: string | string[]) => {
      const value =
        isSingleChoice && Array.isArray(input) ? input.at(-1) : input;
      setStepValue(value);

      if (isSingleChoice) {
        onTransition?.({
          type: FunnelStepTransitionType.Complete,
          details: { [id]: value },
        });
      }
    },
    [id, isSingleChoice, onTransition],
  );

  const onCtaClick = useCallback(() => {
    if (isSingleChoice || !stepValue.length) {
      return;
    }
    onTransition?.({
      type: FunnelStepTransitionType.Complete,
      details: { [id]: stepValue },
    });
  }, [isSingleChoice, stepValue, onTransition, id]);

  return (
    <FunnelStepBackground>
      <ConditionalWrapper
        condition={!isSingleChoice}
        wrapper={(component) => (
          <FunnelStepCtaWrapper onClick={onCtaClick}>
            {component}
          </FunnelStepCtaWrapper>
        )}
      >
        <div className="flex flex-col gap-4 px-4 py-6">
          <StepHeadline heading={text} description={explainer} />
          {imageUrl && (
            <Image
              alt="Question additional context"
              aria-hidden
              className="mx-auto max-w-lg object-contain object-center"
              role="presentation"
              src={imageUrl}
            />
          )}
          <Component
            name={id}
            options={inputOptions}
            onValueChange={onChange}
          />
        </div>
      </ConditionalWrapper>
    </FunnelStepBackground>
  );
};
