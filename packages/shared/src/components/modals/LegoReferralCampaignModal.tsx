/* eslint-disable @dailydotdev/daily-dev-eslint-rules/no-custom-color */
import React, { ReactElement } from 'react';
import { LazyModalCommonProps, Modal } from './common/Modal';
import { ReferralCampaignKey, useReferralCampaign } from '../../hooks';
import { FlexCol, FlexRow } from '../utilities';
import { Image } from '../image/Image';
import { referralToC } from '../../lib/constants';
import { Checkbox } from '../fields/Checkbox';
import { useActions } from '../../hooks/useActions';
import { ActionType } from '../../graphql/actions';
import { FieldInput } from '../fields/common';
import { Button, ButtonSize } from '../buttons/Button';
import { useCopyLink } from '../../hooks/useCopyLink';
import CloseButton from '../CloseButton';
import { cloudinary } from '../../lib/image';

type LegoReferralCampaignModalProps = {
  campaignKey: ReferralCampaignKey;
  onRequestClose: (event: MouseEvent) => void;
} & LazyModalCommonProps;

function LegoReferralCampaignModal({
  campaignKey,
  onRequestClose,
  ...props
}: LegoReferralCampaignModalProps): ReactElement {
  const {
    url: referralUrl,
    isReady,
    referralCurrentCount,
    referralTargetCount,
  } = useReferralCampaign({
    campaignKey,
  });
  const { checkHasCompleted, completeAction } = useActions();
  const [, copyReferralLink] = useCopyLink(() => referralUrl);

  if (!isReady) {
    return null;
  }

  return (
    <Modal
      {...props}
      className="border-none"
      kind={Modal.Kind.FixedCenter}
      size={Modal.Size.XLarge}
      onRequestClose={onRequestClose}
    >
      <div className="bg-gradient-to-br rounded-14 p-[3px] from-[#6DE8BE] via-[#DD3DFC] to-[#F9DD53]">
        <FlexRow
          style={{
            backgroundColor: '#1b174b',
            backgroundImage: `url(${cloudinary.referralCampaign.backgroundDark})`,
          }}
          className="flex-1 gap-6 justify-center items-center p-6 pr-0 bg-cover rounded-14 border-0"
        >
          <CloseButton
            buttonSize={ButtonSize.Small}
            className="top-3 right-3 text-white border-white !absolute !btn-secondary"
            onClick={onRequestClose}
          />
          <FlexCol className="justify-center basis-[23.25rem]">
            <h3 className="mb-3 font-bold text-transparent bg-clip-text bg-gradient-to-l typo-mega2 from-[#6DE8BE] via-[#DD3DFC] to-[#F9DD53]">
              Win a limited edition lego set!
            </h3>
            <p className="mb-6 text-salt-50 typo-title3">
              <b>Invite 5 friends</b> using the link below for a chance to win
              the lego set.
            </p>
            <FlexRow className="gap-4 items-center px-3 mb-6 h-12 rounded-14 bg-[#a8b3cf14]">
              <FieldInput
                className="flex flex-1 text-white"
                value={referralUrl}
              />
              <Button
                className="bg-white text-[black]"
                buttonSize={ButtonSize.Small}
                onClick={() => {
                  copyReferralLink();
                }}
              >
                Copy link
              </Button>
            </FlexRow>
            <div className="mb-6 bg-gradient-to-br rounded-12 p-[3px] from-[#6DE8BE] via-[#DD3DFC] to-[#F9DD53]">
              <div className="flex gap-1.5 justify-center items-center py-4 px-3 font-bold text-white rounded-10 bg-[#1b174b] typo-title3">
                {referralCurrentCount} out of {referralTargetCount}
              </div>
            </div>
            <Image
              className="mb-6 shadow-3-black"
              width={372}
              height={186}
              src={cloudinary.referralCampaign.lego.francesco}
              alt="Image showing lego set box held by a person."
            />
            <FlexRow className="justify-center items-center">
              <Checkbox
                name="lego-referral-hide"
                checked={checkHasCompleted(ActionType.LegoMay2023Hide)}
                onToggle={() => {
                  completeAction(ActionType.LegoMay2023Hide);
                }}
              >
                <p className="font-normal text-salt-90 typo-footnote">
                  Hide from header
                </p>
              </Checkbox>
              <a
                target="_blank"
                rel="noopener"
                className="text-salt-90 hover:underline typo-footnote"
                href={referralToC}
              >
                Giveaway rules
              </a>
            </FlexRow>
          </FlexCol>
          <FlexCol className="flex-1 justify-center items-center">
            <Image
              className="-m-10 mb-3"
              width={604}
              height={512}
              src="https://daily-now-res.cloudinary.com/image/upload/s--D-MLNY69--/f_auto,q_auto/v1685624124/public/lego-preview"
              alt="Image showing lego set consisting of little chair and table with programmer setup."
            />
            <p className="mb-4 max-w-md italic text-center text-salt-50 typo-callout">
              P.S. Inviting more than 5 friends will not affect your chance to
              win but it will make my manager very happy if you do{' '}
              <span className="not-italic">😉</span>
            </p>
            <Image
              className="mb-3"
              width={248}
              height={27}
              src={cloudinary.referralCampaign.lego.madeWithLove}
              alt="Made with love by daily.dev"
            />
          </FlexCol>
        </FlexRow>
      </div>
    </Modal>
  );
}

export default LegoReferralCampaignModal;
