import React, { ReactElement } from 'react';
import { useRouter } from 'next/router';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { ArrowIcon } from '../icons';
import { PostHeaderActions } from './PostHeaderActions';
import { PostNavigationProps } from './common';
import { isNullOrUndefined } from '../../lib/func';

export function PostContentHeaderMobile({
  post,
  onReadArticle,
}: Pick<PostNavigationProps, 'onReadArticle' | 'post'>): ReactElement {
  const router = useRouter();
  const canGoBack =
    globalThis?.history &&
    !!globalThis.history.length &&
    isNullOrUndefined(globalThis.history.state.options.shallow) &&
    !globalThis.document.referrer; // empty referrer means you are from the same site

  return (
    <span className="-mx-4 flex flex-row items-center border-b border-border-subtlest-tertiary px-4 py-2 tablet:hidden">
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
