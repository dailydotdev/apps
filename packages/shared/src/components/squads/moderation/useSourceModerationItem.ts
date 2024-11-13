import { useId } from 'react';
import {
  SourcePostModeration,
  verifyPermission,
} from '../../../graphql/squads';
import useContextMenu from '../../../hooks/useContextMenu';
import { useLazyModal } from '../../../hooks/useLazyModal';
import { SourcePermissions, Squad } from '../../../graphql/sources';
import { LazyModal } from '../../modals/common/types';
import { useSourceModerationList } from '../../../hooks/squads/useSourceModerationList';

export interface SquadModerationItemProps {
  data: SourcePostModeration;
  onApprove: () => Promise<void>;
  onReject: () => void;
  isPending: boolean;
  squad: Squad;
}

export const useSourceModerationItem = ({
  data,
  squad,
  onApprove,
  onReject,
}: SquadModerationItemProps) => {
  const contextMenuId = useId();
  const { isOpen, onMenuClick } = useContextMenu({ id: contextMenuId });

  const { openModal, closeModal } = useLazyModal();

  const isModerator = verifyPermission(squad, SourcePermissions.ModeratePost);

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
