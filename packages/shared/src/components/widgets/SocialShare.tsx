import React, { ReactElement } from 'react';
import {
  getEmailShareLink,
  getFacebookShareLink,
  getLinkedInShareLink,
  getRedditShareLink,
  getTelegramShareLink,
  getTwitterShareLink,
  getWhatsappShareLink,
} from '../../lib/share';
import ForwardIcon from '../icons/Forward';
import { SocialShareIcon } from './SocialShareIcon';
import { Post } from '../../graphql/posts';

interface SocialShareProps {
  post: Post;
}
export const SocialShare = ({ post }: SocialShareProps): ReactElement => {
  return (
    <section className="flex flex-wrap py-2 mb-2">
      <SocialShareIcon
        href={getWhatsappShareLink(post?.commentsPermalink)}
        icon={<ForwardIcon />}
        className="bg-theme-bg-whatsapp"
        label="Whatsapp"
      />
      <SocialShareIcon
        href={getTwitterShareLink(post?.commentsPermalink, post?.title)}
        icon={<ForwardIcon />}
        className="bg-theme-bg-twitter"
        label="Twitter"
      />
      <SocialShareIcon
        href={getRedditShareLink(post?.commentsPermalink, post?.title)}
        icon={<ForwardIcon />}
        className="bg-theme-bg-reddit"
        label="Reddit"
      />
      <SocialShareIcon
        href={getFacebookShareLink(post?.commentsPermalink)}
        icon={<ForwardIcon />}
        className="bg-theme-bg-facebook"
        label="Facebook"
      />
      <SocialShareIcon
        href={getLinkedInShareLink(post?.commentsPermalink)}
        icon={<ForwardIcon />}
        className="bg-theme-bg-linkedin"
        label="LinkedIn"
      />
      <SocialShareIcon
        href={getTelegramShareLink(post?.commentsPermalink, post?.title)}
        icon={<ForwardIcon />}
        className="bg-theme-bg-telegram"
        label="Telegram"
      />
      <SocialShareIcon
        href={getEmailShareLink(
          post?.commentsPermalink,
          'I found this amazing article',
        )}
        icon={<ForwardIcon />}
        className="bg-theme-bg-email"
        label="Email"
      />
    </section>
  );
};
