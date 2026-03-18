import type { ReactElement } from 'react';
import React from 'react';
import dynamic from 'next/dynamic';
import type { SourceMember, Squad } from '../../graphql/sources';
import { SourceMemberRole } from '../../graphql/sources';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuOptions,
  DropdownMenuTrigger,
} from '../dropdown/DropdownMenu';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { BlockIcon, MenuIcon, SquadIcon } from '../icons';
import { useAuthContext } from '../../contexts/AuthContext';
import type { PromptOptions } from '../../hooks/usePrompt';
import { usePrompt } from '../../hooks/usePrompt';
import { UserShortInfo } from '../profile/UserShortInfo';
import type { UseSquadActions } from '../../hooks';
import { useToastNotification } from '../../hooks';
import { Tooltip } from '../tooltip/Tooltip';

interface SquadMemberActionsProps
  extends Pick<UseSquadActions, 'onUpdateRole' | 'onDemoteSelf'> {
  squad: Squad;
  member: SourceMember;
  onUnblock: React.MouseEventHandler;
}

const SquadMemberMenu = dynamic(
  () => import(/* webpackChunkName: "squadMemberMenu" */ './SquadMemberMenu'),
);

function SquadMemberItemOptionsButton({
  squad,
  member,
  onUnblock,
  onDemoteSelf,
  onUpdateRole,
}: SquadMemberActionsProps): ReactElement {
  const { showPrompt } = usePrompt();
  const { displayToast } = useToastNotification();
  const { user: loggedUser } = useAuthContext();
  const { role, user } = member;
  const sameUser = loggedUser && loggedUser.id === user.id;
  const canDemoteSelf =
    sameUser &&
    [SourceMemberRole.Admin, SourceMemberRole.Moderator].includes(role);

  const onConfirmUnblock = async (e: React.MouseEvent) => {
    e.preventDefault();

    const options: PromptOptions = {
      title: 'Unblock member?',
      description: `${user.name} will now have access to join your Squad and can then post, upvote and comment`,
      okButton: {
        title: 'Unblock',
        variant: ButtonVariant.Primary,
      },
      content: (
        <UserShortInfo
          disableTooltip
          user={user}
          className={{
            container: 'justify-center px-6 py-3',
            textWrapper: 'max-w-fit',
          }}
        />
      ),
      className: { buttons: 'mt-6' },
    };

    if (await showPrompt(options)) {
      onUnblock(e);
      displayToast('Member is now unblocked');
    }
  };

  const onConfirmBecomeMember = async () => {
    if (!onDemoteSelf) {
      throw new Error('Self demotion action is not configured');
    }

    const options: PromptOptions = {
      title: 'Become a member?',
      description:
        role === SourceMemberRole.Admin
          ? 'You will lose admin permissions and become a regular member.'
          : 'You will lose moderator permissions and become a regular member.',
      okButton: {
        title: 'Become a member',
        variant: ButtonVariant.Primary,
      },
      content: (
        <UserShortInfo
          disableTooltip
          user={user}
          className={{
            container: 'justify-center px-6 py-3',
            textWrapper: 'max-w-fit',
          }}
        />
      ),
      className: { buttons: 'mt-6' },
    };

    if (!(await showPrompt(options))) {
      return;
    }

    await onDemoteSelf(squad.id);
    displayToast('You are now a member');
  };

  if (role === SourceMemberRole.Blocked) {
    return (
      <Tooltip content="Unblock">
        <Button
          className="my-auto ml-2"
          variant={ButtonVariant.Tertiary}
          icon={<BlockIcon />}
          onClick={onConfirmUnblock}
        />
      </Tooltip>
    );
  }

  if (canDemoteSelf) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild tooltip={{ content: 'Member options' }}>
          <Button
            size={ButtonSize.Small}
            variant={ButtonVariant.Tertiary}
            className="z-1 m-auto ml-2 mr-0"
            icon={<MenuIcon />}
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuOptions
            options={[
              {
                label: 'Become a member',
                icon: <SquadIcon />,
                action: onConfirmBecomeMember,
              },
            ]}
          />
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  const hideOption = sameUser || !loggedUser;

  return hideOption ? null : (
    <SquadMemberMenu
      squad={squad}
      member={member}
      onUpdateRole={onUpdateRole}
    />
  );
}

export default SquadMemberItemOptionsButton;
