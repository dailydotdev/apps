import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
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
import {
  navigationKey,
  SETTINGS_HEADER_ACTIONS_PORTAL_ID,
  SETTINGS_HEADER_TITLE_PORTAL_ID,
} from '.';

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
  const [, setIsOpen] = useQueryState({
    key: navigationKey,
    defaultValue: false,
  });
  // Capture the laptop PageHeader's portal targets imperatively after
  // SettingsLayout has committed. Reading the DOM in a useEffect (rather
  // than via `ref={setState}`) avoids running setState from a ref-detach
  // during the React commit phase, which previously cascaded into the
  // "Maximum update depth exceeded" error on settings pages.
  const [titleNode, setTitleNode] = useState<HTMLElement | null>(null);
  const [actionsNode, setActionsNode] = useState<HTMLElement | null>(null);
  useEffect(() => {
    if (!isLaptop) {
      setTitleNode(null);
      setActionsNode(null);
      return;
    }
    setTitleNode(document.getElementById(SETTINGS_HEADER_TITLE_PORTAL_ID));
    setActionsNode(document.getElementById(SETTINGS_HEADER_ACTIONS_PORTAL_ID));
  }, [isLaptop]);

  const portaledTitle = (
    <>
      <span aria-hidden> · </span>
      {title}
    </>
  );

  const portaledActions = (
    <>
      {onBack && (
        <Button
          type="button"
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Small}
          icon={<ArrowIcon className="-rotate-90" />}
          onClick={onBack}
          aria-label="Back"
        />
      )}
      {actions}
    </>
  );

  return (
    <>
      {isLaptop && titleNode && createPortal(portaledTitle, titleNode)}
      {isLaptop &&
        actionsNode &&
        (actions || onBack) &&
        createPortal(portaledActions, actionsNode)}
      <AccountPageContent
        className={classNames(
          'relative',
          // The unified PageHeader at the top of the floating card already
          // owns the visual frame on laptop, so drop the inner card border
          // there to avoid the nested-box look. Tablet still renders the
          // standalone card since it isn't wrapped by the floating shell.
          'laptop:rounded-none laptop:border-0',
          className.container,
        )}
      >
        {!isLaptop && (
          <AccountPageHeading
            className={classNames('sticky', className.heading)}
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
            {actions && (
              <span className="ml-auto flex flex-row">{actions}</span>
            )}
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
    </>
  );
};
