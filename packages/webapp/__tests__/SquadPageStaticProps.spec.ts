import { gqlClient } from '@dailydotdev/shared/src/graphql/common';
import {
  getSquad,
  getSquadStaticFields,
} from '@dailydotdev/shared/src/graphql/squads';
import { SourceType } from '@dailydotdev/shared/src/graphql/sources';
import { getServerSideProps } from '../pages/squads/[handle]/index';

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
    getSquad: jest.fn(),
  };
});

const mockRequest = gqlClient.request as jest.Mock;
const mockStaticFields = getSquadStaticFields as jest.Mock;
const mockGetSquad = getSquad as jest.Mock;

const createSquad = (isPublic: boolean) => ({
  id: 'squad-id',
  handle: 'my-squad',
  name: 'My Squad',
  permalink: 'https://app.daily.dev/squads/my-squad',
  description: 'A squad',
  image: 'https://media.daily.dev/squad.png',
  membersCount: 3,
  public: isPublic,
});

const runGssp = () =>
  getServerSideProps({
    params: { handle: 'my-squad' },
    query: {},
    res: { setHeader: jest.fn() },
  } as never);

describe('squad page getServerSideProps seo', () => {
  beforeEach(() => {
    mockRequest.mockReset();
    mockStaticFields.mockReset();
    mockGetSquad.mockReset();
    mockRequest.mockResolvedValue({
      source: { type: SourceType.Squad, id: 'squad-id' },
    });
  });

  it('marks a private squad as noindex and nofollow', async () => {
    mockStaticFields.mockResolvedValue(createSquad(false));

    const result = await runGssp();

    expect(result).toMatchObject({
      props: {
        seo: {
          noindex: true,
          nofollow: true,
        },
      },
    });
  });

  it('keeps a public squad indexable', async () => {
    mockStaticFields.mockResolvedValue(createSquad(true));
    mockGetSquad.mockResolvedValue(createSquad(true));

    const result = await runGssp();

    expect(result).toMatchObject({
      props: {
        seo: {
          noindex: false,
          nofollow: false,
        },
      },
    });
  });
});
