import type { GetServerSidePropsContext } from 'next';
import { gqlClient } from '@dailydotdev/shared/src/graphql/common';
import { LiveRoomStatus } from '@dailydotdev/shared/src/graphql/liveRooms';
import { getServerSideProps } from '../pages/standups/[id]';

jest.mock('@dailydotdev/shared/src/graphql/common', () => ({
  ...jest.requireActual('@dailydotdev/shared/src/graphql/common'),
  gqlClient: {
    request: jest.fn(),
  },
}));

const mockGqlRequest = gqlClient.request as jest.MockedFunction<
  typeof gqlClient.request
>;

const createContext = (): GetServerSidePropsContext<{
  id: string;
}> =>
  ({
    params: { id: 'room-1' },
    req: {
      headers: {
        cookie: 'da2=test-session',
      },
    },
    res: {
      setHeader: jest.fn(),
    },
  } as unknown as GetServerSidePropsContext<{ id: string }>);

describe('standup page getServerSideProps', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('forwards request cookies when loading the standup', async () => {
    mockGqlRequest.mockResolvedValueOnce({
      liveRoom: {
        id: 'room-1',
        topic: 'Instant standup',
        mode: 'moderated',
        status: LiveRoomStatus.Created,
        createdAt: '2026-05-17T00:00:00.000Z',
        updatedAt: '2026-05-17T00:00:00.000Z',
        startedAt: null,
        endedAt: null,
        scheduledStart: null,
        descriptionHtml: null,
        subscribed: false,
        contentEmbeds: [],
        host: {
          id: 'user-1',
          name: 'Host',
          username: 'host',
          image: '',
          permalink: '#',
        },
      },
    });

    const result = await getServerSideProps(createContext());

    expect(result).toHaveProperty('props');
    expect(mockGqlRequest).toHaveBeenCalledWith(
      expect.any(String),
      { id: 'room-1' },
      { Cookie: 'da2=test-session' },
    );
  });
});
