import type { ReactElement } from 'react';
import React, { useCallback, useContext } from 'react';
import classNames from 'classnames';
import { OpenLinkIcon } from '../icons';
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
  const { openNewTab } = useContext(SettingsContext);
  const isLaptop = useViewSizeClient(ViewSize.Laptop);
  const isMobile = useViewSizeClient(ViewSize.MobileXL);
  const isEnlarged = isFixedNavigation || isLaptop;
  const readButtonText = getReadPostButtonText(post);
  const isCollection = post?.type === PostType.Collection;
  const { canBoost } = useCanBoostPost(post);
  const ButtonWithExperiment = useCallback(() => {
    return (
      <Tooltip side="bottom" content={readButtonText} visible={!inlineActions}>
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
    );
  }, [
    inlineActions,
    onReadArticle,
    openNewTab,
    post.permalink,
    post.sharedPost?.permalink,
    readButtonText,
    isFixedNavigation,
    isMobile,
  ]);

  return (
    <Container {...props} className={classNames('gap-2', className)}>
      {!isInternalReadType(post) && !!onReadArticle && <ButtonWithExperiment />}
      {!post.flags?.boosted && canBoost && <BoostPostButton post={post} />}
      {isCollection && <CollectionSubscribeButton post={post} />}
      <PostMenuOptions
        post={post}
        onClose={onClose}
        inlineActions={inlineActions}
        origin={Origin.ArticleModal}
        isEnlarged={isEnlarged}
      />
    </Container>
  );
}
