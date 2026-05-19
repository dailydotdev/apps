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
import { useLayoutVariant } from '@dailydotdev/shared/src/hooks/layout/useLayoutVariant';
import { PageHeader } from '@dailydotdev/shared/src/components/layout/PageHeader';
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
  const isLaptop = useViewSize(ViewSize.Laptop);
  const { isV2 } = useLayoutVariant();
  const isV2Laptop = isV2 && isLaptop;
  const [, setIsOpen] = useQueryState({
    key: navigationKey,
    defaultValue: false,
  });

  return (
    <AccountPageContent
      className={classNames(
        'relative',
        // v2: the outer floating-card already provides the rounded chrome
        // — drop AccountPageContent's `tablet:border rounded-16` so the
        // settings section doesn't look like a nested bordered box.
        isV2Laptop && 'laptop:rounded-none laptop:border-0',
        className.container,
      )}
    >
      {isV2Laptop ? (
        <PageHeader title={typeof title === 'string' ? title : undefined}>
          {onBack && (
            <Button
              icon={<ArrowIcon className="-rotate-90" />}
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.Small}
              onClick={onBack}
              aria-label="Back"
            />
          )}
          {actions}
        </PageHeader>
      ) : (
        <AccountPageHeading className={classNames('sticky', className.heading)}>
          <Button
            className={classNames('mr-2 flex tablet:hidden', {
              hidden: onBack,
            })}
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
      )}
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
