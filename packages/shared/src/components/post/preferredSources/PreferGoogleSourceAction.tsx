import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import { ButtonSize, ButtonVariant } from '../../buttons/Button';
import { usePreferredSource } from '../../../hooks/usePreferredSource';
import { PreferGoogleButton } from './PreferGoogleButton';

/**
 * The widget-column ask, at the very top of the rail — above the source card,
 * the signup widget and the ad slot. No margin of its own: PageWidgets already
 * sets the gap between rail items, and an extra one here would push the whole
 * column down.
 */
export function PreferGoogleSourceAction(): ReactElement | null {
  const { isEligible, isReady, useDeeplink, onAdd, onImpression } =
    usePreferredSource({
      placement: 'post widgets',
    });

  useEffect(() => {
    if (isEligible) {
      onImpression();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per appearance
  }, [isEligible]);

  if (!isEligible) {
    return null;
  }

  return (
    <div className="w-full">
      <PreferGoogleButton
        className="w-full"
        isReady={isReady}
        useDeeplink={useDeeplink}
        onAdd={onAdd}
        size={ButtonSize.Small}
        variant={ButtonVariant.Float}
      />
    </div>
  );
}
