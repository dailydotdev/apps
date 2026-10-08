import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { ArrowIcon, PlusIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import { ShellPage } from '@dailydotdev/shared/src/components/shell/ShellPageContext';
import { ShellSquare } from '@dailydotdev/shared/src/components/shell/ShellSquare';
import { useQueryState } from '@dailydotdev/shared/src/hooks/utils/useQueryState';
import { useLayoutVariant } from '@dailydotdev/shared/src/hooks/layout/useLayoutVariant';
import { PageHeader } from '@dailydotdev/shared/src/components/layout/PageHeader';
import {
  AccountPageContent,
  AccountPageHeading,
  AccountPageSection,
} from './common';
import { navigationKey, SETTINGS_PAGE_HEADER_PORTAL_ID } from '.';

interface ClassName {
  container?: string;
  heading?: string;
  section?: string;
  header?: string;
}

interface AccountPageContainerProps {
  title: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  className?: ClassName;
  onBack?: () => void;
  // What the phone's block shows under the title: a section's segments.
  phoneRow?: ReactNode;
  // The block's actions when the phone's differ, as a list's add square.
  phoneActions?: ReactNode;
}

// A list page adds an entry with a plus top right on a phone.
export const AccountPageAddSquare = ({
  href,
  label,
}: {
  href: string;
  label: string;
}): ReactElement => (
  <Link href={href} passHref>
    <ShellSquare tag="a" aria-label={label}>
      <PlusIcon size={IconSize.Small} />
    </ShellSquare>
  </Link>
);

export const AccountPageContainer = ({
  title,
  actions,
  children,
  className = {},
  onBack,
  phoneRow,
  phoneActions,
}: AccountPageContainerProps): ReactElement => {
  const { isV2 } = useLayoutVariant();
  const isV2Laptop = isV2;
  const [, setIsOpen] = useQueryState({
    key: navigationKey,
    defaultValue: false,
  });
  // Look up the portal target lazily after mount — the SettingsLayout slot
  // is rendered as `<div id={...} className="contents">` and only exists
  // under v2 + laptop, so we must wait until it's in the DOM before
  // attempting to portal into it.
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  useEffect(() => {
    if (!isV2Laptop) {
      setPortalTarget(null);
      return;
    }
    setPortalTarget(document.getElementById(SETTINGS_PAGE_HEADER_PORTAL_ID));
  }, [isV2Laptop]);

  const pageHeader = isV2Laptop ? (
    <PageHeader title={title} className={className.header}>
      {onBack && (
        <Button
          type="button"
          icon={<ArrowIcon className="-rotate-90" />}
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Small}
          onClick={onBack}
          aria-label="Back"
        />
      )}
      {actions}
    </PageHeader>
  ) : null;

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
      {isV2Laptop && portalTarget && createPortal(pageHeader, portalTarget)}
      {!isV2Laptop && (
        <ShellPage
          title={title}
          row={phoneRow}
          // On a phone the sections menu is the page behind every section,
          // so back returns to it.
          onBack={() => setIsOpen(true)}
          actions={
            phoneActions ??
            (actions && (
              <div className="flex items-center gap-2 [&_.btn]:!h-[2.375rem] [&_.btn]:!rounded-14">
                {actions}
              </div>
            ))
          }
        />
      )}
      {!isV2Laptop && (
        <AccountPageHeading
          className={classNames(
            'sticky top-[var(--safe-area-top)] z-1 hidden bg-background-default tablet:flex laptop:top-[var(--sticky-header-offset)]',
            className.heading,
          )}
        >
          <Button
            type="button"
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
              type="button"
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
      <AccountPageSection className={className.section}>
        {children}
      </AccountPageSection>
    </AccountPageContent>
  );
};
