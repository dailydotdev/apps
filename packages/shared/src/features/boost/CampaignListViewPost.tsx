import type { ReactElement } from 'react';
import React from 'react';
import { Button } from '../../components/buttons/Button';
import { ButtonVariant } from '../../components/buttons/common';
import { OpenLinkIcon } from '../../components/icons';
import {
  Typography,
  TypographyType,
} from '../../components/typography/Typography';
import { CampaignListViewContainer } from './common';
import type { Post } from '../../graphql/posts';
import { Image } from '../../components/image/Image';

interface CampaignListViewPostProps {
  post: Post;
}

export function CampaignListViewPost({
  post,
}: CampaignListViewPostProps): ReactElement {
  return (
    <CampaignListViewContainer>
      <span className="flex flex-1 flex-row">
        <Typography
          type={TypographyType.Callout}
          className="line-clamp-3 flex-1"
          style={{ lineBreak: 'anywhere' }}
        >
          {post.title}
        </Typography>
      </span>
      <Image src={post.image} className="h-12 w-18 rounded-12 object-cover" />
      <Button
        icon={<OpenLinkIcon />}
        variant={ButtonVariant.Tertiary}
        tag="a"
        href={post.commentsPermalink}
      />
    </CampaignListViewContainer>
  );
}
