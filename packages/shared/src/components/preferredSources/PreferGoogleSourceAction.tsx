import type { ReactElement } from 'react';
import React from 'react';
import { ButtonSize, ButtonVariant } from '../buttons/Button';
import { usePreferredSource } from '../../hooks/usePreferredSource';
import { PreferGoogleButton } from './PreferGoogleButton';

export type PreferGoogleSourceActionProps = {
  /**
   * Which rail is rendering it. Each post type has its own widget column, so
   * this is what separates them in the events — the component cannot tell.
   */
  placement?: string;
};

/**
 * The widget-column ask, sitting directly above the share bar. It trades on the
 * same intent: a reader deciding whether to recommend the post has already
 * decided the source was worth their time. No margin of its own, since
 * PageWidgets sets the gap between rail items.
 */
export function PreferGoogleSourceAction({
  placement = 'post widgets',
}: PreferGoogleSourceActionProps = {}): ReactElement | null {
  const { isEligible, isReady, useDeeplink, onAdd } = usePreferredSource({
    placement,
  });

  if (!isEligible) {
    return null;
  }

  return (
    <PreferGoogleButton
      className="w-full"
      isReady={isReady}
      useDeeplink={useDeeplink}
      onAdd={onAdd}
      size={ButtonSize.Small}
      variant={ButtonVariant.Float}
    />
  );
}
