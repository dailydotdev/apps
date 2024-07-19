import { useCallback, useMemo } from 'react';
import useTagAndSource from '../useTagAndSource';
import { Origin } from '../../lib/log';
import useFeedSettings from '../useFeedSettings';
import { Source } from '../../graphql/sources';
import { useToastNotification } from '../useToastNotification';

interface UseSourceActionsBlockProps {
  source: Source;
}

interface UseSourceActionsBlockReturn {
  isBlocked: boolean;
  toggleBlock: () => void;
}

export function useSourceActionsBlock(
  props: UseSourceActionsBlockProps,
): UseSourceActionsBlockReturn {
  const { source } = props;
  const { feedSettings } = useFeedSettings();
  const { displayToast } = useToastNotification();

  const isBlocked = useMemo(() => {
    if (!feedSettings) {
      return true;
    }
    return (
      feedSettings.excludeSources &&
      feedSettings.excludeSources?.findIndex(
        (excludedSource) => source?.id === excludedSource.id,
      ) >= 0
    );
  }, [feedSettings, source]);

  const { onUnblockSource, onBlockSource } = useTagAndSource({
    origin: Origin.SourcePage,
  });

  const toggleBlock = useCallback(async () => {
    if (isBlocked) {
      await onUnblockSource({ source, requireLogin: true });
      displayToast('✅ Source unblocked');
      return;
    }

    await onBlockSource({ source, requireLogin: true });
    displayToast('⛔️ Source is now blocked');
  }, [displayToast, isBlocked, onBlockSource, onUnblockSource, source]);

  return {
    isBlocked,
    toggleBlock,
  };
}
