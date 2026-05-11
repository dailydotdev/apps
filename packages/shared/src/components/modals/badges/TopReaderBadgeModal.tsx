import type { ReactElement } from 'react';
import React, { useCallback } from 'react';
import classNames from 'classnames';
import { useMutation } from '@tanstack/react-query';
import type { ModalProps } from '../common/Modal';
import { Modal } from '../common/Modal';
import { ModalSize } from '../common/types';
import { useAuthContext } from '../../../contexts/AuthContext';
import { TopReaderBadge } from '../../badges/TopReaderBadge';
import { Button, ButtonVariant } from '../../buttons/Button';
import { DownloadIcon } from '../../icons';
import { useViewSize, ViewSize } from '../../../hooks';
import { downloadUrl } from '../../../lib/blob';
import { useLogContext } from '../../../contexts/LogContext';
import type { Origin } from '../../../lib/log';
import { LogEvent, TargetId, TargetType } from '../../../lib/log';
import { formatDate, TimeFormatType } from '../../../lib/dateFormat';
import { useTopReader } from '../../../hooks/useTopReader';
import { ModalClose } from '../common/ModalClose';
import { ContextualReferralLink } from '../../referral/ContextualReferralLink';
import { ReferralCampaignKey } from '../../../lib/referral';
import { ReferralGrowthSurface } from '../../../lib/referralGrowth';
import { webappUrl } from '../../../lib/constants';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import { featureReferralGrowthLoops } from '../../../lib/featureManagement';

type TopReaderBadgeModalProps = {
  badgeId?: string;
  origin?: Origin;
};

const TopReaderBadgeModal = (
  props: ModalProps & TopReaderBadgeModalProps,
): ReactElement | null => {
  const { onRequestClose, onAfterOpen, onAfterClose, badgeId, origin } = props;

  const { user } = useAuthContext();
  const { logEvent } = useLogContext();
  const isMobile = useViewSize(ViewSize.MobileL);

  const { data: topReaders } = useTopReader({
    user: user!,
    limit: 1,
    badgeId,
  });
  const topReader = topReaders?.[0];
  const { value: showReferralGrowthLoop } = useConditionalFeature({
    feature: featureReferralGrowthLoops,
    shouldEvaluate: !!user?.id,
  });
  const profileUrl = user?.username ? `${webappUrl}${user.username}` : '';

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
    if (!topReader?.image) {
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
        <ModalClose top="2" onClick={onRequestClose} />

        <h1 className="font-bold typo-title1">
          You&apos;ve earned the top reader badge!
        </h1>
        <TopReaderBadge
          user={user!}
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
        {showReferralGrowthLoop && (
          <ContextualReferralLink
            className={classNames('w-full', !isMobile && 'max-w-80')}
            url={profileUrl}
            campaignKey={ReferralCampaignKey.ShareProfile}
            surface={ReferralGrowthSurface.TopReaderBadge}
            origin={origin ?? 'top reader badge modal'}
            title="Let other devs see your badge"
            description="Share your profile so friends can check your reader status and get their own."
          />
        )}
      </Modal.Body>
    </Modal>
  );
};

export default TopReaderBadgeModal;
