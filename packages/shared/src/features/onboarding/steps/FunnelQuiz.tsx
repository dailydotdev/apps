import type { ReactElement } from 'react';
import React, { useCallback, useMemo, useState } from 'react';
import classNames from 'classnames';
import type {
  FunnelQuestion,
  FunnelQuestionCheckbox,
  FunnelStepQuiz,
} from '../types/funnel';
import {
  FunnelStepQuizQuestionType,
  FunnelStepTransitionType,
} from '../types/funnel';
import { FormInputRating } from '../../common/components/FormInputRating';
import {
  CheckboxGroupBehaviour,
  FormInputCheckboxGroup,
} from '../../common/components/FormInputCheckboxGroup';
import ConditionalWrapper from '../../../components/ConditionalWrapper';
import type { StepHeadlineAlign } from '../shared';
import { FunnelStepCtaWrapper, StepHeadline } from '../shared';
import { Image } from '../../../components/image/Image';
import { TypographyColor } from '../../../components/typography/Typography';

const quizComponentsMap = {
  [FunnelStepQuizQuestionType.Rating]: FormInputRating,
  [FunnelStepQuizQuestionType.Radio]: FormInputCheckboxGroup,
  [FunnelStepQuizQuestionType.Checkbox]: FormInputCheckboxGroup,
} as const;

const checkIfSingleChoice = (type: FunnelStepQuizQuestionType): boolean => {
  return (
    type === FunnelStepQuizQuestionType.Radio ||
    type === FunnelStepQuizQuestionType.Rating
  );
};

const checkIfCheckboxGroup = (
  type: FunnelStepQuizQuestionType,
  question: FunnelQuestion,
): question is FunnelQuestionCheckbox => {
  return (
    type === FunnelStepQuizQuestionType.Checkbox ||
    type === FunnelStepQuizQuestionType.Radio
  );
};

export function FunnelQuiz({
  id,
  onTransition,
  parameters: { question, explainer, align },
}: FunnelStepQuiz): ReactElement {
  const { type, text, options, imageUrl } = question;
  const isSingleChoice = checkIfSingleChoice(type);
  const isCheckboxGroup = checkIfCheckboxGroup(type, question);
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
    <ConditionalWrapper
      condition={!isSingleChoice}
      wrapper={(component) => (
        <FunnelStepCtaWrapper
          containerClassName="flex flex-col"
          onClick={onCtaClick}
        >
          {component}
        </FunnelStepCtaWrapper>
      )}
    >
      <div
        data-testid="funnel-step-quiz"
        className={classNames('flex flex-1 flex-col gap-4 px-4 py-6')}
      >
        <StepHeadline
          heading={text}
          description={explainer}
          align={align as StepHeadlineAlign}
          descriptionProps={{ color: TypographyColor.Tertiary }}
        />
        {imageUrl && (
          <div className="grid flex-1 place-items-center">
            <Image
              alt="Question additional context"
              aria-hidden
              className="mx-auto w-full max-w-lg object-contain object-center"
              role="presentation"
              src={imageUrl}
            />
          </div>
        )}
        <Component
          name={id}
          options={inputOptions}
          onValueChange={onChange}
          {...(isCheckboxGroup && {
            ...{
              behaviour: isSingleChoice
                ? CheckboxGroupBehaviour.Radio
                : CheckboxGroupBehaviour.Checkbox,
              variant: question.variant,
              cols: question.cols,
            },
          })}
        />
      </div>
    </ConditionalWrapper>
  );
}
