import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type {
  UserExperience,
  UserExperienceWork,
} from '../../../../graphql/user/profile';
import { UserExperienceType } from '../../../../graphql/user/profile';
import { Image, ImageType } from '../../../../components/image/Image';
import {
  Typography,
  TypographyType,
  TypographyColor,
} from '../../../../components/typography/Typography';
import { UserExperienceItem } from './UserExperienceItem';
import { currentPill } from './common';
import { Separator } from '../../../../components/cards/common/common';
import { LocationType } from '../../../opportunity/protobuf/util';
import { pluralize } from '../../../../lib/strings';
import type { DateRange } from '../../../../lib/date';
import { calculateTotalDurationInMonths } from '../../../../lib/date';
import { locationToString } from '../../../../lib/utils';
import { useLazyModal } from '../../../../hooks/useLazyModal';
import { LazyModal } from '../../../../components/modals/common/types';
import { IconSize } from '../../../../components/Icon';
import { JobIcon } from '../../../../components/icons';
import { VerifiedBadge } from './VerifiedBadge';

interface UserExperiencesGroupedListProps {
  company: string;
  experiences: UserExperience[];
  isExperienceVerified?: boolean;
  showEditOnItems?: boolean;
  isSameUser?: boolean;
  experienceType?: UserExperienceType;
  editBaseUrl?: string;
}

function calculateTotalDuration(experiences: UserExperience[]): string {
  const ranges: DateRange[] = experiences.map((exp) => ({
    start: new Date(exp.startedAt),
    end: exp.endedAt ? new Date(exp.endedAt) : new Date(),
  }));

  const { years, months } = calculateTotalDurationInMonths(ranges);

  if (years > 0) {
    const yearCopy = `${years} ${pluralize('year', years)}`;

    if (months === 0) {
      return yearCopy;
    }

    return `${yearCopy} ${months} ${pluralize('month', months)}`;
  }

  return months > 0
    ? `${months} ${pluralize('month', months)}`
    : 'Less than a month';
}

export function UserExperiencesGroupedList({
  company,
  experiences,
  isExperienceVerified = false,
  showEditOnItems = false,
  isSameUser,
  experienceType,
  editBaseUrl,
}: UserExperiencesGroupedListProps): ReactElement {
  const [first] = experiences;
  const duration = calculateTotalDuration(experiences);
  const { openModal } = useLazyModal();

  const isCurrent = !first.endedAt;
  const isWorkExperience = experienceType === UserExperienceType.Work;

  const experienceForLocation = isWorkExperience
    ? experiences.find((exp) => !exp.endedAt) || first
    : null;
  const workExperience = experienceForLocation as UserExperienceWork | null;
  const location = workExperience?.location || null;
  const locationType = workExperience?.locationType || null;

  const shouldShowVerifyButton =
    isWorkExperience && isCurrent && !isExperienceVerified;
  const shouldShowVerifiedBadge = isWorkExperience && isExperienceVerified;

  return (
    <li>
      <div className="flex flex-row gap-2">
        <Image
          className="h-8 w-8 rounded-max object-cover"
          type={ImageType.Organization}
          src={first.company?.image}
        />
        <div className="flex flex-1 flex-col">
          <div className="flex flex-wrap items-center gap-1">
            <Typography type={TypographyType.Subhead} bold>
              {company}
            </Typography>
            {isCurrent && currentPill}
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
          </div>
          <div className="flex items-center">
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Secondary}
            >
              {duration}
            </Typography>
            {isWorkExperience && locationType && location && (
              <>
                <Separator className="text-text-secondary" />
                <Typography
                  type={TypographyType.Footnote}
                  color={TypographyColor.Secondary}
                >
                  {locationType === LocationType.REMOTE
                    ? 'Remote'
                    : locationToString(location)}
                </Typography>
              </>
            )}
          </div>
        </div>
      </div>
      <ul className="flex flex-col">
        {experiences.map((experience, index) => (
          <UserExperienceItem
            key={experience.id}
            experience={experience}
            grouped={{ isLastItem: index === experiences.length - 1 }}
            isExperienceVerified={isExperienceVerified}
            editUrl={
              showEditOnItems && isSameUser && experienceType && editBaseUrl
                ? `${editBaseUrl}?id=${experience.id}&type=${experienceType}`
                : undefined
            }
          />
        ))}
      </ul>
    </li>
  );
}
