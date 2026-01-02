import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import type {
  UserExperience,
  UserExperienceCertification,
  UserExperienceProject,
  UserExperienceWork,
} from '../../../../graphql/user/profile';
import { UserExperienceType } from '../../../../graphql/user/profile';
import { Image, ImageType } from '../../../../components/image/Image';
import { Pill, PillSize } from '../../../../components/Pill';
import {
  Typography,
  TypographyType,
  TypographyColor,
} from '../../../../components/typography/Typography';
import { Separator } from '../../../../components/cards/common/common';
import ShowMoreContent from '../../../../components/cards/common/ShowMoreContent';
import { LocationType } from '../../../opportunity/protobuf/util';
import { formatDateRange } from '../../../../lib/dateFormat';
import { locationToString } from '../../../../lib/utils';
import { currentPill } from './common';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import { EditIcon, JobIcon, OpenLinkIcon } from '../../../../components/icons';
import Link from '../../../../components/utilities/Link';
import { useLazyModal } from '../../../../hooks/useLazyModal';
import { LazyModal } from '../../../../components/modals/common/types';
import { IconSize } from '../../../../components/Icon';
import { VerifiedBadge } from './VerifiedBadge';
import type { TLocation } from '../../../../graphql/autocomplete';
import {
  GitIntegrationStats,
  generateMockGitStats,
} from './github-integration';
import {
  ExperienceTimeline,
  generateMockExperiencePosts,
} from './experience-posts';
import { ActivityOverviewCard } from '../../../../components/MultiSourceHeatmap';

const MAX_SKILLS = 3;

// TODO: Remove these mocks - for demo purposes only
const MOCK_GIT_DATA = generateMockGitStats('github');
const MOCK_EXPERIENCE_POSTS = generateMockExperiencePosts();

const getDisplayLocation = (
  grouped: boolean | undefined,
  locationType: number | null | undefined,
  location: Partial<TLocation> | null,
): string | null => {
  if (grouped || !location) {
    return null;
  }
  if (locationType === LocationType.REMOTE) {
    return 'Remote';
  }
  return locationToString(location);
};

interface UserExperienceItemProps {
  experience: UserExperience;
  grouped?: {
    isLastItem?: boolean;
  };
  editUrl?: string;
  isExperienceVerified?: boolean;
  isSameUser: boolean;
}

export function UserExperienceItem({
  experience,
  grouped,
  editUrl,
  isSameUser,
  isExperienceVerified = false,
}: UserExperienceItemProps): ReactElement {
  const {
    company,
    customCompanyName,
    title,
    description,
    startedAt,
    endedAt,
    subtitle,
  } = experience;
  const { skills, location, locationType, customLocation } =
    experience as UserExperienceWork;
  const { url } = experience as UserExperienceProject;
  const { externalReferenceId } = experience as UserExperienceCertification;
  const [showMoreSkills, setShowMoreSkills] = useState(false);
  const skillList = showMoreSkills
    ? skills
    : skills?.slice(0, MAX_SKILLS) || [];
  const { openModal } = useLazyModal();

  const isWorkExperience = experience.type === UserExperienceType.Work;
  const isCurrent = !endedAt;

  const shouldShowVerifyButton =
    isSameUser &&
    isWorkExperience &&
    isCurrent &&
    !isExperienceVerified &&
    !grouped;

  const shouldShowVerifiedBadge =
    isWorkExperience && isExperienceVerified && !grouped;
  const shouldSwapCopies =
    experience.type === UserExperienceType.Education && !grouped;
  const primaryCopy = shouldSwapCopies
    ? company?.name || customCompanyName
    : title;
  const secondaryCopy = shouldSwapCopies
    ? title
    : company?.name || customCompanyName;

  const dateRange = formatDateRange(startedAt, endedAt);
  const loc = getDisplayLocation(
    !!grouped,
    locationType,
    location || customLocation,
  );

  return (
    <li key={experience.id} className="relative flex flex-row gap-2">
      {grouped ? (
        <div className="relative flex w-8 justify-center overflow-hidden">
          <div className="absolute left-4 h-6 w-8 -translate-x-px rounded-bl-10 border-b-2 border-l-2 border-accent-pepper-subtle" />
          {!grouped.isLastItem && (
            <div className="absolute h-full w-0.5 bg-accent-pepper-subtle" />
          )}
        </div>
      ) : (
        <Image
          className="h-8 w-8 rounded-max object-cover"
          type={ImageType.Organization}
          src={company?.image}
        />
      )}
      {editUrl && (
        <div
          className={classNames(
            'absolute right-0',
            grouped ? 'top-2' : 'top-0',
          )}
        >
          <Link href={editUrl} passHref>
            <Button
              tag="a"
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.XSmall}
              icon={<EditIcon />}
            />
          </Link>
        </div>
      )}
      <div
        className={classNames('flex flex-1 flex-col gap-2', {
          'pt-3': !!grouped,
        })}
      >
        <div
          className={classNames(
            'flex flex-col gap-1',
            editUrl && 'max-w-[calc(100%-32px)]',
          )}
        >
          <div className="flex flex-wrap items-center gap-1">
            <Typography
              className="whitespace-break-spaces"
              truncate
              type={TypographyType.Subhead}
              bold
            >
              {primaryCopy}
            </Typography>
            {!grouped && !endedAt && currentPill}
            {shouldShowVerifyButton && (
              <button
                type="button"
                className={classNames(
                  'my-auto flex cursor-pointer items-center gap-1 rounded-4 px-1.5 py-[1px]',
                  'bg-overlay-float-water text-text-link',
                  'hover:bg-accent-water-flat',
                  'typo-caption2',
                )}
                onClick={() =>
                  openModal({
                    type: LazyModal.VerifyExperience,
                  })
                }
              >
                <JobIcon size={IconSize.Size16} className="text-text-link" />
                <span>Verify company</span>
              </button>
            )}
            {shouldShowVerifiedBadge && <VerifiedBadge />}
            {url && (
              <Link href={url} passHref>
                <a target="_blank">
                  <OpenLinkIcon className="size-4 text-text-secondary" />
                </a>
              </Link>
            )}
          </div>
          {!!subtitle && (
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Secondary}
            >
              {subtitle}
            </Typography>
          )}
          {!grouped && (
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Secondary}
            >
              {secondaryCopy}
            </Typography>
          )}
          <div className="flex items-center">
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
            >
              {dateRange}
            </Typography>
            {loc && (
              <>
                <Separator className="text-text-tertiary" />
                <Typography
                  type={TypographyType.Footnote}
                  color={TypographyColor.Tertiary}
                >
                  {loc}
                </Typography>
              </>
            )}
          </div>
          {!!externalReferenceId && (
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
            >
              {externalReferenceId}
            </Typography>
          )}
        </div>
        {description && (
          <ShowMoreContent
            ending="ellipsis"
            content={description}
            charactersLimit={160}
            className={{
              wrapper: 'w-full min-w-0 max-w-full flex-1',
              text: 'whitespace-break-spaces break-words text-text-secondary typo-subhead',
            }}
          />
        )}
        {skillList?.length > 0 && (
          <div className="flex flex-row flex-wrap gap-2">
            {skillList.map((skill) => (
              <Pill
                key={skill.value}
                label={skill.value}
                size={PillSize.Small}
                className="border border-border-subtlest-tertiary text-text-quaternary"
              />
            ))}
            {!showMoreSkills && skills.length > MAX_SKILLS && (
              <button type="button" onClick={() => setShowMoreSkills(true)}>
                <Pill
                  label={`+${skills.length - MAX_SKILLS}`}
                  size={PillSize.Small}
                  className="border border-border-subtlest-tertiary text-text-quaternary"
                />
              </button>
            )}
          </div>
        )}
        {/* GitHub/GitLab Integration - Mock for demo */}
        {isWorkExperience && !grouped && (
          <GitIntegrationStats data={MOCK_GIT_DATA} />
        )}
        {/* Experience Posts Timeline - Mock for demo */}
        {isWorkExperience && !grouped && (
          <ExperienceTimeline posts={MOCK_EXPERIENCE_POSTS} />
        )}
        {/* Multi-source Activity Heatmap - Mock for demo */}
        {isWorkExperience && !grouped && <ActivityOverviewCard />}
      </div>
    </li>
  );
}
