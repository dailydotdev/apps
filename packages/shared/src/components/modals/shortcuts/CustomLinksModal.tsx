import type { ReactElement } from 'react';
import React, { useEffect, useRef } from 'react';
import { Button, ButtonColor, ButtonVariant } from '../../buttons/Button';
import { UserIcon, SitesIcon } from '../../icons';
import type { ModalProps } from '../common/Modal';
import { Modal } from '../common/Modal';
import { Justify } from '../../utilities';
import { IconSize } from '../../Icon';
import { CardSelection } from './CardSelection';
import { LinksForm } from './LinksForm';
import { useShortcutLinks } from '../../../features/shortcuts/hooks/useShortcutLinks';
import { useShortcuts } from '../../../features/shortcuts/contexts/ShortcutsProvider';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, TargetType } from '../../../lib/log';

export default function CustomLinksModal(props: ModalProps): ReactElement {
  const { logEvent } = useLogContext();
  const { onSaveChanges, formRef, hasTopSites } = useShortcutLinks();
  const { isManual, setIsManual, onRevokePermission, setShowPermissionsModal } =
    useShortcuts();

  const logRef = useRef<typeof logEvent>();
  logRef.current = logEvent;

  const displayRevoke = !isManual && hasTopSites !== null;

  useEffect(() => {
    logRef.current({
      event_name: LogEvent.OpenShortcutConfig,
      target_type: TargetType.Shortcuts,
    });
  }, []);

  return (
    <Modal kind={Modal.Kind.FixedCenter} size={Modal.Size.Medium} {...props}>
      <Modal.Header title="Shortcuts" />
      <Modal.Body>
        <form
          ref={formRef}
          id="shortcuts-modal"
          onSubmit={async (event) => {
            const { errors } = await onSaveChanges(event);
            if (errors) {
              return;
            }

            props?.onRequestClose?.(undefined);
          }}
        >
          <nav className="mb-8 grid grid-cols-2 gap-6">
            <CardSelection
              title="My shortcuts"
              description="Curate your own shortcuts manually"
              icon={<UserIcon size={IconSize.Large} secondary={isManual} />}
              isActive={isManual}
              onClick={() => {
                setIsManual(true);
              }}
            />
            <CardSelection
              title="Most visited sites"
              description="Shortcuts are imported from your browser"
              icon={
                <SitesIcon
                  size={IconSize.Large}
                  secondary={isManual === false}
                />
              }
              isActive={isManual === false}
              onClick={() => {
                if (!hasTopSites) {
                  setShowPermissionsModal(true);
                }
                setIsManual(false);
              }}
            />
          </nav>
          {!isManual && (
            <p className="mb-6 text-text-tertiary typo-callout">
              To edit links, please switch to &quot;My shortcuts&quot; mode
            </p>
          )}
          <LinksForm />
        </form>
      </Modal.Body>
      <Modal.Footer justify={displayRevoke ? Justify.Between : Justify.End}>
        {displayRevoke && (
          <Button
            onClick={onRevokePermission}
            form="shortcuts-modal"
            variant={ButtonVariant.Primary}
            color={ButtonColor.Ketchup}
            type="button"
          >
            Revoke access
          </Button>
        )}
        <Button
          variant={ButtonVariant.Primary}
          form="shortcuts-modal"
          type="submit"
        >
          Save changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
