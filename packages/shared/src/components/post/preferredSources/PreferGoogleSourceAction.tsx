import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import { ButtonSize, ButtonVariant } from '../../buttons/Button';
import { usePreferredSource } from '../../../hooks/usePreferredSource';
import { PreferGoogleButton } from './PreferGoogleButton';

/**
 * The widget-column ask, directly under the source card. Takes its own top
 * margin so the space above and below it matches the gap the recommend block
 * below already carries.
 */
export function PreferGoogleSourceAction(): ReactElement | null {
  const { isEligible, isReady, onAdd, onImpression } = usePreferredSource({
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
    <div className="mt-3 w-full">
      <PreferGoogleButton
        className="w-full"
        isReady={isReady}
        onAdd={onAdd}
        size={ButtonSize.Small}
        variant={ButtonVariant.Float}
      />
    </div>
  );
}
