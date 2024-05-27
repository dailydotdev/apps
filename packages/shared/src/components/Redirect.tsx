import { useRouter } from 'next/router';
import { ReactElement, useEffect } from 'react';
import { webappUrl } from '../lib/constants';

export type RedirectProps = {
  path?: string | URL;
};

export const Redirect = ({ path = webappUrl }: RedirectProps): ReactElement => {
  const router = useRouter();

  useEffect(() => {
    router.push(path);
  }, [router, path]);

  return null;
};
