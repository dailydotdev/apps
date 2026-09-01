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
    // Evaluating enrolls, so an anonymous visitor must not be measured.
    shouldEvaluate: isAuthReady && !!user,
  });
  // An anonymous reader was never evaluated, so they get the sign-in wall below
  // rather than the redirect.
  const isGatedOut = isAuthReady && !!user && !showAgent;

  // Handed over by a shared agent link, and typed into the field rather than
  // run: see `useShareAgent`.
  const sharedQuery = typeof router.query.q === 'string' ? router.query.q : '';

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
