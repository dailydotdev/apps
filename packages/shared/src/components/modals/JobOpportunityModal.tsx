import type { MouseEvent, ReactElement } from 'react';
import React, { useEffect, useRef } from 'react';
import type { ModalProps } from './common/Modal';
import { Modal } from './common/Modal';
import { Button, ButtonVariant } from '../buttons/Button';
import { Image } from '../image/Image';
import Link from '../utilities/Link';
import { opportunityUrl } from '../../lib/constants';
import { useViewSize, ViewSize } from '../../hooks';
import { useThemedAsset } from '../../hooks/utils';
import { Typography, TypographyType } from '../typography/Typography';
import { MoveToIcon } from '../icons';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent, TargetId } from '../../lib/log';

export interface JobOpportunityModalProps extends ModalProps {
  opportunityId: string;
}

export const JobOpportunityModal = ({
  opportunityId,
  onRequestClose,
  ...modalProps
}: JobOpportunityModalProps): ReactElement => {
  const isMobile = useViewSize(ViewSize.MobileL);
  const { jobOfferDesktop, jobOfferMobile } = useThemedAsset();
  const { logEvent } = useLogContext();
  const logRef = useRef<typeof logEvent>();
  const hasLoggedRef = useRef(false);
  logRef.current = logEvent;

  const logExtraPayload = JSON.stringify({
    count: 1, // always 1 for now
  });

  const onClick = (event: MouseEvent) => {
    logRef.current({
      event_name: LogEvent.ClickOpportunityNudge,
      target_id: TargetId.Fullscreen,
      extra: logExtraPayload,
    });
    onRequestClose(event);
  };

  useEffect(() => {
    if (hasLoggedRef.current) {
      return;
    }

    logRef.current({
      event_name: LogEvent.ImpressionOpportunityNudge,
      target_id: TargetId.Fullscreen,
      extra: logExtraPayload,
    });
    hasLoggedRef.current = true;
  }, [logExtraPayload]);

  return (
    <>
      <div className="fixed z-header size-full rounded-[63.75rem] bg-background-default blur-[6.875rem]" />
      <Modal
        {...modalProps}
        kind={Modal.Kind.FlexibleCenter}
        size={Modal.Size.Medium}
        onRequestClose={onRequestClose}
        className="!border-transparent !bg-transparent !shadow-none"
        overlayClassName="!bg-transparent"
        isDrawerOnMobile
        shouldCloseOnOverlayClick
        drawerProps={{ displayCloseButton: false }}
      >
        <Modal.Body className="items-center overflow-hidden !p-0">
          <div className="flex h-full flex-col items-start justify-center gap-6 px-6 py-10 tablet:items-center tablet:px-10 tablet:py-14">
            <div className="relative flex items-center justify-center">
              <Image
                src={isMobile ? jobOfferMobile : jobOfferDesktop}
                alt="Job offer for you"
                className="h-72 w-auto tablet:h-64"
              />
            </div>
            <Typography type={TypographyType.Title3}>
              We think this role deserves your attention, but your decision is
              private. If it’s a fit, we’ll handle it quietly. If not, it’s gone
              for good.
            </Typography>
            <div className="flex w-full flex-col gap-3">
              <Link href={`${opportunityUrl}/${opportunityId}`} passHref>
                <Button
                  tag="a"
                  className="w-full gap-2"
                  variant={ButtonVariant.Primary}
                  onClick={onClick}
                >
                  Show me now <MoveToIcon />
                </Button>
              </Link>
              <Button
                className="w-full"
                variant={ButtonVariant.Float}
                onClick={onClick}
              >
                Maybe later
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default JobOpportunityModal;
