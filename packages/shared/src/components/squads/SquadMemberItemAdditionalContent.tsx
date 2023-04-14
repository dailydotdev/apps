import React, { ReactElement } from 'react';
import { SourceMember, SourceMemberRole } from '../../graphql/sources';
import { Button, ButtonSize } from '../buttons/Button';
import BlockIcon from '../icons/Block';
import MenuIcon from '../icons/Menu';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';
import { useAuthContext } from '../../contexts/AuthContext';
import SquadMemberBadge from './SquadMemberBadge';
import { PromptOptions, usePrompt } from '../../hooks/usePrompt';
import { UserShortInfo } from '../profile/UserShortInfo';
import { ModalSize } from '../modals/common/types';
import { useToastNotification } from '../../hooks/useToastNotification';

interface SquadMemberActionsProps {
  member: SourceMember;
  onUnblock: React.MouseEventHandler;
  onOptionsClick: React.MouseEventHandler;
}

function SquadMemberItemAdditionalContent({
  member,
  onUnblock,
  onOptionsClick,
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
      okButton: { title: 'Unblock', className: 'btn-primary-cabbage' },
      content: (
        <UserShortInfo
          disableTooltip
          user={user}
          className={{ container: 'py-3 px-6 justify-center' }}
        />
      ),
      promptSize: ModalSize.Small,
      className: { buttons: 'mt-6' },
    };

    if (await showPrompt(options)) {
      onUnblock(e);
      displayToast('Member is now unblocked');
    }
  };

  if (role === SourceMemberRole.Blocked) {
    return (
      <SimpleTooltip content="Unblock">
        <Button
          className="my-auto btn-tertiary"
          icon={<BlockIcon />}
          onClick={onConfirmUnblock}
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
          className={isLoggedUser ? 'mr-10' : 'mr-2'}
          role={member.role}
        />
        {isLoggedUser ? null : option}
      </>
    );
  }

  if (isLoggedUser) return null;

  return option;
}

export default SquadMemberItemAdditionalContent;
