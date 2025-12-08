import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { InAppNotificationElement } from '../../notifications/InAppNotification';
import { PromptElement } from '../../modals/Prompt';
import { Sidebar } from './Sidebar';
import Toast from '../../notifications/Toast';
import { useSettingsContext } from '../../../contexts/SettingsContext';

export type RecruiterSelfServeLayoutProps = {
  children: ReactNode | undefined;
  className?: {
    main?: string;
  };
};

export const RecruiterLayout = ({
  children,
  className,
}: RecruiterSelfServeLayoutProps): ReactElement => {
  const { autoDismissNotifications } = useSettingsContext();

  return (
    <div className="antialiased">
      <InAppNotificationElement />
      <PromptElement />
      <Toast autoDismissNotifications={autoDismissNotifications} />
      <main className={classNames('flex', className?.main)}>
        <Sidebar />
        <section className="flex flex-1">{children}</section>
      </main>
    </div>
  );
};
