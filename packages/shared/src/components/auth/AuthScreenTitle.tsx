import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import { MailIcon } from '../icons';
import { IconSize } from '../Icon';

/** The left-aligned title of a full-page flow, with its optional line below. */
export const AuthScreenTitle = ({
  title,
  description,
}: {
  title: ReactNode;
  description?: ReactNode;
}): ReactElement => (
  <div className="flex flex-col gap-2">
    <h1 className="text-balance font-bold tracking-tight typo-large-title">
      {title}
    </h1>
    {description && (
      <p className="text-pretty text-text-secondary typo-callout">
        {description}
      </p>
    )}
  </div>
);

export const AuthScreenMail = (): ReactElement => (
  <MailIcon
    aria-hidden
    className="text-text-primary"
    size={IconSize.XXLarge}
    style={{ marginBottom: -12, marginLeft: -8 }}
  />
);
