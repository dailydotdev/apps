import type { MouseEventHandler } from 'react';
import { useId } from 'react';
import { useSearchParams } from 'next/navigation';
import type { SourcePostModeration } from '../../../graphql/squads';
import { verifyPermission } from '../../../graphql/squads';
import useContextMenu from '../../../hooks/useContextMenu';
import { useLazyModal } from '../../../hooks/useLazyModal';
import type { Squad } from '../../../graphql/sources';
import { SourcePermissions } from '../../../graphql/sources';
import { LazyModal } from '../../modals/common/types';
import { useSourceModerationList } from '../../../hooks/squads/useSourceModerationList';

export interface SquadModerationItemProps {
  data: SourcePostModeration;
  onApprove: () => Promise<void>;
  onReject: () => void;
  isPending: boolean;
  squad: Squad;
}

interface UseSourceModerationItem {
  context: {
    id: string;
    isOpen: boolean;
    onMenuClick: MouseEventHandler;
    onDelete: (id: string) => void;
  };
  modal: {
    open: () => void;
    close: () => void;
  };
  user: {
    isModerator: boolean;
  };
}

export const useSourceModerationItem = ({
  data,
  onApprove,
  onReject,
}: SquadModerationItemProps): UseSourceModerationItem => {
  const squad = data.source as Squad;
  const searchParams = useSearchParams();
  const contextMenuId = useId();
  const { isOpen, onMenuClick } = useContextMenu({ id: contextMenuId });

  const { openModal, closeModal } = useLazyModal();

  const isModerator =
    verifyPermission(squad, SourcePermissions.ModeratePost) ||
    !searchParams?.get('handle');

  const { onDelete } = useSourceModerationList({ squad });

  return {
    context: {
      id: contextMenuId,
      isOpen,
      onMenuClick,
      onDelete,
    },
    modal: {
      open: () => {
        openModal({
          type: LazyModal.PostModeration,
          props: {
            data,
            squad,
            onApprove: () => onApprove().then(closeModal),
            onReject,
          },
        });
      },
      close: closeModal,
    },
    user: {
      isModerator,
    },
  };
};
