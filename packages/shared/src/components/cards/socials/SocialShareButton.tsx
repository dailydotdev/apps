import type { ReactElement } from 'react';
import React from 'react';
import { Button, ButtonVariant } from '../../buttons/Button';
import type { Post } from '../../../graphql/posts';
import {
  LinkedInIcon,
  RedditIcon,
  TwitterIcon,
  WhatsappIcon,
} from '../../icons';
import { SocialIconType } from '../../../lib/socialMedia';

type SocialShareButtonProps = {
  post: Post;
  platform: SocialIconType;
};

const getBtnProps = ({ post, platform }: SocialShareButtonProps) => {
  const commonProps = {
    target: '_blank',
    rel: 'noopener noreferrer',
  };

  switch (platform) {
    case SocialIconType.Reddit:
      return {
        ...commonProps,
        href: `https://www.reddit.com/submit?url=${encodeURIComponent(
          post.permalink,
        )}&title=${encodeURIComponent(post.title)}`,
        icon: <RedditIcon />,
      };
    case SocialIconType.X:
      return {
        ...commonProps,
        href: `https://x.com/share?url=${encodeURIComponent(
          post.permalink,
        )}&text=${encodeURIComponent(post.title)}`,
        icon: <TwitterIcon />,
      };
    case SocialIconType.LinkedIn:
      return {
        ...commonProps,
        href: `https://www.linkedin.com/shareArticle?url=${encodeURIComponent(
          post.permalink,
        )}&title=${encodeURIComponent(post.title)}`,
        icon: <LinkedInIcon />,
      };
    case SocialIconType.WhatsApp:
      return {
        ...commonProps,
        href: `https://wa.me/?text=${encodeURIComponent(post.title)}`,
        icon: <WhatsappIcon />,
      };
    default:
      return {};
  }
};

const SocialShareButton = ({
  post,
  platform,
}: SocialShareButtonProps): ReactElement => {
  return (
    <Button
      variant={ButtonVariant.Float}
      tag="a"
      {...getBtnProps({ post, platform })}
    />
  );
};

export default SocialShareButton;
