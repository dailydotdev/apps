import React, { ReactElement, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { Card } from './Card';
import { Radio } from '../fields/Radio';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { AcquisitionChannel, updateUserAcquisition } from '../../graphql/users';
import { MiniCloseIcon } from '../icons';
import { OnboardingTitleGradient } from '../onboarding/common';
import { removeQueryParam } from '../../lib/links';

const options = [
  {
    label: 'Referred by a friend or colleague',
    value: AcquisitionChannel.Friend,
  },
  { label: 'Social media', value: AcquisitionChannel.SocialMedia },
  { label: 'Search engine', value: AcquisitionChannel.SearchEngine },
  { label: 'Blog, forum, or discussion', value: AcquisitionChannel.Blog },
  {
    label: 'Browser extension store',
    value: AcquisitionChannel.ExtensionStore,
  },
  {
    label: 'Advertisement or sponsorship',
    value: AcquisitionChannel.Advertisement,
  },
  { label: 'Other', value: AcquisitionChannel.Other },
];

export const acquisitionKey = 'ua';

export function AcquisitionFormCard(): ReactElement {
  const [isDismissed, setIsDismissed] = useState(false);
  const [value, setValue] = useState<AcquisitionChannel>();
  const router = useRouter();
  const onRemoveQueryParams = () => {
    const removed = removeQueryParam(window.location.href, acquisitionKey);
    router.replace(removed);
  };
  const onDismiss = () => {
    setIsDismissed(true);
    onRemoveQueryParams();
  };

  const { mutateAsync, isLoading } = useMutation(updateUserAcquisition, {
    onSuccess: onRemoveQueryParams,
  });

  if (isDismissed) {
    return null;
  }

  return (
    <Card data-testid="acquisitionFormCard" className="p-4">
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
        options={options}
        value={value}
      />
      <Button
        className="mt-auto w-full"
        variant={ButtonVariant.Primary}
        size={ButtonSize.Small}
        loading={isLoading}
        disabled={!value}
        onClick={() => mutateAsync(value)}
      >
        Submit
      </Button>
    </Card>
  );
}
