import React from 'react';
import type { ReactElement } from 'react';
import { useRouter } from 'next/router';
import { OrganizationSidebarHeader } from './SidebarHeader';
import type { ProfileSectionItemProps } from '../../../components/ProfileMenu/ProfileSectionItem';
import {
  CreditCardIcon,
  OrganizationIcon,
  SquadIcon,
} from '../../../components/icons';
import { ProfileSection } from '../../../components/ProfileMenu/ProfileSection';
import { getOrganizationSettingsUrl } from '../utils';
import type { Organization } from '../types';
import { HorizontalSeparator } from '../../../components/utilities';
import ConditionalWrapper from '../../../components/ConditionalWrapper';
import { useViewSize, ViewSize } from '../../../hooks';
import {
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { InnerProfileSettingsMenu } from '../../../components/profile/ProfileSettingsMenu';

type MenuItems = Record<
  string,
  {
    title: string | null;
    items: Record<string, ProfileSectionItemProps>;
  }
>;

const defineMenuItems = <T extends MenuItems>(items: T): T => items;

const menuItems = defineMenuItems({
  main: {
    title: null,
    items: {
      general: {
        title: 'General',
        icon: OrganizationIcon,
        href: 'general',
      },
      members: {
        title: 'Members',
        icon: SquadIcon,
        href: 'members',
      },
      billing: {
        title: 'Billing',
        icon: CreditCardIcon,
        href: 'billing',
      },
    },
  },
});

export const OrganizationSidebar = ({
  organization,
}: {
  organization: Organization;
}): ReactElement => {
  const { asPath } = useRouter();
  const isMobile = useViewSize(ViewSize.MobileL);

  return (
    <ConditionalWrapper
      condition={!isMobile}
      wrapper={(children) => (
        <aside className="ml-auto flex min-h-full flex-col gap-2 self-start rounded-16 border border-border-subtlest-tertiary p-2 tablet:w-64">
          {children}
        </aside>
      )}
    >
      <>
        {!isMobile && <OrganizationSidebarHeader organization={organization} />}

        <HorizontalSeparator />

        <nav className="flex flex-col gap-2 p-4 tablet:p-0">
          {Object.entries(menuItems).map(([key, menuItem], index, arr) => {
            const lastItem = index === arr.length - 1;

            return (
              <ProfileSection
                key={key}
                withSeparator={!lastItem}
                title={menuItem.title}
                items={Object.entries(menuItem.items).map(
                  ([, item]: [string, ProfileSectionItemProps]) => {
                    const href = getOrganizationSettingsUrl(
                      organization.id,
                      item.href,
                    );
                    return {
                      ...item,
                      isActive: asPath === href,
                      href,
                      ...(isMobile && {
                        typography: {
                          type: TypographyType.Body,
                          color: TypographyColor.Primary,
                        },
                      }),
                    };
                  },
                )}
              />
            );
          })}
        </nav>

        {isMobile && (
          <>
            <HorizontalSeparator />

            <InnerProfileSettingsMenu className="p-4" />
          </>
        )}
      </>
    </ConditionalWrapper>
  );
};
