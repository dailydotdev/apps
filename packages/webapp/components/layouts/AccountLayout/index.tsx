import React, { ReactElement, ReactNode, useContext } from 'react';
import { getProfile, PublicProfile } from '@dailydotdev/shared/src/lib/user';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { NextSeoProps } from 'next-seo/lib/types';
import Head from 'next/head';
import { NextSeo } from 'next-seo';
import dynamic from 'next/dynamic';
import { useQuery } from 'react-query';
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
  const { data: profile } = useQuery<PublicProfile>(queryKey, () =>
    getProfile(user.id),
  );

  if (!profile || !Object.keys(profile).length) {
    return <></>; // should be a loading screen
  }

  const Seo: NextSeoProps = profile
    ? {
        title: profile.name,
        titleTemplate: '%s | daily.dev',
        description: profile.bio
          ? profile.bio
          : `Check out ${profile.name}'s profile`,
        openGraph: {
          images: [{ url: profile.image }],
        },
        twitter: {
          handle: profile.twitter,
        },
      }
    : {};

  return (
    <>
      <Head>
        <link rel="preload" as="image" href={profile.image} />
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
