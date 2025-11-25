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
import { formatDate, TimeFormatType } from '../../../../lib/dateFormat';
import { concatStrings } from '../../../../lib/strings';
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

const MAX_SKILLS = 3;

interface UserExperienceItemProps {
  experience: UserExperience;
  grouped?: {
    isLastItem?: boolean;
  };
  editUrl?: string;
  isExperienceVerified?: boolean;
}

export function UserExperienceItem({
  experience,
  grouped,
  editUrl,
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
  const { skills, verified } = experience as UserExperienceWork;
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
    isWorkExperience && isCurrent && !isExperienceVerified && !grouped;
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
            <Typography truncate type={TypographyType.Subhead} bold>
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
              {!!verified && (
                <span className="ml-1 text-text-quaternary">Verified</span>
              )}
            </Typography>
          )}
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            {concatStrings(
              [
                formatDate({
                  value: startedAt,
                  type: TimeFormatType.TopReaderBadge,
                }),
                !!endedAt &&
                  formatDate({
                    value: endedAt,
                    type: TimeFormatType.TopReaderBadge,
                  }),
              ],
              ' - ',
            )}
          </Typography>
          {!!externalReferenceId && (
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
            >
              {externalReferenceId}
            </Typography>
          )}
        </div>
        <Typography
          type={TypographyType.Subhead}
          color={TypographyColor.Secondary}
          className="flex w-full max-w-full flex-1 whitespace-break-spaces break-words"
        >
          {description}
        </Typography>
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
      </div>
    </li>
  );
}
