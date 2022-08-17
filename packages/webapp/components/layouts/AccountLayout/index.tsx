import React, { ReactElement, ReactNode, useContext } from 'react';
import {
  GraphQLProfile,
  PublicProfile,
} from '@dailydotdev/shared/src/lib/user';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { NextSeoProps } from 'next-seo/lib/types';
import Head from 'next/head';
import { NextSeo } from 'next-seo';
import dynamic from 'next/dynamic';
import { useQuery } from 'react-query';
import { apiUrl } from '@dailydotdev/shared/src/lib/config';
import { USER_BY_ID_STATIC_FIELDS_QUERY } from '@dailydotdev/shared/src/graphql/users';
import request from 'graphql-request';
import { getLayout as getMainLayout } from '../MainLayout';
import SidebarNav from './SidebarNav';
import { AccountPage } from './common';

const Custom404 = dynamic(() => import('../../../pages/404'));

export interface AccountLayoutProps {
  profile: PublicProfile;
  children?: ReactNode;
  activePage?: AccountPage;
}

export default function AccountLayout({
  activePage,
  children,
}: AccountLayoutProps): ReactElement {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Custom404 />;
  }

  const queryKey = ['profile', user.id];
  const { data: profile } = useQuery<GraphQLProfile>(queryKey, () =>
    request(`${apiUrl}/graphql`, USER_BY_ID_STATIC_FIELDS_QUERY, {
      id: user.id,
    }),
  );

  const userProfile = profile?.user;

  if (!userProfile || !Object.keys(userProfile).length) {
    return <></>; // should be a loading screen
  }

  const Seo: NextSeoProps = userProfile
    ? {
        title: userProfile.name,
        titleTemplate: '%s | daily.dev',
        description: userProfile.bio
          ? userProfile.bio
          : `Check out ${userProfile.name}'s profile`,
        openGraph: {
          images: [{ url: userProfile.image }],
        },
        twitter: {
          handle: userProfile.twitter,
        },
      }
    : {};

  return (
    <>
      <Head>
        <link rel="preload" as="image" href={userProfile.image} />
      </Head>
      <NextSeo {...Seo} />
      <main className="flex relative flex-row flex-1 pt-0 mx-auto w-[calc(100vw-17.5rem)]">
        <SidebarNav
          className="px-6 pt-6 ml-auto border-l border-theme-divider-tertiary"
          activePage={activePage}
          basePath="account"
        />
        {children}
      </main>
    </>
  );
}

export const getAccountLayout = (
  page: ReactNode,
  props: AccountLayoutProps,
): ReactNode =>
  getMainLayout(<AccountLayout {...props}>{page}</AccountLayout>, null, {
    screenCentered: false,
  });
