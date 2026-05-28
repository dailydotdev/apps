import type { GetServerSideProps } from 'next';

/** Legacy URL: keep redirecting old `/onboarding/swipe` links into the funnel. */
export const getServerSideProps: GetServerSideProps = async ({
  resolvedUrl,
}) => {
  const queryIndex = resolvedUrl.indexOf('?');
  const query = queryIndex === -1 ? '' : resolvedUrl.slice(queryIndex);

  return {
    redirect: {
      destination: `/onboarding${query}`,
      permanent: false,
    },
  };
};

export default function SwipeOnboardingRedirect(): null {
  return null;
}
