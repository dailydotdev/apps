import type { ReactElement } from 'react';
import React from 'react';

import type { NextSeoProps } from 'next-seo';

import { FlexCol, FlexRow } from '@dailydotdev/shared/src/components/utilities';
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

import { webappUrl } from '@dailydotdev/shared/src/lib/constants';
import { PreferenceOptionsForm } from '@dailydotdev/shared/src/components/opportunity/PreferenceOptionsForm';

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

const PreferencePage = (): ReactElement => {
  return (
    <div className="mx-4 flex w-auto max-w-full flex-col gap-4 tablet:mx-auto tablet:max-w-[35rem] laptop:flex-row">
      <FlexCol className="flex-1 gap-6">
        <FlexCol className="gap-4">
          <Typography type={TypographyType.LargeTitle} bold center>
            Train us to find your unicorn job
          </Typography>
          <Typography
            type={TypographyType.Title3}
            color={TypographyColor.Secondary}
            center
          >
            Tell us exactly what’s worth bugging you about so we can ghost every
            irrelevant recruiter on your behalf. The better you set this up, the
            less nonsense you’ll ever see.
          </Typography>
        </FlexCol>
        <PreferenceOptionsForm />
        <FlexRow className="justify-between">
          <Button
            size={ButtonSize.Large}
            variant={ButtonVariant.Tertiary}
            className="hidden laptop:flex"
          >
            Back
          </Button>
          <Button
            size={ButtonSize.Large}
            variant={ButtonVariant.Primary}
            className="w-full laptop:w-auto"
            tag="a"
            href={`${webappUrl}jobs/job-123/preference-done`}
          >
            Save preferences
          </Button>
        </FlexRow>
      </FlexCol>
    </div>
  );
};

const getPageLayout: typeof getLayout = (...page) => getLayout(...page);

PreferencePage.getLayout = getPageLayout;
PreferencePage.layoutProps = {
  className: 'gap-10 laptop:pt-10 pb-10',
  screenCentered: true,
  seo,
};

export default PreferencePage;
