'use client';

import { appBootDataAtom } from '@dailydotdev/shared/src/lib/boot';
import { useAtomValue } from 'jotai/react';

export const ClientTest = () => {
  const { data } = useAtomValue(appBootDataAtom);
  const user = data?.user;
  const isLoggedIn = !!user?.id;

  return (
    <p>
      <strong>Client</strong> says that user is{' '}
      {isLoggedIn ? 'logged' : 'not logged'}
    </p>
  );
};
