import React, { ReactElement, ReactNode } from 'react';
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
      <h3 className="font-bold typo-body">{title}</h3>
      {description && (
        <p className="mb-2 text-text-tertiary typo-callout">{description}</p>
      )}
      {children}
    </div>
  );
}
