import React, {
  ChangeEvent,
  HTMLAttributes,
  ReactElement,
  useState,
} from 'react';
import { changeProfileImage, LoggedUser } from '../../lib/user';
import CameraIcon from '../../../icons/camera.svg';
import GoogleIcon from '../../../icons/google.svg';
import GitHubIcon from '../../../icons/github.svg';
import JoinedDate from './JoinedDate';
import { FormErrorMessage } from '../utilities';
import classNames from 'classnames';
import sizeN from '../../../macros/sizeN.macro';
import classed from '../../lib/classed';

export interface EditImageWithJoinedDateProps
  extends HTMLAttributes<HTMLDivElement> {
  user: LoggedUser;
}

const Provider = classed('div', 'flex items-center my-0.5');
const providerIconClass = 'icon text-base mr-3';

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
      console.error('failed to change profile image', err);
      setProfileImage(user.image);
    }
  };

  return (
    <div className={classNames(className, 'flex flex-col')} {...props}>
      <div className="flex mt-6 items-center">
        <label
          className="relative overflow-hidden rounded-2xl cursor-pointer group"
          style={{ width: '6.25rem', height: '6.25rem' }}
          title="Update your image"
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
          <img
            className="w-full h-full object-cover group-hover:opacity-40"
            style={{ transition: 'opacity 0.1s linear' }}
            src={profileImage}
            alt="Your profile image"
          />
          <span
            className="absolute flex invisible left-0 top-0 w-full h-full items-center justify-center opacity-0 group-hover:visible group-hover:opacity-100"
            style={{ transition: 'opacity 0.1s linear' }}
          >
            <CameraIcon style={{ fontSize: sizeN(11) }} />
          </span>
        </label>
        <div className="flex flex-col ml-6 text-theme-label-quaternary typo-caption1">
          {user?.providers[0] === 'google' ? (
            <Provider>
              <GoogleIcon className={providerIconClass} />
              <span>via Google</span>
            </Provider>
          ) : (
            <Provider>
              <GitHubIcon className={providerIconClass} />
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
