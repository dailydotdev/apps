import type { NextSeoProps } from 'next-seo/lib/types';
import { getSquadInvitation } from '@dailydotdev/shared/src/graphql/squads';
import FollowingFeed from '../pages/following';
import ModerateSquad from '../pages/squads/moderate';
import SquadManage from '../pages/squads/[handle]/manage';
import SquadManageSection from '../pages/squads/[handle]/manage/[section]';
import SquadMembers from '../pages/squads/[handle]/members';
import SquadPendingPosts from '../pages/squads/[handle]/pending';
import SquadProducts from '../pages/squads/[handle]/products';
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
    ['squad moderation', ModerateSquad],
    ['squad manage', SquadManage],
    ['squad manage section', SquadManageSection],
    ['squad members', SquadMembers],
    ['squad pending posts', SquadPendingPosts],
    ['squad products', SquadProducts],
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
