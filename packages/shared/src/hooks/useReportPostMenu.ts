import { TriggerEvent, useContextMenu } from '@dailydotdev/react-contexify';
import { ContextMenuParams } from '@dailydotdev/react-contexify/dist/types';
import { ContextMenu } from './constants';

export default function useReportPostMenu(id = ContextMenu.PostContext): {
  showReportMenu: (
    event: TriggerEvent,
    params?: Pick<ContextMenuParams, 'id' | 'props' | 'position'> | undefined,
  ) => void;
} {
  const { show } = useContextMenu({ id });

  return {
    showReportMenu: show,
  };
}
