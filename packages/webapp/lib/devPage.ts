import type { GetServerSideProps } from 'next';

/**
 * `/dev/*` pages render unreleased UI against mock data, and the agent family
 * fabricates a signed-in user to do it, so the production deployment must not
 * serve them at all. They exist to be reviewed on a preview, which builds with
 * `NODE_ENV=production` too, hence Vercel's own environment rather than
 * `isDevelopment`. Request time also keeps mock timestamps out of build-time
 * HTML, where they hydrate as a mismatch.
 */
export const devPageServerSideProps: GetServerSideProps = async () => {
  if (process.env.VERCEL_ENV === 'production') {
    return { notFound: true };
  }

  return { props: {} };
};
