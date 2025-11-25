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
import {
  Typography,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import {
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/common';
import { opportunityUrl } from '@dailydotdev/shared/src/lib/constants';
import { MoveToIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { getLayout } from '../../components/layouts/MainLayout';
import { getLayout as getFooterNavBarLayout } from '../../components/layouts/FooterNavBarLayout';
import { defaultOpenGraph, defaultSeo, defaultSeoTitle } from '../../next-seo';

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
    <div className="relative border-border-subtlest-tertiary tablet:mx-auto laptop:max-w-[48rem] laptop:border-x">
      <div className="flex items-center gap-2 border-b border-border-subtlest-tertiary px-5 py-3">
        <div className="flex gap-2">
          <Link href={opportunityUrl}>
            <Button
              tag="a"
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.Small}
              icon={<MoveToIcon size={IconSize.Small} className="rotate-180" />}
            />
          </Link>
        </div>
        <Typography type={TypographyType.Title3} bold>
          How it works
        </Typography>
      </div>
      <FlexCol className="gap-8 px-4 py-6">
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
