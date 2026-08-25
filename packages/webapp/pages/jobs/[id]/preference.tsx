import React from 'react';
import type { ReactElement } from 'react';

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

import { opportunityUrl } from '@dailydotdev/shared/src/lib/constants';
import { PreferenceOptionsForm } from '@dailydotdev/shared/src/components/opportunity/PreferenceOptionsForm';

import { useRouter } from 'next/router';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
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

export const InnerPreferencePage = ({
  buttons,
}: {
  buttons: ReactElement;
}): ReactElement => {
  return (
    <>
      <FlexCol className="gap-4">
        <Typography type={TypographyType.LargeTitle} bold center>
          Train us to find your unicorn job
        </Typography>
        <Typography
          type={TypographyType.Title3}
          color={TypographyColor.Secondary}
          center
        >
          Tell us exactly what&apos;s worth bugging you about so we can ghost
          every irrelevant recruiter on your behalf. The better you set this up,
          the less nonsense you&apos;ll ever see.
        </Typography>
      </FlexCol>
      <PreferenceOptionsForm />
      <FlexRow className="justify-between">{buttons}</FlexRow>
    </>
  );
};

const PreferencePage = (): ReactElement => {
  const {
    query: { id },
    back,
  } = useRouter();
  const opportunityId = id as string;

  return (
    <div className="mx-4 my-4 flex w-auto max-w-full flex-col gap-4 tablet:mx-auto tablet:max-w-[35rem] laptop:flex-row">
      <FlexCol className="flex-1 gap-6">
        <InnerPreferencePage
          buttons={
            <>
              <Button
                size={ButtonSize.Large}
                variant={ButtonVariant.Tertiary}
                className="hidden laptop:flex"
                onClick={() => back()}
              >
                Back
              </Button>

              <Link
                href={`${opportunityUrl}/${opportunityId}/preference-done`}
                passHref
              >
                <Button
                  size={ButtonSize.Large}
                  variant={ButtonVariant.Primary}
                  className="w-full laptop:w-auto"
                  tag="a"
                  href={`${opportunityUrl}/${opportunityId}/preference-done`}
                >
                  Save preferences
                </Button>
              </Link>
            </>
          }
        />
      </FlexCol>
    </div>
  );
};

PreferencePage.getLayout = getOpportunityProtectedLayout;
PreferencePage.layoutProps = {
  ...opportunityPageLayoutProps,
  seo,
};

export default PreferencePage;
