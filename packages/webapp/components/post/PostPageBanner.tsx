import type { ReactElement } from 'react';
import React from 'react';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { PhoneTopAdStrip } from '@dailydotdev/shared/src/components/post/read/PhoneTopAdStrip';
import CustomAuthBanner from '@dailydotdev/shared/src/components/auth/CustomAuthBanner';
import { usePostPageRedesign } from './usePostPageRedesign';

interface PostPageBannerProps {
  post?: Pick<Post, 'type'> | null;
}

// Strip first: both pin, and the banner's top offset is the strip's height.
// The strip renders in the layout, outside the page, so it takes the page's
// own redesign decision: the focus card carries no slot markup and never
// loads adsbygoogle, and a unit pinned without the script neither fills nor
// collapses.
export function PostPageBanner({ post }: PostPageBannerProps): ReactElement {
  const showRedesign = usePostPageRedesign(post);

  return (
    <>
      {!showRedesign && <PhoneTopAdStrip surface="organic" />}
      <CustomAuthBanner />
    </>
  );
}
