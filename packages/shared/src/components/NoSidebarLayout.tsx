import type { PropsWithChildren, ReactNode } from 'react';
import React from 'react';
import { webappUrl } from '../lib/constants';
import Link from './utilities/Link';
import { Button } from './buttons/Button';
import { ButtonSize, ButtonVariant } from './buttons/common';
import { ArrowIcon } from './icons';

/**
 * Layout that doesn't show a sidebar
 * It shows a top header on tablet and mobile to navigate back
 *
 * @param children
 * @param hideBackButton
 * @constructor
 */
export function NoSidebarLayout({
  className,
  children,
  hideBackButton = false,
}: PropsWithChildren & {
  hideBackButton?: boolean;
  className?: string;
}): ReactNode {
  return (
    <div className={className}>
      {!hideBackButton && (
        <div className="flex h-12 items-center gap-2 border-b border-border-subtlest-tertiary px-4 laptop:hidden">
          <Link href={webappUrl} passHref>
            <Button
              tag="a"
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.Small}
              icon={<ArrowIcon className="-rotate-90" />}
            >
              Back
            </Button>
          </Link>
        </div>
      )}
      {children}
    </div>
  );
}
