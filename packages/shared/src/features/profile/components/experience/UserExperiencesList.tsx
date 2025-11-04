import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import type { UserExperience } from '../../../../graphql/user/profile';
import {
  Typography,
  TypographyTag,
  TypographyType,
} from '../../../../components/typography/Typography';
import { UserExperienceItem } from './UserExperienceItem';
import { UserExperiencesGroupedList } from './UserExperiencesGroupedList';

interface UserExperienceListProps<T extends UserExperience> {
  experiences: T[];
  title: string;
}

const groupListByCompany = <T extends UserExperience>(
  experiences: T[],
): [string, T[]][] => {
  if (!experiences?.length) {
    return [];
  }

  const grouped = experiences.reduce((acc, node) => {
    const name = node.customCompanyName || node.company?.name;
    if (!acc[name]) {
      acc[name] = [];
    }
    acc[name].push(node);
    return acc;
  }, {} as Record<string, T[]>);

  return Object.entries(grouped);
};

export function UserExperienceList<T extends UserExperience>({
  experiences,
  title,
}: UserExperienceListProps<T>): ReactElement {
  const groupedByCompany: [string, T[]][] = useMemo(
    () => groupListByCompany(experiences),
    [experiences],
  );

  if (!experiences?.length) {
    return <></>;
  }

  return (
    <div className="flex flex-col gap-3 pt-4">
      <Typography tag={TypographyTag.H2} type={TypographyType.Body} bold>
        {title}
      </Typography>
      <ul className="flex flex-col">
        {groupedByCompany?.map(([company, list]) =>
          list.length === 1 ? (
            <UserExperienceItem key={list[0].id} experience={list[0]} />
          ) : (
            <UserExperiencesGroupedList
              key={company}
              company={company}
              experiences={list}
            />
          ),
        )}
      </ul>
    </div>
  );
}
