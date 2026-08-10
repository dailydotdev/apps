import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import type { NextSeoProps } from 'next-seo';
import { useRouter } from 'next/router';
import { webappUrl } from '@dailydotdev/shared/src/lib/constants';
import { useQuery } from '@tanstack/react-query';
import { useConditionalFeature } from '@dailydotdev/shared/src/hooks/useConditionalFeature';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { featureInterestAgent } from '@dailydotdev/shared/src/lib/featureManagement';
import { interestsQueryOptions } from '@dailydotdev/shared/src/features/interests/queries';
import { useCreateInterest } from '@dailydotdev/shared/src/features/interests/hooks/useCreateInterest';
import { AgentHomeScreen } from '@dailydotdev/shared/src/features/interests/components/AgentHomeScreen';
import { getLayout as getFooterNavBarLayout } from '../../components/layouts/FooterNavBarLayout';
import { getLayout } from '../../components/layouts/MainLayout';
import ProtectedPage from '../../components/ProtectedPage';
import { getPageSeoTitles } from '../../components/layouts/utils';

const Page = (): ReactElement | null => {
  const router = useRouter();
  const { user, isAuthReady } = useAuthContext();
  const { value: showAgent } = useConditionalFeature({
    feature: featureInterestAgent,
    // Signed-in only, as at every other entry point: evaluating enrolls, and an
    // anonymous visitor can never see the feature to be measured on it.
    shouldEvaluate: isAuthReady && !!user,
  });
  // A signed-in reader without the flag has nothing here. An anonymous one has
  // not been evaluated at all, so they fall through to the sign-in wall rather
  // than being bounced off a page the flag never spoke about.
  const isGatedOut = isAuthReady && !!user && !showAgent;

  // Handed over from a shared agent link — see `useShareAgent`. The prompt is
  // put in the field, not run: spawning on someone else's link would spend a run
  // the reader never asked to spend.
  const sharedQuery = typeof router.query.q === 'string' ? router.query.q : '';

  // Nothing is asked of the API until the flag has said yes: a gated-out reader
  // is redirected away, so their requests would only spend backend budget and
  // muddy the feature's own request metrics.
  const { data: interests, isPending } = useQuery({
    ...interestsQueryOptions(user),
    enabled: showAgent && !!user?.id,
  });
  const { isCreating, createInterest } = useCreateInterest({
    onCreated: (id) => router.push(`${webappUrl}agent/${id}`),
  });

  useEffect(() => {
    if (isGatedOut) {
      router.replace(webappUrl);
    }
  }, [isGatedOut, router]);

  if (isGatedOut) {
    return null;
  }

  return (
    <ProtectedPage>
      <AgentHomeScreen
        agents={interests ?? []}
        isPending={isPending}
        onCreate={createInterest}
        isCreating={isCreating}
        initialQuery={sharedQuery}
      />
    </ProtectedPage>
  );
};

const getAgentLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

const seo: NextSeoProps = {
  ...getPageSeoTitles('Your agents'),
  nofollow: true,
  noindex: true,
};

Page.getLayout = getAgentLayout;
Page.layoutProps = { seo, screenCentered: false, hideFeedbackWidget: true };

export default Page;
