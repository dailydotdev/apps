import { ApiError, gqlClient } from '@dailydotdev/shared/src/graphql/common';
import { getStaticProps } from '../pages/achievements/[id]';

jest.mock('@dailydotdev/shared/src/graphql/common', () => {
  const actual = jest.requireActual('@dailydotdev/shared/src/graphql/common');

  return {
    ...actual,
    gqlClient: {
      request: jest.fn(),
    },
  };
});

const mockRequest = gqlClient.request as jest.Mock;

const apiError = (code: string) =>
  Object.assign(new Error(code), {
    response: { errors: [{ message: code, extensions: { code } }] },
  });

const run = () => getStaticProps({ params: { id: 'achievement-id' } });

describe('shared achievement static props', () => {
  beforeEach(() => {
    mockRequest.mockReset();
  });

  it('should render the unavailable state when the award is not shared', async () => {
    mockRequest.mockResolvedValueOnce({ sharedCreatorAchievement: null });

    const result = await run();

    expect(result).toMatchObject({
      props: { id: 'achievement-id', achievement: null },
      revalidate: 60,
    });
  });

  it.each([ApiError.NotFound, ApiError.Forbidden])(
    'should render the unavailable state on %s',
    async (code) => {
      mockRequest.mockRejectedValueOnce(apiError(code));

      const result = await run();

      expect(result).toMatchObject({ props: { achievement: null } });
    },
  );

  it('should throw on a network failure instead of caching unavailable', async () => {
    const error = new Error('fetch failed');
    mockRequest.mockRejectedValueOnce(error);

    await expect(run()).rejects.toBe(error);
  });

  it('should throw on an unclassified API error', async () => {
    const error = apiError('INTERNAL_SERVER_ERROR');
    mockRequest.mockRejectedValueOnce(error);

    await expect(run()).rejects.toBe(error);
  });
});
