import React, { ReactElement } from 'react';
import {
  ModalCloseButton,
  Props as ModalProps,
  StyledModal,
} from './StyledModal';
import styled from 'styled-components';
import { size10, size8 } from '../../styles/sizes';
import { typoCallout } from '../../styles/typography';

const MyModal = styled(StyledModal)`
  .Modal {
    max-width: 21rem;
    align-items: flex-start;
    padding: ${size8} ${size10};
    color: var(--theme-label-secondary);
    ${typoCallout}

    & strong {
      color: var(--theme-label-primary);
      font-weight: bold;
    }
  }
`;

export default function AboutModal(props: ModalProps): ReactElement {
  return (
    <MyModal {...props}>
      <ModalCloseButton onClick={props.onRequestClose} />
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
