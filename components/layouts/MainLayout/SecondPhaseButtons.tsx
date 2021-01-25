import React, { ReactElement } from 'react';
import GiftIcon from '../../../icons/gift.svg';
import styled from '@emotion/styled';
import { sizeN } from '../../../styles/sizes';
import { laptopL } from '../../../styles/media';
import usePersistentState from '../../../lib/usePersistentState';
import { ButtonProps } from '../../buttons/BaseButton';
import QuandaryButton from '../../buttons/QuandaryButton';

const buttonMargin = sizeN(1.5);

const GiftButton = styled(QuandaryButton)<ButtonProps<'a'>>`
  margin: 0 ${buttonMargin};
`;

export default function SecondPhaseButtons(): ReactElement {
  const [didClickedTshirt, setDidClickTshirt] = usePersistentState(
    'tshirt',
    true,
    false,
  );
  return (
    <>
      <GiftButton
        id="header-gift-btn"
        tag="a"
        href="https://daily.dev/win-free-t-shirt"
        target="_blank"
        rel="noopener"
        title="Get free T-shirt"
        themeColor="avocado"
        pressed={!didClickedTshirt}
        onClick={() => setDidClickTshirt(true)}
        icon={<GiftIcon />}
        reverse
        labelMediaQuery={laptopL}
      >
        {!didClickedTshirt && 'Get free T-shirt'}
      </GiftButton>
    </>
  );
}
