import classNames from 'classnames';
import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useMutation } from '@tanstack/react-query';
import { OnboardingTitleGradient } from '../../../onboarding/common';
import { Button, ButtonSize, ButtonVariant } from '../../../buttons/Button';
import { MiniCloseIcon } from '../../../icons';
import { Radio } from '../../../fields/Radio';
import {
  AcquisitionChannel,
  getStoredChannel,
  updateUserAcquisition,
} from '../../../../graphql/users';
import { useLogContext } from '../../../../contexts/LogContext';
import { removeQueryParam } from '../../../../lib';
import { LogEvent, UserAcquisitionEvent } from '../../../../lib/log';
import { ACQUISITION_FORM_OPTIONS, acquisitionKey } from './common';
import { shuffleArray } from '../../../../lib/func';
import { AcquisitionOpenField } from './AcquisitionOpenField';

export interface AcquisitionFormProps {
  // 'open' swaps the list for one free-text answer, stored as `other:<text>`.
  answerStyle?: 'list' | 'open';
}

interface Props extends AcquisitionFormProps {
  className?: {
    button?: string;
  };
}
export const AcquisitionFormInner = ({
  className,
  answerStyle = 'list',
}: Props): ReactElement | null => {
  const { logEvent } = useLogContext();
  const [selected, setSelected] = useState<AcquisitionChannel>();
  const [answer, setAnswer] = useState('');
  const isOpenField = answerStyle === 'open';
  const openChannel = answer.trim() ? AcquisitionChannel.Other : undefined;
  const value = isOpenField ? openChannel : selected;
  const [shuffledOptions] = useState(() =>
    shuffleArray(ACQUISITION_FORM_OPTIONS),
  );
  const router = useRouter();
  const onRemoveQueryParams = () => {
    const updatedUrl = removeQueryParam(window.location.href, acquisitionKey);
    router.replace(updatedUrl);
  };
  const onDismiss = () => {
    logEvent({ event_name: UserAcquisitionEvent.Dismiss });
    onRemoveQueryParams();
  };

  const {
    mutateAsync,
    isPending: isLoading,
    isSuccess,
  } = useMutation({
    mutationFn: (channel: AcquisitionChannel) =>
      updateUserAcquisition(getStoredChannel(channel, answer)),
    onSuccess: () => {
      logEvent({
        event_name: UserAcquisitionEvent.Submit,
        target_id: value,
      });
    },
  });

  useEffect(() => {
    logEvent({
      event_name: LogEvent.Impression,
      target_type: acquisitionKey,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isSuccess) {
    onRemoveQueryParams();
    return null;
  }

  return (
    <>
      <OnboardingTitleGradient className="flex w-full flex-row items-center whitespace-nowrap pb-1 typo-body">
        How did you hear about us?
        <Button
          className="ml-auto"
          size={ButtonSize.Small}
          variant={ButtonVariant.Tertiary}
          icon={<MiniCloseIcon />}
          onClick={onDismiss}
          aria-label="Close acquisition form"
        />
      </OnboardingTitleGradient>
      {isOpenField ? (
        <AcquisitionOpenField
          isCompact
          disabled={isLoading}
          name="acquisition"
          onChange={setAnswer}
          onSubmit={() => value && mutateAsync(value)}
          value={answer}
        />
      ) : (
        <Radio<AcquisitionChannel>
          name="acquisition"
          onChange={setSelected}
          options={shuffledOptions}
          value={selected}
        />
      )}
      <Button
        className={classNames('w-full', className?.button)}
        variant={ButtonVariant.Primary}
        size={ButtonSize.Small}
        loading={isLoading}
        disabled={!value}
        onClick={() => value && mutateAsync(value)}
      >
        Submit
      </Button>
    </>
  );
};
