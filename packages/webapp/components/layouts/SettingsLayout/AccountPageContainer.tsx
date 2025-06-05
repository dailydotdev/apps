import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons';
import { useQueryState } from '@dailydotdev/shared/src/hooks/utils/useQueryState';
import { useViewSize, ViewSize } from '@dailydotdev/shared/src/hooks';
import {
  AccountPageContent,
  AccountPageHeading,
  AccountPageSection,
} from './common';
import { navigationKey } from '.';

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
  const isMobile = useViewSize(ViewSize.MobileL);
  const [, setIsOpen] = useQueryState({
    key: navigationKey,
    defaultValue: false,
  });

  return (
    <AccountPageContent className={classNames('relative', className.container)}>
      <AccountPageHeading className={classNames('sticky', className.heading)}>
        <Button
          className={classNames('mr-2 flex tablet:hidden', { hidden: onBack })}
          icon={<ArrowIcon className="-rotate-90" />}
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.XSmall}
          onClick={() => setIsOpen(true)}
        />
        {onBack && (
          <Button
            className="mr-2"
            icon={<ArrowIcon className="-rotate-90" />}
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.XSmall}
            onClick={onBack}
          />
        )}
        {title}
        {actions && <span className="ml-auto flex flex-row">{actions}</span>}
      </AccountPageHeading>
      <AccountPageSection
        className={classNames(
          isMobile && `h-[calc(100dvh-7.75rem)] overflow-y-scroll`,
          className.section,
        )}
      >
        {children}
      </AccountPageSection>
    </AccountPageContent>
  );
};
