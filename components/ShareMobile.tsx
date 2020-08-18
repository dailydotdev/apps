import React, { ReactElement } from 'react';
import styled from 'styled-components';
import { laptop } from '../styles/media';
import CopyIcon from '../icons/copy.svg';
import ShareIcon from '../icons/share.svg';
import { FloatButton } from './Buttons';
import { size1, size10 } from '../styles/sizes';
import { useCopyPostLink } from '../lib/useCopyPostLink';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: ${size10};

  ${laptop} {
    display: none;
  }

  ${FloatButton} {
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
      <FloatButton onClick={copyLink} done={copying}>
        <CopyIcon />
        {copying ? 'Copied!' : 'Copy link'}
      </FloatButton>
      <FloatButton onClick={share}>
        <ShareIcon />
        Share with your friends
      </FloatButton>
    </Container>
  );
}
