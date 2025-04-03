import type { ReactElement } from 'react';
import React, { useMemo, useState, useCallback } from 'react';
import type { FunnelStepQuiz } from '../types/funnel';
import {
  FunnelStepQuizQuestionType,
  FunnelStepTransitionType,
} from '../types/funnel';
import { FormInputRating } from '../../common/components/FormInputRating';
import { FormInputCheckboxGroup } from '../../common/components/FormInputCheckboxGroup';
import type { ButtonProps } from '../../../components/buttons/Button';
import { Button, ButtonVariant } from '../../../components/buttons/Button';

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

function CtaWrapper({
  children,
  ...props
}: ButtonProps<'button'>): ReactElement {
  return (
    <div className="relative">
      {children}

      <div className="sticky bottom-2">
        <Button type="button" variant={ButtonVariant.Primary} {...props}>
          Next
        </Button>
      </div>
    </div>
  );
}

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
    <CtaWrapper onClick={onCtaClick}>
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
    </CtaWrapper>
  );
};
