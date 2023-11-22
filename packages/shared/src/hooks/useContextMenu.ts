import { MouseEventHandler, useCallback, useMemo } from 'react';
import { useContextMenu as useContexifyContextMenu } from '@dailydotdev/react-contexify';
import { useQuery, useQueryClient } from 'react-query';
import { generateQueryKey, RequestKey } from '../lib/query';

interface UseContextMenuProps {
  id: string;
}

interface UseContextMenu {
  isOpen: boolean;
  onMenuClick: MouseEventHandler;
  onHide(): void;
}

export default function useContextMenu({
  id,
}: UseContextMenuProps): UseContextMenu {
  const key = useMemo(
    () => generateQueryKey(RequestKey.ContextMenu, null, id),
    [id],
  );
  const client = useQueryClient();
  const { show, hideAll } = useContexifyContextMenu({ id });
  const { data: isOpen } = useQuery(key, () =>
    client.getQueryData<boolean>(key),
  );

  const onIsOpen = useCallback(
    (value: boolean) => client.setQueryData(key, value),
    [client, key],
  );

  const onHide = useCallback(() => {
    onIsOpen(false);
    hideAll();
  }, [onIsOpen, hideAll]);

  const onMenuClick: MouseEventHandler = useCallback(
    (e) => {
      const { right, bottom } = e.currentTarget.getBoundingClientRect();
      const state = !isOpen;

      if (state) {
        show(e, {
          position: { x: right, y: bottom + 4 },
        });
      }
      onIsOpen(state);
    },
    [show, isOpen, onIsOpen],
  );

  return { onMenuClick, onHide, isOpen };
}
