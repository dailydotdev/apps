import React, { ReactElement } from 'react';
import { useRouter } from 'next/router';
import { ButtonVariant } from '../../buttons/common';
import { ArrowIcon } from '../../icons';
import { Button } from '../../buttons/Button';
import { useFeedLayout } from '../../../hooks';

interface PostBackButtonProps {
  link?: string;
}

export function PostBackButton({ link }: PostBackButtonProps): ReactElement {
  const router = useRouter();
  const { shouldUseListFeedLayout } = useFeedLayout({ feedRelated: false });
  const canGoBack = !!globalThis?.window?.history?.length;
  const onClick = () => router.push(link);

  if (!shouldUseListFeedLayout || (!canGoBack && !link)) {
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
