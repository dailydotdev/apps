import React, { ReactElement } from 'react';
import {
  getStaticPaths as getProfileStaticPaths,
  getStaticProps as getProfileStaticProps,
} from '../../components/layouts/ProfileLayout';
import { getAccountDetailsLayout } from '../../components/layouts/ProfileLayout/AccountDetailsLayout';
import {
  AccountPageContainer,
  ContentHeading,
  ContentText,
} from '../../components/layouts/ProfileLayout/common';

export const getStaticProps = getProfileStaticProps;
export const getStaticPaths = getProfileStaticPaths;

const AccountOthersPage = (): ReactElement => {
  return (
    <AccountPageContainer title="Other Settings">
      <ContentHeading>Timezone</ContentHeading>
      <ContentText className="mt-1">
        Used to calculate your weekly goal cycle and other time-based
        activities.
      </ContentText>
    </AccountPageContainer>
  );
};

AccountOthersPage.getLayout = getAccountDetailsLayout;

export default AccountOthersPage;
