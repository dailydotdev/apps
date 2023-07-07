import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';

interface UseSubmitArticle {
  isOpen: boolean;
  onIsOpen: (value: boolean) => void;
}

export const useSubmitArticle = (): UseSubmitArticle => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    const query = Object.fromEntries(search);
    if (!query?.scout) {
      return;
    }

    const { origin, pathname } = window.location;
    setIsOpen(true);
    router.replace(origin + pathname);
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return useMemo(() => ({ isOpen, onIsOpen: setIsOpen }), [isOpen]);
};
