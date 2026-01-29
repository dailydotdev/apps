import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import type { UserExperience } from '../../../../graphql/user/profile';
import { UserExperienceType } from '../../../../graphql/user/profile';
import {
  Typography,
  TypographyColor,
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
import {
  MoveToIcon,
  PlusIcon,
  EditIcon,
  JobIcon,
  TerminalIcon,
  TourIcon,
} from '../../../../components/icons';
import { GraduationIcon } from '../../../../components/icons/Graduation';
import { MedalIcon } from '../../../../components/icons/Medal';
import { VolunteeringIcon } from '../../../../components/icons/Volunteering';
import { IconSize } from '../../../../components/Icon';
import Link from '../../../../components/utilities/Link';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { webappUrl } from '../../../../lib/constants';
import type { PublicProfile } from '../../../../lib/user';
import { useProfilePreview } from '../../../../hooks/profile/useProfilePreview';
import type { IconProps } from '../../../../components/Icon';

const experienceTypeConfig: Record<
  UserExperienceType,
  {
    icon: React.FC<IconProps>;
    label: string;
    heading: string;
    subheading: string;
  }
> = {
  [UserExperienceType.Work]: {
    icon: JobIcon,
    label: 'work experience',
    heading: 'Add your work experience',
    subheading: "Show where you've worked and what you've accomplished",
  },
  [UserExperienceType.Education]: {
    icon: GraduationIcon,
    label: 'education',
    heading: 'Add your education',
    subheading: 'Share your academic background and achievements',
  },
  [UserExperienceType.Certification]: {
    icon: MedalIcon,
    label: 'certification',
    heading: 'Add your certifications',
    subheading: 'Showcase your professional certifications and credentials',
  },
  [UserExperienceType.OpenSource]: {
    icon: TerminalIcon,
    label: 'open source contribution',
    heading: 'Add your open source work',
    subheading: 'Highlight your contributions to open source projects',
  },
  [UserExperienceType.Project]: {
    icon: TourIcon,
    label: 'project',
    heading: 'Add your projects',
    subheading: 'Share your side projects and publications',
  },
  [UserExperienceType.Volunteering]: {
    icon: VolunteeringIcon,
    label: 'volunteering experience',
    heading: 'Add your volunteering',
    subheading: 'Share your community involvement and volunteer work',
  },
};

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
    // For open source, group by repository owner (org name)
    const name =
      node.customCompanyName ||
      node.company?.name ||
      node.repository?.owner ||
      node.title;

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
  const { isOwner } = useProfilePreview(user);

  const groupedByCompany: [string, T[]][] = useMemo(
    () => groupListByCompany(experiences),
    [experiences],
  );

  const hasExperiences = experiences?.length > 0;

  if (!user) {
    return null;
  }

  if (!hasExperiences && !isOwner) {
    return null;
  }

  const showMoreUrl = `${webappUrl}${user.username}/${experienceType}`;
  const editBaseUrl = `${webappUrl}settings/profile/experience/edit`;
  const addUrl = `${editBaseUrl}?type=${experienceType}`;
  const settingsUrl = `${webappUrl}settings/profile/experience/${experienceType}`;
  const config = experienceTypeConfig[experienceType];
  const IconComponent = config.icon;

  if (!hasExperiences && isOwner) {
    return (
      <div className="flex flex-col gap-3 py-4">
        {title && (
          <Typography tag={TypographyTag.H2} type={TypographyType.Body} bold>
            {title}
          </Typography>
        )}
        <div className="flex flex-col items-center gap-4 rounded-16 bg-surface-float p-6">
          <div className="flex size-14 items-center justify-center rounded-full bg-overlay-quaternary-cabbage">
            <IconComponent size={IconSize.XLarge} />
          </div>
          <div className="flex flex-col items-center gap-1 text-center">
            <Typography
              type={TypographyType.Body}
              color={TypographyColor.Primary}
              bold
            >
              {config.heading}
            </Typography>
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
            >
              {config.subheading}
            </Typography>
          </div>
          <Link href={addUrl} passHref>
            <Button
              tag="a"
              variant={ButtonVariant.Secondary}
              size={ButtonSize.Small}
              icon={<PlusIcon />}
            >
              Add your first {config.label}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 py-4">
      {title ? (
        <div className="flex flex-row items-center justify-between">
          <Typography tag={TypographyTag.H2} type={TypographyType.Body} bold>
            {title}
          </Typography>
          {isOwner && (
            <Link href={settingsUrl} passHref>
              <Button
                tag="a"
                variant={ButtonVariant.Tertiary}
                size={ButtonSize.XSmall}
                icon={<EditIcon />}
                aria-label={`Edit ${title}`}
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
              isSameUser={isOwner}
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
              isSameUser={isOwner}
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
