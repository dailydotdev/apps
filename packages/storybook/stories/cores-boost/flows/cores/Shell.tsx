import type { ReactElement, ReactNode } from 'react';
import React from 'react';

/** The screen inside the production app shell (see CoresProviders) */
export const Shell = ({ children }: { children: ReactNode }): ReactElement => (
  <div className="flex flex-1 flex-col">{children}</div>
);
