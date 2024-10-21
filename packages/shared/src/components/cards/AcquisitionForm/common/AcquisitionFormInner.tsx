import classNames from 'classnames';
import React, { ReactElement, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useMutation } from '@tanstack/react-query';
import { OnboardingTitleGradient } from '../../../onboarding/common';
import { Button, ButtonSize, ButtonVariant } from '../../../buttons/Button';
import { MiniCloseIcon } from '../../../icons';
import { Radio } from '../../../fields/Radio';
import {
  AcquisitionChannel,
  updateUserAcquisition,
} from '../../../../graphql/users';
import LogContext from '../../../../contexts/LogContext';
import { removeQueryParam } from '../../../../lib';
import { LogEvent, UserAcquisitionEvent } from '../../../../lib/log';
import { ACQUISITION_FORM_OPTIONS, acquisitionKey } from './common';
import { shuffleArray } from '../../../../lib/func';

interface Props {
  className?: {
    button?: string;
  };
}
export const AcquisitionFormInner = ({ className }: Props): ReactElement => {
  const { logEvent } = useContext(LogContext);
  const [value, setValue] = useState<AcquisitionChannel>();
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

  const { mutateAsync, isLoading, isSuccess } = useMutation(
    updateUserAcquisition,
    {
      onSuccess: () => {
        logEvent({
          event_name: UserAcquisitionEvent.Submit,
          target_id: value,
        });
      },
    },
  );

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
      <Radio<AcquisitionChannel>
        name="acquisition"
        onChange={setValue}
        options={shuffledOptions}
        value={value}
      />
      <Button
        className={classNames('w-full', className?.button)}
        variant={ButtonVariant.Primary}
        size={ButtonSize.Small}
        loading={isLoading}
        disabled={!value}
        onClick={() => mutateAsync(value)}
      >
        Submit
      </Button>
    </>
  );
};
