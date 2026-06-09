import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { ActionButtonsProps } from './ActionButtons';
import ActionButtons from './ActionButtons';

// iOS/macOS-style "liquid glass" bar: a consistently dark translucent tint
// (so it reads in both themes over any cover image) plus a heavy backdrop blur.
// `--button-default-color` recolors the resting action icons to white; their
// pressed/hover brand tints stay bright enough to pop against the dark glass.
const glassContainerClasses = classNames(
  'pointer-events-auto absolute inset-x-2 bottom-2 z-1 flex items-center',
  'rounded-12 border border-border-subtlest-tertiary px-0.5',
  'bg-overlay-primary-pepper shadow-3 backdrop-blur-2xl',
  'text-white [--button-default-color:theme(colors.white)]',
);

export function FeedCardGlassActions(props: ActionButtonsProps): ReactElement {
  return (
    <div className={glassContainerClasses}>
      <ActionButtons {...props} className="w-full !px-0 !pb-0" />
    </div>
  );
}
