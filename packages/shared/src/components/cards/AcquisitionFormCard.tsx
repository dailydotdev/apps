import React, { ReactElement, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { Card } from './Card';
import { Radio } from '../fields/Radio';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { updateUserAcquisition } from '../../graphql/users';
import { MiniCloseIcon } from '../icons';
import { OnboardingTitleGradient } from '../onboarding/common';
import { removeQueryParam } from '../../lib/links';

const options = [
  { label: 'Referred by a friend or colleague', value: 'friend' },
  { label: 'Social media', value: 'social_media' },
  { label: 'Search engine', value: 'search_engine' },
  { label: 'Blog, forum, or discussion', value: 'blog' },
  { label: 'Browser extension store', value: 'extension_store' },
  { label: 'Advertisement or sponsorship', value: 'ad' },
  { label: 'Other', value: 'other' },
];

export function AcquisitionFormCard(): ReactElement {
  const [value, setValue] = useState<string>();
  const router = useRouter();
  const onDismiss = () => {
    const removed = removeQueryParam(
      window.location.href,
      'user_acquisiton_channel',
    );
    router.replace(removed);
  };

  const { mutateAsync, isLoading } = useMutation(updateUserAcquisition, {
    onSuccess: onDismiss,
  });

  return (
    <Card className="p-4">
      <OnboardingTitleGradient className="flex w-full flex-row items-center whitespace-nowrap pb-1 typo-body">
        How did you hear about us?
        <Button
          className="ml-auto"
          size={ButtonSize.Small}
          variant={ButtonVariant.Tertiary}
          icon={<MiniCloseIcon />}
          onClick={onDismiss}
        />
      </OnboardingTitleGradient>
      <Radio
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
