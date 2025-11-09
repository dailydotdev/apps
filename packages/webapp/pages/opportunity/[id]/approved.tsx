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
import { useRouter } from 'next/router';
import { Image } from '@dailydotdev/shared/src/components/image/Image';
import { opportunityLiveIllustration } from '@dailydotdev/shared/src/lib/image';
import { Portal } from '@dailydotdev/shared/src/components/tooltips/Portal';
import { recruiterLayoutHeaderClassName } from '@dailydotdev/shared/src/features/opportunity/types';
import {
  Button,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { OpportunityFooter } from '@dailydotdev/shared/src/components/opportunity/OpportunityFooter';
import {
  defaultOpenGraph,
  defaultSeo,
  defaultSeoTitle,
} from '../../../next-seo';
import { opportunityPageLayoutProps } from '../../../components/layouts/utils';
import { getOpportunityProtectedLayout } from '../../../components/layouts/OpportunityProtectedLayout';

const seo: NextSeoProps = {
  title: defaultSeoTitle,
  openGraph: { ...defaultOpenGraph },
  ...defaultSeo,
  nofollow: true,
  noindex: true,
};

const ApprovedPage = (): ReactElement => {
  const router = useRouter();

  const buttonElement = (
    <Button
      className="w-full"
      variant={ButtonVariant.Primary}
      onClick={() => {
        router.push(webappUrl);
      }}
    >
      Back to daily.dev
    </Button>
  );

  return (
    <>
      <Portal
        container={document.querySelector(`.${recruiterLayoutHeaderClassName}`)}
      >
        <div className="laptop:flex hidden items-center">{buttonElement}</div>
      </Portal>
      <OpportunityFooter>{buttonElement}</OpportunityFooter>
      <div className="tablet:mx-auto tablet:max-w-[35rem] laptop:flex-row mx-4 flex w-auto max-w-full flex-col gap-4">
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
            className="rounded-16 w-full gap-4 p-4 text-black"
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
                You&apos;ll get notified in Slack as soon as there&apos;s a
                strong match
              </Typography>
              <Typography tag={TypographyTag.Li}>
                You can update or edit your job listing anytime in your
                dashboard
              </Typography>
            </ul>
          </FlexCol>
        </FlexCol>
      </div>
    </>
  );
};

ApprovedPage.getLayout = getOpportunityProtectedLayout;
ApprovedPage.layoutProps = {
  ...opportunityPageLayoutProps,
  seo,
};

export default ApprovedPage;
