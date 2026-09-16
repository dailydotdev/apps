import type { ReactElement } from 'react';
import React from 'react';
import { ButtonSize, ButtonVariant } from '../buttons/Button';
import { usePreferredSource } from '../../hooks/usePreferredSource';
import { PreferGoogleButton } from './PreferGoogleButton';

/**
 * The widget-column ask, at the very top of the rail — above the source card,
 * the signup widget and the ad slot. No margin of its own: PageWidgets already
 * sets the gap between rail items, and an extra one here would push the whole
 * column down.
 */
export function PreferGoogleSourceAction(): ReactElement | null {
  const { isEligible, isReady, useDeeplink, onAdd } = usePreferredSource({
    placement: 'post widgets',
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
