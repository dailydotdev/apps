import React from 'react';
import type { ReactElement } from 'react';
import type { NextSeoProps } from 'next-seo';

import { useSettingsContext } from '@dailydotdev/shared/src/contexts/SettingsContext';
import {
  Typography,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import type { RadioItemProps } from '@dailydotdev/shared/src/components/fields/Radio';
import { Radio } from '@dailydotdev/shared/src/components/fields/Radio';

import { WriteFormTab } from '@dailydotdev/shared/src/components/fields/form/common';
import { FlexCol } from '@dailydotdev/shared/src/components/utilities';
import { AccountPageContainer } from '../../components/layouts/SettingsLayout/AccountPageContainer';
import { getSettingsLayout } from '../../components/layouts/SettingsLayout';
import { defaultSeo } from '../../next-seo';
import { getTemplatedTitle } from '../../components/layouts/utils';

const defaultWriteTabs: RadioItemProps[] = Object.keys(WriteFormTab).map(
  (key) => ({
    label: WriteFormTab[key],
    value: key,
  }),
);

const AccountManageSubscriptionPage = (): ReactElement => {
  const { updateFlag, flags } = useSettingsContext();

  return (
    <AccountPageContainer title="Composition">
      <div id="compose" aria-hidden />
      <FlexCol className="gap-2">
        <Typography bold type={TypographyType.Subhead}>
          Default new post type
        </Typography>

        <Radio
          name="default-write-tab"
          options={defaultWriteTabs}
          value={flags.defaultWriteTab}
          onChange={(value) => {
            updateFlag('defaultWriteTab', value);
          }}
          className={{
            content: 'w-full justify-between !pr-0',
            container: '!gap-0',
            label: 'font-normal text-text-secondary typo-callout',
          }}
          reverse
        />
      </FlexCol>
    </AccountPageContainer>
  );
};

const seo: NextSeoProps = {
  ...defaultSeo,
  title: getTemplatedTitle('Appearance'),
};

AccountManageSubscriptionPage.getLayout = getSettingsLayout;
AccountManageSubscriptionPage.layoutProps = { seo };

export default AccountManageSubscriptionPage;
