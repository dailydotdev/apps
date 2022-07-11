import React, { ReactElement, ReactNode } from 'react';
import { getProfile, PublicProfile } from '@dailydotdev/shared/src/lib/user';
import { NextSeoProps } from 'next-seo/lib/types';
import Head from 'next/head';
import { NextSeo } from 'next-seo';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useQuery } from 'react-query';
import { getLayout as getMainLayout } from '../MainLayout';
import SidebarNav from './SidebarNav';
import { AccountPage } from './common';

const Custom404 = dynamic(() => import('../../../pages/404'));

export interface AccountDetailsLayoutProps {
  profile: PublicProfile;
  children?: ReactNode;
  activePage?: AccountPage;
}

export default function AccountDetailsLayout({
  profile: initialProfile,
  activePage,
  children,
}: AccountDetailsLayoutProps): ReactElement {
  const router = useRouter();

  if (!router.isFallback && !initialProfile) {
    return <Custom404 />;
  }

  const queryKey = ['profile', initialProfile?.id];
  const { data: fetchedProfile } = useQuery<PublicProfile>(
    queryKey,
    () => getProfile(initialProfile.id),
    { initialData: initialProfile, enabled: !!initialProfile },
  );

  const profile = fetchedProfile ?? initialProfile;

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

  if (!initialProfile) {
    return <></>;
  }

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
        />
        {children}
      </main>
    </>
  );
}

export const getAccountDetailsLayout = (
  page: ReactNode,
  props: AccountDetailsLayoutProps,
): ReactNode =>
  getMainLayout(
    <AccountDetailsLayout {...props}>{page}</AccountDetailsLayout>,
    null,
    { screenCentered: false },
  );
