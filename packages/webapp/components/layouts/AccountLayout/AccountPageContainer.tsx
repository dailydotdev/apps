import React, { ReactElement, ReactNode } from 'react';
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
}

interface AccountPageContainerProps {
  title: string;
  actions?: ReactNode;
  children?: ReactNode;
  className?: ClassName;
  onBack?: () => void;
}

export const AccountPageContainer = ({
  title,
  actions,
  children,
  className = {},
  onBack,
}: AccountPageContainerProps): ReactElement => {
  return (
    <AccountPageContent className={className.container}>
      <AccountPageHeading className={className.heading}>
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
      <AccountPageSection className={className.section}>
        {children}
      </AccountPageSection>
    </AccountPageContent>
  );
};
