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
import { generateQueryKey, RequestKey } from '../../../lib/query';
import { disabledRefetch } from '../../../lib/func';
import { TOP_READER_BADGE } from '../../../graphql/users';

const TopReaderBadgeModal = (
  props: ModalProps & {
    onAfterClose: (keywordValue: string) => void;
    onAfterOpen: (keywordValue: string) => void;
  },
): ReactElement => {
  const { onRequestClose, onAfterOpen, onAfterClose } = props;

  const { user } = useAuthContext();
  const isMobile = useViewSize(ViewSize.MobileL);

  const { data } = useQuery<{ topReaderBadge: TopReader[] }>({
    queryKey: generateQueryKey(RequestKey.TopReaderBadge),
    queryFn: () => gqlClient.request(TOP_READER_BADGE, { limit: 1 }),
    ...disabledRefetch,
  });

  if (!data) {
    return null;
  }

  const { issuedAt, keyword } = data.topReaderBadge[0];

  return (
    <Modal
      {...props}
      size={ModalSize.Small}
      isDrawerOnMobile
      onAfterClose={() => onAfterClose(keyword.value)}
      onAfterOpen={() => onAfterOpen(keyword.value)}
    >
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
