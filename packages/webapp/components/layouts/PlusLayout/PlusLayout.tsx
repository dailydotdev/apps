import React, { ReactElement, ReactNode } from 'react';
import { MainFeedPageProps } from '../MainFeedPage';
import { PlusHeader } from './PlusHeader';

export default function PlusLayout({
  children,
}: MainFeedPageProps): ReactElement {
  return (
    <main className="flex h-screen flex-col bg-blur-glass before:absolute before:inset-0 before:-z-1 before:bg-[url('https://daily-now-res.cloudinary.com/image/upload/s--q2q8AL3Q--/f_auto/v1731397654/Upgrade_to_plus_i8phhr')] before:content-['']">
      <PlusHeader />
      {children}
    </main>
  );
}

export function getPlusLayout(page: ReactNode): ReactNode {
  return <PlusLayout>{page}</PlusLayout>;
}
