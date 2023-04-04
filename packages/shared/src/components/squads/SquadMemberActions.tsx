import React, { ReactElement } from 'react';
import { SourceMember, SourceMemberRole } from '../../graphql/sources';
import { Button, ButtonSize } from '../buttons/Button';
import BlockIcon from '../icons/Block';
import MenuIcon from '../icons/Menu';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';
import { useAuthContext } from '../../contexts/AuthContext';
import { SquadMemberBadge } from './SquadMemberRoleBadge';

interface SquadMemberActionsProps {
  member: SourceMember;
  onUnblockClick: React.MouseEventHandler;
  onOptionsClick: React.MouseEventHandler;
}

function SquadMemberActions({
  member,
  onUnblockClick,
  onOptionsClick,
}: SquadMemberActionsProps): ReactElement {
  const { user: loggedUser } = useAuthContext();
  const { role, user } = member;

  if (role === SourceMemberRole.Blocked) {
    return (
      <SimpleTooltip content="Unblock">
        <Button
          className="my-auto btn-tertiary"
          icon={<BlockIcon />}
          onClick={onUnblockClick}
        />
      </SimpleTooltip>
    );
  }

  const option = (
    <SimpleTooltip content="Member options">
      <Button
        buttonSize={ButtonSize.Small}
        className="m-auto mr-0 btn-tertiary"
        iconOnly
        onClick={onOptionsClick}
        icon={<MenuIcon />}
      />
    </SimpleTooltip>
  );

  const isLoggedUser = loggedUser.id === user.id;

  if (role !== SourceMemberRole.Member) {
    return (
      <>
        <SquadMemberBadge
          className={!isLoggedUser && 'my-auto mr-2'}
          role={member.role}
        />
        {isLoggedUser ? null : option}
      </>
    );
  }

  if (isLoggedUser) return null;

  return option;
}

export default SquadMemberActions;
