import type { ReactElement } from 'react';
import React, { useContext } from 'react';
import classNames from 'classnames';
import { OpenLinkIcon, TwitterIcon } from '../icons';
import type { Post } from '../../graphql/posts';
import {
  getReadPostButtonText,
  isInternalReadType,
  isSocialTwitterPost,
  PostType,
} from '../../graphql/posts';
import { IconSize } from '../Icon';
import classed from '../../lib/classed';
import { Button, ButtonIconPosition, ButtonVariant } from '../buttons/Button';
import SettingsContext from '../../contexts/SettingsContext';
import type { PostHeaderActionsProps } from './common';
import { PostMenuOptions } from './PostMenuOptions';
import { Origin } from '../../lib/log';
import { CollectionSubscribeButton } from './collection/CollectionSubscribeButton';
import { useViewSizeClient, ViewSize } from '../../hooks';
import { BoostPostButton } from '../../features/boost/BoostButton';
import { Tooltip } from '../tooltip/Tooltip';
import { useShowBoostButton } from '../../features/boost/useShowBoostButton';

const Container = classed('div', 'flex flex-row items-center');

export function PostHeaderActions({
  onReadArticle,
  post,
  readButtonText: readButtonTextOverride,
  onClose,
  inlineActions,
  className,
  notificationClassName,
  isFixedNavigation,
  buttonSize,
  ...props
}: PostHeaderActionsProps): ReactElement {
  const { openNewTab } = useContext(SettingsContext);
  const isMobile = useViewSizeClient(ViewSize.MobileXL);
  const readButtonText = readButtonTextOverride || getReadPostButtonText(post);
  const isCollection = post?.type === PostType.Collection;
  const isInternalReadTyped = isInternalReadType(post);
  const isTwitter =
    isSocialTwitterPost(post) || isSocialTwitterPost(post?.sharedPost as Post);
  const isBoostButtonVisible = useShowBoostButton({ post });
  const isPoll = post?.type === PostType.Poll;

  return (
    <Container {...props} className={classNames('gap-2', className)}>
      {!isPoll && !isInternalReadTyped && !!onReadArticle && (
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
            icon={
              isTwitter ? (
                <TwitterIcon size={IconSize.Size16} />
              ) : (
                <OpenLinkIcon />
              )
            }
            {...(isTwitter && {
              iconPosition: ButtonIconPosition.Right,
            })}
            onClick={onReadArticle}
            data-testid="postActionsRead"
            size={buttonSize}
          >
            {!inlineActions ? readButtonText : null}
          </Button>
        </Tooltip>
      )}
      {isBoostButtonVisible && (
        <BoostPostButton post={post} buttonProps={{ size: buttonSize }} />
      )}
      {isCollection && <CollectionSubscribeButton post={post} />}
      <PostMenuOptions
        post={post}
        origin={Origin.ArticleModal}
        buttonSize={buttonSize}
      />
    </Container>
  );
}
