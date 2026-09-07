import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import classNames from 'classnames';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { MiniCloseIcon } from '../../icons';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';
import { usePreferredSource } from '../../../hooks/usePreferredSource';
import { PreferGoogleButton } from './PreferGoogleButton';

export type PreferGoogleStripProps = {
  /** Only true once the reader has actually copied the link. */
  isTriggered: boolean;
  className?: string;
};

/**
 * Shown once, right after the reader copies the post link — a sharing gesture,
 * so the ask reads as part of the same intent rather than as page furniture.
 * The button sits at the end of the row so it lands under the Copy action that
 * triggered it.
 */
export function PreferGoogleStrip({
  isTriggered,
  className,
}: PreferGoogleStripProps): ReactElement | null {
  const { isEligible, isReady, onAdd, onDismiss, onImpression } =
    usePreferredSource({
      placement: 'post copy link',
      shouldEvaluate: isTriggered,
    });
  const isVisible = isTriggered && isEligible;

  useEffect(() => {
    if (isVisible) {
      onImpression();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per appearance
  }, [isVisible]);

  if (!isVisible) {
    return null;
  }

  return (
    <section
      aria-label="Add daily.dev as a preferred source on Google"
      className={classNames(
        'mt-3 flex flex-col gap-3 rounded-12 border border-border-subtlest-tertiary px-3 py-2',
        'mobileL:flex-row mobileL:items-center',
        className,
      )}
    >
      <Typography
        className="min-w-0 flex-1"
        color={TypographyColor.Tertiary}
        type={TypographyType.Footnote}
      >
        Link copied. Want more like this when you search?
      </Typography>
      <span className="flex shrink-0 items-center gap-1 self-start mobileL:self-auto">
        <PreferGoogleButton
          isReady={isReady}
          onAdd={onAdd}
          size={ButtonSize.XSmall}
        />
        <Button
          aria-label="Dismiss"
          icon={<MiniCloseIcon />}
          onClick={onDismiss}
          size={ButtonSize.XSmall}
          variant={ButtonVariant.Tertiary}
        />
      </span>
    </section>
  );
}
