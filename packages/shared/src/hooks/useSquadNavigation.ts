import { useRouter } from 'next/router';
import { useCallback, useContext, useEffect } from 'react';
import { Origin } from '../lib/log';
import { AuthTriggers } from '../lib/auth';
import AuthContext from '../contexts/AuthContext';
import { webappUrl } from '../lib/constants';

type OpenNewSquadProps = { origin: Origin };
type EditSquadProps = { handle: string };
interface UseSquadNavigation {
  openNewSquad: (props?: OpenNewSquadProps) => void;
  editSquad: (props: EditSquadProps) => void;
}

export const useSquadNavigation = (): UseSquadNavigation => {
  const { user, showLogin } = useContext(AuthContext);
  const router = useRouter();

  const openNewSquad = useCallback(
    (props: OpenNewSquadProps) => {
      if (!user) {
        showLogin({ trigger: AuthTriggers.CreateSquad });
        return;
      }
      router.push(`${webappUrl}squads/new?origin=${props.origin}`);
    },
    [router, user, showLogin],
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

  return { openNewSquad, editSquad };
};
