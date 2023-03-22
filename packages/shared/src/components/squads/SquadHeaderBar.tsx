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
import { IconSize } from '../Icon';
import FeedbackIcon from '../icons/Feedback';
import { squadFeedback } from '../../lib/constants';
import AddUserIcon from '../icons/AddUser';
import { useCopySquadInvitation } from '../../hooks/useCopySquadInvitation';
import useSidebarRendered from '../../hooks/useSidebarRendered';
import { Origin } from '../../lib/analytics';

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
  const [, copying, copyLink] = useCopySquadInvitation({
    squad,
    origin: Origin.SquadPage,
  });
  const { onMenuClick } = useContextMenu({ id: 'squad-menu-context' });
  const { sidebarRendered } = useSidebarRendered();

  return (
    <div
      {...props}
      className={classNames('flex flex-row gap-4 h-fit', className)}
    >
      <Button
        className="btn-primary"
        onClick={() => copyLink()}
        icon={<AddUserIcon />}
        disabled={copying}
      >
        Copy invitation link
      </Button>
      {sidebarRendered && (
        <SquadMemberShortList
          squad={squad}
          members={members}
          memberCount={memberCount}
        />
      )}
      <SimpleTooltip placement="top" content="Feedback">
        <Button
          tag="a"
          target="_blank"
          rel="noopener noreferrer"
          href={`${squadFeedback}#user_id=${squad?.currentMember?.user?.id}&squad_id=${squad.id}`}
          className="btn-secondary"
          icon={<FeedbackIcon size={IconSize.Small} />}
        />
      </SimpleTooltip>
      <SimpleTooltip placement="top" content="Squad options">
        <Button
          className="btn-secondary"
          icon={<MenuIcon size={IconSize.Small} />}
          onClick={onMenuClick}
        />
      </SimpleTooltip>
      <SquadHeaderMenu squad={squad} />
    </div>
  );
}
