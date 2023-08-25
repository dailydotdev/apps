import { MouseEventHandler, useCallback } from 'react';
import { useContextMenu as useContexifyContextMenu } from '@dailydotdev/react-contexify';

interface UseContextMenuProps {
  id: string;
}

interface UseContextMenu {
  onMenuClick: MouseEventHandler;
  onHide(): void;
}

export default function useContextMenu({
  id,
}: UseContextMenuProps): UseContextMenu {
  const { show, hideAll } = useContexifyContextMenu({ id });

  const onMenuClick: MouseEventHandler = useCallback(
    (e) => {
      const { right, bottom } = e.currentTarget.getBoundingClientRect();
      show(e, {
        position: { x: right, y: bottom + 4 },
      });
    },
    [show],
  );

  return {
    onMenuClick,
    onHide: hideAll,
  };
}
