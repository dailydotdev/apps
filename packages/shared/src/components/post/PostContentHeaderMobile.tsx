import React, { ReactElement } from 'react';
import { useRouter } from 'next/router';
import classNames from 'classnames';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { ArrowIcon } from '../icons';
import { PostHeaderActions } from './PostHeaderActions';
import { PostNavigationProps } from './common';
import { WithClassNameProps } from '../utilities';

const checkSameSite = () => {
  const referrer = globalThis?.document?.referrer;
  const origin = globalThis?.window?.location.origin;

  if (!referrer) {
    return true; // empty referrer means you are from the same site
  }

  return (
    referrer === origin || origin === referrer.substring(0, referrer.length - 1) // remove trailing slash
  );
};

export function PostContentHeaderMobile({
  post,
  className,
  onReadArticle,
}: Pick<PostNavigationProps, 'onReadArticle' | 'post'> &
  WithClassNameProps): ReactElement {
  const router = useRouter();
  const canGoBack = !!globalThis?.history?.length && checkSameSite();

  return (
    <span
      className={classNames(
        '-mx-4 flex flex-row items-center border-b border-border-subtlest-tertiary px-4 py-2 tablet:hidden',
        className,
      )}
    >
      <Button
        icon={<ArrowIcon className="-rotate-90" />}
        size={ButtonSize.Small}
        variant={ButtonVariant.Tertiary}
        onClick={router.back}
        className={!canGoBack && 'invisible'}
      />
      <PostHeaderActions
        post={post}
        className="ml-auto"
        contextMenuId="post-page-header-actions"
        onReadArticle={onReadArticle}
      />
    </span>
  );
}
