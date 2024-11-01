import React, { ReactElement, useCallback } from 'react';
import classNames from 'classnames';
import { useMutation, useQuery } from '@tanstack/react-query';
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
import { downloadUrl } from '../../../lib/blob';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, TargetId, TargetType } from '../../../lib/log';
import { formatDate, TimeFormatType } from '../../../lib/dateFormat';

const TopReaderBadgeModal = (
  props: ModalProps & {
  },
): ReactElement => {
  const { onRequestClose, onAfterOpen, onAfterClose } = props;

  const { user } = useAuthContext();
  const { logEvent } = useLogContext();
  const isMobile = useViewSize(ViewSize.MobileL);

  const { data: topReaderBadge } = useQuery({
    queryKey: generateQueryKey(RequestKey.TopReaderBadge),
    queryFn: async () => {
      return (
        await gqlClient.request<{ topReaderBadge: TopReader[] }>(
          TOP_READER_BADGE,
          {
            limit: 1,
          },
        )
      ).topReaderBadge[0];
    },
    ...disabledRefetch,
  });

  const { mutateAsync: onDownloadUrl, isPending: downloading } = useMutation({
    mutationFn: downloadUrl,
  });

  const onClickDownload = useCallback(async () => {
    if (!topReaderBadge) {
      return;
    }

    const formattedDate = formatDate({
      value: topReader.issuedAt,
      type: TimeFormatType.TopReaderBadge,
    });

    await onDownloadUrl({
      url: topReaderBadge.image,
      filename: `${formattedDate} Top Reader in ${topReaderBadge.keyword.flags.title}.png`,
    });

    logEvent({
      event_name: LogEvent.TopReaderBadgeDownload,
      target_type: TargetType.Badge,
      target_id: TargetId.TopReader,
      extra: JSON.stringify({
        tag: topReaderBadge.keyword.value,
      }),
    });
  }, [logEvent, onDownloadUrl, topReaderBadge]);

  if (!topReaderBadge) {
    return null;
  }

  return (
    <Modal
      {...props}
      size={ModalSize.Small}
      isDrawerOnMobile
      onAfterClose={() => {
        logEvent({
          event_name: LogEvent.TopReaderModalClose,
          target_type: TargetType.Badge,
          target_id: TargetId.TopReader,
          extra: JSON.stringify({
            tag: topReader.keyword.value,
          }),
        });

        onAfterClose?.();
      }}
      onAfterOpen={() => {
        logEvent({
          event_name: LogEvent.Impression,
          target_type: TargetType.Badge,
          target_id: TargetId.TopReader,
          extra: JSON.stringify({
            tag: topReader.keyword.value,
          }),
        });

        onAfterOpen?.();
      }}
      drawerProps={{
        displayCloseButton: false,
      }}
    >
      <Modal.Body className="flex flex-col items-center justify-center gap-4 text-center">
        <h1 className="font-bold typo-title1">
          You&apos;ve earned the top reader badge!
        </h1>
        <TopReaderBadge
          user={user}
          keyword={topReaderBadge.keyword}
          issuedAt={topReaderBadge.issuedAt}
        />

        <Button
          className={classNames('w-full', !isMobile && 'max-w-80')}
          variant={ButtonVariant.Primary}
          icon={<DownloadIcon secondary />}
          disabled={!topReaderBadge.image}
          loading={downloading}
          onClick={() => onClickDownload()}
        >
          Download badge
        </Button>

        <Button
          className={classNames('w-full', !isMobile && 'max-w-80')}
          variant={ButtonVariant.Float}
          onClick={onRequestClose}
        >
          Close
        </Button>
      </Modal.Body>
    </Modal>
  );
};

export default TopReaderBadgeModal;
