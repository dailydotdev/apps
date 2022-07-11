import React, { ReactElement } from 'react';
import {
  getStaticPaths as getProfileStaticPaths,
  getStaticProps as getProfileStaticProps,
} from '../../components/layouts/ProfileLayout';
import { getAccountDetailsLayout } from '../../components/layouts/ProfileLayout/AccountDetailsLayout';
import { AccountPageContainer } from '../../components/layouts/ProfileLayout/common';

export const getStaticProps = getProfileStaticProps;
export const getStaticPaths = getProfileStaticPaths;

const AccountOthersPage = (): ReactElement => {
  return (
    <AccountPageContainer title="Other Settings">Sample</AccountPageContainer>
  );
};

AccountOthersPage.getLayout = getAccountDetailsLayout;

export default AccountOthersPage;
