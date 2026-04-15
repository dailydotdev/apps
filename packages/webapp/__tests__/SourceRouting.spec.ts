import { gqlClient, ApiError } from '@dailydotdev/shared/src/graphql/common';
import { getSquadStaticFields } from '@dailydotdev/shared/src/graphql/squads';
import { SourceType } from '@dailydotdev/shared/src/graphql/sources';
import { getStaticProps as getSourceStaticProps } from '../pages/sources/[source]';
import { getServerSideProps as getSquadServerSideProps } from '../pages/squads/[handle]';

jest.mock('@dailydotdev/shared/src/graphql/common', () => {
  const actual = jest.requireActual('@dailydotdev/shared/src/graphql/common');

  return {
    ...actual,
    gqlClient: {
      request: jest.fn(),
    },
  };
});

jest.mock('@dailydotdev/shared/src/graphql/squads', () => {
  const actual = jest.requireActual('@dailydotdev/shared/src/graphql/squads');

  return {
    ...actual,
    getSquadStaticFields: jest.fn(),
  };
});

const mockRequest = gqlClient.request as jest.MockedFunction<
  typeof gqlClient.request
>;
const mockGetSquadStaticFields =
  getSquadStaticFields as jest.MockedFunction<typeof getSquadStaticFields>;

describe('source and squad route redirects', () => {
  beforeEach(() => {
    mockRequest.mockReset();
    mockGetSquadStaticFields.mockReset();
  });

  it('redirects squad sources from /sources/[source] to /squads/[source]', async () => {
    mockRequest.mockResolvedValueOnce({
      source: {
        id: 'frontend',
        name: 'Frontend',
        image: 'https://daily.dev/frontend.png',
        handle: 'frontend',
        permalink: 'https://app.daily.dev/squads/frontend',
        type: SourceType.Squad,
        public: true,
      },
    });

    const result = await getSourceStaticProps({
      params: { source: 'frontend' },
    } as never);

    expect(result).toEqual({
      redirect: {
        destination: '/squads/frontend',
        permanent: false,
      },
    });
  });

  it('redirects machine sources from /squads/[handle] to /sources/[handle]', async () => {
    mockGetSquadStaticFields.mockRejectedValueOnce({
      response: {
        errors: [
          {
            extensions: {
              code: ApiError.NotFound,
            },
          },
        ],
      },
    });
    mockRequest.mockResolvedValueOnce({
      source: {
        id: 'daily',
        name: 'daily.dev',
        image: 'https://daily.dev/daily.png',
        handle: 'daily',
        permalink: 'https://app.daily.dev/sources/daily',
        type: SourceType.Machine,
        public: true,
      },
    });

    const setHeader = jest.fn();
    const result = await getSquadServerSideProps({
      params: { handle: 'daily' },
      query: {},
      res: { setHeader },
    } as never);

    expect(setHeader).toHaveBeenCalled();
    expect(result).toEqual({
      redirect: {
        destination: '/sources/daily',
        permanent: false,
      },
    });
  });
});
