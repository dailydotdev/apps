import type { PropsWithChildren, ReactNode } from 'react';
import React from 'react';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import { webappUrl } from '@dailydotdev/shared/src/lib/constants';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import {
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/common';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons';
import type { MainLayoutProps } from '@dailydotdev/shared/src/components/MainLayout';

import { getLayout as getMainLayout } from './MainLayout';

/**
 * Layout that doesn't show a sidebar
 * It shows a top header on tablet and mobile to navigate back
 *
 * @param children
 * @constructor
 */
export default function NoSidebarLayout({
  children,
}: PropsWithChildren): ReactNode {
  return (
    <>
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
      {children}
    </>
  );
}

export const getLayout = (
  page: ReactNode,
  pageProps: Record<string, unknown>,
  layoutProps: MainLayoutProps,
): ReactNode =>
  getMainLayout(<NoSidebarLayout>{page}</NoSidebarLayout>, pageProps, {
    ...layoutProps,
    showSidebar: false,
  });
