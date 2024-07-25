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
  haveNotificationsOn: boolean;
  toggleNotify: () => void;
}

export const useSourceActions = (
  props: UseSourceActionsProps,
): UseSourceActionsReturn => {
  const { source } = props;

  const { isBlocked, toggleBlock } = useSourceActionsBlock({ source });
  const { isFollowing, toggleFollow } = useSourceActionsFollow({ source });
  const { haveNotificationsOn, onNotify } = useSourceActionsNotify({
    source,
  });

  return {
    isBlocked,
    toggleBlock,
    isFollowing,
    toggleFollow,
    haveNotificationsOn,
    toggleNotify: onNotify,
  };
};

export default useSourceActions;
