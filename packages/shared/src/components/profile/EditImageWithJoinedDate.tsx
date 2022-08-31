import React, {
  ChangeEvent,
  HTMLAttributes,
  ReactElement,
  useState,
} from 'react';
import classNames from 'classnames';
import { changeProfileImage, LoggedUser } from '../../lib/user';
import CameraIcon from '../icons/Camera';
import GoogleIcon from '../../../icons/google.svg';
import GitHubIcon from '../icons/GitHub';
import JoinedDate from './JoinedDate';
import { FormErrorMessage } from '../utilities';
import classed from '../../lib/classed';
import { ProfilePicture } from '../ProfilePicture';

export interface EditImageWithJoinedDateProps
  extends HTMLAttributes<HTMLDivElement> {
  user: LoggedUser;
}

const Provider = classed('div', 'flex items-center my-0.5');
const providerIconClass = 'icon text-base mr-3';
const providerIconStyles = { width: 'auto', height: 'auto' };

const TWO_MEGABYTES = 2 * 1024 * 1024;

export default function EditImageWithJoinedDate({
  user,
  className,
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
      // eslint-disable-next-line no-console
      console.error('failed to change profile image', err);
      setProfileImage(user.image);
    }
  };

  return (
    <div className={classNames(className, 'flex flex-col')} {...props}>
      <div className="flex items-center mt-6">
        <label
          className="group overflow-hidden relative w-24 h-24 rounded-2xl cursor-pointer"
          title="Update your image"
          htmlFor="profileImage"
        >
          <input
            type="file"
            name="profileImage"
            id="profileImage"
            data-testid="profileImage"
            accept="image/png,image/jpeg"
            onChange={onFileChange}
            className="hidden"
          />
          <ProfilePicture
            user={{ image: profileImage, username: user.username }}
            size="xxxlarge"
            className="group-hover:opacity-40 transition-opacity"
          />
          <span
            className="flex absolute top-0 left-0 invisible group-hover:visible justify-center items-center w-full h-full opacity-0 group-hover:opacity-100"
            style={{ transition: 'opacity 0.1s linear' }}
          >
            <CameraIcon size="xlarge" />
          </span>
        </label>
        <div className="flex flex-col ml-6 text-theme-label-quaternary typo-caption1">
          {user?.providers[0] === 'google' ? (
            <Provider>
              <GoogleIcon
                style={providerIconStyles}
                className={providerIconClass}
              />
              <span>via Google</span>
            </Provider>
          ) : (
            <Provider>
              <GitHubIcon
                secondary
                style={providerIconStyles}
                className={providerIconClass}
              />
              <span>via GitHub</span>
            </Provider>
          )}
          <JoinedDate date={new Date(user.createdAt)} />
        </div>
      </div>
      {imageError && (
        <FormErrorMessage role="alert">
          Maximum image size is 2 MB
        </FormErrorMessage>
      )}
    </div>
  );
}
