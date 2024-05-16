import React, { ReactElement, useContext, useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import classNames from 'classnames';
import shuffle from 'lodash.shuffle';
import { Card } from './Card';
import { Card as CardV1 } from './v1/Card';
import { Radio } from '../fields/Radio';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { AcquisitionChannel, updateUserAcquisition } from '../../graphql/users';
import { MiniCloseIcon } from '../icons';
import { OnboardingTitleGradient } from '../onboarding/common';
import { removeQueryParam } from '../../lib/links';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import { AnalyticsEvent, UserAcquisitionEvent } from '../../lib/analytics';
import { useFeedLayout } from '../../hooks';

const options = [
  {
    label: 'Referred by a friend or colleague',
    value: AcquisitionChannel.Friend,
  },
  {
    label: 'Instagram or Facebook',
    value: AcquisitionChannel.InstagramFacebook,
  },
  { label: 'YouTube', value: AcquisitionChannel.YouTube },
  { label: 'TikTok', value: AcquisitionChannel.TikTok },
  { label: 'Search engine', value: AcquisitionChannel.SearchEngine },
  {
    label: 'Advertisement or sponsorship',
    value: AcquisitionChannel.Advertisement,
  },
  { label: 'Other', value: AcquisitionChannel.Other },
];

export const acquisitionKey = 'ua';

export function AcquisitionFormCard(): ReactElement {
  const { trackEvent } = useContext(AnalyticsContext);
  const [isDismissed, setIsDismissed] = useState(false);
  const [value, setValue] = useState<AcquisitionChannel>();
  const { shouldUseMobileFeedLayout } = useFeedLayout();
  const [shuffledOptions] = useState(() => shuffle(options));
  const router = useRouter();
  const onRemoveQueryParams = () => {
    const updatedUrl = removeQueryParam(window.location.href, acquisitionKey);
    router.replace(updatedUrl);
  };
  const onDismiss = () => {
    setIsDismissed(true);
    trackEvent({ event_name: UserAcquisitionEvent.Dismiss });
    onRemoveQueryParams();
  };

  const { mutateAsync, isLoading, isSuccess } = useMutation(
    updateUserAcquisition,
    {
      onSuccess: () => {
        trackEvent({
          event_name: UserAcquisitionEvent.Submit,
          target_id: value,
        });
      },
    },
  );

  useEffect(() => {
    trackEvent({
      event_name: AnalyticsEvent.Impression,
      target_type: acquisitionKey,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isSuccess) {
    onRemoveQueryParams();
    return null;
  }

  if (isDismissed) {
    return null;
  }

  const CardComponent = shouldUseMobileFeedLayout ? CardV1 : Card;

  return (
    <CardComponent data-testid="acquisitionFormCard" className="p-4">
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
        className={classNames(
          'w-full',
          shouldUseMobileFeedLayout ? 'mt-4' : 'mt-auto',
        )}
        variant={ButtonVariant.Primary}
        size={ButtonSize.Small}
        loading={isLoading}
        disabled={!value}
        onClick={() => mutateAsync(value)}
      >
        Submit
      </Button>
    </CardComponent>
  );
}
