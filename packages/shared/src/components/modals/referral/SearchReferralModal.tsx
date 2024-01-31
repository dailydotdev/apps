import React, { ReactElement } from 'react';
import { Modal, ModalProps } from '../common/Modal';
import { Checkbox } from '../../fields/Checkbox';
import { Button, ButtonVariant } from '../../buttons/ButtonV2';
import { CopyIcon } from '../../icons';
import { useSettingsContext } from '../../../contexts/SettingsContext';
import { CampaignCtaPlacement } from '../../../graphql/settings';
import {
  ReferralCampaignKey,
  useReferralCampaign,
  useViewSize,
  ViewSize,
} from '../../../hooks';
import { cloudinary } from '../../../lib/image';
import { KeysRow } from './KeysRow';
import { link } from '../../../lib/links';
import { useCopyLink } from '../../../hooks/useCopy';
import { useAnalyticsContext } from '../../../contexts/AnalyticsContext';
import { AnalyticsEvent, TargetType } from '../../../lib/analytics';
import { ModalClose } from '../common/ModalClose';

function SearchReferralModal({
  onRequestClose,
  ...props
}: ModalProps): ReactElement {
  const isLaptop = useViewSize(ViewSize.Laptop);
  const { trackEvent } = useAnalyticsContext();
  const { campaignCtaPlacement, onToggleHeaderPlacement } =
    useSettingsContext();
  const { availableCount, noKeysAvailable, url, referralToken } =
    useReferralCampaign({
      campaignKey: ReferralCampaignKey.Search,
    });
  const [isCopying, copyLink] = useCopyLink(() => url);
  const handleCopy = () => {
    trackEvent({
      event_name: AnalyticsEvent.CopyKeyLink,
      extra: JSON.stringify({ token: referralToken }),
    });
    copyLink();
  };

  const handleToggle = () => {
    trackEvent({
      event_name: AnalyticsEvent.HideFromHeader,
      target_type: TargetType.HideInviteCheckbox,
      target_id: campaignCtaPlacement === CampaignCtaPlacement.Header,
      // we need expected value after clicking the checkbox, that means, the previous value was header.
    });
    onToggleHeaderPlacement();
  };

  const handleRequestClose: typeof onRequestClose = (event) => {
    trackEvent({ event_name: AnalyticsEvent.CloseInvitationPopup });
    onRequestClose(event);
  };

  return (
    <Modal
      {...props}
      kind={isLaptop ? Modal.Kind.FixedCenter : Modal.Kind.FlexibleCenter}
      size={isLaptop ? Modal.Size.XLarge : Modal.Size.Small}
      onRequestClose={handleRequestClose}
    >
      <ModalClose
        onClick={handleRequestClose}
        variant={ButtonVariant.Secondary}
        top="3"
        right="3"
      />
      <Modal.Body className="laptop:flex-row">
        <span className="-mx-6 -mt-6 laptop:hidden">
          <img
            src={cloudinary.referralCampaign.search.bgPopupMobile}
            alt="tablet popup background"
          />
        </span>
        <div className="flex w-full max-w-[26rem] flex-col laptop:p-2">
          <h1 className="text-center font-bold typo-title3 tablet:typo-title2 laptop:mt-4 laptop:text-left laptop:typo-mega2">
            {noKeysAvailable
              ? `Need more keys?`
              : `Give your friends early access to daily.dev's search!`}
          </h1>
          <p className="mt-6 text-center font-normal text-theme-label-secondary typo-body tablet:typo-body laptop:text-left laptop:typo-title3">
            {noKeysAvailable
              ? `You've already used all your invitation keys, but you can always ask for more...`
              : `Be that cool friend who got access to yet another AI feature! You
            have ${availableCount} invite keys left, use them wisely.`}
          </p>
          <KeysRow count={availableCount} />
          <Button
            variant={
              noKeysAvailable ? ButtonVariant.Secondary : ButtonVariant.Primary
            }
            tag={noKeysAvailable ? 'a' : 'button'}
            href={noKeysAvailable ? link.search.requestKeys : undefined}
            className="mt-5"
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
            onToggle={handleToggle}
          >
            Hide from header
          </Checkbox>
        </div>
        <div
          className="-m-6 hidden flex-1 bg-contain bg-center bg-no-repeat laptop:flex"
          style={{
            backgroundImage: `url(${cloudinary.referralCampaign.search.bgPopup})`,
          }}
        />
      </Modal.Body>
    </Modal>
  );
}

export default SearchReferralModal;
