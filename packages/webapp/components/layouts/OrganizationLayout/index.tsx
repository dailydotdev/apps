import React, { useEffect } from 'react';
import type { PropsWithChildren, ReactElement, ReactNode } from 'react';

import { useRouter } from 'next/router';
import { useOrganization } from '@dailydotdev/shared/src/features/organizations/hooks/useOrganization';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import AuthOptions from '@dailydotdev/shared/src/components/auth/AuthOptions';
import useAuthForms from '@dailydotdev/shared/src/hooks/useAuthForms';
import { AuthTriggers } from '@dailydotdev/shared/src/lib/auth';

import { isPrivilegedOrganizationRole } from '@dailydotdev/shared/src/features/organizations/utils';
import { OrganizationSidebar } from '@dailydotdev/shared/src/features/organizations/components/Sidebar';
import { useQueryState } from '@dailydotdev/shared/src/hooks/utils/useQueryState';
import { useViewSize, ViewSize } from '@dailydotdev/shared/src/hooks';
import { NavDrawer } from '@dailydotdev/shared/src/components/drawers/NavDrawer';
import ConditionalWrapper from '@dailydotdev/shared/src/components/ConditionalWrapper';
import { getLayout as getMainLayout } from '../MainLayout';
import { getLayout as getFooterNavBarLayout } from '../FooterNavBarLayout';
import SettingsLayout, { navigationKey } from '../SettingsLayout';

export const OrganizationLayout = ({
  children,
}: PropsWithChildren): ReactElement => {
  const isMobile = useViewSize(ViewSize.MobileL);
  const { query, events } = useRouter();
  const { user, isAuthReady } = useAuthContext();
  const { formRef } = useAuthForms();
  const { organization, role, isFetching } = useOrganization(
    query.orgId as string,
  );

  const [isOpen, setIsOpen] = useQueryState({
    key: navigationKey,
    defaultValue: false,
  });

  useEffect(() => {
    const onClose = () => setIsOpen(false);

    events.on('routeChangeComplete', onClose);

    return () => {
      events.off('routeChangeComplete', onClose);
    };
  }, [events, setIsOpen]);

  if (!isAuthReady) {
    return null;
  }

  if (!user) {
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

  if (isFetching || !organization) {
    return null;
  }

  // If the user is just a member of the organization, we want to show the settings layout
  // instead of the organization layout. This is because the organization layout is
  // meant for admins and owners and the settings layout is meant for members.
  if (!isPrivilegedOrganizationRole(role)) {
    return <SettingsLayout>{children}</SettingsLayout>;
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl gap-4 tablet:p-6">
      <ConditionalWrapper
        condition={isMobile}
        wrapper={(child) => (
          <NavDrawer
            header="Organization"
            shouldKeepOpen={false}
            showActions={false}
            drawerProps={{
              isOpen,
              onClose: () => setIsOpen(false),
            }}
          >
            {child}
          </NavDrawer>
        )}
      >
        <OrganizationSidebar organization={organization} />
      </ConditionalWrapper>

      {children}
    </div>
  );
};

export const getOrganizationLayout = (page: ReactNode): ReactNode =>
  getFooterNavBarLayout(
    getMainLayout(<OrganizationLayout>{page}</OrganizationLayout>, null, {
      screenCentered: true,
      showSidebar: false,
    }),
  );
