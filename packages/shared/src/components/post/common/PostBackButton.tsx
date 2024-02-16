import React, { ReactElement } from 'react';
import { useRouter } from 'next/router';
import { ButtonVariant } from '../../buttons/common';
import { ArrowIcon } from '../../icons';
import { Button } from '../../buttons/ButtonV2';
import { FeedLayout } from '../../../lib/featureValues';
import { useFeature } from '../../GrowthBookProvider';
import { feature } from '../../../lib/featureManagement';

interface PostBackButtonProps {
  link?: string;
}

export function PostBackButton({ link }: PostBackButtonProps): ReactElement {
  const router = useRouter();
  const layout = useFeature(feature.feedLayout);
  const canGoBack = !!globalThis?.window?.history?.length;
  const onClick = () => router.push(link);

  if (layout === FeedLayout.Control || (!canGoBack && !link)) {
    return null;
  }

  return (
    <Button
      className="w-fit"
      onClick={canGoBack ? router.back : onClick}
      variant={ButtonVariant.Tertiary}
      icon={<ArrowIcon className="-rotate-90" />}
    >
      Back
    </Button>
  );
}
