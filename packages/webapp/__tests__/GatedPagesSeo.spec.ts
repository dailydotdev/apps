import type { NextSeoProps } from 'next-seo/lib/types';
import { getSquadInvitation } from '@dailydotdev/shared/src/graphql/squads';
import FollowingFeed from '../pages/following';
import SquadAnalytics from '../pages/squads/[handle]/analytics';
import ModerateSquad from '../pages/squads/moderate';
import { getStaticProps as getSquadInviteStaticProps } from '../pages/squads/[handle]/[token]';

jest.mock('@dailydotdev/shared/src/graphql/squads', () => {
  const actual = jest.requireActual('@dailydotdev/shared/src/graphql/squads');

  return {
    ...actual,
    getSquadInvitation: jest.fn(),
  };
});

type WithLayoutProps = {
  layoutProps?: { seo?: NextSeoProps };
};

const layoutSeo = (page: unknown): NextSeoProps | undefined =>
  (page as WithLayoutProps).layoutProps?.seo;

// Regression lock: auth-gated pages must stay noindex,nofollow so private,
// crawler-inaccessible surfaces are never advertised as indexable.
describe('gated page seo', () => {
  it.each([
    ['following feed', FollowingFeed],
    ['squad analytics', SquadAnalytics],
    ['squad moderation', ModerateSquad],
  ])('%s is noindex and nofollow', (_, page) => {
    const seo = layoutSeo(page);

    expect(seo?.noindex).toBe(true);
    expect(seo?.nofollow).toBe(true);
  });

  it.each([
    ['a valid invite', { user: { name: 'Ido' }, source: { name: 'My Squad' } }],
    ['an invalid invite', {}],
  ])('squad invite token page is noindex for %s', async (_, invitation) => {
    (getSquadInvitation as jest.Mock).mockResolvedValue(invitation);

    const result = await getSquadInviteStaticProps({
      params: { handle: 'my-squad', token: 'token' },
    } as never);

    expect(result).toMatchObject({
      props: { seo: { noindex: true, nofollow: true } },
    });
  });
});
