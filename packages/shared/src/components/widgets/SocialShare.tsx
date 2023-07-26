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
import { usePostToSquad } from '../../hooks';
import { SocialShareContainer } from './SocialShareContainer';
import { useCopyLink } from '../../hooks/useCopyLink';
import { SquadsToShare } from '../squads/SquadsToShare';

interface SocialShareProps {
  origin: Origin;
  post: Post;
  comment?: Comment;
  onSquadShare?: (post: Post) => void;
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
  commentary,
}: SocialShareProps & FeedItemPosition): ReactElement => {
  const isComment = !!comment;
  const href = isComment
    ? `${post?.commentsPermalink}${getCommentHash(comment.id)}`
    : post?.commentsPermalink;
  const [copying, copyLink] = useCopyLink(() => href);
  const link = isComment
    ? `${post?.commentsPermalink}${getCommentHash(comment.id)}`
    : post?.commentsPermalink;
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

  const { onSubmitPost, isPosting } = usePostToSquad({
    initialPreview: post,
    onPostSuccess: () => {
      trackEvent(postAnalyticsEvent(AnalyticsEvent.ShareToSquad, post));
      onSquadShare(null);
    },
  });

  const trackAndCopyLink = () => {
    copyLink();
    trackClick(ShareProvider.CopyLink);
  };

  return (
    <>
      {!isComment && !post.private && (
        <SocialShareContainer title="Share with your squad">
          <SquadsToShare
            onClick={(e, squad) => onSubmitPost(e, squad.id, commentary)}
            isLoading={isPosting}
          />
        </SocialShareContainer>
      )}
      <SocialShareContainer title="Share externally" className="mt-4">
        <SocialShareIcon
          onClick={trackAndCopyLink}
          pressed={copying}
          icon={
            <CopyIcon
              className={classNames(
                'text-theme-label-invert',
                copying && 'text-theme-color-avocado',
              )}
              secondary={copying}
            />
          }
          className="btn-primary"
          label={copying ? 'Copied!' : 'Copy link'}
        />
        <SocialShareIcon
          href={getTwitterShareLink(link, post?.title)}
          icon={<TwitterIcon />}
          className="bg-theme-bg-twitter"
          onClick={() => trackClick(ShareProvider.Twitter)}
          label="Twitter"
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
