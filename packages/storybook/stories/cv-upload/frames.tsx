import type { CSSProperties, ReactElement, ReactNode } from 'react';
import React, { useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import classNames from 'classnames';
import { FormProvider } from 'react-hook-form';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { EditIcon } from '@dailydotdev/shared/src/components/icons/Edit';
import { ExitIcon } from '@dailydotdev/shared/src/components/icons/Exit';
import { PlusIcon } from '@dailydotdev/shared/src/components/icons/Plus';
import { UploadIcon } from '@dailydotdev/shared/src/components/icons/Upload';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuOptions,
  DropdownMenuTrigger,
} from '@dailydotdev/shared/src/components/dropdown/DropdownMenu';
import { Header } from '@dailydotdev/shared/src/components/profile/Header';
import ProfileHeader from '@dailydotdev/shared/src/components/profile/ProfileHeader';
import {
  ProfileSegment,
  ProfileSegments,
} from '@dailydotdev/shared/src/components/profile/ProfileSegments';
import {
  LfgBadgeMark,
  LfgBadgeSize,
} from '@dailydotdev/shared/src/features/lfg/components/LfgAvatarBadge';
import InteractivePopup, {
  InteractivePopupPosition,
} from '@dailydotdev/shared/src/components/tooltips/InteractivePopup';
import { ProfileMenuHeader } from '@dailydotdev/shared/src/components/ProfileMenu/ProfileMenuHeader';
import { ProfileMenuFooter } from '@dailydotdev/shared/src/components/ProfileMenu/ProfileMenuFooter';
import { ProfileSection } from '@dailydotdev/shared/src/components/ProfileMenu/ProfileSection';
import { MainSection } from '@dailydotdev/shared/src/components/ProfileMenu/sections/MainSection';
import { ThemeSection } from '@dailydotdev/shared/src/components/ProfileMenu/sections/ThemeSection';
import { AccountSection } from '@dailydotdev/shared/src/components/ProfileMenu/sections/AccountSection';
import { ResourceSection } from '@dailydotdev/shared/src/components/ProfileMenu/sections/ResourceSection';
import { FeedbackButtonSection } from '@dailydotdev/shared/src/components/ProfileMenu/sections/FeedbackButtonSection';
import { PlusMenuEntry } from '@dailydotdev/shared/src/components/plus/PlusMenuEntry';
import { PlusEntryRowSize } from '@dailydotdev/shared/src/components/plus/PlusEntryRow';
import { HorizontalSeparator } from '@dailydotdev/shared/src/components/utilities/common';
import UserWorkExperienceForm from '@dailydotdev/shared/src/features/profile/components/experience/forms/UserWorkExperienceForm';
import useUserExperienceForm from '@dailydotdev/shared/src/hooks/useUserExperienceForm';
import { useReferralLadder } from '@dailydotdev/shared/src/hooks/referral/useReferralLadder';
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
import { LogoutReason } from '@dailydotdev/shared/src/lib/user';
import { TargetId } from '@dailydotdev/shared/src/lib/log';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import {
  AccountPageAddSquare,
  AccountPageContainer,
} from '../../../webapp/components/layouts/SettingsLayout/AccountPageContainer';
import { SETTINGS_PAGE_HEADER_PORTAL_ID } from '../../../webapp/components/layouts/SettingsLayout';
import { user } from './providers';
import {
  CvCompletionCard,
  CvRow,
  ExperienceSection,
  LfgChip,
  ProgressRing,
} from './screens';

// The production pages with the proposal's pieces added, each at the width
// its iframe gives it, so the phone and laptop layouts are the real ones.
// Wrappers carry the classes of the page or layout that renders them in the
// app.

const noop = (): void => undefined;
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

export enum ProfileLfg {
  None = 'none',
  // Today's LFG badge alone: its own ring and the ribbon on the avatar.
  Today = 'today',
  // The suggestion: a chip in the name row, beside the Plus mark.
  NameRow = 'nameRow',
}

// The pencil opens Edit profile details and Import from CV, anchored to the
// header's own edit button. On a phone the menu is the dropdown's sheet.
const EditMenu = ({
  container,
}: {
  container: HTMLElement;
}): ReactElement | null => {
  const [anchor, setAnchor] = useState<CSSProperties>();

  useLayoutEffect(() => {
    // The phone header carries its own edit button, hidden from laptop up.
    const box = [...container.querySelectorAll('[aria-label="Edit profile"]')]
      .map((edit) => edit.getBoundingClientRect())
      .find((rect) => rect.width > 0);
    if (!box) {
      return;
    }
    const origin = container.getBoundingClientRect();
    setAnchor({
      position: 'absolute',
      top: box.top - origin.top,
      left: box.left - origin.left,
      width: box.width,
      height: box.height,
    });
  }, [container]);

  if (!anchor) {
    return null;
  }

  return (
    <DropdownMenu open>
      <DropdownMenuTrigger asChild>
        <span aria-hidden style={anchor} />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuOptions
          options={[
            { label: 'Edit profile details', icon: <EditIcon /> },
            { label: 'Import from CV', icon: <UploadIcon /> },
          ]}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// ProfilePage for the owner, as Tsahi's proposal has it: the ring on the
// avatar in place of the completion card and the CV banner, and the empty
// Experience section with the progress and the CV row.
export const ProfilePage = ({
  lfg = ProfileLfg.None,
  isEditMenuOpen,
}: {
  lfg?: ProfileLfg;
  isEditMenuOpen?: boolean;
}): ReactElement => {
  const isTablet = useViewSize(ViewSize.Tablet);
  const pageRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  useLayoutEffect(() => setIsMounted(true), []);

  return (
    <Shell>
      <div
        ref={pageRef}
        className="relative tablet:rounded-16 tablet:border tablet:border-t-0 tablet:border-border-subtlest-tertiary laptop:border-t"
      >
        <Header
          user={profile}
          isSameUser
          isOverCover={false}
          className="relative left-0 top-0 z-3 w-full bg-background-default laptop:hidden"
        />
        <ProfileHeader
          user={profile}
          isSameUser
          coversBlock={false}
          nameRef={nameRef}
          avatarBadge={
            <>
              {lfg === ProfileLfg.Today && (
                <span className="absolute inset-0 rounded-16 ring-2 ring-accent-avocado-default ring-offset-2 ring-offset-background-default">
                  <LfgBadgeMark size={LfgBadgeSize.Ribbon} />
                </span>
              )}
              {lfg !== ProfileLfg.Today && <ProgressRing />}
            </>
          }
        />
        <div className="flex flex-col divide-y divide-border-subtlest-tertiary px-4 py-6 tablet:px-6">
          <div className="-mx-4 tablet:hidden phone:[&+*]:!border-t-0">
            <ProfileSegments active={ProfileSegment.About} onSelect={noop} />
          </div>
          <ExperienceSection isPhone={!isTablet} />
        </div>
        {isMounted &&
          lfg === ProfileLfg.NameRow &&
          nameRef.current &&
          createPortal(<LfgChip />, nameRef.current)}
        {isMounted && isEditMenuOpen && pageRef.current && (
          <EditMenu container={pageRef.current} />
        )}
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

// SettingsLayout's column. On laptop the page header portals into the
// layout's slot; the sidebar is left out.
const SettingsColumn = ({
  children,
}: {
  children: ReactNode;
}): ReactElement => {
  const isLaptopLayout = useLaptopLayout();

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
        {children}
      </div>
    </Shell>
  );
};

// The settings list page as webapp/pages/settings/profile/experience
// renders it, empty: the empty state's words and the CV row, no mascot.
const SettingsPage = ({
  type,
}: {
  type: UserExperienceType.Work | UserExperienceType.Education;
}): ReactElement => {
  const isTablet = useViewSize(ViewSize.Tablet);
  const page = settingsPages[type];
  const addUrl = `/settings/profile/experience/edit?type=${type}`;

  return (
    <SettingsColumn>
      <AccountPageContainer
        title={page.title}
        phoneActions={<AccountPageAddSquare href={addUrl} label={page.label} />}
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
    </SettingsColumn>
  );
};

export const SettingsWork = (): ReactElement => (
  <SettingsPage type={UserExperienceType.Work} />
);

export const SettingsEducation = (): ReactElement => (
  <SettingsPage type={UserExperienceType.Education} />
);

// webapp/pages/settings/profile/experience/edit for a new role, with the
// CV shortcut above the real form.
export const AddWork = (): ReactElement => {
  const isTablet = useViewSize(ViewSize.Tablet);
  const { methods } = useUserExperienceForm({
    defaultValues: {
      type: UserExperienceType.Work,
      id: '',
      title: '',
      description: '',
      createdAt: '',
    } as never,
  });

  return (
    <SettingsColumn>
      <FormProvider {...methods}>
        <form className="flex flex-1 flex-col">
          <AccountPageContainer
            onBack={noop}
            title="Add Work Experience"
            actions={
              <Button
                type="button"
                className="ml-auto"
                variant={ButtonVariant.Primary}
                size={ButtonSize.Small}
              >
                Save
              </Button>
            }
          >
            <div className="mb-6">
              <CvRow
                isPhone={!isTablet}
                title="Skip the typing: import your CV"
                description={null}
              />
            </div>
            <UserWorkExperienceForm />
          </AccountPageContainer>
        </form>
      </FormProvider>
    </SettingsColumn>
  );
};

// Full-width hover bands, as ProfileMenu defines them.
const panelBand = '-mx-3 px-3 hover:bg-surface-float';
const panelBandBetween = '-my-1.5 py-1.5';

// ProfileMenu as production renders it, open, with the CV-first card in
// ProfileCompletion's place.
export const ProfileMenuCvFirst = (): ReactElement => {
  const { logout } = useAuthContext();
  const { isEligible: isReferralLadderEligible, isCompleted } =
    useReferralLadder();

  return (
    <div className="relative min-h-screen bg-background-default">
      <InteractivePopup
        onClose={noop}
        closeOutsideClick
        position={InteractivePopupPosition.ProfileMenu}
        showCloseButton={!isReferralLadderEligible || isCompleted}
        className="flex max-h-[calc(100vh-4rem)] w-full max-w-80 flex-col gap-3 overflow-y-auto !rounded-10 border border-border-subtlest-tertiary !bg-accent-pepper-subtlest p-3"
      >
        <CvCompletionCard />
        <ProfileMenuHeader
          showReferralLadderGift
          shouldOpenProfile
          showOpenLinkIcon={false}
          compact
          className={classNames(panelBand, panelBandBetween)}
        />
        <PlusMenuEntry
          target={TargetId.ProfileDropdown}
          size={PlusEntryRowSize.Large}
          className={classNames(panelBand, panelBandBetween)}
        />
        <HorizontalSeparator className="-mx-3" />
        <nav className="flex flex-col gap-2">
          <MainSection />
          <HorizontalSeparator />
          <ThemeSection className="px-1" />
          <HorizontalSeparator />
          <AccountSection />
          <HorizontalSeparator />
          <ResourceSection />
          <FeedbackButtonSection className="px-1" />
          <HorizontalSeparator />
          <ProfileSection
            items={[
              {
                title: 'Log out',
                icon: ExitIcon,
                onClick: () => logout(LogoutReason.ManualLogout),
              },
            ]}
          />
        </nav>
        <ProfileMenuFooter />
      </InteractivePopup>
    </div>
  );
};
