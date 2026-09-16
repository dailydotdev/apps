import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { ButtonSize, ButtonVariant } from '../buttons/Button';
import { usePreferredSource } from '../../hooks/usePreferredSource';
import { PreferGoogleButton } from './PreferGoogleButton';

/**
 * The permanent home for the ask.
 *
 * Every other surface goes quiet after one click, which would otherwise leave a
 * reader who changed their mind with no way back. This row ignores that state.
 *
 * A button, not a toggle: Google exposes no way to read whether the reader
 * already added us, and a switch would promise a state we cannot show.
 */
export function PreferredSourceSetting(): ReactElement | null {
  const { isEligible, isReady, useDeeplink, onAdd } = usePreferredSource({
    placement: 'settings',
    isPermanent: true,
  });

  if (!isEligible) {
    return null;
  }

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex min-w-0 flex-1 flex-col">
        <Typography
          color={TypographyColor.Tertiary}
          type={TypographyType.Callout}
        >
          Preferred source on Google
        </Typography>
        <Typography
          color={TypographyColor.Quaternary}
          type={TypographyType.Footnote}
        >
          Show daily.dev more often in Top Stories and AI Overviews.
        </Typography>
      </div>
      <PreferGoogleButton
        isReady={isReady}
        useDeeplink={useDeeplink}
        label="Add"
        onAdd={onAdd}
        size={ButtonSize.Small}
        variant={ButtonVariant.Primary}
      />
    </div>
  );
}
