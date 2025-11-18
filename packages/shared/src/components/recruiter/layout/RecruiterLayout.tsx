import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import { InAppNotificationElement } from '../../notifications/InAppNotification';
import { PromptElement } from '../../modals/Prompt';
import { Sidebar } from './Sidebar';

export type RecruiterSelfServeLayoutProps = {
  children: ReactNode | undefined;
};

export const RecruiterLayout = ({
  children,
}: RecruiterSelfServeLayoutProps): ReactElement => {
  return (
    <div className="antialiased">
      <InAppNotificationElement />
      <PromptElement />
      <main className="flex">
        <Sidebar />
        <section className="flex flex-1">{children}</section>
      </main>
    </div>
  );
};
