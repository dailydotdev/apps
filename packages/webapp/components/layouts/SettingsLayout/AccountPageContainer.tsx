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
  checkSameSite,
  resolveSettingsBackPath,
  settingsBackPathQueryParam,
} from '@dailydotdev/shared/src/lib/links';
import { isDevelopment } from '@dailydotdev/shared/src/lib/constants';
import { useRouter } from 'next/router';
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
  const router = useRouter();
  const settingsBackPath = resolveSettingsBackPath(
    router.query?.[settingsBackPathQueryParam],
  );
  const [, setIsOpen] = useQueryState({
    key: navigationKey,
    defaultValue: false,
  });

  const handleBack = () => {
    if (settingsBackPath) {
      router.replace(settingsBackPath);
      return;
    }

    const referrer = globalThis?.document?.referrer;
    const canGoBack =
      globalThis?.history?.length > 1 && (checkSameSite() || isDevelopment);
    let cameFromOutside = false;

    if (canGoBack && referrer) {
      try {
        cameFromOutside = !new URL(referrer).pathname.startsWith('/settings');
      } catch {
        cameFromOutside = false;
      }
    }

    if (cameFromOutside) {
      router.back();
      return;
    }

    setIsOpen(true);
  };

  return (
    <AccountPageContent className={classNames('relative', className.container)}>
      <AccountPageHeading className={classNames('sticky', className.heading)}>
        <Button
          className={classNames('mr-2 flex tablet:hidden', { hidden: onBack })}
          icon={<ArrowIcon className="-rotate-90" />}
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.XSmall}
          onClick={handleBack}
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
