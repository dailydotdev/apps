import React, {
  ReactElement,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import styled from 'styled-components';
import { size1, size4, size8, sizeN } from '../styles/sizes';
import { FloatButton, IconButton } from './Buttons';
import DailyDevLogo from './DailyDevLogo';
import LazyImage from './LazyImage';
import AuthContext from './AuthContext';
import { focusOutline } from '../styles/utilities';
import { laptop, tablet } from '../styles/media';
import BetaBadge from './BetaBadge';
import AboutModal from './AboutModal';
import BellIcon from '../icons/bell.svg';
import BellNotifyIcon from '../icons/bell_notify.svg';

export interface Props {
  children?: ReactNode;
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

const ProfileImage = styled.button`
  width: ${size8};
  overflow: hidden;
  padding: 0;
  background: none;
  border: none;
  border-radius: 100%;
  cursor: pointer;
  ${focusOutline}
`;

const AboutButton = styled(IconButton)`
  margin: 0 ${size4} 0 auto;
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

export default function MainLayout({ children }: Props): ReactElement {
  const { user, showLogin, showProfile } = useContext(AuthContext);
  const [showAbout, setShowAbout] = useState(false);
  const [showBadge, setShowBadge] = useState(false);

  const onAboutClick = () => {
    setShowAbout(true);
    if (showBadge) {
      setShowBadge(false);
      localStorage.setItem('about', 'true');
    }
  };

  useEffect(() => {
    setShowBadge(!localStorage.getItem('about'));
  }, []);

  return (
    <Container>
      <Header>
        <HomeLink href="/">
          <DailyDevLogo />
          <BetaBadge className="badge" />
        </HomeLink>
        <AboutButton onClick={onAboutClick}>
          {showBadge ? <BellNotifyIcon /> : <BellIcon />}
        </AboutButton>
        {user ? (
          <ProfileImage onClick={showProfile}>
            <LazyImage
              imgSrc={user.image}
              imgAlt="Your profile image"
              ratio="100%"
            />
          </ProfileImage>
        ) : (
          <FloatButton onClick={showLogin}>Login</FloatButton>
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
