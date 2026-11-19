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
import { isNewerFeedWidgetConfig } from './config';

type MoveTarget = 'start' | 'left' | 'right' | 'end';

export type FeedWidgetMenuAction =
  | { type: 'size'; size: FeedWidgetSize }
  | { type: 'move'; to: MoveTarget }
  | { type: 'configure' }
  | { type: 'remove' };

/**
 * Every widget's menu in edit mode: the way to resize, reorder and remove
 * without a drag, as WCAG 2.5.7 asks.
 */
export const FeedWidgetMenu = ({
  widget,
  sizes = feedWidgetSizes(widget.kind),
  canMoveLeft,
  canMoveRight,
  moves = ['start', 'left', 'right', 'end'],
  sizeLabel = (size) => feedWidgetSizeLabel[size],
  onAction,
}: {
  widget: FeedWidget;
  /** The sizes this screen can show, the kind's own by default. */
  sizes?: FeedWidgetSize[];
  canMoveLeft: boolean;
  canMoveRight: boolean;
  /** The moves this surface offers, all of them by default. */
  moves?: MoveTarget[];
  /** What this surface calls each size. */
  sizeLabel?: (size: FeedWidgetSize) => string;
  onAction: (action: FeedWidgetMenuAction) => void;
}): ReactElement => {
  const { name, configureLabel } = getFeedWidgetDefinition(widget.kind);
  // A config a newer build wrote is neither used nor edited here.
  const canConfigure = !!configureLabel && !isNewerFeedWidgetConfig(widget);
  const moveOptions: (MenuItemProps & { to: MoveTarget })[] = [
    {
      to: 'start',
      label: 'Move to start',
      disabled: !canMoveLeft,
      action: () => onAction({ type: 'move', to: 'start' }),
    },
    {
      to: 'left',
      label: 'Move left',
      disabled: !canMoveLeft,
      action: () => onAction({ type: 'move', to: 'left' }),
    },
    {
      to: 'right',
      label: 'Move right',
      disabled: !canMoveRight,
      action: () => onAction({ type: 'move', to: 'right' }),
    },
    {
      to: 'end',
      label: 'Move to end',
      disabled: !canMoveRight,
      action: () => onAction({ type: 'move', to: 'end' }),
    },
  ];
  const options: MenuItemProps[] = [
    ...(canConfigure
      ? [
          {
            label: configureLabel,
            action: () => onAction({ type: 'configure' }),
          },
        ]
      : []),
    ...sizes.map((size) => ({
      label: sizeLabel(size),
      icon: size === widget.size ? <VIcon /> : undefined,
      disabled: size === widget.size,
      action: () => onAction({ type: 'size', size }),
    })),
    ...moveOptions
      .filter(({ to }) => moves.includes(to))
      .map(({ to, ...option }) => option),
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
