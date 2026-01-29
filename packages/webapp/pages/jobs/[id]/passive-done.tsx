import React from 'react';
import type { ReactElement } from 'react';
import type { NextSeoProps } from 'next-seo';
import { FlexCol } from '@dailydotdev/shared/src/components/utilities';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { PassiveIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { anchorDefaultRel } from '@dailydotdev/shared/src/lib/strings';
import { webappUrl } from '@dailydotdev/shared/src/lib/constants';
import { TargetId } from '@dailydotdev/shared/src/lib/log';
import { CandidatePreferenceButton } from '@dailydotdev/shared/src/features/opportunity/components/CandidatePreferenceButton';
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

const PassiveDonePage = (): ReactElement => {
  return (
    <div className="mx-4 my-4 flex w-auto max-w-full flex-col gap-4 tablet:mx-auto tablet:max-w-[35rem] laptop:flex-row">
      <FlexCol className="flex-1 gap-6">
        <FlexCol className="items-center gap-4">
          <PassiveIcon size={IconSize.Size48} className="text-text-secondary" />
          <Typography type={TypographyType.LargeTitle} bold center>
            We&apos;ll step back until you&apos;re ready
          </Typography>
          <Typography
            type={TypographyType.Title3}
            color={TypographyColor.Secondary}
            center
          >
            You won&apos;t see any new job matches from us unless you decide to
            change your status. You can update your preferences anytime if
            things change.
          </Typography>
        </FlexCol>
        <FlexCol className="items-center gap-4">
          <Button
            size={ButtonSize.Large}
            variant={ButtonVariant.Primary}
            className="w-full tablet:w-80"
            tag="a"
            rel={anchorDefaultRel}
            href={webappUrl}
          >
            Back to daily.dev
          </Button>
          <CandidatePreferenceButton
            label="Update job preferences"
            targetId={TargetId.OpportunityPassiveDonePage}
            className="w-full tablet:w-80"
          />
        </FlexCol>
      </FlexCol>
    </div>
  );
};

PassiveDonePage.getLayout = getOpportunityProtectedLayout;
PassiveDonePage.layoutProps = {
  ...opportunityPageLayoutProps,
  hideBackButton: true,
  seo,
};

export default PassiveDonePage;
