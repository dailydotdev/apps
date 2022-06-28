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
import { SocialShareIcon } from './SocialShareIcon';
import { Post } from '../../graphql/posts';
import MailIcon from '../icons/Mail';
import TwitterIcon from '../icons/Twitter';
import WhatsappIcon from '../icons/Whatsapp';
import FacebookIcon from '../icons/Facebook';
import RedditIcon from '../icons/Reddit';
import LinkedInIcon from '../icons/LinkedIn';
import TelegramIcon from '../icons/Telegram';

interface SocialShareProps {
  post: Post;
}
export const SocialShare = ({ post }: SocialShareProps): ReactElement => {
  return (
    <section className="flex flex-wrap py-2 mb-2">
      <SocialShareIcon
        href={getTwitterShareLink(post?.commentsPermalink, post?.title)}
        icon={<TwitterIcon />}
        className="bg-theme-bg-twitter"
        label="Twitter"
      />
      <SocialShareIcon
        href={getWhatsappShareLink(post?.commentsPermalink)}
        icon={<WhatsappIcon showSecondary />}
        className="bg-theme-bg-whatsapp"
        label="Whatsapp"
      />
      <SocialShareIcon
        href={getFacebookShareLink(post?.commentsPermalink)}
        icon={<FacebookIcon />}
        className="bg-theme-bg-facebook"
        label="Facebook"
      />
      <SocialShareIcon
        href={getRedditShareLink(post?.commentsPermalink, post?.title)}
        icon={<RedditIcon />}
        className="bg-theme-bg-reddit"
        label="Reddit"
      />
      <SocialShareIcon
        href={getLinkedInShareLink(post?.commentsPermalink)}
        icon={<LinkedInIcon />}
        className="bg-theme-bg-linkedin"
        label="LinkedIn"
      />
      <SocialShareIcon
        href={getTelegramShareLink(post?.commentsPermalink, post?.title)}
        icon={<TelegramIcon />}
        className="bg-theme-bg-telegram"
        label="Telegram"
      />
      <SocialShareIcon
        href={getEmailShareLink(
          post?.commentsPermalink,
          'I found this amazing article',
        )}
        icon={<MailIcon />}
        className="bg-theme-bg-email"
        label="Email"
      />
    </section>
  );
};
