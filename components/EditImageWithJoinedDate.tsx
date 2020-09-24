import React, {
  ChangeEvent,
  HTMLAttributes,
  ReactElement,
  useState,
} from 'react';
import { changeProfileImage, LoggedUser } from '../lib/user';
import CameraIcon from '../icons/camera.svg';
import GoogleIcon from '../icons/google.svg';
import GitHubIcon from '../icons/github.svg';
import JoinedDate from './JoinedDate';
import styled from 'styled-components';
import { size05, size3, size4, size6, sizeN } from '../styles/sizes';
import { colorPepper80 } from '../styles/colors';
import { typoMicro2 } from '../styles/typography';
import { FormErrorMessage } from './utilities';

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
  margin-top: ${size6};
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
  background: ${colorPepper80}66;
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
  border-radius: ${size4};
  cursor: pointer;

  input {
    display: none;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &:hover ${ImageInputHover} {
    visibility: visible;
    opacity: 1;
  }
`;

const Metadata = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: ${size6};
  color: var(--theme-secondary);
  ${typoMicro2}

  div {
    display: flex;
    align-items: center;
    margin: ${size05} 0;
  }

  .icon {
    font-size: ${size4};
    margin-right: ${size3};
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
        <ImageInput title="Change your profile image">
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
        <FormErrorMessage>Maximum image size is 2 MB</FormErrorMessage>
      )}
    </Container>
  );
}
