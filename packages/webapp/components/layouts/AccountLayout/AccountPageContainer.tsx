import React, { ReactElement, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons';
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
  const client = useQueryClient();
  const openSideNav = () => client.setQueryData(['account_nav_open'], true);

  return (
    <AccountPageContent className={classNames('relative', className.container)}>
      <AccountPageHeading className={classNames('sticky', className.heading)}>
        <Button
          className={classNames('mr-2 flex tablet:hidden', { hidden: onBack })}
          icon={<ArrowIcon className="-rotate-90" />}
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.XSmall}
          onClick={openSideNav}
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
        /* eslint-disable-next-line tailwindcss/no-contradicting-classname */
        className={classNames(
          'h-full overflow-y-scroll',
          footer
            ? '!max-h-[calc(100dvh-11.25rem)] max-h-[calc(100vh-11.25rem)] !min-h-[calc(100dvh-11.25rem)] min-h-[calc(100vh-11.25rem)]'
            : '!max-h-[calc(100dvh-7.25rem)] max-h-[calc(100vh-7.25rem)] !min-h-[calc(100dvh-7.25rem)] min-h-[calc(100vh-7.25rem)]',
          className.section,
        )}
      >
        {children}
      </AccountPageSection>
      {footer && (
        <div
          className={classNames(
            'sticky flex flex-row gap-3 border-t border-theme-divider-tertiary p-3',
            className.footer,
          )}
        >
          {footer}
        </div>
      )}
    </AccountPageContent>
  );
};
