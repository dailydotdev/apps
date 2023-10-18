import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { Modal, ModalProps } from '../common/Modal';
import { Checkbox } from '../../fields/Checkbox';
import { Button } from '../../buttons/Button';
import CopyIcon from '../../icons/Copy';
import { useSettingsContext } from '../../../contexts/SettingsContext';
import { CampaignCtaPlacement } from '../../../graphql/settings';
import useMedia from '../../../hooks/useMedia';
import { laptop } from '../../../styles/media';
import { cloudinary } from '../../../lib/image';
import { KeysRow } from './KeysRow';
import { ReferralCampaignKey, useReferralCampaign } from '../../../hooks';
import { link } from '../../../lib/links';
import { useCopyLink } from '../../../hooks/useCopy';

function SearchReferralModal(modalProps: ModalProps): ReactElement {
  const isLaptop = useMedia([laptop.replace('@media ', '')], [true], false);
  const { campaignCtaPlacement, onToggleHeaderPlacement } =
    useSettingsContext();
  const { availableCount, noKeysAvailable, url } = useReferralCampaign({
    campaignKey: ReferralCampaignKey.Search,
  });
  const [isCopying, copyLink] = useCopyLink(() => url);
  const handleCopy = () => copyLink();

  return (
    <Modal
      {...modalProps}
      kind={isLaptop ? Modal.Kind.FixedCenter : Modal.Kind.FlexibleCenter}
      size={isLaptop ? Modal.Size.XLarge : Modal.Size.Small}
    >
      <Modal.Body className="laptop:flex-row">
        <span className="laptop:hidden -mx-6 -mt-6">
          <img
            src={cloudinary.referralCampaign.search.bgPopupMobile}
            alt="tablet popup background"
          />
        </span>
        <div className="flex flex-col laptop:p-2 w-full max-w-[26rem]">
          <h1 className="laptop:mt-4 font-bold text-center laptop:text-left typo-title3 tablet:typo-title1 laptop:typo-mega2">
            {noKeysAvailable
              ? `Need more keys?`
              : `Give your friends early access to daily.dev's search!`}
          </h1>
          <p className="mt-6 text-center laptop:text-left !font-normal typo-body tablet:typo-headline laptop:typo-title3 text-theme-label-secondary">
            {noKeysAvailable
              ? `You've already used all your invitation keys, but you can always ask for more...`
              : `Be that cool friend who got access to yet another AI feature! You
            have ${availableCount} invite keys left, use them wisely.`}
          </p>
          <KeysRow count={10} />
          <Button
            tag={noKeysAvailable ? 'a' : 'button'}
            href={noKeysAvailable ? link.search.requestKeys : undefined}
            className={classNames(
              'mt-5',
              noKeysAvailable ? 'btn-secondary' : 'btn-primary',
            )}
            icon={
              noKeysAvailable ? undefined : <CopyIcon secondary={isCopying} />
            }
            disabled={isCopying}
            onClick={noKeysAvailable ? undefined : handleCopy}
          >
            {noKeysAvailable ? `Request more invitation keys` : `Copy key link`}
          </Button>
          <Checkbox
            name="referral_cta_placement"
            className="mt-6 laptop:mt-auto"
            checked={campaignCtaPlacement !== CampaignCtaPlacement.Header}
            onToggle={onToggleHeaderPlacement}
          >
            Hide from header
          </Checkbox>
        </div>
        <div
          className="hidden laptop:flex flex-1 -m-6 bg-center bg-no-repeat bg-contain"
          style={{
            backgroundImage: `url(${cloudinary.referralCampaign.search.bgPopup})`,
          }}
        />
      </Modal.Body>
    </Modal>
  );
}

export default SearchReferralModal;
