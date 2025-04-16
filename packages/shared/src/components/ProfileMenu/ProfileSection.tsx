import React from 'react';
import type { ReactElement } from 'react';
import classNames from 'classnames';
import type { WithClassNameProps } from '../utilities';
import type { ProfileSectionItemProps } from './ProfileSectionItem';
import { ProfileSectionItem } from './ProfileSectionItem';

export type ProfileSectionProps = {
  items: Array<ProfileSectionItemProps>;
} & WithClassNameProps;

export const ProfileSection = ({
  items,
  className,
}: ProfileSectionProps): ReactElement => {
  return (
    <section className={classNames('flex flex-col', className)}>
      {items.map((item) => (
        <ProfileSectionItem
          {...item}
          key={`${item.title.trim().toLowerCase().replace(' ', '-')}`}
        />
      ))}
    </section>
  );
};
