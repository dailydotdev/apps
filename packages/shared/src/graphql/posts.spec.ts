import {
  BAN_POST_MUTATION,
  DELETE_POST_MUTATION,
  banPost,
  deletePost,
  Post,
  getLatestChangelogPost,
} from './posts';
import { mockGraphQL } from '../../__tests__/helpers/graphql';
import { RankingAlgorithm, SOURCE_FEED_QUERY } from './feed';
import { Connection } from './common';

beforeEach(() => {
  jest.clearAllMocks();
});
const id = 'p1';

it('should send banPost query', async () => {
  let queryCalled = false;
  mockGraphQL({
    request: {
      query: BAN_POST_MUTATION,
      variables: { id },
    },
    result: () => {
      queryCalled = true;
      return {
        data: {
          banPost: {
            _: true,
          },
        },
      };
    },
  });
  await banPost(id);
  expect(queryCalled).toBeTruthy();
});

it('should send deletePost query', async () => {
  let queryCalled = false;
  mockGraphQL({
    request: {
      query: DELETE_POST_MUTATION,
      variables: { id },
    },
    result: () => {
      queryCalled = true;
      return {
        data: {
          deletePost: {
            _: true,
          },
        },
      };
    },
  });
  await deletePost(id);
  expect(queryCalled).toBeTruthy();
});

it('should return latest changelog post', async () => {
  interface MockFeedData {
    page: Connection<Pick<Post, 'id'>>;
  }

  let queryCalled = false;
  mockGraphQL<MockFeedData>({
    request: {
      query: SOURCE_FEED_QUERY,
      variables: {
        source: 'daily_updates',
        first: 1,
        loggedIn: false,
        ranking: RankingAlgorithm.Time,
      },
    },
    result: () => {
      queryCalled = true;

      return {
        data: {
          page: {
            edges: [
              {
                node: { id: 'test1' },
              },
            ],
            pageInfo: {},
          },
        },
      };
    },
  });
  const result = await getLatestChangelogPost();

  expect(queryCalled).toBeTruthy();
  expect(result.id).toBe('test1');
});
