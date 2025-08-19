import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuOptions,
  DropdownMenuTrigger,
} from '../../dropdown/DropdownMenu';
import { MenuIcon, ShareIcon } from '../../icons';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';

export function SquadOptionsButton(): ReactElement {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger content="Options" asChild>
        <Button
          variant={ButtonVariant.Tertiary}
          icon={<MenuIcon />}
          size={ButtonSize.Small}
          className={classNames('group-hover:flex', !open && 'hidden')}
        />
      </DropdownMenuTrigger>
      {!!open && (
        <DropdownMenuContent>
          <DropdownMenuOptions
            options={[
              { label: 'Share via', icon: <ShareIcon /> },
              { label: 'Share via', icon: <ShareIcon /> },
              { label: 'Share via', icon: <ShareIcon /> },
            ]}
          />
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  );
}
