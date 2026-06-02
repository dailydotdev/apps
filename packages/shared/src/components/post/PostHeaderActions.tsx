import type { ReactElement } from 'react';
import React, { useContext } from 'react';
import classNames from 'classnames';
import {
  getReadArticleHref,
  getReadPostButtonText,
  isInternalReadType,
  isPostOrSharedPostTwitter,
  PostType,
} from '../../graphql/posts';
import { getReadPostButtonIcon } from '../cards/common/ReadArticleButton';
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
import { useReaderModalEligibility } from './reader/hooks/useReaderModalEligibility';
import { useLegacyPostLayoutOptOut } from './reader/hooks/useLegacyPostLayoutOptOut';
import { useReaderInstallPromptGate } from '../../hooks/useReaderInstallPromptGate';
import { EarthIcon } from '../icons';

const Container = classed('div', 'flex flex-row items-center');

export function PostHeaderActions({
  onReadArticle,
  post,
  onClose,
  inlineActions,
  className,
  notificationClassName,
  contextMenuId: _contextMenuId,
  isFixedNavigation,
  buttonSize,
  hideSubscribeAction,
  hideMenuOptions,
  ...props
}: PostHeaderActionsProps): ReactElement {
  const { openNewTab } = useContext(SettingsContext);
  const isMobile = useViewSizeClient(ViewSize.MobileXL);
  const readButtonText = getReadPostButtonText(post);
  const isCollection = post?.type === PostType.Collection;
  const isInternalReadTyped = isInternalReadType(post);
  const isTwitter = isPostOrSharedPostTwitter(post);
  const isBoostButtonVisible = useShowBoostButton({ post });
  const isPoll = post?.type === PostType.Poll;
  const readHref = getReadArticleHref(post);
  const isArticle = post?.type === PostType.Article;
  const hideShareReadButton =
    post?.type === PostType.Share && !isFixedNavigation;
  const { isEligible: isReaderEligible, isReaderModalEnabled } =
    useReaderModalEligibility();
  const { isOptedOut: isLegacyLayoutOptedOut } = useLegacyPostLayoutOptOut();
  // When enrolled in the variant — and the user hasn't opted out — we flip
  // the action semantics: "Read post" becomes the inside-daily.dev entry
  // (globe icon, opens reader preview), and a secondary external-link
  // button takes over the "open in a new tab" role that used to live on
  // Read post. Once a user opts out (via the install-prompt overlay) the
  // UI snaps back to the classic Read post button + no secondary button.
  const isReaderVariant =
    isArticle &&
    isReaderEligible &&
    isReaderModalEnabled &&
    !isLegacyLayoutOptedOut;
  const { onReadClick: onReaderInstallGateClick } = useReaderInstallPromptGate(
    post,
    // Dismissing the install prompt tears down the classic post modal too,
    // so the user doesn't bounce back to the surface they just rejected.
    // `onClose` is a React event handler — the post modal close ignores its
    // argument, so a fake undefined event is fine.
    {
      onCloseParent: onClose
        ? // The post modal's onClose is typed as `MouseEventHandler |
          // KeyboardEventHandler` (a union) but the underlying close handler
          // ignores its event argument. Pass through with a cast.
          () => (onClose as (event?: unknown) => void)()
        : undefined,
    },
  );

  const handleReadArticle = (event: React.MouseEvent) => {
    if (onReaderInstallGateClick(event)) {
      return;
    }
    onReadArticle?.();
  };

  const readPostIcon = isReaderVariant ? (
    <EarthIcon />
  ) : (
    getReadPostButtonIcon(post)
  );

  return (
    <Container {...props} className={classNames('gap-2', className)}>
      {!isPoll &&
        !isInternalReadTyped &&
        !hideShareReadButton &&
        !!onReadArticle && (
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
              href={readHref}
              target={openNewTab ? '_blank' : '_self'}
              icon={readPostIcon}
              iconPosition={
                isTwitter ? ButtonIconPosition.Right : (undefined as never)
              }
              onClick={handleReadArticle}
              data-testid="postActionsRead"
              size={buttonSize}
            >
              {!inlineActions ? readButtonText : undefined}
            </Button>
          </Tooltip>
        )}
      {isBoostButtonVisible && (
        <BoostPostButton post={post} buttonProps={{ size: buttonSize }} />
      )}
      {isCollection && !hideSubscribeAction && (
        <CollectionSubscribeButton post={post} />
      )}
      {!hideMenuOptions && (
        <PostMenuOptions
          post={post}
          origin={Origin.ArticleModal}
          buttonSize={buttonSize}
        />
      )}
    </Container>
  );
}
