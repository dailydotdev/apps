import type { ReactElement } from 'react';
import React, { useCallback, useMemo, useState } from 'react';
import classNames from 'classnames';
import { useMutation } from '@tanstack/react-query';
import type { FunnelStepAcquisition } from '../types/funnel';
import { FunnelStepTransitionType } from '../types/funnel';
import {
  CheckboxGroupBehaviour,
  FormInputCheckboxGroup,
} from '../../common/components/FormInputCheckboxGroup';
import {
  FunnelStepCtaWrapper,
  funnelStepRail,
} from '../shared/FunnelStepCtaWrapper';
import { sanitizeMessage } from '../lib/utils';
import { withIsActiveGuard } from '../shared/withActiveGuard';
import { withShouldSkipStepGuard } from '../shared/withShouldSkipStepGuard';
import {
  OnboardingHeadline,
  OnboardingSubheadline,
} from '../../../components/onboarding/common';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useLogContext } from '../../../contexts/LogContext';
import { UserAcquisitionEvent } from '../../../lib/log';
import {
  AcquisitionChannel,
  updateUserAcquisition,
} from '../../../graphql/users';
import { ACQUISITION_FORM_OPTIONS } from '../../../components/cards/AcquisitionForm/common/common';
import { shuffleArray } from '../../../lib/func';

const DEFAULT_HEADLINE = 'How did you hear about us?';

// "Other" is a catch-all, so it stays last however the rest are ordered.
const orderOptions = (
  options: AcquisitionChannel[] | undefined,
  shuffle: boolean,
) => {
  const selected = options?.length
    ? ACQUISITION_FORM_OPTIONS.filter(({ value }) => options.includes(value))
        // Config order, not the constant's.
        .sort((a, b) => options.indexOf(a.value) - options.indexOf(b.value))
    : ACQUISITION_FORM_OPTIONS;
  const other = selected.filter(
    ({ value }) => value === AcquisitionChannel.Other,
  );
  const rest = selected.filter(
    ({ value }) => value !== AcquisitionChannel.Other,
  );

  return [...(shuffle ? shuffleArray(rest) : rest), ...other];
};

function FunnelAcquisitionComponent({
  id,
  parameters: { headline, explainer, cta, options, shuffle = true, skip },
  onTransition,
}: FunnelStepAcquisition): ReactElement {
  const { logEvent } = useLogContext();
  const [value, setValue] = useState<AcquisitionChannel>();
  // Shuffled once per mount: re-ordering the list under a user who is halfway
  // through reading it is worse than the position bias it corrects.
  const [inputOptions] = useState(() => orderOptions(options, shuffle));
  const headlineHtml = useMemo(
    () => sanitizeMessage(headline || DEFAULT_HEADLINE),
    [headline],
  );

  const complete = useCallback(
    (channel: AcquisitionChannel) => {
      logEvent({
        event_name: UserAcquisitionEvent.Submit,
        target_id: channel,
      });
      onTransition({
        type: FunnelStepTransitionType.Complete,
        details: { acquisitionChannel: channel },
      });
    },
    [logEvent, onTransition],
  );

  const { mutate: submit, isPending } = useMutation({
    mutationFn: updateUserAcquisition,
    onSuccess: (_, channel) => complete(channel),
    // The answer is analytics, not something the funnel should stall on.
    onError: (_, channel) => complete(channel),
  });

  const onChange = useCallback((input: string[]) => {
    setValue(input.at(-1) as AcquisitionChannel);
  }, []);

  const onSkip = useCallback(() => {
    onTransition({ type: FunnelStepTransitionType.Skip });
  }, [onTransition]);

  return (
    <FunnelStepCtaWrapper
      isGlass
      cta={{ label: cta }}
      disabled={!value}
      loading={isPending}
      onClick={() => value && submit(value)}
      skip={skip ? { cta: skip, onClick: onSkip } : undefined}
      containerClassName="flex w-full flex-1 flex-col items-center overflow-hidden"
    >
      <div
        className={classNames(
          funnelStepRail,
          'z-1 flex flex-col items-center gap-6 py-6 pt-3',
        )}
      >
        <OnboardingHeadline
          dangerouslySetInnerHTML={{ __html: headlineHtml }}
        />
        {!!explainer && (
          <OnboardingSubheadline>{explainer}</OnboardingSubheadline>
        )}
        {/* The rail centres its children, and the group sizes to its content. */}
        <div className="w-full">
          <FormInputCheckboxGroup
            behaviour={CheckboxGroupBehaviour.Radio}
            name={id}
            onValueChange={onChange}
            options={inputOptions}
          />
        </div>
      </div>
    </FunnelStepCtaWrapper>
  );
}

export const FunnelAcquisition = withShouldSkipStepGuard(
  withIsActiveGuard(FunnelAcquisitionComponent),
  () => {
    const { user } = useAuthContext();

    return { shouldSkip: !!user?.acquisitionChannel };
  },
);
