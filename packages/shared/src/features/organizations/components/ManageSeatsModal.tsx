import React, { useState } from 'react';
import type { ReactElement } from 'react';

import classNames from 'classnames';
import type { ModalProps } from '../../../components/modals/common/Modal';
import { Modal } from '../../../components/modals/common/Modal';
import { useOrganization } from '../hooks/useOrganization';

import { useViewSize, ViewSize } from '../../../hooks';
import CloseButton from '../../../components/CloseButton';
import { LogoWithPlus } from '../../../components/Logo';
import { ButtonSize, ButtonVariant } from '../../../components/buttons/common';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { HorizontalSeparator } from '../../../components/utilities';
import { Button } from '../../../components/buttons/Button';
import { PlusAdjustQuantity } from '../../../components/plus/PlusAdjustQuantity';
import {
  DevPlusIcon,
  InfoIcon,
  PlusUserIcon,
  SquadIcon,
} from '../../../components/icons';
import { SimpleTooltip } from '../../../components/tooltips';
import { PlusPlanExtraLabel } from '../../../components/plus/PlusPlanExtraLabel';
import { PricingCaptionColor } from '../../../graphql/paddle';

type Props = ModalProps & {
  organizationId?: string;
};

export const ManageSeatsModal = ({
  organizationId,
  ...props
}: Props): ReactElement => {
  const { organization } = useOrganization(organizationId);
  const [quantity, setQuantity] = useState(organization.seats);
  const { onRequestClose } = props;

  const isMobile = useViewSize(ViewSize.MobileL);

  return (
    <Modal
      {...props}
      className={classNames(
        props.className,
        'relative tablet:!w-[52.5rem] tablet:flex-row',
      )}
    >
      {isMobile ? (
        <Modal.Header>
          <LogoWithPlus />
        </Modal.Header>
      ) : (
        <CloseButton
          size={ButtonSize.Small}
          className="absolute right-4 top-4 z-2"
          onClick={onRequestClose}
        />
      )}
      <section className="flex h-full w-full flex-1 flex-col gap-4 p-6">
        {!isMobile && <LogoWithPlus className="mb-8" />}

        <Typography bold type={TypographyType.Body}>
          Number of seats
        </Typography>

        <PlusAdjustQuantity
          itemQuantity={quantity}
          selectedOption="organization.plan"
          checkoutItemsLoading={false}
          setItemQuantity={setQuantity}
        />

        <Typography bold type={TypographyType.Body}>
          Billing cycle
        </Typography>

        <div className="flex h-14 items-center gap-1 rounded-10 border border-border-subtlest-tertiary px-3">
          <Typography bold type={TypographyType.Callout}>
            Annual
          </Typography>

          <PlusPlanExtraLabel
            color={PricingCaptionColor.Success}
            label="Save 50%"
          />

          <div className="ml-auto flex flex-col gap-0.5 text-right">
            <Typography type={TypographyType.Body}>
              <span className="font-bold">$43.99</span>{' '}
              <span className="text-text-secondary">USD</span>
            </Typography>

            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
            >
              per user/month
            </Typography>
          </div>
        </div>

        <Typography bold type={TypographyType.Body}>
          Team overview
        </Typography>

        <section className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <SquadIcon secondary />
            <Typography type={TypographyType.Footnote}>Total seats:</Typography>
            <Typography bold type={TypographyType.Footnote}>
              {organization.seats}
            </Typography>

            <SimpleTooltip content="TODO: Update copy">
              <div>
                <InfoIcon />
              </div>
            </SimpleTooltip>
          </div>
          <div className="flex items-center gap-2">
            <PlusUserIcon secondary />
            <Typography type={TypographyType.Footnote}>
              Assigned seats:
            </Typography>
            <Typography bold type={TypographyType.Footnote}>
              {organization.seats}
            </Typography>

            <SimpleTooltip content="TODO: Implement assigned seats">
              <div>
                <InfoIcon />
              </div>
            </SimpleTooltip>
          </div>
          <div className="flex items-center gap-2">
            <DevPlusIcon secondary />
            <Typography type={TypographyType.Footnote}>
              Available seats:
            </Typography>
            <Typography bold type={TypographyType.Footnote}>
              {organization.seats}
            </Typography>

            <SimpleTooltip content="TODO: Implement available seats">
              <div>
                <InfoIcon />
              </div>
            </SimpleTooltip>
          </div>
        </section>
      </section>

      {isMobile && (
        <div className="w-full px-6">
          <HorizontalSeparator />
        </div>
      )}

      <section className="relative flex h-full w-full flex-1 flex-col gap-2 rounded-l-16 border-border-subtlest-tertiary p-6 tablet:border-l">
        {!isMobile && <div className="h-12" />}
        <Typography bold type={TypographyType.Body}>
          Summary
        </Typography>

        <div className="flex flex-col gap-0.5">
          <div className="flex flex-row items-center justify-between">
            <Typography type={TypographyType.Callout}>
              daily.dev for teams
            </Typography>
            <Typography type={TypographyType.Body}>$1,500</Typography>
          </div>

          <div className="flex flex-row items-center justify-between">
            <Typography
              type={TypographyType.Caption1}
              color={TypographyColor.Tertiary}
            >
              {organization.seats} users x 12 months
            </Typography>
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
            >
              $25/seat
            </Typography>
          </div>
        </div>

        <div className="flex flex-row items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <Typography type={TypographyType.Callout}>Discount</Typography>
            <Typography
              type={TypographyType.Caption1}
              color={TypographyColor.Tertiary}
            >
              Annual (-50%)
            </Typography>
          </div>

          <div className="flex flex-col gap-0.5">
            <Typography
              type={TypographyType.Body}
              color={TypographyColor.StatusSuccess}
            >
              -$120
            </Typography>
          </div>
        </div>

        <HorizontalSeparator className="my-4" />

        <div className="flex flex-row items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <Typography type={TypographyType.Callout}>Plan Total</Typography>
            <Typography
              type={TypographyType.Caption1}
              color={TypographyColor.Tertiary}
            >
              Billed annually starting March 31, 2026
            </Typography>
          </div>

          <div className="flex flex-col gap-0.5">
            <Typography bold type={TypographyType.Body}>
              USD $600
            </Typography>
          </div>
        </div>

        {!isMobile && (
          <Button variant={ButtonVariant.Primary} className="mt-auto">
            Continue
          </Button>
        )}
      </section>
      {isMobile && (
        <Modal.Footer>
          <Button variant={ButtonVariant.Primary} className="w-full">
            Continue
          </Button>
        </Modal.Footer>
      )}
    </Modal>
  );
};
