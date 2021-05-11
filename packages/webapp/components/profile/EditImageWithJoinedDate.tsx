import React, {
  ChangeEvent,
  HTMLAttributes,
  ReactElement,
  useState,
} from 'react';
import { changeProfileImage, LoggedUser } from '../../lib/user';
import CameraIcon from '@dailydotdev/shared/icons/camera.svg';
import GoogleIcon from '@dailydotdev/shared/icons/google.svg';
import GitHubIcon from '@dailydotdev/shared/icons/github.svg';
import JoinedDate from './JoinedDate';
import styled from '@emotion/styled';
import sizeN from '@dailydotdev/shared/macros/sizeN.macro';
import { typoCaption1 } from '../../styles/typography';
import { FormErrorMessage } from '@dailydotdev/shared';

export interface EditImageWithJoinedDateProps
  extends HTMLAttributes<HTMLDivElement> {
  user: LoggedUser;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const ImageAndMetadata = styled.div`
  display: flex;
  margin-top: ${sizeN(6)};
  align-items: center;
`;

const ImageInputHover = styled.span`
  position: absolute;
  display: flex;
  visibility: hidden;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.1s linear;

  .icon {
    font-size: ${sizeN(11)};
  }
`;

const ImageInput = styled.label`
  position: relative;
  overflow: hidden;
  width: ${sizeN(25)};
  height: ${sizeN(25)};
  border-radius: ${sizeN(4)};
  cursor: pointer;

  input {
    display: none;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: opacity 0.1s linear;
  }

  &:hover {
    ${ImageInputHover} {
      visibility: visible;
      opacity: 1;
    }

    img {
      opacity: 0.4;
    }
  }
`;

const Metadata = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: ${sizeN(6)};
  color: var(--theme-label-quaternary);
  ${typoCaption1}

  div {
    display: flex;
    align-items: center;
    margin: ${sizeN(0.5)} 0;
  }

  .icon {
    font-size: ${sizeN(4)};
    margin-right: ${sizeN(3)};
  }
`;

const TWO_MEGABYTES = 2 * 1024 * 1024;

export default function EditImageWithJoinedDate({
  user,
  ...props
}: EditImageWithJoinedDateProps): ReactElement {
  const [profileImage, setProfileImage] = useState(user.image);
  const [imageError, setImageError] = useState(false);

  const onFileChange = async (event: ChangeEvent) => {
    const input = event.target as HTMLInputElement;
    const file = input.files[0];
    if (file.size > TWO_MEGABYTES) {
      setImageError(true);
      return;
    }

    setImageError(false);
    const reader = new FileReader();
    reader.onload = (readerEvent) =>
      setProfileImage(readerEvent.target.result as string);
    reader.readAsDataURL(file);
    try {
      const newUser = await changeProfileImage(file);
      setProfileImage(newUser.image);
    } catch (err) {
      console.error('failed to change profile image', err);
      setProfileImage(user.image);
    }
  };

  return (
    <Container {...props}>
      <ImageAndMetadata>
        <ImageInput title="Update your image">
          <input
            type="file"
            name="profileImage"
            id="profileImage"
            data-testid="profileImage"
            accept="image/png,image/jpeg"
            onChange={onFileChange}
          />
          <img src={profileImage} alt="Your profile image" />
          <ImageInputHover>
            <CameraIcon />
          </ImageInputHover>
        </ImageInput>
        <Metadata>
          {user?.providers[0] === 'google' ? (
            <div>
              <GoogleIcon />
              <span>via Google</span>
            </div>
          ) : (
            <div>
              <GitHubIcon />
              <span>via GitHub</span>
            </div>
          )}
          <JoinedDate date={new Date(user.createdAt)} />
        </Metadata>
      </ImageAndMetadata>
      {imageError && (
        <FormErrorMessage role="alert">
          Maximum image size is 2 MB
        </FormErrorMessage>
      )}
    </Container>
  );
}
