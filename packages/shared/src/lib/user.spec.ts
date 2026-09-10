import { classifyProfileRequest, type PublicProfile } from './user';
import { ApiError } from '../graphql/common';

const user = { id: 'u1', username: 'kramer' } as PublicProfile;

describe('classifyProfileRequest', () => {
  it('returns found when the profile response has a user', () => {
    expect(classifyProfileRequest(200, { data: { user } })).toEqual({
      status: 'found',
      user,
    });
  });

  it('returns notFound for the API code used by missing profiles', () => {
    expect(
      classifyProfileRequest(200, {
        data: { user: null },
        errors: [{ extensions: { code: ApiError.Forbidden } }],
      }),
    ).toEqual({ status: 'notFound' });
  });

  it('returns failed for a server error', () => {
    const result = classifyProfileRequest(500);

    expect(result.status).toEqual('failed');
    expect(result).toMatchObject({
      error: expect.objectContaining({
        message: 'Failed to fetch profile: 500',
      }),
    });
  });

  it('returns failed for an unknown GraphQL error', () => {
    const result = classifyProfileRequest(200, {
      errors: [{ extensions: { code: 'BOOM' } }],
    });

    expect(result.status).toEqual('failed');
  });
});
