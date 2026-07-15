import type { NextSeoProps } from 'next-seo/lib/types';
import FollowingFeed from '../pages/following';

type WithLayoutProps = {
  layoutProps?: { seo?: NextSeoProps };
};

// Regression lock: auth-gated pages must stay noindex,nofollow so private,
// crawler-inaccessible surfaces are never advertised as indexable.
describe('gated page seo', () => {
  it('following feed is noindex and nofollow', () => {
    const { seo } = (FollowingFeed as WithLayoutProps).layoutProps ?? {};

    expect(seo?.noindex).toBe(true);
    expect(seo?.nofollow).toBe(true);
  });
});
