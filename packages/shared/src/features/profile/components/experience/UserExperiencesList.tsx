import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import type {
  UserExperience,
  UserExperienceType,
} from '../../../../graphql/user/profile';
import {
  Typography,
  TypographyTag,
  TypographyType,
} from '../../../../components/typography/Typography';
import { UserExperienceItem } from './UserExperienceItem';
import { UserExperiencesGroupedList } from './UserExperiencesGroupedList';
import {
  Button,
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import { MoveToIcon, EditIcon } from '../../../../components/icons';
import { IconSize } from '../../../../components/Icon';
import Link from '../../../../components/utilities/Link';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { webappUrl } from '../../../../lib/constants';
import type { PublicProfile } from '../../../../lib/user';

interface UserExperienceListProps<T extends UserExperience> {
  experiences: T[];
  title?: string;
  experienceType: UserExperienceType;
  hasNextPage?: boolean;
  user?: PublicProfile;
  showEditOnItems?: boolean;
}

const groupListByCompany = <T extends UserExperience>(
  experiences: T[],
): [string, T[]][] => {
  if (!experiences?.length) {
    return [];
  }

  const grouped = experiences.reduce((acc, node) => {
    const name = node.customCompanyName || node.company?.name || node.title;
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
  experienceType,
  hasNextPage,
  showEditOnItems = false,
  user,
}: UserExperienceListProps<T>): ReactElement {
  const { user: loggedUser } = useAuthContext();
  const isSameUser = user?.id === loggedUser?.id;

  const groupedByCompany: [string, T[]][] = useMemo(
    () => groupListByCompany(experiences),
    [experiences],
  );

  if (!user || !experiences?.length) {
    return null;
  }

  const showMoreUrl = `${webappUrl}${user.username}/${experienceType}`;
  const editBaseUrl = `${webappUrl}settings/profile/experience/edit`;
  const settingsUrl = `${webappUrl}settings/profile/experience/${experienceType}`;

  return (
    <div className="flex flex-col gap-3 py-4">
      {title ? (
        <div className="flex flex-row items-center justify-between">
          <Typography tag={TypographyTag.H2} type={TypographyType.Body} bold>
            {title}
          </Typography>
          {settingsUrl && isSameUser && (
            <Link href={settingsUrl} passHref>
              <Button
                tag="a"
                variant={ButtonVariant.Tertiary}
                size={ButtonSize.XSmall}
                icon={<EditIcon />}
              />
            </Link>
          )}
        </div>
      ) : null}
      <ul className="flex flex-col gap-4">
        {groupedByCompany?.map(([company, list]) => {
          const firstExperience = list[0];
          const experienceVerified = !!firstExperience.verified;

          return list.length === 1 ? (
            <UserExperienceItem
              key={list[0].id}
              experience={list[0]}
              isExperienceVerified={experienceVerified}
              isSameUser={isSameUser}
              editUrl={
                showEditOnItems
                  ? `${editBaseUrl}?id=${list[0].id}&type=${experienceType}`
                  : undefined
              }
            />
          ) : (
            <UserExperiencesGroupedList
              key={company}
              company={company}
              experiences={list}
              isExperienceVerified={experienceVerified}
              showEditOnItems={showEditOnItems}
              isSameUser={isSameUser}
              experienceType={experienceType}
              editBaseUrl={editBaseUrl}
            />
          );
        })}
      </ul>
      {hasNextPage && showMoreUrl && loggedUser && (
        <Link href={showMoreUrl} passHref>
          <Button
            tag="a"
            variant={ButtonVariant.Subtle}
            size={ButtonSize.Medium}
            icon={<MoveToIcon size={IconSize.XSmall} />}
            iconPosition={ButtonIconPosition.Right}
            className="w-full"
          >
            Show More
          </Button>
        </Link>
      )}
    </div>
  );
}
