import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { Switch } from '@dailydotdev/shared/src/components/fields/Switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuOptions,
  DropdownMenuTrigger,
} from '@dailydotdev/shared/src/components/dropdown/DropdownMenu';
import {
  EyeIcon,
  MenuIcon,
  SettingsIcon,
} from '@dailydotdev/shared/src/components/icons';
import { ChromeIcon } from '@dailydotdev/shared/src/components/icons/Browser/Chrome';
import { MenuIcon as WrappingMenuIcon } from '@dailydotdev/shared/src/components/MenuIcon';
import type { ShortcutsAppearance } from '@dailydotdev/shared/src/features/shortcuts/types';

interface ShortcutLinksHubMenuProps {
  isAuto: boolean;
  appearance: ShortcutsAppearance;
  forceShowMenuButton: boolean;
  menuOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onToggleSourceMode: () => void;
  onManage: () => void;
  onHideShortcuts: () => void;
}

interface SourceModeToggleItemProps {
  isAuto: boolean;
  onToggle: () => void;
}

function SourceModeToggleItem({
  isAuto,
  onToggle,
}: SourceModeToggleItemProps): ReactElement {
  return (
    <DropdownMenuItem
      role="menuitemcheckbox"
      aria-checked={isAuto}
      onSelect={(event) => {
        event.preventDefault();
        onToggle();
      }}
    >
      <span className="inline-flex flex-1 items-center gap-2">
        <WrappingMenuIcon Icon={ChromeIcon} />
        <span className="flex-1 truncate">Most visited sites</span>
        <Switch
          inputId="shortcuts-source-toggle"
          name="shortcuts-source-toggle"
          checked={isAuto}
          onToggle={onToggle}
          aria-label="Most visited sites"
          className="pointer-events-none ml-2"
          compact
        />
      </span>
    </DropdownMenuItem>
  );
}

export function ShortcutLinksHubMenu({
  isAuto,
  appearance,
  forceShowMenuButton,
  menuOpen,
  onOpenChange,
  onToggleSourceMode,
  onManage,
  onHideShortcuts,
}: ShortcutLinksHubMenuProps): ReactElement {
  const menuOptions = [
    {
      icon: <WrappingMenuIcon Icon={SettingsIcon} />,
      label: 'Manage shortcuts…',
      action: onManage,
    },
    {
      icon: <WrappingMenuIcon Icon={EyeIcon} />,
      label: 'Hide shortcuts',
      action: onHideShortcuts,
    },
  ];

  return (
    <DropdownMenu open={menuOpen} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Small}
          icon={<MenuIcon className="rotate-90" secondary />}
          className={classNames(
            'ml-1 !size-8 !min-w-0 !rounded-10 text-text-tertiary transition-opacity duration-150 hover:bg-surface-float hover:text-text-primary motion-reduce:transition-none',
            forceShowMenuButton
              ? 'opacity-100'
              : 'opacity-0 focus-visible:opacity-100 group-focus-within/hub:opacity-100 group-hover/hub:opacity-100 [@media(hover:none)]:opacity-100',
            appearance === 'tile' && 'mt-3.5 self-start',
          )}
          aria-label="Shortcut options"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <SourceModeToggleItem isAuto={isAuto} onToggle={onToggleSourceMode} />
        <div
          aria-hidden
          className="mx-2 my-1 h-px bg-border-subtlest-tertiary"
        />
        <DropdownMenuOptions options={menuOptions} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
