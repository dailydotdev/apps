import React, { FormEventHandler, MutableRefObject, ReactElement } from 'react';
import {
  Button,
  ButtonColor,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { UserIcon, SitesIcon } from '@dailydotdev/shared/src/components/icons';
import {
  Modal,
  ModalProps,
} from '@dailydotdev/shared/src/components/modals/common/Modal';
import { Justify } from '@dailydotdev/shared/src/components/utilities';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { CardSelection } from '../CardSelection';
import { LinksForm } from '../LinksForm';

interface CustomLinksModalProps extends ModalProps {
  onSubmit: FormEventHandler<HTMLFormElement>;
  onShowPermission: () => unknown;
  onShowCustomLinks: () => unknown;
  onShowTopSitesClick: () => unknown;
  isManual?: boolean;
  hasTopSites?: boolean;
  links?: string[];
  formRef: MutableRefObject<HTMLFormElement>;
  onRevokePermission?: () => Promise<unknown>;
  onIsManual?: (isManual: boolean) => unknown;
}

export default function CustomLinksModal({
  isManual,
  hasTopSites,
  links,
  style,
  formRef,
  onRevokePermission,
  onShowPermission,
  onShowTopSitesClick,
  onShowCustomLinks,
  onRequestClose,
  onSubmit,
  ...props
}: CustomLinksModalProps): ReactElement {
  const displayRevoke = !isManual && hasTopSites !== null;
  return (
    <Modal
      kind={Modal.Kind.FixedCenter}
      size={Modal.Size.Medium}
      onRequestClose={onRequestClose}
      {...props}
    >
      <Modal.Header title="Shortcuts" />
      <Modal.Body>
        <form ref={formRef} id="shortcuts-modal" onSubmit={onSubmit}>
          <nav className="mb-8 grid grid-cols-2 gap-6">
            <CardSelection
              title="My shortcuts"
              description="Curate your own shortcuts manually"
              icon={<UserIcon size={IconSize.Large} secondary={isManual} />}
              isActive={isManual}
              onClick={onShowCustomLinks}
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
              onClick={onShowTopSitesClick}
            />
          </nav>
          {!isManual && (
            <p className="mb-6 text-text-tertiary typo-callout">
              To edit links, please switch to &quot;My shortcuts&quot; mode
            </p>
          )}
          <LinksForm links={links} isFormReadonly={isManual === false} />
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
