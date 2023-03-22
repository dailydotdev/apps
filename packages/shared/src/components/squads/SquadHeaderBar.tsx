import classNames from 'classnames';
import React, { HTMLAttributes, ReactElement } from 'react';
import { Button } from '../buttons/Button';
import MenuIcon from '../icons/Menu';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';
import SquadHeaderMenu from './SquadHeaderMenu';
import useContextMenu from '../../hooks/useContextMenu';
import SquadMemberShortList, {
  SquadMemberShortListProps,
} from './SquadMemberShortList';
import { LazyModal } from '../modals/common/types';
import { useLazyModal } from '../../hooks/useLazyModal';
import { squadFeedback } from '../../lib/constants';
import FeedbackIcon from '../icons/Feedback';
import { useAuthContext } from '../../contexts/AuthContext';

interface SquadHeaderBarProps
  extends SquadMemberShortListProps,
    HTMLAttributes<HTMLDivElement> {
  onNewSquadPost: () => void;
}

export function SquadHeaderBar({
  squad,
  members,
  memberCount,
  className,
  ...props
}: SquadHeaderBarProps): ReactElement {
  const { user } = useAuthContext();
  const { onMenuClick } = useContextMenu({ id: 'squad-menu-context' });
  const { openModal } = useLazyModal();
  const openSquadInviteModal = () =>
    openModal({
      type: LazyModal.SquadInvite,
      props: {
        initialSquad: squad,
      },
    });

  return (
    <div
      {...props}
      className={classNames(
        'flex laptop:flex-row flex-col justify-center items-center gap-4 w-full',
        className,
      )}
    >
      <SquadMemberShortList
        squad={squad}
        members={members}
        memberCount={memberCount}
      />
      <span className="flex flex-row gap-4">
        <Button className="btn-secondary" onClick={openSquadInviteModal}>
          Invite
        </Button>
        <SimpleTooltip placement="top" content="Feedback">
          <Button
            tag="a"
            target="_blank"
            rel="noopener noreferrer"
            href={`${squadFeedback}#user_id=${user.id}&squad_id=${squad.id}`}
            className="btn-secondary"
            icon={<FeedbackIcon aria-label="squad-feedback-icon" />}
          />
        </SimpleTooltip>
        <SimpleTooltip placement="top" content="Squad options">
          <Button
            className="btn-secondary"
            icon={<MenuIcon />}
            onClick={onMenuClick}
            aria-label="Squad options"
          />
        </SimpleTooltip>
      </span>
      <SquadHeaderMenu squad={squad} />
    </div>
  );
}
