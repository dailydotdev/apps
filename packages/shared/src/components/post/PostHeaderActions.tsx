import type { ReactElement } from 'react';
import React, { useContext } from 'react';
import classNames from 'classnames';
import { useQueryClient } from '@tanstack/react-query';
import { OpenLinkIcon } from '../icons';
import type { PostData } from '../../graphql/posts';
import {
  getReadPostButtonText,
  isInternalReadType,
  PostType,
  useCanBoostPost,
} from '../../graphql/posts';
import classed from '../../lib/classed';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import SettingsContext from '../../contexts/SettingsContext';
import type { PostHeaderActionsProps } from './common';
import { PostMenuOptions } from './PostMenuOptions';
import { Origin } from '../../lib/log';
import { CollectionSubscribeButton } from './collection/CollectionSubscribeButton';
import { useViewSizeClient, ViewSize } from '../../hooks';
import { BoostPostButton } from '../../features/boost/BoostPostButton';
import { Tooltip } from '../tooltip/Tooltip';
import { getPostByIdKey } from '../../lib/query';

const Container = classed('div', 'flex flex-row items-center');

export function PostHeaderActions({
  onReadArticle,
  post,
  onClose,
  inlineActions,
  className,
  notificationClassName,
  isFixedNavigation,
  ...props
}: PostHeaderActionsProps): ReactElement {
  const key = getPostByIdKey(post?.id);
  const client = useQueryClient();
  const postById = client.getQueryData<PostData>(key);
  const { openNewTab } = useContext(SettingsContext);
  const isMobile = useViewSizeClient(ViewSize.MobileXL);
  const readButtonText = getReadPostButtonText(post);
  const isCollection = post?.type === PostType.Collection;
  const { canBoost } = useCanBoostPost(post);
  const isInternalReadTyped = isInternalReadType(post);

  return (
    <Container {...props} className={classNames('gap-2', className)}>
      {!isInternalReadTyped && !!onReadArticle && (
        <Tooltip
          side="bottom"
          content={readButtonText}
          visible={!inlineActions}
        >
          <Button
            variant={
              isFixedNavigation || isMobile
                ? ButtonVariant.Tertiary
                : ButtonVariant.Secondary
            }
            tag="a"
            href={post.sharedPost?.permalink ?? post.permalink}
            target={openNewTab ? '_blank' : '_self'}
            icon={<OpenLinkIcon />}
            onClick={onReadArticle}
            data-testid="postActionsRead"
            size={ButtonSize.Small}
          >
            {!inlineActions ? readButtonText : null}
          </Button>
        </Tooltip>
      )}
      {canBoost && postById && !postById.post?.flags?.campaignId && (
        <BoostPostButton
          post={post}
          buttonProps={{
            size: isInternalReadTyped ? undefined : ButtonSize.Small,
          }}
        />
      )}
      {isCollection && <CollectionSubscribeButton post={post} />}
      <PostMenuOptions
        post={post}
        inlineActions={inlineActions}
        origin={Origin.ArticleModal}
      />
    </Container>
  );
}
