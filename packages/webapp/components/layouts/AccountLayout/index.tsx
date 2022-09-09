import React, { ReactElement, ReactNode, useContext } from 'react';
import { PublicProfile } from '@dailydotdev/shared/src/lib/user';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { NextSeoProps } from 'next-seo/lib/types';
import Head from 'next/head';
import { NextSeo } from 'next-seo';
import dynamic from 'next/dynamic';
import { getLayout as getMainLayout } from '../MainLayout';
import SidebarNav from './SidebarNav';

const Custom404 = dynamic(() => import('../../../pages/404'));

export interface AccountLayoutProps {
  profile: PublicProfile;
  children?: ReactNode;
}

export default function AccountLayout({
  children,
}: AccountLayoutProps): ReactElement {
  const { user: profile } = useContext(AuthContext);

  if (!profile) {
    return <Custom404 />;
  }

  if (!Object.keys(profile).length) {
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
      <main className="flex relative flex-row flex-1 items-stretch pt-0 mx-auto w-full laptop:max-w-[calc(100vw-17.5rem)]">
        <SidebarNav
          className="absolute tablet:relative z-3 ml-auto w-full h-full border-l tablet:w-[unset] bg-theme-bg-primary border-theme-divider-tertiary"
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
