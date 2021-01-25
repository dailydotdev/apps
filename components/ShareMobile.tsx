import React, { ReactElement } from 'react';
import styled from '@emotion/styled';
import { laptop } from '../styles/media';
import CopyIcon from '../icons/copy.svg';
import ShareIcon from '../icons/share.svg';
import { size1, size10 } from '../styles/sizes';
import { useCopyPostLink } from '../lib/useCopyPostLink';
import TertiaryButton from './buttons/TertiaryButton';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: ${size10};

  ${laptop} {
    display: none;
  }

  button {
    margin: ${size1} 0;

    &:first-child {
      margin-top: 0;
    }

    &:last-child {
      margin-bottom: 0;
    }
  }
`;

export interface Props {
  share: () => Promise<void>;
}

export function ShareMobile({ share }: Props): ReactElement {
  const [copying, copyLink] = useCopyPostLink();

  return (
    <Container>
      <TertiaryButton
        buttonSize="small"
        themeColor="avocado"
        onClick={copyLink}
        pressed={copying}
        icon={<CopyIcon />}
      >
        {copying ? 'Copied!' : 'Copy link'}
      </TertiaryButton>
      <TertiaryButton buttonSize="small" onClick={share} icon={<ShareIcon />}>
        Share with your friends
      </TertiaryButton>
    </Container>
  );
}
