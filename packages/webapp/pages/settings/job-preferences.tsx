import type { ReactElement } from 'react';
import React from 'react';

import type { NextSeoProps } from 'next-seo';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { FlexCol } from '@dailydotdev/shared/src/components/utilities';
import { getSettingsLayout } from '../../components/layouts/SettingsLayout';
import { defaultSeo } from '../../next-seo';
import { getTemplatedTitle } from '../../components/layouts/utils';
import { AccountPageContainer } from '../../components/layouts/SettingsLayout/AccountPageContainer';

const seo: NextSeoProps = {
  ...defaultSeo,
  title: getTemplatedTitle('Manage job preferences'),
};

const JobPreferencesPage = (): ReactElement => {
  return (
    <AccountPageContainer title="Job preferences">
      <div className="flex flex-col gap-6">
        <FlexCol>
          <Typography type={TypographyType.Body}>
            <strong>Career mode</strong> (beta)
          </Typography>
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            When this is on, daily.dev works as your trusted talent agent,
            introducing you to real roles from real teams for your approval.
            Nothing is shared without your say-so. We’ll only reach out when a
            role is worth your time. No spam. No pressure. Your career, your
            terms.
          </Typography>
        </FlexCol>
      </div>
    </AccountPageContainer>
  );
};

JobPreferencesPage.getLayout = getSettingsLayout;
JobPreferencesPage.layoutProps = { seo };

export default JobPreferencesPage;
