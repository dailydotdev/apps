import React, { MutableRefObject, ReactElement } from 'react';
import classNames from 'classnames';
import { ModalHeader } from '@dailydotdev/shared/src/components/modals/common';
import { ModalProps } from '@dailydotdev/shared/src/components/modals/StyledModal';
import { ResponsiveModal } from '@dailydotdev/shared/src/components/modals/ResponsiveModal';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import XIcon from '@dailydotdev/shared/icons/x.svg';
import UserIcon from '@dailydotdev/shared/icons/user.svg';
import SitesIcon from '@dailydotdev/shared/icons/sites.svg';
import { CardSelection } from './CardSelection';
import { LinksForm } from './LinksForm';

const getIconClassName = (isActive?: boolean) =>
  classNames('w-8 h-8', !isActive && 'text-theme-label-tertiary');

interface CustomLinksModalProps extends ModalProps {
  onSubmit: () => unknown;
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
  return (
    <ResponsiveModal
      {...props}
      padding={false}
      contentClassName="max-h-[40rem]"
      style={{ ...style, content: { maxHeight: '40rem' } }}
    >
      <form ref={formRef} onSubmit={onSubmit}>
        <ModalHeader>
          <h3 className="font-bold typo-title3">Shortcuts</h3>
          <div className="flex-1" />
          <Button className="mr-3 btn-primary" buttonSize="small" type="submit">
            save changes
          </Button>
          <Button
            className="btn-tertiary"
            buttonSize="small"
            icon={<XIcon />}
            onClick={onRequestClose}
          />
        </ModalHeader>
        <main className="flex flex-col p-10 pt-9 w-full">
          <nav className="grid grid-cols-2 gap-6 mb-8">
            <CardSelection
              title="My shortcuts"
              description="Curate your own shortcuts manually"
              icon={<UserIcon className={getIconClassName(true)} />}
              isActive={isManual}
              onClick={onShowCustomLinks}
            />
            <CardSelection
              title="Most visited sites"
              description="Shortcuts are imported from your browser"
              icon={<SitesIcon className={getIconClassName()} />}
              isActive={isManual === false}
              onClick={onShowTopSitesClick}
            />
          </nav>
          <LinksForm links={links} isFormDisabled={isManual === false} />
          {!isManual && hasTopSites !== null && (
            <Button
              onClick={onRevokePermission}
              buttonSize="small"
              className="self-start mt-6 btn-primary-ketchup text-theme-label-primary"
            >
              Revoke access
            </Button>
          )}
        </main>
      </form>
    </ResponsiveModal>
  );
}
