import type { ReactElement, ReactNode } from 'react';
import React from 'react';

export const FeaturedWideTextContainer = ({
  children,
}: {
  children: ReactNode;
}): ReactElement => <div className="mx-4 flex flex-col">{children}</div>;
