import classNames from 'classnames';
import type { ReactElement } from 'react';
import React from 'react';
import { iconSizeToClassName, IconSize } from '../../components/Icon';
import {
  Typography,
  TypographyType,
} from '../../components/typography/Typography';
import { Image } from '../../components/image/Image';
import type { Post } from '../../graphql/posts';

interface CampaignListItemPostProps {
  post: Post;
}

export function CampaignListItemPost({
  post,
}: CampaignListItemPostProps): ReactElement {
  return (
    <span className="flex flex-1 flex-row items-center gap-2">
      {post.image && (
        <Image
          src={post.image}
          className={classNames(
            'rounded-12 object-cover',
            iconSizeToClassName[IconSize.Size48],
          )}
        />
      )}
      <span className="flex flex-1">
        <Typography
          type={TypographyType.Callout}
          className="line-clamp-2 flex-1 text-left"
          style={{ lineBreak: 'anywhere' }}
        >
          {post.title}
        </Typography>
      </span>
    </span>
  );
}
