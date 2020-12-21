import React, { ReactElement, useState } from 'react';
import GiftIcon from '../icons/gift.svg';
import BellNotifyIcon from '../icons/bell_notify.svg';
import BellIcon from '../icons/bell.svg';
import styled from 'styled-components';
import { FloatButton, IconButton } from './Buttons';
import { size1, size2, sizeN } from '../styles/sizes';
import { typoNuggets } from '../styles/typography';
import { laptopL } from '../styles/media';
import AboutModal from './modals/AboutModal';
import usePersistentState from '../lib/usePersistentState';

const buttonMargin = sizeN(1.5);

const AboutButton = styled(IconButton)`
  margin: 0 ${buttonMargin};
`;

const GiftButton = styled(FloatButton)`
  margin: 0 ${buttonMargin} 0 auto;
  padding: ${size1};
  border-radius: ${size2};
  ${typoNuggets}

  .icon {
    margin: 0;
  }

  span {
    display: none;
    margin: 0 ${size1} 0 ${size2};

    ${laptopL} {
      display: unset;
    }
  }
`;

export default function MainLayoutButtons(): ReactElement {
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
        as="a"
        href="https://daily.dev/win-free-t-shirt"
        target="_blank"
        rel="noopener"
        title="Get free T-shirt"
        done={!didClickedTshirt}
        onClick={() => setDidClickTshirt(true)}
      >
        {!didClickedTshirt && <span>Get free T-shirt</span>}
        <GiftIcon />
      </GiftButton>
      <AboutButton onClick={onAboutClick} title="About">
        {showBadge ? <BellNotifyIcon /> : <BellIcon />}
      </AboutButton>
      <AboutModal
        isOpen={showAbout}
        onRequestClose={() => setShowAbout(false)}
      />
    </>
  );
}
