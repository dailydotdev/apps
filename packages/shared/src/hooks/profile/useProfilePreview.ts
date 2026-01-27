import { useMemo } from 'react';
import { useRouter } from 'next/router';
import { useAuthContext } from '../../contexts/AuthContext';
import type { PublicProfile } from '../../lib/user';

export interface UseProfilePreviewReturn {
  isPreviewMode: boolean;
  isOwner: boolean;
  togglePreview: () => void;
}

/**
 * Hook to manage profile preview mode
 * When preview mode is active, the profile owner sees their profile as a visitor would
 */
export function useProfilePreview(
  user: PublicProfile | null | undefined,
): UseProfilePreviewReturn {
  const router = useRouter();
  const { user: loggedUser } = useAuthContext();

  const isPreviewMode = router.query.preview === 'true';
  const isSameUser = !!user && !!loggedUser && loggedUser.id === user.id;

  // When in preview mode, act as a visitor (not owner)
  const isOwner = useMemo(
    () => isSameUser && !isPreviewMode,
    [isSameUser, isPreviewMode],
  );

  const togglePreview = () => {
    const newQuery = { ...router.query };
    if (isPreviewMode) {
      delete newQuery.preview;
    } else {
      newQuery.preview = 'true';
    }
    router.replace(
      {
        pathname: router.pathname,
        query: newQuery,
      },
      undefined,
      { shallow: true },
    );
  };

  return {
    isPreviewMode,
    isOwner,
    togglePreview,
  };
}
