import type { CSSProperties, ReactElement, ReactNode } from 'react';
import React, { useEffect, useState } from 'react';
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
import { ProfileUploadBanner } from '@dailydotdev/shared/src/features/profile/components/ProfileUploadBanner';
import { CvTopHero } from '@dailydotdev/shared/src/features/profile/components/CvTopHero';
import { AutofillProfileBanner } from '@dailydotdev/shared/src/features/profile/components/AutofillProfileBanner';
import { ProfileCompletion } from '@dailydotdev/shared/src/features/profile/components/ProfileWidgets/ProfileCompletion';
import { UserExperienceList } from '@dailydotdev/shared/src/features/profile/components/experience/UserExperiencesList';
import { ExperienceSettings } from '@dailydotdev/shared/src/components/profile/ExperienceSettings';
import ProfileHeader from '@dailydotdev/shared/src/components/profile/ProfileHeader';
import { Header } from '@dailydotdev/shared/src/components/profile/Header';
import {
  ProfileSegment,
  ProfileSegments,
} from '@dailydotdev/shared/src/components/profile/ProfileSegments';
import ProfileMenu from '@dailydotdev/shared/src/components/ProfileMenu/ProfileMenu';
import { MarketingCtaModal } from '@dailydotdev/shared/src/components/marketing/cta/MarketingCtaModal';
import { MarketingCtaPopoverSmall } from '@dailydotdev/shared/src/components/marketing/cta/MarketingCtaPopoverSmall';
import InteractivePopup, {
  InteractivePopupPosition,
} from '@dailydotdev/shared/src/components/tooltips/InteractivePopup';
import type { MarketingCta } from '@dailydotdev/shared/src/components/marketing/cta/common';
import { MarketingCtaVariant } from '@dailydotdev/shared/src/components/marketing/cta/common';
import { ShellBlock } from '@dailydotdev/shared/src/components/shell/ShellBlock';
import { ShellPageProvider } from '@dailydotdev/shared/src/components/shell/ShellPageContext';
import { blockRest } from '@dailydotdev/shared/src/components/shell/constants';
import { ShellRoot } from '@dailydotdev/shared/src/components/shell/shellNav';
import FeedNav from '@dailydotdev/shared/src/components/feeds/FeedNav';
import { ActiveFeedNameContext } from '@dailydotdev/shared/src/contexts/ActiveFeedNameContext';
import { SharedFeedPage } from '@dailydotdev/shared/src/components/utilities/common';
import { useLaptopLayout } from '@dailydotdev/shared/src/hooks/layout/useLaptopLayout';
import { UserExperienceType } from '@dailydotdev/shared/src/graphql/user/profile';
import type { PublicProfile } from '@dailydotdev/shared/src/lib/user';
import { cloudinaryCharmEmptyProfile } from '@dailydotdev/shared/src/lib/image';
import { TargetId } from '@dailydotdev/shared/src/lib/log';
import {
  AccountPageAddSquare,
  AccountPageContainer,
} from '../../../webapp/components/layouts/SettingsLayout/AccountPageContainer';
import { SETTINGS_PAGE_HEADER_PORTAL_ID } from '../../../webapp/components/layouts/SettingsLayout';
import { user } from './providers';
import { FillFromCvRow } from './screens';

// Pages built from the production components, each at the width its iframe
// gives it, so the phone and laptop layouts are the real ones. Wrappers
// carry the classes of the page or layout that renders them in the app.

const noop = (): void => undefined;
const noUpload = (): Promise<void> => Promise.resolve();
const profile = user as unknown as PublicProfile;

// MainLayout's shell: the phone block on top, content under it. My feed's
// block is the home row with the feed segments, as MainLayoutHeader gives
// it; every other page here is a leaf.
const Shell = ({
  isHome,
  children,
}: {
  isHome?: boolean;
  children: ReactNode;
}): ReactElement => {
  const rest = isHome ? blockRest.rootWithRow : blockRest.page;

  return (
    <ShellPageProvider>
      {isHome ? (
        <ShellBlock root={ShellRoot.Home} row={<FeedNav inShellBlock />} />
      ) : (
        <ShellBlock />
      )}
      <div
        className="min-h-screen bg-background-default pt-[var(--shell-top,var(--shell-top-rest))] tablet:pt-0"
        style={{ '--shell-top-rest': rest } as CSSProperties}
      >
        {children}
      </div>
    </ShellPageProvider>
  );
};

const myFeed = { feedName: SharedFeedPage.MyFeed };

// FeedContainer's CV banner on My feed, with its copy when the jobs feature
// is off and the campaign sends no title.
export const FeedBanner = (): ReactElement => {
  const isLaptopLayout = useLaptopLayout();

  if (isLaptopLayout) {
    return (
      <div className="min-h-screen bg-background-default p-6">
        {/* MainLayout's top hero slot, without the sidebar beside it. */}
        <div className="mx-4 mb-3 grid grid-cols-1 gap-3 laptop:mx-0">
          <CvTopHero
            subtitle="Upload your CV to autofill your profile in seconds."
            onUpload={noop}
            onClose={noop}
          />
        </div>
      </div>
    );
  }

  return (
    <ActiveFeedNameContext.Provider value={myFeed}>
      <Shell isHome>
        <div className="px-4 tablet:px-0 tablet:pt-1">
          <ProfileUploadBanner
            className="mt-0 tablet:mt-4"
            status="idle"
            onUpload={noUpload}
            onClose={noop}
            targetId={TargetId.Feed}
          />
        </div>
      </Shell>
    </ActiveFeedNameContext.Provider>
  );
};

// The live marketing_cta rows behind campaign 48's two popovers, word for
// word. Both link to /opportunity/welcome, not to an upload.
const popover30d: MarketingCta = {
  campaignId: 'cv-reminder-popup-30d',
  createdAt: new Date('2025-07-28T16:05:10Z'),
  variant: MarketingCtaVariant.Popover,
  flags: {
    image:
      'https://daily-now-res.cloudinary.com/image/upload/v1753718449/docs/Open_for_work__3.jpg',
    title: 'Your skills deserve better job matches',
    ctaUrl: 'https://app.daily.dev/opportunity/welcome',
    ctaText: 'Upload your CV',
    tagText: 'Recommended',
    tagColor: 'avocado',
    description:
      'Upload your CV and we’ll quietly match you with roles that make sense. 100% private. No spam.',
  },
};

const popover60d: MarketingCta = {
  campaignId: 'cv-popover-60d',
  createdAt: new Date('2025-07-28T16:10:46Z'),
  variant: MarketingCtaVariant.PopoverSmall,
  flags: {
    image:
      'https://daily-now-res.cloudinary.com/image/upload/v1753718448/docs/Open_for_work__2.jpg',
    title: 'Get hired on your terms',
    ctaUrl: 'https://app.daily.dev/opportunity/welcome',
    ctaText: 'Upload CV',
    tagText: 'Popular',
    tagColor: 'avocado',
    description: 'Let us handle the search. You choose if and when to respond.',
  },
};

// The 30-day popover, the `popover` variant: BootPopups opens it as
// MarketingCtaModal. The modal binds to the app's #__next root, so it opens
// once that exists.
export const Popover30d = (): ReactElement => {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  return (
    <div id="__next" className="min-h-screen bg-background-default">
      {isMounted && (
        <MarketingCtaModal
          isOpen
          marketingCta={popover30d}
          onRequestClose={noop}
        />
      )}
    </div>
  );
};

// The 60-day popover, the `popover_small` variant: BootPopups' interactive
// popup, with its props, holding MarketingCtaPopoverSmall. A sheet on a
// phone, bottom right from tablet up.
export const Popover60d = (): ReactElement => (
  <div className="min-h-screen bg-background-default">
    <InteractivePopup
      isDrawerOnMobile
      drawerProps={{ className: { wrapper: '!p-0' } }}
      position={InteractivePopupPosition.RightEnd}
      disableOverlay
      closeButton={{ variant: ButtonVariant.Primary }}
      onClose={noop}
    >
      <MarketingCtaPopoverSmall marketingCta={popover60d} />
    </InteractivePopup>
  </div>
);

// ProfilePage for the owner, top down: the completion card below laptop,
// the header, then the CV banner while no CV is uploaded.
export const ProfileTop = (): ReactElement => (
  <Shell>
    <div className="tablet:rounded-16 tablet:border tablet:border-t-0 tablet:border-border-subtlest-tertiary laptop:border-t">
      <Header
        user={profile}
        isSameUser
        isOverCover={false}
        className="relative left-0 top-0 z-3 w-full bg-background-default laptop:hidden"
      />
      <ProfileCompletion className="laptop:hidden" />
      <ProfileHeader user={profile} isSameUser coversBlock={false} />
      <div className="flex flex-col divide-y divide-border-subtlest-tertiary px-4 py-6 tablet:px-6">
        <AutofillProfileBanner onUpload={noUpload} />
        <div className="-mx-4 tablet:hidden phone:[&+*]:!border-t-0">
          <ProfileSegments active={ProfileSegment.About} onSelect={noop} />
        </div>
      </div>
    </div>
  </Shell>
);

// Further down the About segment: ProfileUserExperiences with nothing in
// work or education. The proposal adds the CV row under the first one.
const ProfileExperience = ({
  proposed,
}: {
  proposed?: boolean;
}): ReactElement => (
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
      {proposed && (
        <div className="py-4">
          <FillFromCvRow description="Upload your CV and we fill in your work and education." />
        </div>
      )}
      <UserExperienceList
        experiences={[]}
        title="Education"
        experienceType={UserExperienceType.Education}
        user={profile}
      />
    </div>
  </Shell>
);

export const ProfileExperienceToday = (): ReactElement => <ProfileExperience />;

export const ProfileExperienceProposed = (): ReactElement => (
  <ProfileExperience proposed />
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
// renders it. On laptop the header portals into SettingsLayout's slot, and
// the column takes SettingsLayout's laptop width; the sidebar is left out.
const SettingsPage = ({
  type,
  proposed,
}: {
  type: UserExperienceType.Work | UserExperienceType.Education;
  proposed?: boolean;
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
          {proposed ? (
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
          ) : (
            <ExperienceSettings
              experienceType={type}
              emptyStateMessage={page.empty}
            />
          )}
        </AccountPageContainer>
      </div>
    </Shell>
  );
};

export const SettingsWorkToday = (): ReactElement => (
  <SettingsPage type={UserExperienceType.Work} />
);

export const SettingsWorkProposed = (): ReactElement => (
  <SettingsPage type={UserExperienceType.Work} proposed />
);

export const SettingsEducationToday = (): ReactElement => (
  <SettingsPage type={UserExperienceType.Education} />
);

export const SettingsEducationProposed = (): ReactElement => (
  <SettingsPage type={UserExperienceType.Education} proposed />
);

// The header's profile menu, open.
export const ProfileMenuOpen = (): ReactElement => (
  <div className="relative min-h-screen bg-background-default">
    <ProfileMenu onClose={noop} />
  </div>
);
