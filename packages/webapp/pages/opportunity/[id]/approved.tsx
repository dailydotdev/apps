import type { ReactElement } from 'react';
import React from 'react';

import type { NextSeoProps } from 'next-seo';

import { FlexCol } from '@dailydotdev/shared/src/components/utilities';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';

import { MagicIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { webappUrl } from '@dailydotdev/shared/src/lib/constants';
import { briefButtonBg } from '@dailydotdev/shared/src/styles/custom';
import { OpportunityEditProvider } from '@dailydotdev/shared/src/components/opportunity/OpportunityEditContext';
import { OpportunitySteps } from '@dailydotdev/shared/src/components/opportunity/OpportunitySteps/OpportunitySteps';
import { useRouter } from 'next/router';
import { Image } from '@dailydotdev/shared/src/components/image/Image';
import { opportunityLiveIllustration } from '@dailydotdev/shared/src/lib/image';
import {
  defaultOpenGraph,
  defaultSeo,
  defaultSeoTitle,
} from '../../../next-seo';
import { opportunityPageLayoutProps } from '../../../components/layouts/utils';
import { getLayout } from '../../../components/layouts/RecruiterLayout';

const seo: NextSeoProps = {
  title: defaultSeoTitle,
  openGraph: { ...defaultOpenGraph },
  ...defaultSeo,
  nofollow: true,
  noindex: true,
};

const ApprovedPage = (): ReactElement => {
  return (
    <div className="mx-4 flex w-auto max-w-full flex-col gap-4 tablet:mx-auto tablet:max-w-[35rem] laptop:flex-row">
      <FlexCol className="flex-1 gap-6">
        <FlexCol className="items-center gap-4">
          <Image src={opportunityLiveIllustration} />
          <Typography type={TypographyType.LargeTitle} bold center>
            Your job listing is now live!
          </Typography>
          <Typography
            type={TypographyType.Title3}
            color={TypographyColor.Secondary}
            center
          >
            We&apos;ll start matching your role with the most relevant
            candidates right away. Expect tailored introductions delivered
            directly to you — no noise, just the right talent.
          </Typography>
        </FlexCol>
        <FlexCol
          className="w-full gap-4 rounded-16 p-4 text-black"
          style={{
            background: briefButtonBg,
          }}
        >
          <header className="flex items-center gap-2">
            <MagicIcon size={IconSize.Small} />{' '}
            <Typography bold>What&apos;s next?</Typography>
          </header>
          <ul className="flex list-disc flex-col gap-1 pl-7">
            <Typography tag={TypographyTag.Li}>
              We&apos;ll automatically surface top candidates that meet your
              role requirements
            </Typography>
            <Typography tag={TypographyTag.Li}>
              You&apos;ll get notified in Slack as soon as there&apos;s a strong
              match
            </Typography>
            <Typography tag={TypographyTag.Li}>
              You can update or edit your job listing anytime in your dashboard
            </Typography>
          </ul>
        </FlexCol>
      </FlexCol>
    </div>
  );
};

const GetPageLayout: typeof getLayout = (page, layoutProps) => {
  const router = useRouter();
  const { id } = router.query;

  return (
    <OpportunityEditProvider opportunityId={id as string}>
      {getLayout(page, {
        ...layoutProps,
        additionalButtons: (
          <OpportunitySteps
            step={2}
            totalSteps={2}
            ctaText="Back to daily.dev"
            ctaButtonProps={{
              onClick: () => {
                router.push(webappUrl);
              },
            }}
          />
        ),
      })}
    </OpportunityEditProvider>
  );
};

ApprovedPage.getLayout = GetPageLayout;
ApprovedPage.layoutProps = {
  ...opportunityPageLayoutProps,
  seo,
};

export default ApprovedPage;
