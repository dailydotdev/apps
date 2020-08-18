import React, { ReactElement } from 'react';
import {
  ModalCloseButton,
  Props as ModalProps,
  StyledModal,
} from './StyledModal';
import styled from 'styled-components';
import { size4, size5, size6 } from '../styles/sizes';
import XIcon from '../icons/x.svg';
import { typoMicro2 } from '../styles/typography';

const MyModal = styled(StyledModal)`
  .Overlay {
    justify-content: center;
    padding-left: ${size5};
    padding-right: ${size5};
  }

  .Modal {
    max-width: 20rem;
    align-items: flex-start;
    padding: ${size6};
    border: 0.063rem solid var(--theme-separator);
    border-radius: ${size4};
    color: var(--theme-secondary);
    ${typoMicro2}

    & strong {
      color: var(--theme-primary);
      font-weight: bold;
    }
  }
`;

export default function AboutModal(props: ModalProps): ReactElement {
  return (
    <MyModal {...props}>
      <ModalCloseButton onClick={props.onRequestClose}>
        <XIcon />
      </ModalCloseButton>
      Welcome to daily.dev!
      <br />
      <br />
      <strong>What is this page?</strong>
      It&apos;s a place to engage with our community by creating meaningful
      conversations on trending dev news.
      <br />
      <br />
      <strong>What should I do here?</strong>
      - Share an insight
      <br />
      - Create a TL;DR
      <br />
      - Comment on what you&apos;ve learned
      <br />
      - Make a joke (only if it&apos;s good)
      <br />
      <br />
      <strong>Is there any magic involved? 🧙‍♂️</strong>
      Oh yes. The comment with most upvotes will be featured on the main feed of
      daily.dev extension.
      <br />
      <br />
      Happy chatting!
    </MyModal>
  );
}
