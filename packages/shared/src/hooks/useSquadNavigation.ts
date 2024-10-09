import { useRouter } from 'next/router';
import { useCallback, useEffect } from 'react';
import { Origin } from '../lib/log';
import { AuthTriggers } from '../lib/auth';
import { useAuthContext } from '../contexts/AuthContext';
import { webappUrl } from '../lib/constants';
import { useLazyModal } from './useLazyModal';
import { LazyModal } from '../components/modals/common/types';

type OpenNewSquadProps = { event?: React.MouseEvent; origin: Origin };
type EditSquadProps = { handle: string };
interface UseSquadNavigation {
  openNewSquad: (props?: OpenNewSquadProps) => void;
  editSquad: (props: EditSquadProps) => void;
  newSquadUrl: string;
}

export const useSquadNavigation = (): UseSquadNavigation => {
  const { user, showLogin } = useAuthContext();
  const router = useRouter();
  const { openModal } = useLazyModal();

  const newSquadUrl = `${webappUrl}squads/new`;

  const openNewSquad = useCallback(
    (props: OpenNewSquadProps) => {
      if (!user) {
        props?.event?.preventDefault();
        showLogin({ trigger: AuthTriggers.CreateSquad });
        return;
      }

      props?.event?.preventDefault();
      openModal({ type: LazyModal.NewSquad });
    },
    [user, openModal, showLogin],
  );

  const editSquad = useCallback(
    ({ handle }: EditSquadProps) => {
      router.push(`${webappUrl}squads/${handle}/edit`);
    },
    [router],
  );

  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    const query = Object.fromEntries(search);
    if (!query?.squad) {
      return;
    }

    const { origin, pathname } = window.location;
    openNewSquad({ origin: Origin.Notification });
    router.replace(origin + pathname);
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.pathname]);

  return { openNewSquad, editSquad, newSquadUrl };
};
