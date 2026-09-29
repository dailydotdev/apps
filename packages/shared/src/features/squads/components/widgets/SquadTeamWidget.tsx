import type { ReactElement } from 'react';
import React from 'react';
import type { Squad } from '../../../../graphql/sources';
import { SourceMemberRole } from '../../../../graphql/sources';
import {
  ProfileImageSize,
  ProfilePicture,
} from '../../../../components/ProfilePicture';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import Link from '../../../../components/utilities/Link';
import { SquadWidget } from './SquadWidget';
import { getSquadMembersUrl } from '../../lib/routes';

const MAX_TEAM_ROWS = 5;

const roleLabel: Partial<Record<SourceMemberRole, string>> = {
  [SourceMemberRole.Admin]: 'Admin',
  [SourceMemberRole.Moderator]: 'Moderator',
};

interface SquadTeamWidgetProps {
  squad: Squad;
}

export const SquadTeamWidget = ({
  squad,
}: SquadTeamWidgetProps): ReactElement | null => {
  const team = squad.privilegedMembers ?? [];

  if (!team.length) {
    return null;
  }

  const membersUrl = getSquadMembersUrl(squad.handle);

  return (
    <SquadWidget title="Team">
      <ul className="mt-4 flex flex-col gap-2.5">
        {team.slice(0, MAX_TEAM_ROWS).map(({ user, role }) => (
          <li key={user.id}>
            <Link href={user.permalink} prefetch={false}>
              <a
                href={user.permalink}
                className="flex items-center gap-2.5 hover:opacity-64"
              >
                <ProfilePicture user={user} size={ProfileImageSize.Medium} />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate font-bold text-text-primary typo-callout">
                    {user.name}
                  </span>
                  <span className="truncate text-text-tertiary typo-footnote">
                    @{user.username}
                  </span>
                </span>
                <span className="shrink-0 text-text-quaternary typo-caption1">
                  {roleLabel[role]}
                </span>
              </a>
            </Link>
          </li>
        ))}
      </ul>
      <Link href={membersUrl} passHref>
        <Button
          tag="a"
          variant={ButtonVariant.Subtle}
          size={ButtonSize.Small}
          className="mt-3 w-full"
        >
          See all members
        </Button>
      </Link>
    </SquadWidget>
  );
};
