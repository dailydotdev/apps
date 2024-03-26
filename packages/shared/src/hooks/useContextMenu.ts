import { MouseEventHandler, useCallback, useMemo } from 'react';
import { useContextMenu as useContexifyContextMenu } from '@dailydotdev/react-contexify';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { generateQueryKey, RequestKey } from '../lib/query';
import { useViewSize, ViewSize } from '.';

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
  const { data: isOpen } = useQuery(
    key,
    () => client.getQueryData<boolean>(key) ?? false,
    { initialData: false },
  );

  const isMobile = useViewSize(ViewSize.MobileL);

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

      // calling `show` from `react-contextify` requires a `Menu` component from the same library to be rendered
      // on mobile we don't render it that way, so we don't call `show` on mobile
      // see `PortalMenu` implementation for more details
      if (!isMobile && state) {
        show(e, {
          position: { x: right, y: bottom + 4 },
        });
      }
      onIsOpen(state);
    },
    [show, isOpen, onIsOpen, isMobile],
  );

  return { onMenuClick, onHide, isOpen };
}
