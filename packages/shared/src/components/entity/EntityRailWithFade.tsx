import type { ReactElement, ReactNode } from 'react';
import React from 'react';

export const EntityRailWithFade = ({
  children,
}: {
  children: ReactNode;
}): ReactElement => (
  <div className="relative mb-10">
    {children}
    <div
      aria-hidden
      className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-r from-transparent to-background-default"
    />
  </div>
);
