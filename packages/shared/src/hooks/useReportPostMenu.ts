import { TriggerEvent } from '@dailydotdev/react-contexify';
import { ContextMenuParams } from '@dailydotdev/react-contexify/dist/types';
import useContextMenu from './useContextMenu';
import { ContextMenu } from './constants';

export default function useReportPostMenu(
  id: string = ContextMenu.PostContext,
): {
  showReportMenu: (
    event: TriggerEvent,
    params?: Pick<ContextMenuParams, 'id' | 'props' | 'position'> | undefined,
  ) => void;
} {
  const { onMenuClick } = useContextMenu({ id });

  return {
    showReportMenu: onMenuClick,
  };
}
