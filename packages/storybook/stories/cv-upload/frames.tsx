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
  CharmEmptyState,
  CharmEmptyStatePlacement,
} from '@dailydotdev/shared/src/components/charm/CharmEmptyState';
import { UserExperienceList } from '@dailydotdev/shared/src/features/profile/components/experience/UserExperiencesList';
import { Header } from '@dailydotdev/shared/src/components/profile/Header';
import { ShellBlock } from '@dailydotdev/shared/src/components/shell/ShellBlock';
import { ShellPageProvider } from '@dailydotdev/shared/src/components/shell/ShellPageContext';
import { blockRest } from '@dailydotdev/shared/src/components/shell/constants';
import { useLaptopLayout } from '@dailydotdev/shared/src/hooks/layout/useLaptopLayout';
import { UserExperienceType } from '@dailydotdev/shared/src/graphql/user/profile';
import type { PublicProfile } from '@dailydotdev/shared/src/lib/user';
import { cloudinaryCharmEmptyProfile } from '@dailydotdev/shared/src/lib/image';
import {
  AccountPageAddSquare,
  AccountPageContainer,
} from '../../../webapp/components/layouts/SettingsLayout/AccountPageContainer';
import { SETTINGS_PAGE_HEADER_PORTAL_ID } from '../../../webapp/components/layouts/SettingsLayout';
import { user } from './providers';
import { FillFromCvRow } from './screens';

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

// The About segment of your own profile with nothing in work or education,
// and the CV row under the first empty section.
export const ProfileExperience = (): ReactElement => (
  <Shell>
    <Header
      user={profile}
      isSameUser
      blockTitle={profile.name}
      isOverCover={false}
      className="relative left-0 top-0 z-3 w-full bg-background-default laptop:hidden"
    />
    <div className="flex flex-col divide-y divide-border-subtlest-tertiary px-4 py-6 tablet:px-6">
      <UserExperienceList
        experiences={[]}
        title="Work Experiences"
        experienceType={UserExperienceType.Work}
        user={profile}
      />
      <div className="py-4">
        <FillFromCvRow description="Upload your CV and we fill in your work and education." />
      </div>
      <UserExperienceList
        experiences={[]}
        title="Education"
        experienceType={UserExperienceType.Education}
        user={profile}
      />
    </div>
  </Shell>
);

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
// renders it, empty, with the CV row under the empty state. On laptop the
// header portals into SettingsLayout's slot, and the column takes
// SettingsLayout's laptop width; the sidebar is left out.
const SettingsPage = ({
  type,
}: {
  type: UserExperienceType.Work | UserExperienceType.Education;
}): ReactElement => {
  const isLaptopLayout = useLaptopLayout();
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
          <div className="flex flex-col items-center">
            <CharmEmptyState
              placement={CharmEmptyStatePlacement.Page}
              image={cloudinaryCharmEmptyProfile}
              imageAlt="daily.dev charm with an empty profile"
              title={page.empty}
              description="Add it here and it shows on your profile."
              action={{ label: 'Add', icon: <PlusIcon />, href: addUrl }}
            />
            <div className="mt-6 w-full max-w-[30rem]">
              <FillFromCvRow description="Upload your CV and we fill in your work and education." />
            </div>
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
