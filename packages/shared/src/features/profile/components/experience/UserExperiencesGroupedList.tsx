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
import { currrentPill } from './common';
import { pluralize } from '../../../../lib/strings';
import type { DateRange } from '../../../../lib/date';
import { calculateTotalDurationInMonths } from '../../../../lib/date';

interface UserExperiencesGroupedListProps {
  company: string;
  experiences: UserExperience[];
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
}: UserExperiencesGroupedListProps): ReactElement {
  const [first] = experiences;
  const duration = calculateTotalDuration(experiences);

  return (
    <li>
      <div className="flex flex-row gap-2">
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
      </div>
      <ul className="flex flex-col">
        {experiences.map((experience, index) => (
          <UserExperienceItem
            key={experience.id}
            experience={experience}
            grouped={{ isLastItem: index === experiences.length - 1 }}
          />
        ))}
      </ul>
    </li>
  );
}
