import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useLazyModal } from '../useLazyModal';
import { LazyModal } from '../../components/modals/common/types';

export const useTopReaderModal = (): void => {
  const { query, replace } = useRouter();
  const { openModal } = useLazyModal();

  useEffect(() => {
    if (!query || !query.topreader || !query.badgeId) {
      return;
    }

    openModal({
      type: LazyModal.TopReaderBadge,
      props: {
        onAfterClose: () => {
          const { origin, pathname } = window.location;
          replace(origin + pathname);
        },
        badgeId: query.badgeId as string,
      },
    });
  }, [openModal, query, replace]);
};
