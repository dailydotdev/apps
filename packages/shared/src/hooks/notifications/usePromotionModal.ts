import { useRouter } from 'next/router';
import { useEffect } from 'react';

import { LazyModal } from '../../components/modals/common/types';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLazyModal } from '../useLazyModal';

export const usePromotionModal = (): void => {
  const { query, replace } = useRouter();
  const { squads } = useAuthContext();
  const { openModal } = useLazyModal();

  useEffect(() => {
    if (!query || !query.promoted || !query.sid || !squads) {
      return;
    }

    const squad = squads.find(({ id, handle }) =>
      [id, handle].includes(query.sid as string),
    );
    const { origin, pathname } = window.location;

    if (!squad) {
      replace(origin + pathname);
      return;
    }

    openModal({
      type: LazyModal.SquadPromotion,
      props: {
        handle: squad.handle,
        onAfterClose: () => replace(origin + pathname),
      },
    });
  }, [query, squads, replace, openModal]);
};
