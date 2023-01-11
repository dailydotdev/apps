import request from 'graphql-request';
import { mockGraphQL } from '../../__tests__/helpers/graphql';
import { deleteComment, DELETE_COMMENT_MUTATION } from './comments';

beforeEach(() => {
  jest.clearAllMocks();
});
const id = 'p1';

it('should send deleteComment query', async () => {
  let queryCalled = false;
  mockGraphQL({
    request: {
      query: DELETE_COMMENT_MUTATION,
      variables: { id },
    },
    result: () => {
      queryCalled = true;
      return {
        data: {
          deleteComment: {
            _: true,
          },
        },
      };
    },
  });
  await deleteComment(id, request);
  expect(queryCalled).toBeTruthy();
});
