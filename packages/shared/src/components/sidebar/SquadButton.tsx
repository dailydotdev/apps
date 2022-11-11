import React, { ReactElement } from 'react';
import Link from 'next/link';
import classNames from 'classnames';
import { ClickableNavItem } from './ClickableNavItem';
import { ItemInner, ListIcon, NavItem, SidebarMenuItem } from './common';
import SquadIcon from '../icons/Squad';
import { SquadVersion } from '../../lib/featureValues';
import AddUserIcon from '../icons/AddUser';
import { Button } from '../buttons/Button';
import PlusIcon from '../icons/Plus';

interface SquadButtonProps {
  sidebarRendered?: boolean;
  sidebarExpanded: boolean;
  squadVersion: SquadVersion;
  squadButton: string;
  squadForm: string;
}

function SquadButton({
  sidebarExpanded,
  sidebarRendered,
  squadVersion,
  squadButton,
  squadForm,
}: SquadButtonProps): ReactElement {
  if (squadVersion === SquadVersion.V4) {
    return (
      <Link href={squadForm} passHref>
        <Button
          tag="a"
          buttonSize="small"
          icon={<PlusIcon />}
          iconOnly={!sidebarExpanded}
          className={classNames(
            'my-4 btn-primary-cabbage',
            sidebarExpanded ? 'mx-3' : 'mx-1.5',
          )}
          textPosition={sidebarExpanded ? 'justify-start' : 'justify-center'}
        >
          {sidebarExpanded && squadButton}
        </Button>
      </Link>
    );
  }

  const myFeedMenuItem: SidebarMenuItem = {
    icon: () => (
      <ListIcon
        Icon={() =>
          squadVersion === SquadVersion.V1 ? <AddUserIcon /> : <SquadIcon />
        }
      />
    ),
    title: squadButton,
    path: squadForm,
  };

  return (
    <NavItem>
      <ClickableNavItem item={myFeedMenuItem}>
        <ItemInner
          item={myFeedMenuItem}
          sidebarExpanded={sidebarExpanded || sidebarRendered === false}
        />
      </ClickableNavItem>
    </NavItem>
  );
}

export default SquadButton;
