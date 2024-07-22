import { Source } from '../../graphql/sources';
import { useSourceActionsBlock } from './useSourceActionsBlock';
import { useSourceActionsNotify } from './useSourceActionsNotify';
import { useSourceActionsFollow } from './useSourceActionsFollow';

interface UseSourceActionsProps {
  source: Source;
}

interface UseSourceActionsReturn {
  isBlocked: boolean;
  toggleBlock: () => void;
  isFollowing: boolean;
  toggleFollow: () => void;
  haveNotifications: boolean;
  toggleNotify: () => void;
  isReadyNotification: boolean;
}

export const useSourceActions = (
  props: UseSourceActionsProps,
): UseSourceActionsReturn => {
  const { source } = props;

  const { isBlocked, toggleBlock } = useSourceActionsBlock({ source });
  const { isFollowing, toggleFollow } = useSourceActionsFollow({ source });
  const {
    haveNotifications,
    onNotify,
    isReady: isReadyNotification,
  } = useSourceActionsNotify({
    source,
  });

  return {
    isBlocked,
    toggleBlock,
    isFollowing,
    toggleFollow,
    haveNotifications,
    toggleNotify: onNotify,
    isReadyNotification,
  };
};

export default useSourceActions;
