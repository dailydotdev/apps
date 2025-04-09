import type { PropsWithChildren, ReactElement } from 'react';
import React, { useCallback, useState } from 'react';
import classNames from 'classnames';
import { PlusUser } from '../PlusUser';
import CloseButton from '../CloseButton';
import { ButtonSize, ButtonVariant } from '../buttons/common';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { Button } from '../buttons/Button';
import { plusUrl } from '../../lib/constants';
import { DevPlusIcon } from '../icons';
import { useConditionalFeature, usePlusSubscription } from '../../hooks';
import type { TargetId } from '../../lib/log';
import { LogEvent } from '../../lib/log';
import { featurePlusCtaCopy } from '../../lib/featureManagement';
import Link from '../utilities/Link';

type PostUpgradeToPlusProps = {
  targetId: TargetId;
  title: ReactElement | string;
  className?: string;
  onClose?: () => void;
};

export const PostUpgradeToPlus = ({
  targetId: target_id,
  title,
  children,
  className,
  onClose,
}: PostUpgradeToPlusProps & PropsWithChildren): ReactElement => {
  const [show, setShow] = useState(true);
  const { logSubscriptionEvent, isPlus } = usePlusSubscription();
  const {
    value: { full: plusCta },
  } = useConditionalFeature({
    feature: featurePlusCtaCopy,
    shouldEvaluate: !isPlus,
  });

  const onCloseClick = useCallback(() => {
    onClose?.();
    setShow(false);
  }, [onClose]);

  if (!show) {
    return null;
  }

  return (
    <div
      className={classNames(
        className,
        'relative flex w-full flex-col rounded-12 border border-border-subtlest-tertiary bg-action-plus-float p-3',
      )}
    >
      <div className="flex w-full items-start">
        <PlusUser className="rounded-4 bg-action-plus-float px-1 py-0.5 " />
        <CloseButton
          className="ml-auto"
          size={ButtonSize.Small}
          onClick={onCloseClick}
        />
      </div>
      <Typography
        bold
        type={TypographyType.Body}
        color={TypographyColor.Primary}
        className="py-2"
      >
        {title}
      </Typography>
      <Typography className="w-full">{children}</Typography>

      <div className="mt-4 flex gap-2">
        <Link href={plusUrl} passHref>
          <Button
            className="flex-1"
            tag="a"
            type="button"
            variant={ButtonVariant.Primary}
            size={ButtonSize.Small}
            icon={<DevPlusIcon className="text-action-plus-default" />}
            onClick={() => {
              logSubscriptionEvent({
                event_name: LogEvent.UpgradeSubscription,
                target_id,
              });
            }}
          >
            {plusCta}
          </Button>
        </Link>
        <Button
          className="flex-1"
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Small}
          onClick={onCloseClick}
        >
          Not now
        </Button>
      </div>
    </div>
  );
};
