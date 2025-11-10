import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';

interface SettingsSectionProps {
  className?: string;
  title: string;
  description?: string;
  children: ReactNode;
}

export function SquadSettingsSection({
  title,
  description,
  children,
  className,
}: SettingsSectionProps): ReactElement {
  return (
    <div className={classNames('flex flex-1 flex-col gap-2', className)}>
      <h3 className="typo-body font-bold">{title}</h3>
      {description && (
        <p className="text-text-tertiary typo-callout mb-2">{description}</p>
      )}
      {children}
    </div>
  );
}
