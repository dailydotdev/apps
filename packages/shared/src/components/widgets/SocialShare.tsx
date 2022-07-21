import React, { ReactElement, useContext } from 'react';
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
import { Origin } from '../../lib/analytics';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import { Comment, getCommentHash } from '../../graphql/comments';

interface SocialShareProps {
  origin: Origin;
  post: Post;
  comment?: Comment;
}
export const SocialShare = ({
  post,
  comment,
  origin,
  columns,
  column,
  row,
}: SocialShareProps & FeedItemPosition): ReactElement => {
  const isComment = !!comment;
  const link = isComment
    ? `${post?.commentsPermalink}${getCommentHash(comment.id)}`
    : post?.commentsPermalink;
  const { trackEvent } = useContext(AnalyticsContext);
  const trackClick = (provider: ShareProvider) =>
    trackEvent(
      postAnalyticsEvent('share post', post, {
        columns,
        column,
        row,
        extra: { provider, origin, ...(comment && { commentId: comment.id }) },
      }),
    );

  return (
    <section className="flex flex-wrap py-2 mb-2">
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
        href={getEmailShareLink(link, 'I found this amazing article')}
        icon={<MailIcon />}
        className="bg-theme-bg-email"
        onClick={() => trackClick(ShareProvider.Email)}
        label="Email"
      />
    </section>
  );
};
