import { useRouter } from 'next/router';
import { useCallback, useContext, useEffect } from 'react';
import { Origin } from '../lib/analytics';
import usePersistentContext from './usePersistentContext';
import AuthContext from '../contexts/AuthContext';
import FeaturesContext from '../contexts/FeaturesContext';

type OpenNewSquadProps = { origin: Origin };
type EditSquadProps = { handle: string };
interface UseSquadNavigation {
  openNewSquad: (props?: OpenNewSquadProps) => void;
  editSquad: (props: EditSquadProps) => void;
}

const SQUAD_ONBOARDING = 'hasTriedSquadOnboarding';
const SQUAD_INVITE_PATHNAME = '/squads/[handle]/[token]';

export const useSquadNavigation = (): UseSquadNavigation => {
  const { squads } = useContext(AuthContext);
  const hasSquads = !!squads?.length;
  const { hasSquadAccess: hasAccess, isFlagsFetched } =
    useContext(FeaturesContext);
  const router = useRouter();
  const [hasTriedOnboarding, setHasTriedOnboarding, isLoaded] =
    usePersistentContext<boolean>(SQUAD_ONBOARDING, hasSquads);

  const openNewSquad = useCallback(
    (props: OpenNewSquadProps) => {
      router.push(`/squads/new?origin=${props.origin}`);
    },
    [router],
  );

  const editSquad = useCallback(
    ({ handle }: EditSquadProps) => {
      router.push(`/squads/${handle}/edit`);
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

  useEffect(() => {
    if (
      !isLoaded ||
      hasTriedOnboarding ||
      hasSquads ||
      !hasAccess ||
      !isFlagsFetched ||
      router.pathname === SQUAD_INVITE_PATHNAME
    ) {
      return;
    }

    openNewSquad({ origin: Origin.Auto });
    setHasTriedOnboarding(true);
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    hasTriedOnboarding,
    isLoaded,
    hasSquads,
    hasAccess,
    isFlagsFetched,
    router.pathname,
  ]);

  return { openNewSquad, editSquad };
};
