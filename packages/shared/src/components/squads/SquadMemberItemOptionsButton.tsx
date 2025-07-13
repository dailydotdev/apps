import type { ReactElement } from 'react';
import React from 'react';
import dynamic from 'next/dynamic';
import type { SourceMember, Squad } from '../../graphql/sources';
import { SourceMemberRole } from '../../graphql/sources';
import { Button, ButtonVariant } from '../buttons/Button';
import { BlockIcon } from '../icons';
import { useAuthContext } from '../../contexts/AuthContext';
import type { PromptOptions } from '../../hooks/usePrompt';
import { usePrompt } from '../../hooks/usePrompt';
import { UserShortInfo } from '../profile/UserShortInfo';
import type { UseSquadActions } from '../../hooks';
import { useToastNotification } from '../../hooks';
import { Tooltip } from '../tooltip/Tooltip';

interface SquadMemberActionsProps
  extends Pick<UseSquadActions, 'onUpdateRole'> {
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
  onUpdateRole,
}: SquadMemberActionsProps): ReactElement {
  const { showPrompt } = usePrompt();
  const { displayToast } = useToastNotification();
  const { user: loggedUser } = useAuthContext();
  const { role, user } = member;

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

  const sameUser = loggedUser && loggedUser.id === user.id;
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
