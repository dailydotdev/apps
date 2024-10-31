import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { useQuery } from '@tanstack/react-query';
import { Modal, type ModalProps } from '../common/Modal';
import { ModalSize } from '../common/types';
import { useAuthContext } from '../../../contexts/AuthContext';
import { TopReaderBadge, type TopReader } from '../../badges/TopReaderBadge';
import { Button, ButtonVariant } from '../../buttons/Button';
import { DownloadIcon } from '../../icons/Download';
import { useViewSize, ViewSize } from '../../../hooks';
import { gqlClient } from '../../../graphql/common';
import { TOP_READER_BADGE_BY_ID } from '../../../graphql/users';
import { generateQueryKey, RequestKey } from '../../../lib/query';
import { disabledRefetch } from '../../../lib/func';

const TopReaderBadgeModal = (
  props: ModalProps & {
    badgeId: string;
  },
): ReactElement => {
  const { onRequestClose, badgeId } = props;

  const { user } = useAuthContext();
  const isMobile = useViewSize(ViewSize.MobileL);

  const { data } = useQuery<{ topReaderBadge: TopReader }>({
    queryKey: generateQueryKey(RequestKey.TopReaderBadge),
    queryFn: () => gqlClient.request(TOP_READER_BADGE_BY_ID, { id: badgeId }),
    ...disabledRefetch,
  });

  if (!data) {
    return null;
  }

  const { issuedAt, keyword } = data.topReaderBadge;

  return (
    <Modal {...props} size={ModalSize.Small} isDrawerOnMobile>
      <Modal.Body className="flex flex-col items-center justify-center gap-4 text-center">
        <h1 className="font-bold typo-title1">
          You&apos;ve earned the top reader badge!
        </h1>
        <TopReaderBadge user={user} keyword={keyword} issuedAt={issuedAt} />

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
