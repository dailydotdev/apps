import type { ReactElement } from 'react';
import React from 'react';
import { ModalSize } from '../common/types';
import type { ModalProps } from '../common/Modal';
import { Modal } from '../common/Modal';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../typography/Typography';
import { Button, ButtonVariant } from '../../buttons/Button';
import { CoreIcon, RefreshIcon } from '../../icons';
import { IconSize } from '../../Icon';
import { formatCoresCurrency } from '../../../lib/utils';
import { useAuthContext } from '../../../contexts/AuthContext';
import type { UserQuest } from '../../../graphql/quests';
import type { TargetId } from '../../../lib/log';
import { LogEvent } from '../../../lib/log';
import { useRefreshQuest } from '../../../hooks/useRefreshQuest';
import { CoresBalanceNote } from '../../cores/CoresBalanceNote';

export interface QuestRefreshModalProps extends Pick<
  ModalProps,
  'isOpen' | 'onAfterClose'
> {
  onRequestClose: () => void;
  quest: UserQuest;
  targetId: TargetId;
}

export const QuestRefreshModal = ({
  quest,
  targetId,
  ...props
}: QuestRefreshModalProps): ReactElement | null => {
  const { isOpen, onRequestClose, onAfterClose } = props;
  const { user } = useAuthContext();
  const { refreshQuest, logRefreshEvent, refreshingQuestId } = useRefreshQuest({
    targetId,
  });
  const cost = quest.refreshCost;

  if (!user || typeof cost !== 'number') {
    return null;
  }

  const canAfford = user.balance.amount >= cost;
  const isRefreshing = refreshingQuestId === quest.userQuestId;

  const onClose = () => {
    logRefreshEvent(LogEvent.CancelQuestRefresh, quest);
    onRequestClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onAfterClose={onAfterClose}
      onRequestClose={onClose}
      size={ModalSize.Small}
      isDrawerOnMobile
    >
      <Modal.Header title="Swap quest" showCloseButton />
      <Modal.Body className="flex flex-col gap-4">
        <div className="flex flex-col items-center gap-2 text-center">
          <RefreshIcon
            size={IconSize.XLarge}
            className="text-accent-cheese-default"
          />
          <Typography tag={TypographyTag.H3} type={TypographyType.Title3} bold>
            Get a different quest
          </Typography>
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            Swap <strong>{quest.quest.name}</strong> for a random quest you
            don&apos;t have yet. Any progress on this quest is lost.
          </Typography>
        </div>
        <div className="flex flex-col gap-2">
          <Button
            className="w-full"
            variant={ButtonVariant.Primary}
            loading={isRefreshing}
            onClick={async () => {
              await refreshQuest(quest);
              onRequestClose();
            }}
          >
            {canAfford ? 'Swap for' : 'Buy Cores'}
            <CoreIcon />
            {formatCoresCurrency(cost)}
          </Button>
          <CoresBalanceNote price={cost} />
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default QuestRefreshModal;
