import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Post } from '../../../graphql/posts';
import type { Squad } from '../../../graphql/sources';
import { Button } from '../../buttons/Button';
import { ButtonSize, ButtonVariant } from '../../buttons/common';
import { Tooltip } from '../../tooltip/Tooltip';
import { CopyIcon, ShareIcon, TwitterIcon, WhatsappIcon } from '../../icons';
import { useCopyPostLink } from '../../../hooks/useCopyPostLink';
import { useGetShortUrl } from '../../../hooks';
import { getShareLink, ShareProvider } from '../../../lib/share';
import { useLogContext } from '../../../contexts/LogContext';
import { useAuthContext } from '../../../contexts/AuthContext';
import { postLogEvent } from '../../../lib/feed';
import { LogEvent, Origin } from '../../../lib/log';
import { useLazyModal } from '../../../hooks/useLazyModal';
import { LazyModal } from '../../modals/common/types';
import { ReferralCampaignKey } from '../../../lib';
import { getShareableSquads } from '../../squads/SquadsToShare';
import SourceProfilePicture from '../../profile/SourceProfilePicture';
import { ProfileImageSize } from '../../ProfilePicture';

interface DiscussionShareRowProps {
  post: Post;
  className?: string;
  /**
   * Surfaces the user's squads as inline avatar buttons for quick sharing.
   * The trailing "more" action still opens the full share modal with every
   * squad and option.
   */
  withSquads?: boolean;
}

const maxInlineSquads = 4;
const mobileInlineSquads = 2;

/**
 * Compact share row for the discussion panel. Surfaces the most-used quick
 * actions (copy, X, WhatsApp) inline and defers the long tail (Facebook,
 * squads, native share) to the full Share modal behind a single "more" action.
 */
export const DiscussionShareRow = ({
  post,
  className,
  withSquads = false,
}: DiscussionShareRowProps): ReactElement => {
  const href = post.commentsPermalink;
  const cid = ReferralCampaignKey.SharePost;
  const { getShortUrl } = useGetShortUrl();
  const [copying, copyLink] = useCopyPostLink();
  const { logEvent } = useLogContext();
  const { openModal } = useLazyModal();
  const { squads } = useAuthContext();
  const inlineSquads = withSquads
    ? getShareableSquads(squads).slice(0, maxInlineSquads)
    : [];

  const onShareToSquad = (squad: Squad) => {
    logEvent(postLogEvent(LogEvent.StartShareToSquad, post));
    openModal({
      type: LazyModal.CreateSharedPost,
      props: {
        squad,
        preview: post,
        onSharedSuccessfully: () =>
          logEvent(postLogEvent(LogEvent.ShareToSquad, post)),
      },
    });
  };

  const logShareEvent = (provider: ShareProvider) =>
    logEvent(
      postLogEvent(LogEvent.SharePost, post, {
        extra: { provider, origin: Origin.ShareBar },
      }),
    );

  const onShare = async (provider: ShareProvider) => {
    logShareEvent(provider);
    const shortLink = await getShortUrl(href, cid);
    const shareLink = getShareLink({
      provider,
      link: shortLink,
      text: post?.title,
    });
    globalThis.window?.open(shareLink, '_blank');
  };

  const onCopy = async () => {
    const shortLink = await getShortUrl(href, cid);
    copyLink({ link: shortLink });
    logShareEvent(ShareProvider.CopyLink);
  };

  const onMore = () =>
    openModal({
      type: LazyModal.Share,
      props: { post, origin: Origin.ShareBar },
    });

  return (
    <div
      className={classNames(
        'flex items-center justify-between gap-2',
        className,
      )}
    >
      <span className="text-text-tertiary typo-footnote">Share this post</span>
      <div className="flex items-center gap-1">
        <Tooltip content={copying ? 'Copied!' : 'Copy link'}>
          <Button
            aria-label="Copy link"
            icon={
              <CopyIcon
                className={copying ? 'text-accent-avocado-default' : undefined}
                secondary={copying}
              />
            }
            onClick={onCopy}
            size={ButtonSize.Small}
            type="button"
            variant={ButtonVariant.Tertiary}
          />
        </Tooltip>
        <Tooltip content="Share on X">
          <Button
            aria-label="Share on X"
            icon={<TwitterIcon />}
            onClick={() => onShare(ShareProvider.Twitter)}
            size={ButtonSize.Small}
            type="button"
            variant={ButtonVariant.Tertiary}
          />
        </Tooltip>
        <Tooltip content="Share on WhatsApp">
          <Button
            aria-label="Share on WhatsApp"
            icon={<WhatsappIcon secondary />}
            onClick={() => onShare(ShareProvider.WhatsApp)}
            size={ButtonSize.Small}
            type="button"
            variant={ButtonVariant.Tertiary}
          />
        </Tooltip>
        {inlineSquads.map((squad, index) => (
          <Tooltip key={squad.id} content={`Share to @${squad.handle}`}>
            <Button
              aria-label={`Share to ${squad.name}`}
              // Keep the row compact on mobile: only the first two squads
              // show; the rest appear from tablet up.
              className={
                index >= mobileInlineSquads ? 'hidden tablet:flex' : undefined
              }
              icon={
                <SourceProfilePicture
                  source={squad}
                  size={ProfileImageSize.Small}
                />
              }
              onClick={() => onShareToSquad(squad)}
              size={ButtonSize.Small}
              type="button"
              variant={ButtonVariant.Tertiary}
            />
          </Tooltip>
        ))}
        <Tooltip content="See all squads and sharing options">
          <Button
            aria-label="More sharing options"
            icon={<ShareIcon />}
            onClick={onMore}
            size={ButtonSize.Small}
            type="button"
            variant={ButtonVariant.Tertiary}
          />
        </Tooltip>
      </div>
    </div>
  );
};
