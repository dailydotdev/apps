import type { GetStaticPropsContext } from 'next';
import type { ParsedUrlQuery } from 'querystring';
import { getProfileV2Extra } from '@dailydotdev/shared/src/lib/user';
import { ApiError } from '@dailydotdev/shared/src/graphql/common';
import {
  getStaticPaths,
  getStaticProps,
} from '../components/layouts/ProfileLayout';
import { hasPublicWorld } from '../components/world/profileWorld';
import { getStaticProps as getWorldStaticProps } from '../pages/world/[userId]';

jest.mock('@dailydotdev/shared/src/lib/user', () => ({
  ...jest.requireActual('@dailydotdev/shared/src/lib/user'),
  getProfileV2Extra: jest.fn(),
}));

jest.mock('../components/world/profileWorld', () => ({
  hasPublicWorld: jest.fn(),
}));

const mockedGetProfileV2Extra = getProfileV2Extra as jest.Mock;
const mockedHasPublicWorld = hasPublicWorld as jest.Mock;
const fetchMock = jest.fn();

// Mirrors the (unexported) ProfileParams in ProfileLayout. Typing the
// helper as GetStaticPropsContext<ParsedUrlQuery> compiles under the
// default config but fails `typecheck:strict:changed`.
interface ProfileParams extends ParsedUrlQuery {
  userId: string;
}

const context = (userId?: string) =>
  ({ params: { userId } } as unknown as GetStaticPropsContext<ProfileParams>);

const respondProfile = (body: unknown, status = 200) =>
  fetchMock.mockResolvedValue({
    status,
    json: async () => body,
  });

beforeEach(() => {
  jest.clearAllMocks();
  fetchMock.mockReset();
  global.fetch = fetchMock as unknown as typeof fetch;
});

// `pages/[userId]` is a ROOT-LEVEL dynamic route, so it claims every
// single-segment path on the apex. If it answers 200 for handles that do
// not exist, every unknown URL on daily.dev becomes a soft 404 —
// `/plus.md`, `/llms-full.txt` and `/definitely-not-a-user` all looked
// like real pages to crawlers and agents, which read the status code.
describe('profile getStaticPaths', () => {
  it('blocks on the first request instead of serving a 200 shell', async () => {
    // `fallback: true` answers unknown paths with a loading shell under
    // HTTP 200 before getStaticProps runs, which makes the `notFound`
    // below unreachable on the request that matters.
    await expect(getStaticPaths()).resolves.toEqual({
      paths: [],
      fallback: 'blocking',
    });
  });
});

describe('profile getStaticProps', () => {
  it('returns notFound when the handle does not resolve to a user', async () => {
    respondProfile({
      data: { user: null },
      errors: [{ extensions: { code: ApiError.NotFound } }],
    });

    await expect(
      getStaticProps(context('definitely-not-a-user')),
    ).resolves.toEqual({ notFound: true, revalidate: 60 });
  });

  it('returns notFound when no handle was supplied', async () => {
    await expect(getStaticProps(context(undefined))).resolves.toEqual({
      notFound: true,
      revalidate: 60,
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns notFound when the profile is forbidden, without confirming it exists', async () => {
    respondProfile({
      data: { user: null },
      errors: [{ extensions: { code: ApiError.Forbidden } }],
    });

    await expect(getStaticProps(context('blocked-user'))).resolves.toEqual({
      notFound: true,
      revalidate: 60,
    });
  });

  it('still serves a real profile', async () => {
    const user = { id: 'u1', username: 'kramer', noindex: false };
    respondProfile({ data: { user } });
    mockedGetProfileV2Extra.mockResolvedValue({ userStats: { numPosts: 1 } });
    mockedHasPublicWorld.mockResolvedValue(true);

    await expect(getStaticProps(context('kramer'))).resolves.toEqual({
      props: {
        user,
        userStats: { numPosts: 1 },
        hasWorld: true,
        noindex: false,
      },
      revalidate: 60,
    });
  });

  it('rethrows HTTP failures rather than hiding them as a 404', async () => {
    respondProfile({ errors: [{ message: 'boom' }] }, 500);

    await expect(getStaticProps(context('kramer'))).rejects.toThrow(
      'Failed to fetch profile: 500',
    );
  });

  it('rethrows network errors rather than hiding them as a 404', async () => {
    const error = new Error('network down');
    fetchMock.mockRejectedValue(error);

    await expect(getStaticProps(context('kramer'))).rejects.toEqual(error);
  });

  it('rethrows aborts rather than hiding them as a 404', async () => {
    const abort = Object.assign(new Error('aborted'), { name: 'AbortError' });
    fetchMock.mockRejectedValue(abort);

    await expect(getStaticProps(context('kramer'))).rejects.toEqual(abort);
  });

  it('rethrows unrecognised GraphQL errors rather than hiding them as a 404', async () => {
    respondProfile({
      data: { user: null },
      errors: [{ extensions: { code: 'BOOM' } }],
    });

    await expect(getStaticProps(context('kramer'))).rejects.toThrow(
      'Failed to fetch profile',
    );
  });

  it('forwards a world profile notFound result unchanged', async () => {
    respondProfile({
      data: { user: null },
      errors: [{ extensions: { code: ApiError.Forbidden } }],
    });

    await expect(getWorldStaticProps(context('blocked-user'))).resolves.toEqual(
      {
        notFound: true,
        revalidate: 60,
      },
    );
  });
});
