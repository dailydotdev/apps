import { useEffect, useRef } from 'react';
import { useGenerateBrief } from './useGenerateBrief';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useActions } from '../../../hooks';
import { ActionType } from '../../../graphql/actions';
import { BriefingType } from '../../../graphql/posts';

export const useGenerateBriefOnLoad = ({
  enabled = false,
}: {
  enabled?: boolean;
}) => {
  const { isGenerating, generate } = useGenerateBrief({});
  const { isAuthReady, isLoggedIn } = useAuthContext();
  const { isActionsFetched, checkHasCompleted } = useActions();
  const hasRequestedBriefRef = useRef(false);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    if (
      isAuthReady &&
      isLoggedIn &&
      isActionsFetched &&
      !checkHasCompleted(ActionType.GeneratedBrief) &&
      !hasRequestedBriefRef.current &&
      !isGenerating
    ) {
      hasRequestedBriefRef.current = true;
      generate({ type: BriefingType.Daily });
    }
  }, [
    checkHasCompleted,
    enabled,
    generate,
    isActionsFetched,
    isAuthReady,
    isGenerating,
    isLoggedIn,
  ]);

  return { isGenerating };
};
