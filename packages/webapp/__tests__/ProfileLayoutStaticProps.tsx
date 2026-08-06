import type { GetStaticPropsContext } from 'next';
import type { ParsedUrlQuery } from 'querystring';
import {
  getProfile,
  getProfileV2Extra,
} from '@dailydotdev/shared/src/lib/user';
import {
  getStaticPaths,
  getStaticProps,
} from '../components/layouts/ProfileLayout';
import { hasPublicWorld } from '../components/world/profileWorld';

jest.mock('@dailydotdev/shared/src/lib/user', () => ({
  ...jest.requireActual('@dailydotdev/shared/src/lib/user'),
  getProfile: jest.fn(),
  getProfileV2Extra: jest.fn(),
}));

jest.mock('../components/world/profileWorld', () => ({
  hasPublicWorld: jest.fn(),
}));

const mockedGetProfile = getProfile as jest.Mock;
const mockedGetProfileV2Extra = getProfileV2Extra as jest.Mock;
const mockedHasPublicWorld = hasPublicWorld as jest.Mock;

// Mirrors the (unexported) ProfileParams in ProfileLayout. Typing the
// helper as GetStaticPropsContext<ParsedUrlQuery> compiles under the
// default config but fails `typecheck:strict:changed`.
interface ProfileParams extends ParsedUrlQuery {
  userId: string;
}

const context = (userId?: string) =>
  ({ params: { userId } } as unknown as GetStaticPropsContext<ProfileParams>);

beforeEach(() => {
  jest.clearAllMocks();
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
    mockedGetProfile.mockResolvedValue(null);

    await expect(
      getStaticProps(context('definitely-not-a-user')),
    ).resolves.toEqual({ notFound: true, revalidate: 60 });
  });

  it('returns notFound when no handle was supplied', async () => {
    await expect(getStaticProps(context(undefined))).resolves.toEqual({
      notFound: true,
      revalidate: 60,
    });
    expect(mockedGetProfile).not.toHaveBeenCalled();
  });

  it('returns notFound when the profile is forbidden, without confirming it exists', async () => {
    mockedGetProfile.mockRejectedValue({
      response: { errors: [{ extensions: { code: 'FORBIDDEN' } }] },
    });

    await expect(getStaticProps(context('blocked-user'))).resolves.toEqual({
      notFound: true,
      revalidate: 60,
    });
  });

  it('still serves a real profile', async () => {
    const user = { id: 'u1', username: 'kramer', noindex: false };
    mockedGetProfile.mockResolvedValue(user);
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

  it('rethrows unexpected errors rather than hiding them as a 404', async () => {
    const boom = { response: { errors: [{ extensions: { code: 'BOOM' } }] } };
    mockedGetProfile.mockRejectedValue(boom);

    await expect(getStaticProps(context('kramer'))).rejects.toEqual(boom);
  });
});
