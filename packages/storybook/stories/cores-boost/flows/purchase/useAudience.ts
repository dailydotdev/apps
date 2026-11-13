import { useState } from 'react';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import type { CampaignAudience } from '@dailydotdev/shared/src/graphql/campaigns';
import type { BoostAudienceValue } from '@dailydotdev/shared/src/features/boost/BoostAudience';
import {
  BoostLocation,
  toCampaignAudience,
} from '@dailydotdev/shared/src/features/boost/BoostAudience';

// Target audience as production's boost form keeps it: the post's tags,
// worldwide, until the poster edits either row.

export const useAudience = (
  post: Post,
): {
  postTags: string[];
  audience: BoostAudienceValue;
  setAudience: (value: BoostAudienceValue) => void;
  campaignAudience: CampaignAudience | undefined;
} => {
  const postTags = post.tags?.length
    ? post.tags
    : (post.sharedPost?.tags ?? []);
  const [audience, setAudience] = useState<BoostAudienceValue>({
    tags: postTags,
    location: BoostLocation.Worldwide,
    countries: [],
  });

  return {
    postTags,
    audience,
    setAudience,
    campaignAudience: toCampaignAudience(audience, postTags),
  };
};
