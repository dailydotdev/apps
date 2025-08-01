import type { ReactElement } from 'react';
import React, { useContext } from 'react';
import classNames from 'classnames';
import { OpenLinkIcon } from '../icons';
import {
  getReadPostButtonText,
  isInternalReadType,
  PostType,
} from '../../graphql/posts';
import classed from '../../lib/classed';
import { Button, ButtonVariant } from '../buttons/Button';
import SettingsContext from '../../contexts/SettingsContext';
import type { PostHeaderActionsProps } from './common';
import { PostMenuOptions } from './PostMenuOptions';
import { Origin } from '../../lib/log';
import { CollectionSubscribeButton } from './collection/CollectionSubscribeButton';
import { useViewSizeClient, ViewSize } from '../../hooks';
import { BoostPostButton } from '../../features/boost/BoostPostButton';
import { Tooltip } from '../tooltip/Tooltip';
import { useShowBoostButton } from '../../features/boost/useShowBoostButton';

const Container = classed('div', 'flex flex-row items-center');

export function PostHeaderActions({
  onReadArticle,
  post,
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
  const readButtonText = getReadPostButtonText(post);
  const isCollection = post?.type === PostType.Collection;
  const isInternalReadTyped = isInternalReadType(post);
  const isBoostButtonVisible = useShowBoostButton({ post });

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
