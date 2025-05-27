import type { PropsWithChildren, ReactElement } from 'react';
import React, { useCallback } from 'react';
import { useAuthContext } from '../../../../contexts/AuthContext';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import { UpgradeToPlus } from '../../../../components/UpgradeToPlus';
import type { TargetId } from '../../../../lib/log';
import CloseButton from '../../../../components/CloseButton';

interface PlusEntrypointProps extends PropsWithChildren {
  cta: {
    label: string;
  };
  close: { behavior: 'cta' | 'closeButton' };
  target: TargetId;
}

export const PlusEntrypoint = ({
  children,
  cta,
  close,
  target,
}: PlusEntrypointProps): ReactElement => {
  const { user, isAuthReady } = useAuthContext();
  const isCloseCta = close.behavior === 'cta';

  const onClose = useCallback(() => {
    console.log('close');
  }, []);

  if (!isAuthReady || user?.isPlus) {
    return null;
  }

  return (
    <div className="relative flex flex-col gap-4">
      {isCloseCta && <CloseButton onClick={onClose} />}
      <div>{children}</div>
      <div className="flex gap-2">
        <UpgradeToPlus size={ButtonSize.Small} target={target}>
          {cta.label}
        </UpgradeToPlus>
        {!isCloseCta && (
          <Button size={ButtonSize.Small} variant={ButtonVariant.Float}>
            Close
          </Button>
        )}
      </div>
    </div>
  );
};
