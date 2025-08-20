import type { ReactElement } from 'react';
import React from 'react';

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
import { JobIcon, PassiveIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { anchorDefaultRel } from '@dailydotdev/shared/src/lib/strings';
import { webappUrl } from '@dailydotdev/shared/src/lib/constants';
import { getLayout } from '../../../components/layouts/NoSidebarLayout';
import {
  defaultOpenGraph,
  defaultSeo,
  defaultSeoTitle,
} from '../../../next-seo';

const seo: NextSeoProps = {
  title: defaultSeoTitle,
  openGraph: { ...defaultOpenGraph },
  ...defaultSeo,
  nofollow: true,
  noindex: true,
};

const PassiveDonePage = (): ReactElement => {
  return (
    <div className="mx-4 flex w-auto max-w-full flex-col gap-4 tablet:mx-auto tablet:max-w-[35rem] laptop:flex-row">
      <FlexCol className="flex-1 gap-6">
        <FlexCol className="items-center gap-4">
          <PassiveIcon size={IconSize.Size48} className="text-text-secondary" />
          <Typography type={TypographyType.LargeTitle} bold center>
            We’ll step back until you’re ready
          </Typography>
          <Typography
            type={TypographyType.Title3}
            color={TypographyColor.Secondary}
            center
          >
            You won’t see any new opportunities from us unless you decide to
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
          <Button
            size={ButtonSize.Large}
            variant={ButtonVariant.Subtle}
            icon={<JobIcon size={IconSize.Small} />}
            className="w-full tablet:w-80"
            tag="a"
            rel={anchorDefaultRel}
            href={`${webappUrl}settings/job-preference`}
          >
            Update job preferences
          </Button>
        </FlexCol>
      </FlexCol>
    </div>
  );
};

const getPageLayout: typeof getLayout = (...page) => getLayout(...page);

PassiveDonePage.getLayout = getPageLayout;
PassiveDonePage.layoutProps = {
  className: 'gap-10 laptop:pt-10 pb-10',
  screenCentered: true,
  hideBackButton: true,
  seo,
};

export default PassiveDonePage;
