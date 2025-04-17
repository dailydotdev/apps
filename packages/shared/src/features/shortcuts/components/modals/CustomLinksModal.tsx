import type { ReactElement } from 'react';
import React, { useEffect, useRef } from 'react';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import { UserIcon, SitesIcon } from '../../../../components/icons';
import type { ModalProps } from '../../../../components/modals/common/Modal';
import { Modal } from '../../../../components/modals/common/Modal';
import { IconSize } from '../../../../components/Icon';
import { CardSelection } from '../CardSelection';
import { LinksForm } from '../LinksForm';
import { useShortcutLinks } from '../../hooks/useShortcutLinks';
import { useShortcuts } from '../../contexts/ShortcutsProvider';
import { useLogContext } from '../../../../contexts/LogContext';
import { LogEvent, TargetType } from '../../../../lib/log';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../../components/typography/Typography';
import { HorizontalSeparator } from '../../../../components/utilities';
import { Switch } from '../../../../components/fields/Switch';
import { useSettingsContext } from '../../../../contexts/SettingsContext';

export default function CustomLinksModal(props: ModalProps): ReactElement {
  const { logEvent } = useLogContext();
  const { showTopSites, toggleShowTopSites } = useSettingsContext();
  const { onSaveChanges, formRef, hasTopSites } = useShortcutLinks();
  const { isManual, setIsManual, onRevokePermission, setShowPermissionsModal } =
    useShortcuts();

  const logRef = useRef<typeof logEvent>();
  logRef.current = logEvent;

  const displayRevoke = !isManual && hasTopSites !== null;

  useEffect(() => {
    document.body.classList.add('hidden-scrollbar');

    logRef.current({
      event_name: LogEvent.OpenShortcutConfig,
      target_type: TargetType.Shortcuts,
    });

    return () => {
      document.body.classList.remove('hidden-scrollbar');
    };
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
          <div className="flex gap-4">
            <div className="flex flex-1 flex-col gap-1">
              <Typography bold type={TypographyType.Body}>
                Show custom shortcuts
              </Typography>

              <Typography
                type={TypographyType.Callout}
                color={TypographyColor.Tertiary}
              >
                Enable custom shortcuts to easily access your favorite pages and
                tools directly from daily.dev. Personalize your workflow and
                navigate faster than ever.
              </Typography>
            </div>

            <Switch
              inputId="showTopSites-switch"
              name="showTopSites"
              className="w-20 justify-end"
              compact={false}
              checked={showTopSites}
              onToggle={toggleShowTopSites}
            >
              {showTopSites ? 'On' : 'Off'}
            </Switch>
          </div>

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
