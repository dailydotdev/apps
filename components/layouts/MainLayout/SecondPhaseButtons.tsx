import React, { ReactElement, useState } from 'react';
import GiftIcon from '../../../icons/gift.svg';
import BellNotifyIcon from '../../../icons/bell_notify.svg';
import BellIcon from '../../../icons/bell.svg';
import styled from 'styled-components';
import { sizeN } from '../../../styles/sizes';
import { laptopL } from '../../../styles/media';
import AboutModal from '../../modals/AboutModal';
import usePersistentState from '../../../lib/usePersistentState';
import TertiaryButton from '../../buttons/TertiaryButton';
import { ButtonProps } from '../../buttons/BaseButton';
import QuandaryButton from '../../buttons/QuandaryButton';

const buttonMargin = sizeN(1.5);

const AboutButton = styled(TertiaryButton)<ButtonProps<'button'>>`
  margin: 0 ${buttonMargin};
`;

const GiftButton = styled(QuandaryButton).attrs({
  labelMediaQuery: laptopL,
})<ButtonProps<'a'>>`
  margin: 0 ${buttonMargin};
`;

export default function SecondPhaseButtons(): ReactElement {
  const [showAbout, setShowAbout] = useState(false);
  const [showBadge, setShowBadge] = usePersistentState('about', false, true);
  const [didClickedTshirt, setDidClickTshirt] = usePersistentState(
    'tshirt',
    true,
    false,
  );

  const onAboutClick = async () => {
    setShowAbout(true);
    await setShowBadge(false);
  };

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
      >
        {!didClickedTshirt && 'Get free T-shirt'}
      </GiftButton>
      <AboutButton
        onClick={onAboutClick}
        title="About"
        icon={showBadge ? <BellNotifyIcon /> : <BellIcon />}
      />
      <AboutModal
        isOpen={showAbout}
        onRequestClose={() => setShowAbout(false)}
      />
    </>
  );
}
