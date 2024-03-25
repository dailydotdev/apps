import React, { ReactElement } from 'react';
import { SourceMember, SourceMemberRole } from '../../graphql/sources';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { BlockIcon, MenuIcon } from '../icons';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';
import { useAuthContext } from '../../contexts/AuthContext';
import SquadMemberBadge from './SquadMemberBadge';
import { PromptOptions, usePrompt } from '../../hooks/usePrompt';
import { UserShortInfo } from '../profile/UserShortInfo';
import { useToastNotification } from '../../hooks';

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
      <SimpleTooltip content="Unblock">
        <Button
          className="my-auto"
          variant={ButtonVariant.Tertiary}
          icon={<BlockIcon />}
          onClick={onConfirmUnblock}
        />
      </SimpleTooltip>
    );
  }

  const option = (
    <SimpleTooltip content="Member options">
      <Button
        size={ButtonSize.Small}
        variant={ButtonVariant.Tertiary}
        className="m-auto mr-0"
        onClick={onOptionsClick}
        icon={<MenuIcon />}
      />
    </SimpleTooltip>
  );

  const sameUser = loggedUser && loggedUser.id === user.id;
  const hideOption = sameUser || !loggedUser;

  if (role !== SourceMemberRole.Member) {
    return (
      <>
        <SquadMemberBadge
          className={sameUser ? 'mr-10' : 'mr-2'}
          role={member.role}
        />
        {hideOption ? null : option}
      </>
    );
  }

  return hideOption ? null : option;
}

export default SquadMemberItemAdditionalContent;
