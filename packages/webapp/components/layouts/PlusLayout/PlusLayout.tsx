import React, { ReactElement, ReactNode } from 'react';
import { cloudinaryPlusBackground } from '@dailydotdev/shared/src/lib/image';
import { MainFeedPageProps } from '../MainFeedPage';
import { PlusHeader } from './PlusHeader';

export default function PlusLayout({
  children,
}: MainFeedPageProps): ReactElement {
  return (
    <main className="relative flex h-screen flex-col">
      <img
        src={cloudinaryPlusBackground}
        alt="Plus background"
        className="absolute inset-0 -z-1 h-full w-full object-cover"
        aria-hidden
      />
      <PlusHeader />
      {children}
    </main>
  );
}

export function getPlusLayout(page: ReactNode): ReactNode {
  return <PlusLayout>{page}</PlusLayout>;
}
