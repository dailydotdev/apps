import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import { useViewSize, ViewSize } from '@dailydotdev/shared/src/hooks';
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
import { ActionSuccessModal } from '@dailydotdev/shared/src/components/modals/utils/ActionSuccessModal';
import { uploadCvProfileSuccessContent } from '@dailydotdev/shared/src/features/profile/hooks/useUploadCv';
import { UserShortInfo } from '@dailydotdev/shared/src/components/profile/UserShortInfo';
import { Image, ImageType } from '@dailydotdev/shared/src/components/image/Image';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { useUserExperiencesByType } from '@dailydotdev/shared/src/features/profile/hooks/useUserExperiencesByType';
import { ElementPlaceholder } from '@dailydotdev/shared/src/components/ElementPlaceholder';
import { AccountPageContainer } from '../../../webapp/components/layouts/SettingsLayout/AccountPageContainer';
import { SettingsFrame } from './production';
import { CyclingCompanyLogo } from './modal';
import { member } from './providers';

// The five places, each drawn by the production components that render it
// today. The new ask sits under a line saying where it would go: it isn't
// inside the components, so where a component can't take it, the line says
// where it belongs.

// A proposed cover from Smith: Patchy and friends reading the new CV.
const cvUploadedCover =
  'https://media.daily.dev/image/upload/s--gZzIz3LN--/f_auto,q_auto/v1795686283/public/cv-uploaded-cover';

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

type AskStatus = 'loading' | 'noJob' | 'verified' | 'ready';

/**
 * The member's current job, as Settings › Work Experience loads it. A job
 * picked from the company search links a company we already have, with its
 * logo; a typed-in name has none. We ask only once the job has loaded, is
 * current and isn't verified yet.
 */
const useCurrentCompany = (): {
  status: AskStatus;
  name: string;
  image?: string;
} => {
  const { user } = useAuthContext();
  const { experiences, isPending } = useUserExperiencesByType(
    UserExperienceType.Work,
    user?.id ?? '',
  );
  const current = experiences?.find(({ endedAt }) => !endedAt);
  const getStatus = (): AskStatus => {
    if (isPending) {
      return 'loading';
    }
    if (!current) {
      return 'noJob';
    }
    return current.verified ? 'verified' : 'ready';
  };

  return {
    status: getStatus(),
    name: current?.company?.name ?? current?.customCompanyName ?? '',
    image: current?.company?.image,
  };
};

const hiddenBecause: Record<Exclude<AskStatus, 'loading' | 'ready'>, string> =
  {
    noJob: 'Not shown: there’s no current job to verify.',
    verified: 'Not shown: this job is already verified.',
  };

/**
 * Shows the ask only when there's a job to verify: a skeleton of the same
 * height while the job loads, so nothing jumps, and a note on why it's
 * hidden otherwise.
 */
const AskGate = ({
  skeletonClassName = 'h-12 rounded-12',
  children,
}: {
  skeletonClassName?: string;
  children: ReactNode;
}): ReactElement => {
  const { status } = useCurrentCompany();

  if (status === 'loading') {
    return <ElementPlaceholder className={skeletonClassName} />;
  }

  if (status !== 'ready') {
    return (
      <Typography
        type={TypographyType.Caption1}
        color={TypographyColor.Quaternary}
      >
        {hiddenBecause[status]}
      </Typography>
    );
  }

  return <>{children}</>;
};

/**
 * The company's logo when we have it; otherwise the logos taking turns, as on
 * the modal's benefits screen.
 */
const CompanyLogoOrCycle = ({
  image,
  name,
}: {
  image?: string;
  name: string;
}): ReactElement =>
  image ? (
    <Image
      className="size-6 rounded-max object-cover"
      type={ImageType.Organization}
      src={image}
      alt={`${name} logo`}
    />
  ) : (
    <CyclingCompanyLogo className="size-6" />
  );

/**
 * The ask: the company's logo when we have it (the logos taking turns
 * otherwise), one line, one button. Copy is a
 * placeholder.
 */
const AskRow = ({
  onVerify,
  children,
}: PlaceProps & {
  children: (company: { name: string; hasLogo: boolean }) => ReactNode;
}): ReactElement => {
  const { name, image } = useCurrentCompany();

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-12 bg-surface-float p-3">
      <CompanyLogoOrCycle image={image} name={name} />
      <Typography
        className="min-w-0 flex-1"
        type={TypographyType.Footnote}
        color={TypographyColor.Secondary}
      >
        {children({ name, hasLogo: !!image })}
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
};

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
        <AskGate>
          <AskRow onVerify={onVerify}>
            {({ name, hasLogo }) =>
              hasLogo
                ? `Put the ${name} logo next to your name.`
                : `Show you work at ${name}, next to your name.`
            }
          </AskRow>
        </AskGate>
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
export const UnverifiedJob = ({ onVerify }: PlaceProps): ReactElement => {
  const { experiences } = useUserExperiencesByType(
    UserExperienceType.Work,
    member.id,
  );

  return (
    <PageCard>
      <div className="p-4">
        <UserExperienceList
          experiences={experiences}
          experienceType={UserExperienceType.Work}
          title="Work Experiences"
          user={member as never}
          displayLimit={3}
        />
        <NewAsk where="A row under the unverified job, replacing the “Verify company” chip.">
          <AskGate>
            <AskRow onVerify={onVerify}>
              {() => 'Not verified yet. Add a Verified tag to this job.'}
            </AskRow>
          </AskGate>
        </NewAsk>
      </div>
    </PageCard>
  );
};

/**
 * 3. Your own profile header. A verified company shows on the row under
 * the bio; until then that row has nothing, and the chip goes there.
 */
export const ProfileHeaderChip = ({ onVerify }: PlaceProps): ReactElement => (
  <PageCard>
    <ProfileHeader user={member as never} isSameUser />
    <div className="px-6 pb-6">
      <NewAsk where="On the row under the bio, where the company badge shows once verified.">
        <AskGate skeletonClassName="h-6 w-24 rounded-8">
          <button
            type="button"
            onClick={onVerify}
            className="flex items-center gap-1 self-start rounded-8 border border-dashed border-border-subtlest-secondary px-2 py-0.5 text-text-secondary typo-footnote hover:border-text-link hover:text-text-link focus-visible:border-text-link focus-visible:text-text-link"
          >
            <PlusIcon size={IconSize.Size16} />
            Add badge
          </button>
        </AskGate>
      </NewAsk>
    </div>
  </PageCard>
);

/**
 * Tsahi's next step for the "CV uploaded" modal: a row in the modal's `body`
 * slot, between the copy and Close, with the company's logo when we have it.
 */
const NextStepRow = ({
  company: { name, image },
  onVerify,
}: PlaceProps & { company: { name: string; image?: string } }): ReactElement => (
  <div className="flex items-center gap-3 rounded-16 border border-border-subtlest-tertiary p-3">
    <span className="flex size-10 shrink-0 items-center justify-center rounded-12 bg-surface-float">
      <CompanyLogoOrCycle image={image} name={name} />
    </span>
    <div className="flex min-w-0 flex-1 flex-col">
      <Typography type={TypographyType.Callout} bold>
        Next: show where you work
      </Typography>
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
      >
        {image
          ? `Verify your work email to put the ${name} logo next to your name.`
          : `Verify your work email to show you work at ${name}.`}
      </Typography>
    </div>
    <Button
      variant={ButtonVariant.Primary}
      size={ButtonSize.Small}
      onClick={onVerify}
    >
      Verify
    </Button>
  </div>
);

/**
 * 4. After a CV upload, the production "CV uploaded" modal
 * (ActionSuccessModal); the ask is a row in its `body` slot, a prop it
 * already has.
 * The modal mounts in this box instead of over the page, so the other places
 * stay in view. On a phone it's a bottom sheet over the whole page, so there
 * it waits for the button.
 */
export const AfterCvUpload = ({ onVerify }: PlaceProps): ReactElement => {
  const [host, setHost] = useState<HTMLDivElement | null>(null);
  const isSheet = useViewSize(ViewSize.MobileL);
  const [isOpenChoice, setIsModalOpen] = useState<boolean>();
  const isModalOpen = isOpenChoice ?? !isSheet;
  const company = useCurrentCompany();

  return (
    <div
      ref={setHost}
      className={classNames(
        'relative flex items-center justify-center overflow-hidden rounded-24 border border-border-subtlest-quaternary bg-background-default',
        isSheet ? 'min-h-32' : 'min-h-[38rem]',
      )}
    >
      {!isModalOpen && (
        <Button
          variant={ButtonVariant.Secondary}
          size={ButtonSize.Small}
          onClick={() => setIsModalOpen(true)}
        >
          Show the “CV uploaded” modal
        </Button>
      )}
      {host && isModalOpen && (
        <ActionSuccessModal
          isOpen
          parentSelector={() => host}
          overlayClassName="!absolute"
          // Inline in its box, it mustn't lock the page's scroll.
          bodyOpenClassName={null}
          onRequestClose={() => setIsModalOpen(false)}
          withCloseOnTablet
          content={{
            ...uploadCvProfileSuccessContent,
            cover: cvUploadedCover,
            coverDrawer: cvUploadedCover,
            // No row without a job to verify: the modal is then as it is
            // today.
            body: company.status === 'ready' && (
              <NextStepRow
                company={company}
                onVerify={() => {
                  setIsModalOpen(false);
                  // After this click is done: on a phone the same click
                  // would land outside the new sheet and close it.
                  setTimeout(onVerify);
                }}
              />
            ),
          }}
        />
      )}
    </div>
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
export const OthersBadge = ({ onVerify }: PlaceProps): ReactElement => {
  // A viewer who's verified already keeps today's badge: no click action.
  const isViewerVerified = useCurrentCompany().status === 'verified';

  return (
    <PageCard>
      <div className="p-4">
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
        <div
          className={classNames(
            !isViewerVerified && '[&_[data-state]:has(img)]:cursor-pointer',
          )}
          onClickCapture={(event) => {
            const trigger = (event.target as HTMLElement).closest(
              '[data-state]',
            );
            if (!isViewerVerified && trigger?.querySelector('img')) {
              onVerify();
            }
          }}
        >
          <UserShortInfo user={dana as never} tag="div" disableTooltip />
        </div>
        <NewAsk
          where={
            isViewerVerified
              ? 'You’re verified, so Dana’s badge stays as it is today: no click action.'
              : 'Click Dana’s company logo: it opens the modal. Today the badge has no click action, only the hover tooltip.'
          }
        >
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
};
