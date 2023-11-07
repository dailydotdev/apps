import React, { HTMLProps, ReactElement, useContext, useState } from 'react';
import classNames from 'classnames';
import dynamic from 'next/dynamic';
import AuthContext from '../../contexts/AuthContext';
import { ProfilePicture } from '../ProfilePicture';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';

const ProfileMenu = dynamic(
  () => import(/* webpackChunkName: "profileMenu" */ '../ProfileMenu'),
);

export default function ProfileButton({
  className,
}: HTMLProps<HTMLButtonElement>): ReactElement {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useContext(AuthContext);

  return (
    <>
      <SimpleTooltip placement="left" content="Profile settings">
        <button
          type="button"
          className={classNames(
            'items-center p-0 ml-0.5 font-bold no-underline rounded-lg border-none cursor-pointer text-theme-label-primary bg-theme-bg-secondary typo-callout focus-outline',
            className ?? 'flex',
          )}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span className="hidden laptop:block mr-2 ml-3">
            {user.reputation ?? 0}
          </span>
          <ProfilePicture user={user} size="medium" />
        </button>
      </SimpleTooltip>
      {isMenuOpen && <ProfileMenu />}
    </>
  );
}
