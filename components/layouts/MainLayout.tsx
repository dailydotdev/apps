import React, {
  HTMLAttributes,
  ReactElement,
  ReactNode,
  useContext,
  useState,
} from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { size1, size2, size4, size8, sizeN } from '../../styles/sizes';
import { FloatButton, IconButton } from '../Buttons';
import DailyDevLogo from '../svg/DailyDevLogo';
import LazyImage from '../LazyImage';
import AuthContext from '../AuthContext';
import { focusOutline } from '../../styles/helpers';
import { laptop, laptopL, tablet } from '../../styles/media';
import BetaBadge from '../svg/BetaBadge';
import AboutModal from '../modals/AboutModal';
import BellIcon from '../../icons/bell.svg';
import BellNotifyIcon from '../../icons/bell_notify.svg';
import GiftIcon from '../../icons/gift.svg';
import { typoNuggets } from '../../styles/typography';
import usePersistentFlag from '../../lib/usePersistentFlag';

export interface Props extends HTMLAttributes<HTMLDivElement> {
  showOnlyLogo?: boolean;
}

const Container = styled.div`
  display: flex;
  position: relative;
  flex-direction: column;
  align-items: stretch;
`;

const Header = styled.header`
  display: flex;
  height: ${sizeN(12)};
  align-items: center;
  padding: 0 ${size4};
  border-bottom: 0.063rem solid var(--theme-separator);

  ${tablet} {
    padding-left: ${size8};
    padding-right: ${size8};
  }

  ${laptop} {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    padding-left: ${size4};
    padding-right: ${size4};
    border-bottom: none;
  }
`;

const buttonMargin = sizeN(1.5);

const ProfileImage = styled.a`
  width: ${size8};
  overflow: hidden;
  margin-left: ${buttonMargin};
  padding: 0;
  background: none;
  border: none;
  border-radius: 100%;
  cursor: pointer;
  ${focusOutline}
`;

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

const HomeLink = styled.a`
  display: flex;
  align-items: center;

  .logo {
    width: 6.25rem;
  }

  .badge {
    width: 1.875rem;
    margin-left: ${size1};
  }
`;

export default function MainLayout({
  children,
  className,
  showOnlyLogo = false,
}: Props): ReactElement {
  const { user, showLogin, loadingUser } = useContext(AuthContext);
  const [showAbout, setShowAbout] = useState(false);
  const [showBadge, setShowBadge] = usePersistentFlag('about', false);
  const [didClickedTshirt, setDidClickTshirt] = usePersistentFlag(
    'tshirt',
    false,
  );

  const onAboutClick = () => {
    setShowAbout(true);
    setShowBadge(false);
  };

  return (
    <Container className={className}>
      <Header>
        <Link href="/" passHref>
          <HomeLink title="Home">
            <DailyDevLogo />
            <BetaBadge className="badge" />
          </HomeLink>
        </Link>
        {!showOnlyLogo && !loadingUser && (
          <>
            <GiftButton
              as="a"
              href="https://daily.dev/win-free-t-shirt"
              target="_blank"
              rel="noopener noreferrer"
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
            {user ? (
              <Link href={`/${user.username || user.id}`} passHref>
                <ProfileImage>
                  <LazyImage
                    imgSrc={user.image}
                    imgAlt="Your profile image"
                    ratio="100%"
                  />
                </ProfileImage>
              </Link>
            ) : (
              <FloatButton onClick={showLogin}>Login</FloatButton>
            )}
          </>
        )}
      </Header>
      {children}
      <AboutModal
        isOpen={showAbout}
        onRequestClose={() => setShowAbout(false)}
      />
    </Container>
  );
}

export const getLayout = (page: ReactNode): ReactNode => (
  <MainLayout>{page}</MainLayout>
);
