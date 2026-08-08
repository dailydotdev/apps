import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import LogoIcon from '@dailydotdev/shared/src/svg/LogoIcon';
import { MiniCloseIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { usePrefersReducedMotion } from './sidecarMocks';

interface SidecarPillProps {
  label: string;
  pulsing?: boolean;
  onOpen: () => void;
  onMute: () => void;
}

export const SidecarPill = ({
  label,
  pulsing = false,
  onOpen,
  onMute,
}: SidecarPillProps): ReactElement => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setEntered(true));

    return () => window.cancelAnimationFrame(frame);
  }, []);

  const isVisible = entered || prefersReducedMotion;

  return (
    <div
      className={classNames(
        'fixed bottom-6 right-6 z-popup flex items-center gap-2 rounded-16 border bg-background-default py-2 pl-3 pr-2 shadow-2',
        pulsing
          ? 'border-accent-cabbage-default'
          : 'border-border-subtlest-quaternary',
        !prefersReducedMotion && 'transition-all duration-[240ms] ease-out',
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
      )}
    >
      {pulsing && !prefersReducedMotion && (
        <span className="pointer-events-none absolute inset-0 animate-ping rounded-16 border border-accent-cabbage-default opacity-64" />
      )}
      <button
        type="button"
        onClick={onOpen}
        className="flex items-center gap-2.5 rounded-10 pr-1 text-left"
      >
        <LogoIcon className={{ container: 'w-6 rounded-8' }} />
        <Typography
          tag={TypographyTag.Span}
          type={TypographyType.Footnote}
          color={TypographyColor.Primary}
          bold
        >
          {label}
        </Typography>
      </button>
      <button
        type="button"
        onClick={onMute}
        aria-label="Mute deals on this store"
        className="flex size-6 items-center justify-center rounded-8 text-text-tertiary hover:bg-surface-float hover:text-text-primary"
      >
        <MiniCloseIcon size={IconSize.Size16} />
      </button>
    </div>
  );
};
