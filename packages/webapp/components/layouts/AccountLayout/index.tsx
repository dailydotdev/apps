import React, { ReactElement, ReactNode, useContext, useEffect } from 'react';
import classNames from 'classnames';
import { PublicProfile } from '@dailydotdev/shared/src/lib/user';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { NextSeoProps } from 'next-seo/lib/types';
import Head from 'next/head';
import { NextSeo } from 'next-seo';
import { ProfileSettingsMenu } from '@dailydotdev/shared/src/components/profile/ProfileSettingsMenu';
import {
  generateQueryKey,
  RequestKey,
} from '@dailydotdev/shared/src/lib/query';
import { useViewSize, ViewSize } from '@dailydotdev/shared/src/hooks';
import { useQueryState } from '@dailydotdev/shared/src/hooks/utils/useQueryState';
import { useRouter } from 'next/router';
import { useFeatureTheme } from '@dailydotdev/shared/src/hooks/utils/useFeatureTheme';
import { AuthTriggers } from '@dailydotdev/shared/src/lib/auth';
import AuthOptions from '@dailydotdev/shared/src/components/auth/AuthOptions';
import useAuthForms from '@dailydotdev/shared/src/hooks/useAuthForms';
import { getLayout as getMainLayout } from '../MainLayout';
import { getTemplatedTitle } from '../utils';
import SidebarNav from './SidebarNav';

export interface AccountLayoutProps {
  profile: PublicProfile;
  children?: ReactNode;
}

export const navigationKey = generateQueryKey(
  RequestKey.AccountNavigation,
  null,
);

export default function AccountLayout({
  children,
}: AccountLayoutProps): ReactElement {
  const router = useRouter();
  const { user: profile, isFetched } = useContext(AuthContext);
  const isMobile = useViewSize(ViewSize.MobileL);
  const [isOpen, setIsOpen] = useQueryState({
    key: navigationKey,
    defaultValue: false,
  });
  const featureTheme = useFeatureTheme();

  useEffect(() => {
    const onClose = () => setIsOpen(false);

    router.events.on('routeChangeComplete', onClose);

    return () => {
      router.events.off('routeChangeComplete', onClose);
    };
  }, [router.events, setIsOpen]);

  const { formRef } = useAuthForms();

  if (isFetched && !profile) {
    return (
      <div className="flex w-full items-center justify-center pt-10">
        <AuthOptions
          simplified
          isLoginFlow
          formRef={formRef}
          trigger={AuthTriggers.AccountPage}
        />
      </div>
    );
  }

  if (!profile || !Object.keys(profile).length) {
    return null;
  }

  const Seo: NextSeoProps = profile
    ? {
        title: getTemplatedTitle(profile.name),
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
      <NextSeo {...Seo} noindex nofollow />
      <main className="relative mx-auto flex w-full flex-1 flex-row items-stretch pt-0 laptop:max-w-[calc(100vw-17.5rem)]">
        {isMobile ? (
          <ProfileSettingsMenu
            shouldKeepOpen
            isOpen={isOpen}
            onClose={() => router.push(profile.permalink)}
          />
        ) : (
          <SidebarNav
            className={classNames(
              'absolute z-3 ml-auto h-full w-full border-l border-border-subtlest-tertiary bg-background-default tablet:relative tablet:w-[unset]',
              featureTheme ? 'bg-transparent' : 'bg-background-default',
            )}
            basePath="account"
          />
        )}
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
