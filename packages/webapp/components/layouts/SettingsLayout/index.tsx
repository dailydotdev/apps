import type { PropsWithChildren, ReactElement, ReactNode } from 'react';
import React, { useContext, useEffect } from 'react';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import {
  generateQueryKey,
  RequestKey,
} from '@dailydotdev/shared/src/lib/query';
import { useViewSize, ViewSize } from '@dailydotdev/shared/src/hooks';
import { useQueryState } from '@dailydotdev/shared/src/hooks/utils/useQueryState';
import { useRouter } from 'next/router';
import { AuthTriggers } from '@dailydotdev/shared/src/lib/auth';
import AuthOptions from '@dailydotdev/shared/src/components/auth/AuthOptions';
import useAuthForms from '@dailydotdev/shared/src/hooks/useAuthForms';
import dynamic from 'next/dynamic';
import {
  Typography,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import { webappUrl } from '@dailydotdev/shared/src/lib/constants';
import { BuyCreditsButton } from '@dailydotdev/shared/src/components/credit/BuyCreditsButton';
import { useCanPurchaseCores } from '@dailydotdev/shared/src/hooks/useCoresFeature';
import { getPathnameWithQuery } from '@dailydotdev/shared/src/lib';
import { Origin } from '@dailydotdev/shared/src/lib/log';
import { getLayout as getFooterNavBarLayout } from '../FooterNavBarLayout';
import { getLayout as getMainLayout } from '../MainLayout';

const ProfileSettingsMenuMobile = dynamic(
  () =>
    import(
      /* webpackChunkName: "profileSettingsMenuMobile" */ '@dailydotdev/shared/src/components/profile/ProfileSettingsMenu'
    ).then((mod) => mod.ProfileSettingsMenuMobile),
  { ssr: false },
);

const ProfileSettingsMenuDesktop = dynamic(
  () =>
    import(
      /* webpackChunkName: "profileSettingsMenuDesktop" */ '@dailydotdev/shared/src/components/profile/ProfileSettingsMenu'
    ).then((mod) => mod.ProfileSettingsMenuDesktop),
  {
    ssr: false,
    loading: () => (
      <div className="h-[669px] w-64 rounded-16 border border-border-subtlest-tertiary" />
    ),
  },
);

export const navigationKey = generateQueryKey(
  RequestKey.AccountNavigation,
  null,
);

export default function SettingsLayout({
  children,
}: PropsWithChildren): ReactElement {
  const router = useRouter();
  const { user: profile, isAuthReady } = useContext(AuthContext);
  const isMobile = useViewSize(ViewSize.MobileL);
  const isLaptop = useViewSize(ViewSize.Laptop);
  const canPurchaseCores = useCanPurchaseCores();
  const [isOpen, setIsOpen] = useQueryState({
    key: navigationKey,
    defaultValue: false,
  });

  useEffect(() => {
    const onClose = () => setIsOpen(false);

    router.events.on('routeChangeComplete', onClose);

    return () => {
      router.events.off('routeChangeComplete', onClose);
    };
  }, [router.events, setIsOpen]);

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
    <>
      {!isMobile && !isLaptop && (
        <div className="hidden h-14 items-center gap-2 border-b border-border-subtlest-tertiary px-4 tablet:flex laptop:hidden">
          <Link href={webappUrl} passHref>
            <Button
              tag="a"
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.XSmall}
              icon={<ArrowIcon className="-rotate-90" />}
            />
          </Link>

          <Typography bold tag={TypographyTag.H2} type={TypographyType.Body}>
            Settings
          </Typography>

          <BuyCreditsButton
            className="ml-auto"
            hideBuyButton={!canPurchaseCores}
            onPlusClick={() => {
              router.push(
                getPathnameWithQuery(
                  `${webappUrl}cores`,
                  new URLSearchParams({
                    origin: Origin.Settings,
                  }),
                ),
              );
            }}
          />
        </div>
      )}

      <div className="mx-auto flex w-full max-w-5xl gap-4 tablet:p-6">
        {isMobile ? (
          <ProfileSettingsMenuMobile
            shouldKeepOpen
            isOpen={isOpen}
            onClose={() => router.push(profile.permalink)}
          />
        ) : (
          <ProfileSettingsMenuDesktop />
        )}
        {children}
      </div>
    </>
  );
}

export const getSettingsLayout = (page: ReactNode): ReactNode =>
  getFooterNavBarLayout(
    getMainLayout(<SettingsLayout>{page}</SettingsLayout>, null, {
      screenCentered: true,
      showSidebar: false,
    }),
  );
