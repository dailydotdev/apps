import type { ReactElement } from 'react';
import React, { useEffect, useRef } from 'react';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '../../buttons/Button';
import { UserIcon, SitesIcon } from '../../icons';
import type { ModalProps } from '../common/Modal';
import { Modal } from '../common/Modal';
import { IconSize } from '../../Icon';
import { CardSelection } from './CardSelection';
import { LinksForm } from './LinksForm';
import { useShortcutLinks } from '../../../features/shortcuts/hooks/useShortcutLinks';
import { useShortcuts } from '../../../features/shortcuts/contexts/ShortcutsProvider';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, TargetType } from '../../../lib/log';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../typography/Typography';
import { HorizontalSeparator } from '../../utilities';

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
    <Modal kind={Modal.Kind.FlexibleCenter} size={Modal.Size.Medium} {...props}>
      <Modal.Header showCloseButton={false}>
        <Typography tag={TypographyTag.H3} type={TypographyType.Body} bold>
          Shortcuts
        </Typography>
        <div className="ml-auto flex gap-2">
          <Button
            variant={ButtonVariant.Float}
            size={ButtonSize.Small}
            onClick={() => {
              props?.onRequestClose?.(undefined);
            }}
          >
            Cancel
          </Button>
          <Button
            variant={ButtonVariant.Primary}
            size={ButtonSize.Small}
            form="shortcuts-modal"
            type="submit"
          >
            Save
          </Button>
        </div>
      </Modal.Header>
      <Modal.Body>
        <form
          ref={formRef}
          id="shortcuts-modal"
          className="flex flex-col gap-6"
          onSubmit={async (event) => {
            const { errors } = await onSaveChanges(event);
            if (errors) {
              return;
            }

            props?.onRequestClose?.(undefined);
          }}
        >
          <HorizontalSeparator />

          <nav className="grid grid-cols-2 gap-10">
            <CardSelection
              title="My shortcuts"
              description="Curate your own shortcuts manually"
              icon={<UserIcon size={IconSize.XLarge} secondary={isManual} />}
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
                  size={IconSize.XLarge}
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
            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Secondary}
            >
              To edit links, please switch to &quot;My shortcuts&quot; mode
            </Typography>
          )}
          <LinksForm />

          {displayRevoke && (
            <Button
              onClick={onRevokePermission}
              form="shortcuts-modal"
              variant={ButtonVariant.Primary}
              color={ButtonColor.Ketchup}
              type="button"
              size={ButtonSize.Small}
              className="self-start"
            >
              Revoke access
            </Button>
          )}
        </form>
      </Modal.Body>
    </Modal>
  );
}
