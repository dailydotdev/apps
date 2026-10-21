import type { ReactElement } from 'react';
import React from 'react';
import { Button } from '../../components/buttons/Button';
import { ButtonSize, ButtonVariant } from '../../components/buttons/common';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuOptions,
  DropdownMenuTrigger,
} from '../../components/dropdown/DropdownMenu';
import type { MenuItemProps } from '../../components/dropdown/common';
import { MenuIcon } from '../../components/icons/Menu';
import { VIcon } from '../../components/icons/V';
import type { FeedWidget, FeedWidgetSize } from './types';
import { feedWidgetSizeLabel } from './types';
import { getFeedWidgetDefinition } from './registry';
import { feedWidgetSizes } from './components';

export type FeedWidgetMenuAction =
  | { type: 'size'; size: FeedWidgetSize }
  | { type: 'move'; to: 'start' | 'left' | 'right' | 'end' }
  | { type: 'remove' };

/**
 * Every widget's menu in edit mode: the way to resize, reorder and remove
 * without a drag, as WCAG 2.5.7 asks.
 */
export const FeedWidgetMenu = ({
  widget,
  canMoveLeft,
  canMoveRight,
  onAction,
}: {
  widget: FeedWidget;
  canMoveLeft: boolean;
  canMoveRight: boolean;
  onAction: (action: FeedWidgetMenuAction) => void;
}): ReactElement => {
  const { name } = getFeedWidgetDefinition(widget.kind);
  const options: MenuItemProps[] = [
    ...feedWidgetSizes(widget.kind).map((size) => ({
      label: feedWidgetSizeLabel[size],
      icon: size === widget.size ? <VIcon /> : undefined,
      disabled: size === widget.size,
      action: () => onAction({ type: 'size', size }),
    })),
    {
      label: 'Move to start',
      disabled: !canMoveLeft,
      action: () => onAction({ type: 'move', to: 'start' }),
    },
    {
      label: 'Move left',
      disabled: !canMoveLeft,
      action: () => onAction({ type: 'move', to: 'left' }),
    },
    {
      label: 'Move right',
      disabled: !canMoveRight,
      action: () => onAction({ type: 'move', to: 'right' }),
    },
    {
      label: 'Move to end',
      disabled: !canMoveRight,
      action: () => onAction({ type: 'move', to: 'end' }),
    },
    {
      label: 'Remove widget',
      action: () => onAction({ type: 'remove' }),
    },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={ButtonVariant.Float}
          size={ButtonSize.XSmall}
          icon={<MenuIcon className="rotate-90" />}
          aria-label={`${name} options`}
          className="absolute right-2 top-2 z-3 shadow-2"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        // The Esc that closes this menu is the menu's: stop it before it
        // reaches the rail, which would leave edit mode on the same key.
        onEscapeKeyDown={(event) => event.stopPropagation()}
      >
        <DropdownMenuOptions options={options} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
