import { Source } from '../../graphql/sources';
import { useSourceActionsBlock } from './useSourceActionsBlock';
import { useSourceActionsNotify } from './useSourceActionsNotify';
import { useSourceActionsFollow } from './useSourceActionsFollow';

interface UseSourceActionsProps {
  source: Source;
}

export const useSourceActions = (props: UseSourceActionsProps) => {
  const { source } = props;

  const { isBlocked, toggleBlock } = useSourceActionsBlock({ source });
  const { isFollowing, toggleFollow } = useSourceActionsFollow({ source });
  const { haveNotifications, onNotify } = useSourceActionsNotify({
    source,
  });

  return {
    isBlocked,
    toggleBlock,
    isFollowing,
    toggleFollow,
    haveNotifications,
    toggleNotify: onNotify,
  };
};

export default useSourceActions;
