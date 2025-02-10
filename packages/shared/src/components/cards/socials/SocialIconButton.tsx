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
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, Origin } from '../../../lib/log';

type SocialShareButtonProps = {
  post: Post;
  platform: SocialIconType;
  variant?: ButtonVariant;
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
          post.commentsPermalink,
        )}&title=${encodeURIComponent(post.title)}`,
        icon: <RedditIcon secondary />,
      };
    case SocialIconType.X:
      return {
        ...commonProps,
        href: `https://x.com/share?url=${encodeURIComponent(
          post.commentsPermalink,
        )}&text=${encodeURIComponent(post.title)}`,
        icon: <TwitterIcon />,
      };
    case SocialIconType.LinkedIn:
      return {
        ...commonProps,
        href: `https://www.linkedin.com/shareArticle?url=${encodeURIComponent(
          post.commentsPermalink,
        )}&title=${encodeURIComponent(post.title)}`,
        icon: <LinkedInIcon secondary />,
      };
    case SocialIconType.WhatsApp:
      return {
        ...commonProps,
        href: `https://wa.me/?text=${encodeURIComponent(
          post.commentsPermalink,
        )}`,
        icon: <WhatsappIcon color="white" secondary />,
      };
    default:
      return {};
  }
};

const SocialIconButton = ({
  post,
  platform,
  variant = ButtonVariant.Float,
}: SocialShareButtonProps): ReactElement => {
  const { logEvent } = useLogContext();
  return (
    <Button
      variant={variant}
      tag="a"
      onClick={() =>
        logEvent({
          event_name: LogEvent.SharePost,
          extra: JSON.stringify({
            provider: platform,
            origin: Origin.Suggestions,
          }),
        })
      }
      {...getBtnProps({ post, platform })}
    />
  );
};

export default SocialIconButton;
