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
    if (!feedSettings?.excludeSources?.length) {
      return false;
    }
    return !!feedSettings.excludeSources.find(
      (excludedSource) => source?.id === excludedSource.id,
    );
  }, [feedSettings, source]);

  const { onUnblockSource, onBlockSource } = useTagAndSource({
    origin: Origin.SourcePage,
  });

  const toggleBlock = useCallback(async () => {
    if (isBlocked) {
      const { successful } = await onUnblockSource({
        source,
        requireLogin: true,
      });

      if (successful) {
        displayToast(`✅ ${source.name} unblocked`);
      }
      return;
    }

    const { successful } = await onBlockSource({ source, requireLogin: true });
    if (successful) {
      displayToast(`⛔️ ${source.name} is now blocked`);
    }
  }, [displayToast, isBlocked, onBlockSource, onUnblockSource, source]);

  return {
    isBlocked,
    toggleBlock,
  };
}
