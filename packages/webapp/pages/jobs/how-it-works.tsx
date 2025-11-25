import React from 'react';
import type { ReactElement } from 'react';

import type { NextSeoProps } from 'next-seo';
import { FlexCol } from '@dailydotdev/shared/src/components/utilities';

import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';

import { getCandidatePreferencesOptions } from '@dailydotdev/shared/src/features/opportunity/queries';
import { useQuery } from '@tanstack/react-query';
import { OpportunityFAQ } from '@dailydotdev/shared/src/features/opportunity/components/OpportunityFAQ';
import { OpportunityBenefits } from '@dailydotdev/shared/src/features/opportunity/components/OpportunityBenefits';
import { OpportunityHowItWorks } from '@dailydotdev/shared/src/features/opportunity/components/OpportunityHowItWorks';
import { IntroHeader } from '@dailydotdev/shared/src/features/opportunity/components/IntroHeader';
import { defaultOpenGraph, defaultSeo, defaultSeoTitle } from '../../next-seo';
import { getLayout as getFooterNavBarLayout } from '../../components/layouts/FooterNavBarLayout';
import { getLayout } from '../../components/layouts/MainLayout';

const seo: NextSeoProps = {
  title: defaultSeoTitle,
  openGraph: { ...defaultOpenGraph },
  ...defaultSeo,
  nofollow: true,
  noindex: true,
};

const JobsHowItWorksPage = (): ReactElement => {
  const { user, isAuthReady } = useAuthContext();

  const { isPending } = useQuery(getCandidatePreferencesOptions(user?.id));

  if (isAuthReady && isPending) {
    return null;
  }

  return (
    <div className="relative mx-4 mt-10 max-w-[47.875rem] tablet:mx-auto">
      <FlexCol className="gap-8 tablet:mx-4 laptop:mx-0">
        <IntroHeader />
        <OpportunityBenefits />
        <OpportunityHowItWorks />
        <OpportunityFAQ />
      </FlexCol>
    </div>
  );
};

const geOpportunityLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

JobsHowItWorksPage.getLayout = geOpportunityLayout;
JobsHowItWorksPage.layoutProps = { screenCentered: false, seo };

export default JobsHowItWorksPage;
