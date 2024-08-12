import { useCallback } from 'react';
import { useToggle } from '../useToggle';
import { useActions } from '../useActions';

interface UseStreakRecoverProps {
  onRequestClose: () => void;
}

interface UseStreakRecoverReturn {
  hideForever: {
    isChecked: boolean;
    toggle: () => void;
  };
  onClose?: () => void;
  recover: {
    canDo: boolean;
    cost: number;
    isLoading: boolean;
    oldStreakLength: number;
  };
}

export const useStreakRecover = ({
  onRequestClose,
}: UseStreakRecoverProps): UseStreakRecoverReturn => {
  const { completeAction } = useActions();
  const [hideForever, toggleHideForever] = useToggle(false);
  const amount = 0;
  const canDo = true;
  const length = 102;

  const isLoading = false;

  const onClose = useCallback(async () => {
    // if (hideForever) {
    //   await completeAction(ActionType.DisableReadingStreakRecover);
    // }

    onRequestClose?.();
  }, [completeAction, hideForever, onRequestClose]);

  return {
    hideForever: {
      isChecked: hideForever,
      toggle: toggleHideForever,
    },
    onClose,
    recover: {
      cost: amount,
      canDo,
      oldStreakLength: length,
      isLoading,
    },
  };
};

export default useStreakRecover;
