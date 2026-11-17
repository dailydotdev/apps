import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import type { LazyModalCommonProps } from '../modals/common/Modal';
import { Button, ButtonVariant } from '../buttons/Button';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent, TargetType } from '../../lib/log';
import { formatCoresCurrency } from '../../lib/utils';
import { CoresMomentModal } from './CoresMomentModal';
import { CoresUseRows } from './UseYourCores';

export interface FirstCoresModalProps extends LazyModalCommonProps {
  amount: number;
}

/** "You earned your first Cores": what Cores do, nothing to tap but Got it */
const FirstCoresModal = ({
  amount,
  onRequestClose,
}: FirstCoresModalProps): ReactElement => {
  const { logEvent } = useLogContext();

  useEffect(() => {
    logEvent({
      event_name: LogEvent.Impression,
      target_type: TargetType.FirstCoresPopup,
      extra: JSON.stringify({ amount }),
    });
    // Once, when it opens
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onClose = (event?: React.MouseEvent | React.KeyboardEvent) => {
    logEvent({
      event_name: LogEvent.Dismiss,
      target_type: TargetType.FirstCoresPopup,
    });
    onRequestClose(event);
  };

  return (
    <CoresMomentModal
      amount={`+${formatCoresCurrency(amount)}`}
      title="You earned your first Cores"
      body="Cores are what you spend on daily.dev. Here is what yours can do."
      artClassName="h-52"
      onRequestClose={onClose}
    >
      <CoresUseRows order={['award', 'boost', 'streak']} />
      <Button
        variant={ButtonVariant.Primary}
        className="w-full"
        onClick={onClose}
      >
        Got it
      </Button>
    </CoresMomentModal>
  );
};

export default FirstCoresModal;
