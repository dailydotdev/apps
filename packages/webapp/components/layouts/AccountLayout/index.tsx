import type { ReactElement, ReactNode } from 'react';
import React, { useContext } from 'react';
import type { PublicProfile } from '@dailydotdev/shared/src/lib/user';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import {
  generateQueryKey,
  RequestKey,
} from '@dailydotdev/shared/src/lib/query';
// import { useViewSize, ViewSize } from '@dailydotdev/shared/src/hooks';
// import { useQueryState } from '@dailydotdev/shared/src/hooks/utils/useQueryState';
// import { useRouter } from 'next/router';
import { AuthTriggers } from '@dailydotdev/shared/src/lib/auth';
import AuthOptions from '@dailydotdev/shared/src/components/auth/AuthOptions';
import useAuthForms from '@dailydotdev/shared/src/hooks/useAuthForms';
import dynamic from 'next/dynamic';
import { getLayout as getMainLayout } from '../MainLayout';
import { getLayout as getFooterNavBarLayout } from '../FooterNavBarLayout';

// const ProfileSettingsMenu = dynamic(
//   () =>
//     import(
//       /* webpackChunkName: "profileSettingsMenu" */ '@dailydotdev/shared/src/components/profile/ProfileSettingsMenu'
//     ),
//   { ssr: false },
// );

const SidebarNav = dynamic(
  () => import(/* webpackChunkName: "sidebarNav" */ './SidebarNav'),
  { ssr: false },
);

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
  // const router = useRouter();
  const { user: profile, isAuthReady } = useContext(AuthContext);
  // const isMobile = useViewSize(ViewSize.MobileL);
  // const [isOpen, setIsOpen] = useQueryState({
  //   key: navigationKey,
  //   defaultValue: false,
  // });

  // useEffect(() => {
  //   const onClose = () => setIsOpen(false);

  //   router.events.on('routeChangeComplete', onClose);

  //   return () => {
  //     router.events.off('routeChangeComplete', onClose);
  //   };
  // }, [router.events, setIsOpen]);

  const { formRef } = useAuthForms();

  if (!isAuthReady) {
    return null;
  }

  if (!profile) {
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

  return (
    <div className="mx-auto flex max-w-5xl gap-4 px-6 pt-6">
      {/* {isMobile ? (
        <ProfileSettingsMenu
          shouldKeepOpen
          isOpen={isOpen}
          onClose={() => router.push(profile.permalink)}
        />
      ) : (
        <SidebarNav />
      )} */}
      <SidebarNav />
      {children}
    </div>
  );
}

export const getAccountLayout = (
  page: ReactNode,
  props: AccountLayoutProps,
): ReactNode =>
  getFooterNavBarLayout(
    getMainLayout(<AccountLayout {...props}>{page}</AccountLayout>, null, {
      screenCentered: true,
      showSidebar: false,
    }),
  );
