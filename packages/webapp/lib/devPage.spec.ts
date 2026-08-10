import type { GetServerSidePropsContext } from 'next';
import { devPageServerSideProps } from './devPage';

const run = () =>
  devPageServerSideProps({} as GetServerSidePropsContext) as Promise<
    Record<string, unknown>
  >;

const originalEnv = process.env.VERCEL_ENV;

afterEach(() => {
  process.env.VERCEL_ENV = originalEnv;
});

/**
 * These pages fabricate a signed-in user to render unreleased UI, so `noindex`
 * is not a gate: it keeps them out of search results, not out of the browser of
 * anyone who has the URL. Previews build as production, so the deployment
 * environment is the only signal that separates the two.
 */
describe('a /dev review page', () => {
  it('is not served by the production deployment', async () => {
    process.env.VERCEL_ENV = 'production';

    expect(await run()).toEqual({ notFound: true });
  });

  it('is served on a preview, which is the whole point of it', async () => {
    process.env.VERCEL_ENV = 'preview';

    expect(await run()).toEqual({ props: {} });
  });

  it('is served locally, where there is no Vercel environment at all', async () => {
    delete process.env.VERCEL_ENV;

    expect(await run()).toEqual({ props: {} });
  });
});
