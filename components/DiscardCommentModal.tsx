import React, { ReactElement, MouseEvent } from 'react';
import { StyledModal, Props as ModalProps } from './StyledModal';
import styled from 'styled-components';
import { size10, size2, size4, size6 } from '../styles/sizes';
import { typoDouble, typoLil2, typoMicro2 } from '../styles/typography';
import { BaseButton, ColorButton, HollowButton } from './Buttons';
import { colorKetchup40 } from '../styles/colors';

export interface Props extends ModalProps {
  onDeleteComment: (event: MouseEvent) => void;
}

const MyModal = styled(StyledModal)`
  .Overlay {
    justify-content: center;
    padding-left: ${size6};
    padding-right: ${size6};
  }

  .Modal {
    max-width: 23.25rem;
    padding: ${size6} ${size10};
    border: 0.063rem solid var(--theme-separator);
    border-radius: ${size4};
  }
`;

const Heading = styled.h1`
  text-transform: uppercase;
  ${typoDouble}
`;

const Content = styled.div`
  margin: ${size2} 0 ${size6};
  color: var(--theme-secondary);
  text-align: center;
  ${typoMicro2}
`;

const Buttons = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  align-self: stretch;

  ${BaseButton} {
    flex: 1;
    padding: ${size2} ${size4};
    margin: 0 ${size2};
    color: var(--theme-primary);
    border-radius: ${size2};
    ${typoLil2}

    &:first-child {
      margin-left: 0;
    }

    &:last-child {
      margin-right: 0;
    }
  }
`;

export default function DiscardCommentModal({
  onDeleteComment,
  onRequestClose,
  ...props
}: Props): ReactElement {
  return (
    <MyModal {...props}>
      <Heading>Remove comment?</Heading>
      <Content>Are you sure you want to close and remove your comment?</Content>
      <Buttons>
        <HollowButton onClick={onRequestClose}>Cancel</HollowButton>
        <ColorButton background={colorKetchup40} onClick={onDeleteComment}>
          Discard
        </ColorButton>
      </Buttons>
    </MyModal>
  );
}
