import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { Modal, type ModalProps } from '../common/Modal';
import { ModalSize } from '../common/types';
import { useAuthContext } from '../../../contexts/AuthContext';
import { TopReaderBadge } from '../../badges/TopReaderBadge';
import { Button, ButtonVariant } from '../../buttons/Button';
import { DownloadIcon } from '../../icons/Download';
import { useViewSize, ViewSize } from '../../../hooks';

const TopReaderBadgeModal = (props: ModalProps): ReactElement => {
  const { onRequestClose } = props;

  const { user } = useAuthContext();
  const isMobile = useViewSize(ViewSize.MobileL);

  // TODO: replace with real data
  const issuedAt = '1996-11-28T00:00:00.000Z';
  const keyword = {
    value: 'someValue',
    flags: {
      title: 'someTitle',
    },
  };
  return (
    <Modal {...props} size={ModalSize.Small} isDrawerOnMobile>
      <Modal.Body className="flex flex-col items-center justify-center gap-4 text-center">
        <h1 className="font-bold typo-title1">
          You&apos;ve earned the top reader badge!
        </h1>
        <TopReaderBadge user={user} keyword={keyword} issuedAt={issuedAt} />

        {}
        <Button
          className={classNames('w-full', !isMobile && 'max-w-80')}
          variant={ButtonVariant.Primary}
          icon={<DownloadIcon secondary />}
        >
          Download badge
        </Button>

        {!isMobile && (
          <Button
            className="w-full max-w-80"
            variant={ButtonVariant.Float}
            onClick={onRequestClose}
          >
            Close
          </Button>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default TopReaderBadgeModal;
