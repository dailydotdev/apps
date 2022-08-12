import React, { ReactElement, ReactNode } from 'react';
import classNames from 'classnames';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import ArrowIcon from '@dailydotdev/shared/src/components/icons/Arrow';
import {
  AccountPageContent,
  AccountPageHeading,
  AccountPageSection,
} from './common';

interface ClassName {
  container?: string;
  heading?: string;
  section?: string;
  footer?: string;
}

interface AccountPageContainerProps {
  title: string;
  footer?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  className?: ClassName;
  onBack?: () => void;
}

export const AccountPageContainer = ({
  title,
  footer,
  actions,
  children,
  className = {},
  onBack,
}: AccountPageContainerProps): ReactElement => {
  return (
    <AccountPageContent className={classNames('relative', className.container)}>
      <AccountPageHeading className={classNames('sticky', className.heading)}>
        {onBack && (
          <Button
            className="mr-2 btn-tertiary"
            icon={<ArrowIcon className="-rotate-90" />}
            onClick={onBack}
          />
        )}
        {title}
        {actions && <span className="flex flex-row ml-auto">{actions}</span>}
      </AccountPageHeading>
      <AccountPageSection
        className={classNames(
          'h-full overflow-y-scroll',
          footer
            ? 'max-h-[calc(100vh-11.25rem)]'
            : 'max-h-[calc(100vh-7.25rem)]',
          className.section,
        )}
      >
        {children}
      </AccountPageSection>
      {footer && (
        <div
          className={classNames(
            'flex flex-row gap-3 sticky p-3 border-t border-theme-divider-tertiary',
            className.footer,
          )}
        >
          {footer}
        </div>
      )}
    </AccountPageContent>
  );
};
