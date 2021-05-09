import { TriggerEvent, useContextMenu } from 'react-contexify';
import { ContextMenuParams } from 'react-contexify/dist/types';

export default function useReportPostMenu(): {
  showReportMenu: (
    event: TriggerEvent,
    params?: Pick<ContextMenuParams, 'id' | 'props' | 'position'> | undefined,
  ) => void;
} {
  const { show } = useContextMenu({ id: 'post-context' });

  return {
    showReportMenu: show,
  };
}
