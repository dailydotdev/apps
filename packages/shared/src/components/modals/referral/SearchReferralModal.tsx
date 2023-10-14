import React, { ReactElement } from 'react';
import { Modal, ModalProps } from '../common/Modal';
import { Checkbox } from '../../fields/Checkbox';
import { Button } from '../../buttons/Button';
import CopyIcon from '../../icons/Copy';
import { useSettingsContext } from '../../../contexts/SettingsContext';
import { CampaignCtaPlacement } from '../../../graphql/settings';

function SearchReferralModal(modalProps: ModalProps): ReactElement {
  const { campaignCtaPlacement, onToggleHeaderPlacement } =
    useSettingsContext();

  return (
    <Modal
      {...modalProps}
      kind={Modal.Kind.FixedCenter}
      size={Modal.Size.XLarge}
    >
      <Modal.Body className="!flex-row">
        <div className="flex flex-col p-2 w-full max-w-[26rem]">
          <h1 className="mt-4 font-bold typo-mega2">
            Give your friends early access to daily.dev&apos;s search!
          </h1>
          <p className="mt-6 typo-title3 text-theme-label-secondary">
            Be that cool friend who got access to yet another AI feature! You
            have COUNT invite keys left, use them wisely.
            {/*  TODO: get the count value */}
          </p>
          <span
            className="flex flex-row justify-evenly mt-10 bg-center bg-no-repeat bg-contain"
            style={{ backgroundImage: `url(./keys_bg.svg)` }}
          >
            <img src="./key.svg" alt="key icon" />
            <img src="./key.svg" alt="key icon" />
            <img src="./key.svg" alt="key icon" />
            <img src="./key.svg" alt="key icon" />
            <img src="./key.svg" alt="key icon" />
          </span>
          <Button className="mt-5 btn-primary" icon={<CopyIcon />}>
            Copy key link
          </Button>
          <Checkbox
            name="referral_cta_placement"
            className="mt-auto"
            checked={campaignCtaPlacement !== CampaignCtaPlacement.Header}
            onToggle={onToggleHeaderPlacement}
          >
            Hide from header
          </Checkbox>
        </div>
        <div
          className="flex flex-1 -m-6 bg-center bg-contain"
          style={{ backgroundImage: `url(./bg_popup.png)` }}
        />
      </Modal.Body>
    </Modal>
  );
}

export default SearchReferralModal;
