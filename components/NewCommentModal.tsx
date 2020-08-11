import React, { FormEvent, ReactElement, useContext, useState } from 'react';
import styled from 'styled-components';
import { Props as ModalProps, StyledModal } from './StyledModal';
import { size2, size3, size4, size6, sizeN } from '../styles/sizes';
import AuthContext from './AuthContext';
import {
  CommentAuthor,
  CommentBox,
  CommentPublishDate,
  RoundedImage,
  SmallRoundedImage,
} from './utilities';
import { commentDateFormat } from '../lib/dateFormat';
import { typoMicro1, typoSmallBase } from '../styles/typography';
import { colorWater60 } from '../styles/colors';
import { ColorButton, FloatButton } from './Buttons';
import UpvoteIcon from '../icons/upvote.svg';
import { mobileL } from '../styles/media';

export interface Props extends ModalProps {
  authorName: string;
  authorImage: string;
  publishDate: Date | string;
  content: string;
}

const MyModal = styled(StyledModal)`
  .Modal {
    max-width: ${sizeN(120)};
    align-items: stretch;
    padding: ${size2};
    background: var(--theme-background-secondary);
    border-radius: 0;

    ${mobileL} {
      border-radius: ${size4};
    }
  }
`;

const ParentComment = styled(CommentBox)`
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const ParentCommentHeader = styled.header`
  display: flex;
  align-items: center;
  margin-bottom: ${size2};
`;

const ParentCommentMetadata = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: ${size2};
`;

const Subheader = styled.div`
  display: flex;
  align-items: center;
  height: ${sizeN(11)};
  padding: 0 ${size2};
`;

const Timeline = styled.div`
  width: 0.063rem;
  height: 100%;
  margin-left: ${size3};
  background: var(--theme-separator);
`;

const ReplyTo = styled.div`
  margin-left: ${size6};
  color: var(--theme-secondary);
  ${typoSmallBase}

  strong {
    color: var(--theme-primary);
    font-weight: bold;
  }
`;

const NewCommentContainer = styled.div`
  display: flex;
  padding: 0 ${size2};
`;

const NewCommentTextArea = styled.div`
  min-height: ${sizeN(44)};
  margin-left: ${size3};
  flex: 1;
  color: var(--theme-primary);
  background: none;
  border: none;
  caret-color: ${colorWater60};
  word-break: break-word;
  ${typoMicro1}

  &:focus {
    outline: 0;
  }

  &:empty:before {
    content: attr(aria-placeholder);
    color: var(--theme-secondary);
  }
`;

const Footer = styled.footer`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${size2} 0;
  border-top: 0.063rem solid var(--theme-separator);
`;

export default function NewCommentModal(props: Props): ReactElement {
  const { user } = useContext(AuthContext);
  const { authorImage, authorName, publishDate, content } = props;
  const [input, setInput] = useState<string>(null);

  const commentRef = (element: HTMLDivElement): void => {
    element?.focus();
  };

  const modalRef = (element: HTMLDivElement): void => {
    if (element) {
      element.scrollTop = element.scrollHeight - element.clientHeight;
    }
  };

  const onInput = (event: FormEvent<HTMLDivElement>): void => {
    setInput(event.currentTarget.innerText);
  };

  return (
    <MyModal {...{ contentRef: modalRef, ...props }}>
      <ParentComment as="article">
        <ParentCommentHeader>
          <RoundedImage
            imgSrc={authorImage}
            imgAlt={`${authorName}'s profile image`}
            background="var(--theme-background-highlight)"
          />
          <ParentCommentMetadata>
            <CommentAuthor>{authorName}</CommentAuthor>
            <CommentPublishDate>
              {commentDateFormat(publishDate)}
            </CommentPublishDate>
          </ParentCommentMetadata>
        </ParentCommentHeader>
        <div>{content}</div>
      </ParentComment>
      <Subheader>
        <Timeline />
        <ReplyTo>
          Reply to <strong>{authorName}</strong>
        </ReplyTo>
      </Subheader>
      <NewCommentContainer>
        <SmallRoundedImage imgSrc={user.image} imgAlt="Your profile image" />
        <NewCommentTextArea
          ref={commentRef}
          contentEditable
          role="textbox"
          aria-placeholder="Write your comment..."
          aria-multiline
          onInput={onInput}
        />
      </NewCommentContainer>
      <Footer>
        <FloatButton>Cancel</FloatButton>
        <ColorButton
          background="var(--theme-avocado)"
          disabled={!input?.length}
        >
          Send
          <UpvoteIcon className="icon right" />
        </ColorButton>
      </Footer>
    </MyModal>
  );
}
