import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { UserExperience } from '../../../../graphql/user/profile';
import { Image, ImageType } from '../../../../components/image/Image';
import { Pill, PillSize } from '../../../../components/Pill';
import {
  Typography,
  TypographyType,
  TypographyColor,
} from '../../../../components/typography/Typography';
import { formatDate, TimeFormatType } from '../../../../lib/dateFormat';
import { anchorDefaultRel, concatStrings } from '../../../../lib/strings';
import { currrentPill } from './common';
import { Button } from '../../../../components/buttons/Button';

interface UserExperienceItemProps {
  experience: UserExperience;
  grouped?: {
    isLastItem?: boolean;
  };
}

export function UserExperienceItem({
  experience,
  grouped,
}: UserExperienceItemProps): ReactElement {
  const {
    company,
    title,
    description,
    skills,
    startedAt,
    endedAt,
    verified,
    url,
    externalReferenceId,
  } = experience;

  return (
    <li key={experience.id} className="flex flex-row gap-2">
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
      <div
        className={classNames('flex flex-1 flex-col gap-2', {
          'pt-3': !!grouped,
        })}
      >
        <div className="flex flex-col gap-1">
          <Typography type={TypographyType.Subhead} bold>
            {title}
            {!grouped && !endedAt && currrentPill}
            {!!url && (
              <Button
                tag="a"
                target="_blank"
                rel={anchorDefaultRel}
                href={url}
              />
            )}
          </Typography>
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Secondary}
          >
            {company?.name}
            {!!verified && (
              <span className="ml-1 text-text-quaternary">Verified</span>
            )}
          </Typography>
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
          className="flex w-full max-w-full flex-1 break-words"
        >
          {description}
        </Typography>
        <div className="flex flex-row gap-2">
          {skills?.map((skill) => (
            <Pill
              key={skill.value}
              label={skill.value}
              size={PillSize.Small}
              className="border border-border-subtlest-tertiary text-text-quaternary"
            />
          ))}
        </div>
      </div>
    </li>
  );
}
