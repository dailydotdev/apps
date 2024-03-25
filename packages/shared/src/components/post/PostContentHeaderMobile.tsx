import React, { ReactElement } from 'react';
import { useRouter } from 'next/router';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { ArrowIcon } from '../icons';
import { PostHeaderActions } from './PostHeaderActions';
import { PostNavigationProps } from './common';
import { SourceType } from '../../graphql/sources';

export function PostContentHeaderMobile({
  post,
  onReadArticle,
}: Pick<PostNavigationProps, 'onReadArticle' | 'post'>): ReactElement {
  const router = useRouter();
  const canGoBack = !!globalThis?.window?.history?.length;
  const routedFromSquad = router?.query?.squad;
  const squadLink = `/squads/${router.query.squad}`;

  const onBackClick = () => {
    if (canGoBack) {
      return router.back();
    }

    if (routedFromSquad) {
      return router.push(squadLink);
    }

    if (post.source.type === SourceType.Squad) {
      return router.push(post.source.permalink);
    }

    return null;
  };

  return (
    <span className="-mx-4 flex flex-row items-center border-b border-border-subtlest-tertiary px-4 py-2 tablet:hidden">
      <Button
        icon={<ArrowIcon className="-rotate-90" />}
        size={ButtonSize.Small}
        variant={ButtonVariant.Tertiary}
        onClick={onBackClick}
        className={
          !canGoBack &&
          !routedFromSquad &&
          post.source.type !== SourceType.Squad &&
          'invisible'
        }
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
