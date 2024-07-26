import { useCallback, useEffect, useRef, useState } from 'react';
import { ActionType } from '../../graphql/actions';
import { useToastNotification } from '../useToastNotification';
import { useAuthContext } from '../../contexts/AuthContext';
import { useActions } from '../useActions';
import { useConditionalFeature } from '../useConditionalFeature';
import { feature } from '../../lib/featureManagement';

interface UseSummaryActivationProps {
  summary?: string;
}

interface UseSummaryActivation {
  onClickSummary: () => void;
  shouldShowOverlay: boolean;
  isLoading: boolean;
}

export const useSummaryActivation = ({
  summary,
}: UseSummaryActivationProps): UseSummaryActivation => {
  const { displayToast } = useToastNotification();
  const { user } = useAuthContext();
  const timeoutRef = useRef<number>(null);
  const { isActionsFetched, checkHasCompleted, completeAction } = useActions();
  const shouldEvaluate =
    !!user &&
    !!summary &&
    isActionsFetched &&
    !checkHasCompleted(ActionType.ShowSummary);
  const { value: isEnrolled } = useConditionalFeature({
    shouldEvaluate,
    feature: feature.generateSummary,
  });
  const [isLoading, setIsLoading] = useState(false);
  const shouldShowOverlay = (isEnrolled && shouldEvaluate) || isLoading;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const onClickSummary = useCallback(() => {
    if (isLoading) {
      return;
    }

    setIsLoading(true);
    completeAction(ActionType.ShowSummary);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      displayToast(
        `We've got you covered! Auto-summaries are now enabled for all posts in your feed.`,
      );
      setIsLoading(false);
    }, 1000);
  }, [completeAction, displayToast, isLoading]);

  return { onClickSummary, isLoading, shouldShowOverlay };
};
