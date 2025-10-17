import type { ReactElement } from 'react';
import React from 'react';
import type { UserExperience } from '../../../../graphql/user/profile';
import { Image, ImageType } from '../../../../components/image/Image';
import {
  Typography,
  TypographyType,
  TypographyColor,
} from '../../../../components/typography/Typography';
import { UserExperienceItem } from './UserExperienceItem';
import { formatDatesDuration } from '../../../../lib/dateFormat';
import { currrentPill } from './common';

interface UserExperiencesGroupedListProps {
  company: string;
  experiences: UserExperience[];
}

export function UserExperiencesGroupedList({
  company,
  experiences,
}: UserExperiencesGroupedListProps): ReactElement {
  const [first] = experiences;
  const last = experiences[experiences.length - 1];
  const duration = formatDatesDuration(
    new Date(last.startedAt),
    first.endedAt ? new Date(first.endedAt) : new Date(),
  );

  return (
    <>
      <li className="flex flex-row gap-2">
        <Image
          className="h-8 w-8 rounded-max object-cover"
          type={ImageType.Organization}
          src={first.company?.image}
        />
        <div className="flex flex-1 flex-col">
          <Typography type={TypographyType.Subhead} bold>
            {company}
            {!first.endedAt && currrentPill}
          </Typography>
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Secondary}
          >
            {duration}
          </Typography>
        </div>
      </li>
      <ul className="flex flex-col">
        {experiences.map((experience, index) => (
          <UserExperienceItem
            key={experience.id}
            experience={experience}
            grouped={{ isLastItem: index === experiences.length - 1 }}
          />
        ))}
      </ul>
    </>
  );
}
