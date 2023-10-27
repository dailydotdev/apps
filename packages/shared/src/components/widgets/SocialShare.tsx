import React, { ReactElement, useContext } from 'react';
import classNames from 'classnames';
import {
  getEmailShareLink,
  getFacebookShareLink,
  getLinkedInShareLink,
  getRedditShareLink,
  getTelegramShareLink,
  getTwitterShareLink,
  getWhatsappShareLink,
  ShareProvider,
} from '../../lib/share';
import { SocialShareIcon } from './SocialShareIcon';
import { Post } from '../../graphql/posts';
import MailIcon from '../icons/Mail';
import TwitterIcon from '../icons/Twitter';
import WhatsappIcon from '../icons/Whatsapp';
import FacebookIcon from '../icons/Facebook';
import RedditIcon from '../icons/Reddit';
import LinkedInIcon from '../icons/LinkedIn';
import TelegramIcon from '../icons/Telegram';
import { FeedItemPosition, postAnalyticsEvent } from '../../lib/feed';
import { AnalyticsEvent, Origin } from '../../lib/analytics';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import { Comment, getCommentHash } from '../../graphql/comments';
import { IconSize } from '../Icon';
import { useSharePost } from '../../hooks/useSharePost';
import MenuIcon from '../icons/Menu';
import CopyIcon from '../icons/Copy';
import { SocialShareContainer } from './SocialShareContainer';
import { useCopyLink } from '../../hooks/useCopy';
import { SquadsToShare } from '../squads/SquadsToShare';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../modals/common/types';
import { Squad } from '../../graphql/sources';

interface SocialShareProps {
  origin: Origin;
  post: Post;
  comment?: Comment;
  onSquadShare?: () => void;
  commentary?: string;
}

export const SocialShare = ({
  post,
  comment,
  origin,
  columns,
  column,
  row,
  onSquadShare,
}: SocialShareProps & FeedItemPosition): ReactElement => {
  const isComment = !!comment;
  const href = isComment
    ? `${post?.commentsPermalink}${getCommentHash(comment.id)}`
    : post?.commentsPermalink;
  const [copying, copyLink] = useCopyLink(() => href);
  const link = isComment
    ? `${post?.commentsPermalink}${getCommentHash(comment.id)}`
    : post?.commentsPermalink;
  const { openModal } = useLazyModal();
  const { trackEvent } = useContext(AnalyticsContext);
  const { openNativeSharePost } = useSharePost(Origin.Share);
  const trackClick = (provider: ShareProvider) =>
    trackEvent(
      postAnalyticsEvent('share post', post, {
        columns,
        column,
        row,
        extra: { provider, origin, ...(comment && { commentId: comment.id }) },
      }),
    );

  const trackAndCopyLink = () => {
    copyLink();
    trackClick(ShareProvider.CopyLink);
  };

  const onSharedSuccessfully = () => {
    trackEvent(postAnalyticsEvent(AnalyticsEvent.ShareToSquad, post));

    if (onSquadShare) {
      onSquadShare();
    }
  };

  const onSquadsShare = (squad: Squad) => {
    openModal({
      type: LazyModal.CreateSharedPost,
      props: {
        squad,
        preview: post,
        onSharedSuccessfully,
      },
    });
  };

  return (
    <>
      {!isComment && !post.private && (
        <SocialShareContainer title="Share with your squad" className="mb-4">
          <SquadsToShare onClick={(_, squad) => onSquadsShare(squad)} />
        </SocialShareContainer>
      )}
      <SocialShareContainer title="Share externally">
        <SocialShareIcon
          onClick={trackAndCopyLink}
          icon={
            <CopyIcon
              className={classNames('text-theme-label-invert')}
              secondary={copying}
            />
          }
          className="btn-primary"
          label={copying ? 'Copied!' : 'Copy link'}
        />
        <SocialShareIcon
          href={getTwitterShareLink(link, post?.title)}
          icon={<TwitterIcon />}
          className="text-white bg-black"
          onClick={() => trackClick(ShareProvider.Twitter)}
          label="X"
        />
        <SocialShareIcon
          href={getWhatsappShareLink(link)}
          icon={<WhatsappIcon />}
          onClick={() => trackClick(ShareProvider.WhatsApp)}
          className="bg-theme-bg-whatsapp"
          label="WhatsApp"
        />
        <SocialShareIcon
          href={getFacebookShareLink(link)}
          icon={<FacebookIcon />}
          className="bg-theme-bg-facebook"
          onClick={() => trackClick(ShareProvider.Facebook)}
          label="Facebook"
        />
        <SocialShareIcon
          href={getRedditShareLink(link, post?.title)}
          icon={<RedditIcon />}
          className="bg-theme-bg-reddit"
          onClick={() => trackClick(ShareProvider.Reddit)}
          label="Reddit"
        />
        <SocialShareIcon
          href={getLinkedInShareLink(link)}
          icon={<LinkedInIcon />}
          className="bg-theme-bg-linkedin"
          onClick={() => trackClick(ShareProvider.LinkedIn)}
          label="LinkedIn"
        />
        <SocialShareIcon
          href={getTelegramShareLink(link, post?.title)}
          icon={<TelegramIcon />}
          className="bg-theme-bg-telegram"
          onClick={() => trackClick(ShareProvider.Telegram)}
          label="Telegram"
        />
        <SocialShareIcon
          href={getEmailShareLink(link, 'I found this amazing post')}
          icon={<MailIcon />}
          className="bg-theme-bg-email"
          onClick={() => trackClick(ShareProvider.Email)}
          label="Email"
        />
        {'share' in navigator && (
          <SocialShareIcon
            icon={<MenuIcon size={IconSize.Large} className="rotate-90" />}
            className="bg-theme-bg-email"
            onClick={() => openNativeSharePost(post)}
            label="Share via..."
          />
        )}
      </SocialShareContainer>
    </>
  );
};
