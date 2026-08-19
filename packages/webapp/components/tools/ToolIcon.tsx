import type { ReactElement } from 'react';
import React from 'react';

interface ToolIconProps {
  title: string;
  faviconUrl: string | null;
  className: string;
}

export const ToolIcon = ({
  title,
  faviconUrl,
  className,
}: ToolIconProps): ReactElement =>
  faviconUrl ? (
    <img src={faviconUrl} alt={`${title} logo`} className={className} />
  ) : (
    <span
      className={`${className} grid place-items-center bg-surface-float font-bold text-text-tertiary`}
    >
      {title.charAt(0).toUpperCase()}
    </span>
  );
