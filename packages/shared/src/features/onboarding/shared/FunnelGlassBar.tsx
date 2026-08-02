import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';

interface FunnelGlassBarProps {
  children: ReactNode;
  className?: string;
}

/** Pair with `funnelGlassBarCta` on a `ButtonSize.Medium` child. */
export function FunnelGlassBar({
  children,
  className,
}: FunnelGlassBarProps): ReactElement {
  return (
    <div
      className={classNames(
        // Not `bg-background-default/95`: the slash modifier can't apply an
        // alpha to these CSS-variable colours and resolves to transparent.
        'flex w-full items-center gap-2 rounded-18 border border-border-subtlest-secondary bg-surface-float p-1.5 shadow-[0_0.125rem_1rem_0_var(--theme-shadow-shadow1)] backdrop-blur-[2.5rem]',
        className,
      )}
    >
      {children}
    </div>
  );
}

export const funnelGlassBarCta = 'flex-1 whitespace-nowrap !px-3 tablet:!px-6';
