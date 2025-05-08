import type { ReactElement } from 'react';
import React, { useState } from 'react';
import TabContainer, {
  Tab,
} from '@dailydotdev/shared/src/components/tabs/TabContainer';
import type { NextSeoProps } from 'next-seo';
import { AccountSecurityDisplay as Display } from '../../components/layouts/AccountLayout/common';
import { getAccountLayout } from '../../components/layouts/AccountLayout';
import VerifyWorkEmail from '../../components/layouts/AccountLayout/Profile/VerifyWorkEmail';
import ProfileIndex from '../../components/layouts/AccountLayout/Profile';
import { defaultSeo } from '../../next-seo';
import { getTemplatedTitle } from '../../components/layouts/utils';

const seo: NextSeoProps = {
  ...defaultSeo,
  title: getTemplatedTitle('Manage account profile'),
};

const AccountProfilePage = (): ReactElement => {
  const [activeDisplay, setActiveDisplay] = useState(Display.Default);
  const [workEmail, setWorkEmail] = useState('');

  return (
    <TabContainer showHeader={false} controlledActive={activeDisplay}>
      <Tab label={Display.Default}>
        <ProfileIndex
          onSwitchDisplay={setActiveDisplay}
          workEmail={workEmail}
          setWorkEmail={setWorkEmail}
        />
      </Tab>
      <Tab label={Display.ChangeEmail}>
        <VerifyWorkEmail
          onSwitchDisplay={setActiveDisplay}
          workEmail={workEmail}
        />
      </Tab>
    </TabContainer>
  );
};

AccountProfilePage.getLayout = getAccountLayout;
AccountProfilePage.layoutProps = { seo };

export default AccountProfilePage;
