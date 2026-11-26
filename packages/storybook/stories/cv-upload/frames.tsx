import type { CSSProperties, ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { PlusIcon } from '@dailydotdev/shared/src/components/icons';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { Header } from '@dailydotdev/shared/src/components/profile/Header';
import { ShellBlock } from '@dailydotdev/shared/src/components/shell/ShellBlock';
import { ShellPageProvider } from '@dailydotdev/shared/src/components/shell/ShellPageContext';
import { blockRest } from '@dailydotdev/shared/src/components/shell/constants';
import { useLaptopLayout } from '@dailydotdev/shared/src/hooks/layout/useLaptopLayout';
import {
  useViewSize,
  ViewSize,
} from '@dailydotdev/shared/src/hooks/useViewSize';
import { UserExperienceType } from '@dailydotdev/shared/src/graphql/user/profile';
import type { PublicProfile } from '@dailydotdev/shared/src/lib/user';
import {
  AccountPageAddSquare,
  AccountPageContainer,
} from '../../../webapp/components/layouts/SettingsLayout/AccountPageContainer';
import { SETTINGS_PAGE_HEADER_PORTAL_ID } from '../../../webapp/components/layouts/SettingsLayout';
import { user } from './providers';
import { CvRow, ExperienceSection } from './screens';

// The production pages with the CV row added, each at the width its iframe
// gives it, so the phone and laptop layouts are the real ones. Wrappers
// carry the classes of the page or layout that renders them in the app.

const profile = user as unknown as PublicProfile;

// MainLayout's shell for a leaf page: the phone block on top, content under
// it.
const Shell = ({ children }: { children: ReactNode }): ReactElement => (
  <ShellPageProvider>
    <ShellBlock />
    <div
      className="min-h-screen bg-background-default pt-[var(--shell-top,var(--shell-top-rest))] tablet:pt-0"
      style={{ '--shell-top-rest': blockRest.page } as CSSProperties}
    >
      {children}
    </div>
  </ShellPageProvider>
);

// Your own profile with nothing in work or education: the one Experience
// section holds the progress and the CV row.
export const ProfileExperience = (): ReactElement => {
  const isTablet = useViewSize(ViewSize.Tablet);

  return (
    <Shell>
      <Header
        user={profile}
        isSameUser
        blockTitle={profile.name}
        isOverCover={false}
        className="relative left-0 top-0 z-3 w-full bg-background-default laptop:hidden"
      />
      <div className="mx-auto max-w-[40rem] px-4 py-6 tablet:px-6">
        <ExperienceSection isPhone={!isTablet} />
      </div>
    </Shell>
  );
};

const settingsPages = {
  [UserExperienceType.Work]: {
    title: 'Work Experience',
    empty: 'No work experience added yet',
    label: 'Add work experience',
  },
  [UserExperienceType.Education]: {
    title: 'Education',
    empty: 'No education added yet',
    label: 'Add education',
  },
};

// The settings list page as webapp/pages/settings/profile/experience
// renders it, empty: the empty state's words and the CV row, no mascot. On laptop the
// header portals into SettingsLayout's slot, and the column takes
// SettingsLayout's laptop width; the sidebar is left out.
const SettingsPage = ({
  type,
}: {
  type: UserExperienceType.Work | UserExperienceType.Education;
}): ReactElement => {
  const isLaptopLayout = useLaptopLayout();
  const isTablet = useViewSize(ViewSize.Tablet);
  const page = settingsPages[type];
  const addUrl = `/settings/profile/experience/edit?type=${type}`;

  return (
    <Shell>
      {isLaptopLayout && (
        <div id={SETTINGS_PAGE_HEADER_PORTAL_ID} className="contents" />
      )}
      <div
        className={classNames(
          'mx-auto flex w-full gap-4 tablet:p-6',
          isLaptopLayout ? 'max-w-3xl' : 'max-w-5xl',
        )}
      >
        <AccountPageContainer
          title={page.title}
          phoneActions={
            <AccountPageAddSquare href={addUrl} label={page.label} />
          }
          actions={
            <Button
              variant={ButtonVariant.Subtle}
              size={ButtonSize.Small}
              icon={<PlusIcon />}
            >
              Add
            </Button>
          }
        >
          <div className="flex flex-col gap-6 pt-4">
            <div className="flex flex-col items-center gap-1 text-center">
              <Typography type={TypographyType.Body} bold>
                {page.empty}
              </Typography>
              <Typography
                type={TypographyType.Callout}
                color={TypographyColor.Tertiary}
              >
                Add it here and it shows on your profile.
              </Typography>
            </div>
            <CvRow isPhone={!isTablet} />
          </div>
        </AccountPageContainer>
      </div>
    </Shell>
  );
};

export const SettingsWork = (): ReactElement => (
  <SettingsPage type={UserExperienceType.Work} />
);

export const SettingsEducation = (): ReactElement => (
  <SettingsPage type={UserExperienceType.Education} />
);
