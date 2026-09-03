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
import { Origin, LogEvent } from '../../lib/log';
import { CollectionSubscribeButton } from './collection/CollectionSubscribeButton';
import { useViewSizeClient, ViewSize, useGetShortUrl } from '../../hooks';
import { BoostPostButton } from '../../features/boost/BoostButton';
import { Tooltip } from '../tooltip/Tooltip';
import { useShowBoostButton } from '../../features/boost/useShowBoostButton';
import { useReaderModalEligibility } from './reader/hooks/useReaderModalEligibility';
import { useReaderInstallPromptGate } from '../../hooks/useReaderInstallPromptGate';
import { EarthIcon, LinkIcon } from '../icons';
import { CopyStateIcon } from '../share/CopyStateIcon';
import { useCopyPostLink } from '../../hooks/useCopyPostLink';
import { useLogContext } from '../../contexts/LogContext';
import { postLogEvent } from '../../lib/feed';
import { ReferralCampaignKey } from '../../lib/referral';
import { ShareProvider } from '../../lib/share';
import { useSharePlacement } from '../../features/snapshot/useSharePlacement';
import { featurePostCopyLink } from '../../lib/featureManagement';

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
  hideOptions,
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
  const { isReaderEnabled } = useReaderModalEligibility();
  // When the reader is the user's default we flip the action semantics:
  // "Read post" becomes the inside-daily.dev entry (globe icon, opens reader
  // preview), and a secondary external-link button takes over the "open in a
  // new tab" role that used to live on Read post. Once a user opts out (via the
  // install-prompt overlay or settings) the UI snaps back to the classic Read
  // post button + no secondary button.
  const isReaderVariant = isArticle && isReaderEnabled;
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

  // Every post type renders this cluster, on the page and in the sticky nav,
  // so the link lives here rather than per surface.
  const isCopyLinkEnabled = useSharePlacement({
    feature: featurePostCopyLink,
    shouldEvaluate: !!post,
  });
  const [linkCopied, copyLink] = useCopyPostLink();
  const { getShortUrl } = useGetShortUrl();
  const { logEvent } = useLogContext();

  const onCopyLink = async () => {
    logEvent(
      postLogEvent(LogEvent.SharePost, post, {
        extra: { provider: ShareProvider.CopyLink, origin: Origin.PostContent },
      }),
    );
    copyLink({
      link: await getShortUrl(
        post.commentsPermalink,
        ReferralCampaignKey.SharePost,
      ),
    });
  };

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
      {isCopyLinkEnabled && post && (
        <Tooltip side="bottom" content="Copy link">
          <Button
            aria-label="Copy link"
            icon={<CopyStateIcon copied={linkCopied} icon={LinkIcon} />}
            onClick={onCopyLink}
            size={buttonSize}
            type="button"
            variant={ButtonVariant.Tertiary}
          />
        </Tooltip>
      )}
      {!hideOptions && (
        <PostMenuOptions
          post={post}
          origin={Origin.ArticleModal}
          buttonSize={buttonSize}
        />
      )}
    </Container>
  );
}
