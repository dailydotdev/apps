import React, { useEffect, useState } from 'react';
import type { ReactElement } from 'react';

import classNames from 'classnames';
import type { ModalProps } from '../../../../components/modals/common/Modal';
import { Modal } from '../../../../components/modals/common/Modal';
import { useOrganization } from '../../hooks/useOrganization';

import { useViewSize, ViewSize } from '../../../../hooks';
import { LogoWithPlus } from '../../../../components/Logo';
import { ButtonSize } from '../../../../components/buttons/common';

import { Button } from '../../../../components/buttons/Button';
import { IconSize } from '../../../../components/Icon';
import { Tab, TabContainer } from '../../../../components/tabs/TabContainer';
import { ArrowIcon, LoaderIcon } from '../../../../components/icons';
import { PreviewChanges } from './PreviewChanges';
import { CheckoutChanges } from './CheckoutChanges';
import { useOrganizationSubscription } from '../../hooks/useOrganizationSubscription';
import {
  Typography,
  TypographyType,
} from '../../../../components/typography/Typography';

export enum Display {
  Loading = 'loading',
  Preview = 'preview',
  Checkout = 'checkout',
  NoAccess = 'no-access',
}

type Props = ModalProps & {
  organizationId?: string;
};

export const ManageSeatsModal = ({
  organizationId,
  ...props
}: Props): ReactElement => {
  const isMobile = useViewSize(ViewSize.MobileL);
  const { seats, isOwner } = useOrganization(organizationId);
  const [quantity, setQuantity] = useState(seats.total);
  const { data, refetch } = useOrganizationSubscription(
    organizationId,
    quantity,
  );

  const [activeTab, setActiveTab] = useState<Display>(
    isOwner ? Display.Loading : Display.NoAccess,
  );

  const onContinue = () => {
    setActiveTab(Display.Checkout);
  };

  const goBack = () => setActiveTab(Display.Preview);

  useEffect(() => {
    if (data) {
      setActiveTab(Display.Preview);
    }
  }, [data]);

  useEffect(() => {
    if (!isOwner) {
      return;
    }
    refetch();
  }, [isOwner, quantity, refetch]);

  const isCheckout = activeTab === Display.Checkout;

  return (
    <Modal
      {...props}
      className={classNames(
        props.className,
        'relative min-h-[27rem] tablet:!w-[52.5rem]',
        activeTab !== Display.Checkout && 'tablet:flex-col',
      )}
      isDrawerOnMobile={activeTab === Display.Checkout}
      drawerProps={{
        displayCloseButton: false,
        title: 'Manage seats',
      }}
    >
      <Modal.Header
        title={isCheckout && 'Manage seats'}
        className={!isCheckout && !isMobile && '!absolute border-b-0'}
      >
        {isMobile && <LogoWithPlus />}
        {isCheckout && (
          <Button
            size={ButtonSize.Small}
            className="mr-2 flex -rotate-90"
            icon={<ArrowIcon />}
            onClick={goBack}
          />
        )}
      </Modal.Header>

      <TabContainer<Display>
        controlledActive={activeTab}
        shouldFocusTabOnChange
        showHeader={false}
      >
        <Tab label={Display.Loading}>
          <div className="flex h-full w-full items-center justify-center">
            <LoaderIcon
              size={IconSize.XXXLarge}
              className="flex-shrink-0 animate-spin drop-shadow-[0_0_5px_var(--theme-shadow-cabbage)]"
            />
          </div>
        </Tab>
        <Tab label={Display.NoAccess}>
          <Typography
            bold
            type={TypographyType.Title2}
            className="flex h-full w-full items-center justify-center"
          >
            You do not have access to manage seats for this organization.
          </Typography>
        </Tab>
        <Tab label={Display.Preview}>
          <PreviewChanges
            data={data}
            onContinue={onContinue}
            organizationId={organizationId}
            quantity={quantity}
            setQuantity={setQuantity}
          />
        </Tab>
        <Tab label={Display.Checkout}>
          <CheckoutChanges
            data={data}
            organizationId={organizationId}
            quantity={quantity}
            goBack={goBack}
          />
        </Tab>
      </TabContainer>
    </Modal>
  );
};
