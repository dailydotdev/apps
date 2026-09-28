import { getServerSideProps as getEditProps } from '../pages/squads/[handle]/edit';
import { getServerSideProps as getAnalyticsProps } from '../pages/squads/[handle]/analytics';
import { getServerSideProps as getModerateProps } from '../pages/squads/[handle]/moderate';
import { getServerSideProps as getAllModerateProps } from '../pages/squads/moderate';

// Notifications and emails keep linking to the pages Manage replaced.
describe('legacy squad urls', () => {
  it.each([
    ['edit', getEditProps, '/squads/webteam/manage/details'],
    ['analytics', getAnalyticsProps, '/squads/webteam/manage/analytics'],
    ['moderate', getModerateProps, '/squads/webteam/manage/moderation'],
  ])('redirects /squads/[handle]/%s', async (_, getProps, destination) => {
    const result = await getProps({ params: { handle: 'webteam' } } as never);

    expect(result).toEqual({ redirect: { destination, permanent: true } });
  });

  it('redirects one squad queue to its Manage area', async () => {
    const result = await getAllModerateProps({
      query: { handle: 'webteam' },
    } as never);

    expect(result).toEqual({
      redirect: {
        destination: '/squads/webteam/manage/moderation',
        permanent: true,
      },
    });
  });

  it('keeps the queue of every moderated squad', async () => {
    const result = await getAllModerateProps({ query: {} } as never);

    expect(result).toEqual({ props: {} });
  });
});
