import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { JobIcon, PlusIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { UserExperienceType } from '@dailydotdev/shared/src/graphql/user/profile';
import { ExperienceSettings } from '@dailydotdev/shared/src/components/profile/ExperienceSettings';
import { UserExperienceList } from '@dailydotdev/shared/src/features/profile/components/experience/UserExperiencesList';
import ProfileHeader from '@dailydotdev/shared/src/components/profile/ProfileHeader';
import { AutofillProfileBanner } from '@dailydotdev/shared/src/features/profile/components/AutofillProfileBanner';
import { ActionSuccessModal } from '@dailydotdev/shared/src/components/modals/utils/ActionSuccessModal';
import { uploadCvProfileSuccessContent } from '@dailydotdev/shared/src/features/profile/hooks/useUploadCv';
import {
  uploadCvModalSuccess,
  uploadCvModalSuccessMobile,
} from '@dailydotdev/shared/src/lib/image';
import { UserShortInfo } from '@dailydotdev/shared/src/components/profile/UserShortInfo';
import { AccountPageContainer } from '../../../webapp/components/layouts/SettingsLayout/AccountPageContainer';
import { SettingsFrame } from './production';
import { job, member } from './providers';
import { COMPANY, CompanyLogo } from './modal';

// The five places, each drawn by the production components that render it
// today. The new ask sits under a line saying where it would go: it isn't
// inside the components, so where a component can't take it, the line says
// where it belongs.

type PlaceProps = { onVerify: () => void };

/** The new ask, under a line on where it goes. */
const NewAsk = ({
  where,
  children,
}: {
  where?: string;
  children: ReactNode;
}): ReactElement => (
  <div className="mt-3 flex flex-col gap-2">
    {where && (
      <Typography
        type={TypographyType.Caption1}
        color={TypographyColor.Tertiary}
      >
        {where}
      </Typography>
    )}
    {children}
  </div>
);

/** The ask: one line on what you get, one button. Copy is a placeholder. */
const AskRow = ({
  onVerify,
  children,
}: PlaceProps & { children: ReactNode }): ReactElement => (
  <div className="flex flex-wrap items-center gap-3 rounded-12 bg-surface-float p-3">
    <CompanyLogo className="size-6" />
    <Typography
      className="min-w-0 flex-1"
      type={TypographyType.Footnote}
      color={TypographyColor.Secondary}
    >
      {children}
    </Typography>
    <Button
      variant={ButtonVariant.Primary}
      size={ButtonSize.Small}
      icon={<JobIcon />}
      onClick={onVerify}
    >
      Verify
    </Button>
  </div>
);

/** The app's floating page card, for places outside settings. */
const PageCard = ({ children }: { children: ReactNode }): ReactElement => (
  <div className="rounded-24 border border-border-subtlest-quaternary bg-background-default p-0.5">
    {children}
  </div>
);

/**
 * 1. Saving a job sends you to Settings › Work Experience
 * (useUserExperienceForm), with no toast. The page is work.tsx's, line for
 * line, with the ask above the list.
 */
export const AfterSavingJob = ({ onVerify }: PlaceProps): ReactElement => (
  <SettingsFrame path="/profile/experience/work">
    <AccountPageContainer
      title="Work Experience"
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
      <NewAsk where="Shown once, on the list the save takes you to.">
        <AskRow onVerify={onVerify}>
          Put the {COMPANY.name} logo next to your name.
        </AskRow>
      </NewAsk>
      <ExperienceSettings
        experienceType={UserExperienceType.Work}
        emptyStateMessage="No work experience added yet"
      />
    </AccountPageContainer>
  </SettingsFrame>
);

/**
 * 2. Your profile's Work Experiences (ProfileUserExperiences renders this
 * list). "Verify company" is the production chip and opens the production
 * modal; the new row goes under the job.
 */
export const UnverifiedJob = ({ onVerify }: PlaceProps): ReactElement => (
  <PageCard>
    <div className="p-4">
      <UserExperienceList
        experiences={[job]}
        experienceType={UserExperienceType.Work}
        title="Work Experiences"
        user={member as never}
        displayLimit={3}
      />
      <NewAsk where="A row under the unverified job, replacing the “Verify company” chip.">
        <AskRow onVerify={onVerify}>
          Not verified yet. Add a Verified tag to this job.
        </AskRow>
      </NewAsk>
    </div>
  </PageCard>
);

/**
 * 3. Your own profile header. A verified company shows on the row under
 * the bio; until then that row has nothing, and the chip goes there.
 */
export const ProfileHeaderChip = ({ onVerify }: PlaceProps): ReactElement => (
  <PageCard>
    <ProfileHeader user={member as never} isSameUser />
    <div className="px-6 pb-6">
      <NewAsk where="On the row under the bio, where the company badge shows once verified.">
        <button
          type="button"
          onClick={onVerify}
          className="flex items-center gap-1 self-start rounded-8 border border-dashed border-border-subtlest-secondary px-2 py-0.5 text-text-secondary typo-footnote hover:border-text-link hover:text-text-link"
        >
          <PlusIcon size={IconSize.Size16} />
          Add badge
        </button>
      </NewAsk>
    </div>
  </PageCard>
);

/**
 * 4. The CV upload on your profile (AutofillProfileBanner). A successful
 * upload opens the production "CV uploaded" modal; the ask is that modal's
 * own `cta`, a prop it already has.
 */
export const AfterCvUpload = ({
  onVerify,
  isModalOpen: isInitiallyOpen = false,
}: PlaceProps & { isModalOpen?: boolean }): ReactElement => {
  const [isModalOpen, setIsModalOpen] = useState(isInitiallyOpen);

  return (
    <PageCard>
      <div className="flex flex-col gap-3 p-4">
        <AutofillProfileBanner onUpload={async () => setIsModalOpen(true)} />
        <NewAsk where="After an upload, a Verify button in the “CV uploaded” modal, through its cta prop.">
          <Button
            variant={ButtonVariant.Secondary}
            size={ButtonSize.Small}
            className="self-start"
            onClick={() => setIsModalOpen(true)}
          >
            Show the modal after an upload
          </Button>
        </NewAsk>
      </div>
      {isModalOpen && (
        <ActionSuccessModal
          isOpen
          onRequestClose={() => setIsModalOpen(false)}
          withCloseOnTablet
          content={{
            ...uploadCvProfileSuccessContent,
            cover: uploadCvModalSuccess,
            coverDrawer: uploadCvModalSuccessMobile,
          }}
          cta={{
            copy: `Verify your job at ${COMPANY.name}`,
            onClick: () => {
              setIsModalOpen(false);
              onVerify();
            },
          }}
        />
      )}
    </PageCard>
  );
};

const dana = {
  id: 'sb-dana',
  name: 'Dana',
  username: 'dana',
  image: 'https://media.daily.dev/image/upload/f_auto,q_auto/v1/placeholders/2',
  permalink: 'https://app.daily.dev/dana',
  reputation: 1200,
  bio: 'Platform engineer',
  companies: [
    {
      id: 'globex',
      name: 'Globex',
      image:
        'https://media.daily.dev/image/upload/f_auto,q_auto/v1/placeholders/3',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
  ],
};

/**
 * 5. Someone else's company badge, in UserShortInfo. Today it has no click
 * action; hovering shows its production tooltip, which tells an unverified
 * viewer to go to account settings. The proposal: clicking it opens the
 * modal. The badge is a tooltip trigger (Radix's data-state) holding the
 * company logo; the reputation badge beside it is one too, but holds no
 * image, so the story catches clicks on the trigger with the logo.
 */
export const OthersBadge = ({ onVerify }: PlaceProps): ReactElement => (
  <PageCard>
    <div className="p-4">
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div
        className="[&_[data-state]:has(img)]:cursor-pointer"
        onClickCapture={(event) => {
          const trigger = (event.target as HTMLElement).closest(
            '[data-state]',
          );
          if (trigger?.querySelector('img')) {
            onVerify();
          }
        }}
      >
        <UserShortInfo user={dana as never} tag="div" disableTooltip />
      </div>
      <NewAsk where="Click Dana’s company logo: it opens the modal. Today the badge has no click action, only the hover tooltip.">
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Secondary}
        >
          The same goes for the badge everywhere it shows: comments, posts,
          profile headers and user cards.
        </Typography>
      </NewAsk>
    </div>
  </PageCard>
);
