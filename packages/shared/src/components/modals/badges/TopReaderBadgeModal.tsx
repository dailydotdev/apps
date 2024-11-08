import React, { ReactElement, useCallback } from 'react';
import classNames from 'classnames';
import { useMutation } from '@tanstack/react-query';
import { Modal, type ModalProps } from '../common/Modal';
import { ModalSize } from '../common/types';
import { useAuthContext } from '../../../contexts/AuthContext';
import { TopReaderBadge } from '../../badges/TopReaderBadge';
import { Button, ButtonVariant } from '../../buttons/Button';
import { DownloadIcon } from '../../icons';
import { useViewSize, ViewSize } from '../../../hooks';
import { downloadUrl } from '../../../lib/blob';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, TargetId, TargetType, type Origin } from '../../../lib/log';
import { formatDate, TimeFormatType } from '../../../lib/dateFormat';
import { useTopReader } from '../../../hooks/useTopReader';

type TopReaderBadgeModalProps = {
  badgeId?: string;
  origin?: Origin;
};

const TopReaderBadgeModal = (
  props: ModalProps & TopReaderBadgeModalProps,
): ReactElement => {
  const { onRequestClose, onAfterOpen, onAfterClose, badgeId, origin } = props;

  const { user } = useAuthContext();
  const { logEvent } = useLogContext();
  const isMobile = useViewSize(ViewSize.MobileL);

  const { data: topReaders } = useTopReader({ user, limit: 1, badgeId });
  const topReader = topReaders?.[0];

  const { mutateAsync: onDownloadUrl, isPending: downloading } = useMutation({
    mutationFn: downloadUrl,
  });

  const logModalEvent = useCallback(
    (event_name: LogEvent) => {
      logEvent({
        event_name,
        target_type: TargetType.Badge,
        target_id: TargetId.TopReader,
        extra: JSON.stringify({
          tag: topReader.keyword.value,
          origin,
        }),
      });
    },
    [logEvent, origin, topReader?.keyword?.value],
  );

  const onClickDownload = useCallback(async () => {
    if (!topReader) {
      return;
    }

    const formattedDate = formatDate({
      value: topReader.issuedAt,
      type: TimeFormatType.TopReaderBadge,
    });

    const keyword = topReader.keyword.flags?.title || topReader.keyword.value;

    await onDownloadUrl({
      url: topReader.image,
      filename: `${formattedDate} Top Reader in ${keyword}.png`,
    });

    logModalEvent(LogEvent.TopReaderBadgeDownload);
  }, [logModalEvent, onDownloadUrl, topReader]);

  if (!topReader) {
    return null;
  }

  return (
    <Modal
      {...props}
      size={ModalSize.Small}
      isDrawerOnMobile
      onAfterClose={() => {
        logModalEvent(LogEvent.TopReaderModalClose);

        onAfterClose?.();
      }}
      onAfterOpen={() => {
        logModalEvent(LogEvent.Impression);

        onAfterOpen?.();
      }}
    >
      <Modal.Body className="flex flex-col items-center justify-center gap-4 text-center">
        <h1 className="font-bold typo-title1">
          You&apos;ve earned the top reader badge!
        </h1>
        <TopReaderBadge
          user={user}
          keyword={topReader.keyword}
          issuedAt={topReader.issuedAt}
        />

        <Button
          className={classNames('w-full', !isMobile && 'max-w-80')}
          variant={ButtonVariant.Primary}
          icon={<DownloadIcon secondary />}
          disabled={!topReader.image}
          loading={downloading}
          onClick={() => onClickDownload()}
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
