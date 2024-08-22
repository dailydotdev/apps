import { useRouter } from 'next/router';
import { useEffect, useMemo } from 'react';
import { getPathnameWithQuery } from '../../lib';
import { webappUrl } from '../../lib/constants';
import { SourceType } from '../../graphql/sources';
import { useAuthContext } from '../../contexts/AuthContext';

export type UsePrivateSourceJoinProps = {
  postId?: string;
};

export type UsePrivateSourceJoin = {
  isActive: boolean;
};

const sourceTypeToPage: Record<SourceType, string> = {
  [SourceType.Squad]: 'squads',
  [SourceType.Machine]: 'sources',
};

export const usePrivateSourceJoin = ({
  postId,
}: UsePrivateSourceJoinProps = {}): UsePrivateSourceJoin => {
  const router = useRouter();
  const squadJoinToken = router.query?.jt as string;
  const sourceId = router.query?.source as string;
  const sourceType = router.query?.type as string;
  const { isAuthReady, squads } = useAuthContext();
  const isSourceMember = useMemo(() => {
    if (sourceType !== SourceType.Squad) {
      return true;
    }

    const squad = squads?.find(
      (item) => item.id === sourceId || item.handle === sourceId,
    );

    return !!squad;
  }, [squads, sourceId, sourceType]);

  const isActive = !!(
    squadJoinToken &&
    sourceId &&
    isAuthReady &&
    !isSourceMember
  );

  useEffect(() => {
    if (!isActive) {
      return;
    }

    const searchParams = new URLSearchParams(window.location.search);
    searchParams.delete('jt');
    searchParams.delete('source');
    searchParams.delete('type');

    if (postId) {
      searchParams.set('post', postId);
    }

    router.replace(
      getPathnameWithQuery(
        `${webappUrl}${sourceTypeToPage[sourceType]}/${sourceId}/${squadJoinToken}`,
        searchParams,
      ),
    );
  }, [squadJoinToken, sourceId, sourceType, router, postId, isActive]);

  return { isActive };
};
