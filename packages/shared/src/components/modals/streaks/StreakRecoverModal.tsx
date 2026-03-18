import type { ReactElement } from 'react';
import React, { useId } from 'react';
import classNames from 'classnames';
import { ModalSize } from '../common/types';
import { ModalBody } from '../common/ModalBody';
import type { ModalProps } from '../common/Modal';
import { Modal } from '../common/Modal';
import type { LoggedUser } from '../../../lib/user';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../typography/Typography';
import type { ButtonProps } from '../../buttons/Button';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import type { UseStreakRecoverReturn } from '../../../hooks/streaks/useStreakRecover';
import { useStreakRecover } from '../../../hooks/streaks/useStreakRecover';
import { Checkbox } from '../../fields/Checkbox';
import { ModalClose } from '../common/ModalClose';
import {
  cloudinaryNotificationsBrowser,
  cloudinaryStreakLost,
} from '../../../lib/image';
import { useReadingStreak } from '../../../hooks/streaks';
import { useAuthContext } from '../../../contexts/AuthContext';
import { formatCoresCurrency } from '../../../lib/utils';
import type { UserStreakRecoverData } from '../../../graphql/users';
import { CoreIcon } from '../../icons';
import { coresDocsLink } from '../../../lib/constants';
import { anchorDefaultRel } from '../../../lib/strings';
import { NotificationPromptSource } from '../../../lib/log';
import { usePushNotificationMutation } from '../../../hooks/notifications';
import { usePushNotificationContext } from '../../../contexts/PushNotificationContext';
import usePersistentContext, {
  PersistentContextKeys,
} from '../../../hooks/usePersistentContext';
import { useNotificationCtaExperiment } from '../../../hooks/notifications/useNotificationCtaExperiment';

export interface StreakRecoverModalProps
  extends Pick<ModalProps, 'isOpen' | 'onAfterClose'> {
  onRequestClose: () => void;
  user: LoggedUser;
}

const StreakRecoverCover = () => (
  <div className="overflow-hidden tablet:-mx-4" role="presentation" aria-hidden>
    <img
      alt="Broken reading streak"
      className="h-auto w-full object-contain"
      loading="lazy"
      src={cloudinaryStreakLost}
    />
  </div>
);

const StreakRecoverHeading = ({ days }: { days: number }) => (
  <Typography
    className="-mx-1 -mb-1 text-center font-bold"
    tag={TypographyTag.H3}
    type={TypographyType.Title1}
    data-testid="streak-recover-modal-heading"
  >
    Oh no! Your
    <span className="text-accent-bacon-default"> {days} day streak </span> has
    been broken!
  </Typography>
);

const StreakRecoveryCopy = ({
  recover,
}: {
  recover: UserStreakRecoverData;
}) => {
  const { user } = useAuthContext();
  const isFree = recover.cost === 0;
  const canRecover = user.balance.amount >= recover.cost;
  const coresLink = (
    <a
      target="_blank"
      rel={anchorDefaultRel}
      href={coresDocsLink}
      title="What are Cores?"
      className="text-text-link hover:underline"
    >
      Cores
    </a>
  );

  const isFreeText = (
    <>
      Lucky you! The first streak restore is on us 🎁. This usually costs{' '}
      {formatCoresCurrency(recover.regularCost ?? 100)} {coresLink}. Be sure to
      come prepared next time!
    </>
  );
  const canRecoverText = (
    <>
      Maintain your streak!
      <br />
      Use {recover.cost} {coresLink} to keep going.
    </>
  );
  const noRecoverText = (
    <>You don&apos;t have enough {coresLink} to restore your streak.</>
  );

  return (
    <Typography
      className="text-center"
      tag={TypographyTag.P}
      type={TypographyType.Body}
      data-testid="streak-recovery-copy"
    >
      {isFree && isFreeText}
      {!isFree && (canRecover ? canRecoverText : noRecoverText)}
    </Typography>
  );
};

const StreakRecoverButton = ({
  recover,
  ...props
}: { recover: UserStreakRecoverData } & ButtonProps<'button'>) => {
  const { user } = useAuthContext();

  return (
    <Button
      {...props}
      className="relative gap-1"
      variant={ButtonVariant.Primary}
      size={ButtonSize.Large}
      data-testid="streak-recover-button"
    >
      {recover.cost > user.balance.amount ? 'Buy Cores' : 'Restore my streak'}
      <CoreIcon />
      {recover.cost === 0 ? 'Free' : formatCoresCurrency(recover.cost)}
    </Button>
  );
};

export const StreakRecoverOptout = ({
  hideForever,
  id,
  className,
  compact = false,
}: {
  id: string;
  className?: string;
  compact?: boolean;
} & Pick<UseStreakRecoverReturn, 'hideForever'>): ReactElement => (
  <div className={className ?? 'flex flex-row items-center justify-center'}>
    <Checkbox
      aria-labelledby={`showAgain-label-${id}`}
      checked={hideForever.isChecked}
      className={compact ? '!w-5 !p-0 !pr-0' : '!pr-0'}
      checkmarkClassName={compact ? 'mr-2 h-4 w-4 rounded-4' : undefined}
      data-testid="streak-recover-optout"
      id={`showAgain-${id}`}
      name="showAgain"
      onToggleCallback={hideForever.toggle}
    />
    <Typography
      aria-label="Never show 'reading streak recover' popup again"
      className={compact ? 'cursor-pointer py-0' : 'cursor-pointer py-2.5'}
      htmlFor={`showAgain-${id}`}
      id={`showAgain-label-${id}`}
      tag={TypographyTag.Label}
      type={TypographyType.Footnote}
      color={TypographyColor.Tertiary}
    >
      {compact ? 'Hide this' : 'Never show this again'}
    </Typography>
  </div>
);

const StreakRecoverNotificationReminder = () => {
  const { isEnabled: isNotificationCtaExperimentEnabled } =
    useNotificationCtaExperiment();
  const { isSubscribed, isInitialized, isPushSupported } =
    usePushNotificationContext();
  const [isAlertShown, setIsAlertShown] = usePersistentContext<boolean>(
    PersistentContextKeys.StreakAlertPushKey,
    true,
  );
  const { onTogglePermission } = usePushNotificationMutation();
  const showAlert =
    isNotificationCtaExperimentEnabled &&
    isPushSupported &&
    isAlertShown &&
    isInitialized &&
    !isSubscribed;

  if (!showAlert) {
    return null;
  }

  return (
    <div className="mt-3 flex flex-wrap gap-4 border-t border-border-subtlest-tertiary px-4 py-3">
      <div className="flex w-full flex-1 justify-between gap-3">
        <Typography bold type={TypographyType.Callout} className="flex-1">
          Get notified to keep your streak
        </Typography>

        <div className="h-12 w-22 overflow-hidden">
          <img
            src={cloudinaryNotificationsBrowser}
            alt="A sample browser notification"
          />
        </div>
      </div>

      <div className="flex w-full justify-between gap-3">
        <Button
          size={ButtonSize.Small}
          variant={ButtonVariant.Primary}
          onClick={() =>
            onTogglePermission(NotificationPromptSource.NotificationsPage)
          }
        >
          Enable notification
        </Button>
        <Button
          size={ButtonSize.Small}
          variant={ButtonVariant.Tertiary}
          onClick={() => {
            setIsAlertShown(false);
          }}
        >
          Dismiss
        </Button>
      </div>
    </div>
  );
};

export const StreakRecoverModal = (
  props: StreakRecoverModalProps,
): ReactElement => {
  const { isOpen, onRequestClose, onAfterClose, user } = props;
  const { isStreaksEnabled } = useReadingStreak();
  const { isEnabled: isNotificationCtaExperimentEnabled } =
    useNotificationCtaExperiment();

  const id = useId();
  const { recover, hideForever, onClose, onRecover } = useStreakRecover({
    onAfterClose,
    onRequestClose,
  });

  if (!user || !isStreaksEnabled || !recover.canRecover || recover.isLoading) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      isDrawerOnMobile={isOpen}
      onRequestClose={onClose}
      size={ModalSize.XSmall}
    >
      <ModalClose
        aria-label="Close streak recover popup"
        onClick={onClose}
        title="Close streak recover popup"
      />
      <ModalBody className="!p-4">
        {isNotificationCtaExperimentEnabled && (
          <StreakRecoverOptout
            id={id}
            className="absolute left-0 top-0 z-1 ml-4 mr-4 flex h-10 flex-row items-center gap-2"
            hideForever={hideForever}
            compact
          />
        )}
        <div
          className={classNames(
            'flex flex-col gap-4',
            isNotificationCtaExperimentEnabled && 'pt-8',
          )}
        >
          <StreakRecoverCover />
          <StreakRecoverHeading days={recover.oldStreakLength} />
          <StreakRecoveryCopy recover={recover} />
          <StreakRecoverButton
            onClick={onRecover}
            recover={recover}
            loading={recover.isRecoverPending}
          />
          {!isNotificationCtaExperimentEnabled && (
            <StreakRecoverOptout id={id} hideForever={hideForever} />
          )}
        </div>
        {isNotificationCtaExperimentEnabled && (
          <StreakRecoverNotificationReminder />
        )}
      </ModalBody>
    </Modal>
  );
};

export default StreakRecoverModal;
