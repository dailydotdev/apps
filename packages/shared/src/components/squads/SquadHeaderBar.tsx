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
  onNewSquadPost,
  ...props
}: SquadHeaderBarProps): ReactElement {
  const { onMenuClick } = useContextMenu({ id: 'squad-menu-context' });

  return (
    <div
      {...props}
      className={classNames(
        'flex flex-row flex-wrap justify-center items-center gap-4 w-full',
        className,
      )}
    >
      <SquadMemberShortList
        squad={squad}
        members={members}
        memberCount={memberCount}
      />
      <SimpleTooltip placement="top" content="Squad options">
        <Button
          className="tablet:order-2 btn btn-secondary"
          icon={<MenuIcon size={IconSize.Small} />}
          onClick={onMenuClick}
          aria-label="Squad options"
        />
      </SimpleTooltip>
      <Button
        className="w-full mobileL:max-w-[18rem] tablet:w-fit btn btn-primary"
        onClick={onNewSquadPost}
      >
        Create new post
      </Button>
      <SquadHeaderMenu squad={squad} />
    </div>
  );
}
