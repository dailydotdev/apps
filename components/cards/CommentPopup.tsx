import React, { KeyboardEvent, ReactElement, useState } from 'react';
import styled from '@emotion/styled';
import rem from '../../macros/rem.macro';
import { ModalCloseButton } from '../modals/StyledModal';
import { typoCallout } from '../../styles/typography';
import commentPopupText from '../../commentPopupText';
import { focusOutline } from '../../styles/helpers';
import PrimaryButton from '../buttons/PrimaryButton';
import CommentIcon from '../../icons/comment.svg';
import requestIdleCallback from 'next/dist/client/request-idle-callback';

const transitionDuration = 150;

const Popup = styled.div`
  position: relative;
  display: flex;
  height: 75%;
  flex-direction: column;
  padding: ${rem(16)};
  background: var(--theme-background-primary);
  border-radius: ${rem(16)};
`;

const Container = styled.div`
  position: absolute;
  display: flex;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  flex-direction: column;
  justify-content: flex-end;
  background: var(--theme-post-disabled);
  border-radius: ${rem(16)};
  z-index: 2;
  overflow: hidden;
  pointer-events: all;
  transition: opacity ${transitionDuration}ms ease-out;
  will-change: opacity;

  &.hide {
    opacity: 0;
  }
`;

const Title = styled.h4`
  color: var(--theme-label-primary);
  margin: 0 ${rem(44)} 0 ${rem(8)};
  ${typoCallout}
`;

const Textarea = styled.textarea`
  flex: 1;
  margin: ${rem(16)} 0;
  padding: ${rem(12)};
  background: var(--theme-float);
  color: var(--theme-label-primary);
  border-radius: ${rem(14)};
  border: none;
  caret-color: var(--theme-label-link);
  resize: none;
  ${typoCallout}
  ${focusOutline}

  &::placeholder {
    color: var(--theme-label-tertiary);
  }
`;

export type CommentPopupProps = {
  onClose?: () => unknown;
  onSubmit?: (comment: string) => unknown;
  loading?: boolean;
};

export default function CommentPopup({
  onClose,
  onSubmit,
  loading,
}: CommentPopupProps): ReactElement {
  const [show, setShow] = useState(false);
  const [comment, setComment] = useState<string>();
  const [text] = useState(
    commentPopupText[Math.floor(Math.random() * commentPopupText.length)],
  );

  const textareaRef = (ref: HTMLTextAreaElement | null) => {
    if (ref) {
      requestAnimationFrame(() => ref?.focus());
    }
  };

  const containerRef = (ref: HTMLDivElement | null) => {
    if (ref) {
      requestIdleCallback(() => setShow(true));
    }
  };

  const onKeyDown = async (event: KeyboardEvent): Promise<void> => {
    // Ctrl / Command + Enter
    if (
      (event.ctrlKey || event.metaKey) &&
      event.keyCode === 13 &&
      comment?.length
    ) {
      onSubmit(comment);
    }
  };

  return (
    <Container className={!show && 'hide'} ref={containerRef}>
      <Popup className="invert">
        <ModalCloseButton onClick={onClose} />
        <Title>{text.title}</Title>
        <Textarea
          placeholder={text.placeholder}
          onChange={(event) => setComment(event.target.value)}
          ref={textareaRef}
          onKeyDown={onKeyDown}
        />
        <PrimaryButton
          icon={<CommentIcon />}
          onClick={() => onSubmit?.(comment)}
          disabled={!comment?.length}
          loading={loading}
        >
          Comment
        </PrimaryButton>
      </Popup>
    </Container>
  );
}
