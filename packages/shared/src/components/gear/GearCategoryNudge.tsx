import type { ReactElement } from 'react';
import React, { useState, useCallback } from 'react';
import { ButtonV2, ButtonVariant, ButtonSize } from '../buttons/ButtonV2';
import { PlusIcon } from '../icons/Plus';
import { useAuthContext } from '../../contexts/AuthContext';
import { GearModal } from '../../features/profile/components/gear/GearModal';
import type { AddGearInput } from '../../graphql/user/gear';
import { addGear } from '../../graphql/user/gear';
import { useToastNotification } from '../../hooks/useToastNotification';
import { AuthTriggers } from '../../lib/auth';

export function GearCategoryNudge(): ReactElement {
  const { user, showLogin } = useAuthContext();
  const { displayToast } = useToastNotification();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClick = useCallback(() => {
    if (!user) {
      showLogin({ trigger: AuthTriggers.Gear });
      return;
    }
    setIsModalOpen(true);
  }, [user, showLogin]);

  const handleSubmit = useCallback(
    async (input: AddGearInput) => {
      try {
        await addGear(input);
        displayToast('Gear added to your profile');
        setIsModalOpen(false);
      } catch {
        displayToast('Failed to add gear');
      }
    },
    [displayToast],
  );

  return (
    <>
      <div className="mt-4 flex justify-end border-t border-border-subtlest-tertiary pt-4">
        <ButtonV2
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Small}
          icon={<PlusIcon />}
          onClick={handleClick}
        >
          Add gear
        </ButtonV2>
      </div>
      {isModalOpen && (
        <GearModal
          isOpen={isModalOpen}
          onRequestClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
        />
      )}
    </>
  );
}
