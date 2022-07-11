import React, { ReactElement } from 'react';
import {
  getStaticPaths as getProfileStaticPaths,
  getStaticProps as getProfileStaticProps,
} from '../../components/layouts/ProfileLayout';
import { getAccountDetailsLayout } from '../../components/layouts/ProfileLayout/AccountDetailsLayout';
import { AccountPageContainer } from '../../components/layouts/ProfileLayout/common';

export const getStaticProps = getProfileStaticProps;
export const getStaticPaths = getProfileStaticPaths;

const AccountSecurityPage = (): ReactElement => {
  return <AccountPageContainer title="Security">Sample</AccountPageContainer>;
};

AccountSecurityPage.getLayout = getAccountDetailsLayout;

export default AccountSecurityPage;
