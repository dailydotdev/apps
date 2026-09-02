import { getSquadInvitation } from '@dailydotdev/shared/src/graphql/squads';
import { getStaticProps } from '../pages/squads/[handle]/[token]';

jest.mock('@dailydotdev/shared/src/graphql/squads', () => {
  const actual = jest.requireActual('@dailydotdev/shared/src/graphql/squads');

  return {
    ...actual,
    getSquadInvitation: jest.fn(),
  };
});

const mockInvitation = getSquadInvitation as jest.Mock;

const runStaticProps = () =>
  getStaticProps({
    params: { handle: 'my-squad', token: 'null' },
  } as never);

describe('squad invitation static props', () => {
  beforeEach(() => {
    mockInvitation.mockReset();
  });

  it('should 404 an invitation that does not resolve', async () => {
    mockInvitation.mockResolvedValue(null);

    const result = await runStaticProps();

    expect(result).toEqual({ notFound: true, revalidate: 60 });
  });

  it('should 404 when the invitation request throws', async () => {
    mockInvitation.mockRejectedValue(new Error('nope'));

    const result = await runStaticProps();

    expect(result).toEqual({ notFound: true, revalidate: 60 });
  });

  it('should keep a valid invitation out of the index', async () => {
    mockInvitation.mockResolvedValue({
      user: { name: 'Ido', username: 'ido' },
      source: { name: 'My Squad', handle: 'my-squad', description: 'A squad' },
    });

    const result = await runStaticProps();

    expect(result).toMatchObject({
      props: {
        handle: 'my-squad',
        seo: {
          title: 'Ido invited you to My Squad',
          noindex: true,
          nofollow: true,
        },
      },
    });
  });
});
