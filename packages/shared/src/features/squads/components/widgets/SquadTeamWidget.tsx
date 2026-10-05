import type { ReactElement } from 'react';
import React from 'react';
import type { Squad } from '../../../../graphql/sources';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import Link from '../../../../components/utilities/Link';
import { UserShortInfo } from '../../../../components/profile/UserShortInfo';
import { SquadWidget } from './SquadWidget';
import { getSquadMembersUrl } from '../../lib/routes';

const MAX_TEAM_ROWS = 5;

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
      <ul className="mt-4 flex flex-col gap-1">
        {team.slice(0, MAX_TEAM_ROWS).map(({ user, role }) => (
          <li key={user.id}>
            <Link href={user.permalink} prefetch={false} passHref>
              <UserShortInfo
                tag="a"
                href={user.permalink}
                user={{ ...user, role }}
                showDescription={false}
                className={{
                  container:
                    '-mx-2 rounded-12 px-2 py-2 hover:bg-surface-hover',
                  textWrapper: 'min-w-0 flex-1',
                }}
              />
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
