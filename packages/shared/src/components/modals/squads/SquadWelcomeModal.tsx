import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import type { ModalProps } from '../common/Modal';
import { Modal } from '../common/Modal';
import type { Squad } from '../../../graphql/sources';
import type { SquadWelcome } from '../../../graphql/squadWelcomeAudience';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent } from '../../../lib/log';
import { getSquadWelcomeView } from '../../../features/squads/lib/welcome';
import { SquadWelcomeCard } from '../../../features/squads/components/welcome/SquadWelcomeCard';

interface SquadWelcomeModalProps extends ModalProps {
  squad: Squad;
  welcome: SquadWelcome;
}

// Shown once, right after someone joins a verified squad that set one up.
export function SquadWelcomeModal({
  squad,
  welcome,
  onRequestClose,
  ...props
}: SquadWelcomeModalProps): ReactElement {
  const { logEvent } = useLogContext();
  const view = getSquadWelcomeView(welcome, squad);

  useEffect(() => {
    logEvent({ event_name: LogEvent.ShowSquadWelcome, target_id: squad.id });
    // Once per pop-up
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Modal
      {...props}
      isOpen
      onRequestClose={onRequestClose}
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.Small}
      className="overflow-hidden"
      isDrawerOnMobile
    >
      <SquadWelcomeCard
        view={view}
        onCta={() => {
          logEvent({
            event_name: LogEvent.ClickSquadWelcomeCta,
            target_id: squad.id,
            extra: JSON.stringify({ hasLink: !!view.ctaUrl }),
          });
          onRequestClose?.(undefined as never);
        }}
        onClose={() => onRequestClose?.(undefined as never)}
      />
    </Modal>
  );
}

export default SquadWelcomeModal;
