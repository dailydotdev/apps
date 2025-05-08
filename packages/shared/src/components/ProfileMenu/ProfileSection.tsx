import React from 'react';
import type { ReactElement } from 'react';
import classNames from 'classnames';
import type { WithClassNameProps } from '../utilities';
import { HorizontalSeparator } from '../utilities';
import type { ProfileSectionItemProps } from './ProfileSectionItem';
import { ProfileSectionItem } from './ProfileSectionItem';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';

export type ProfileSectionProps = {
  items: Array<ProfileSectionItemProps>;
  title?: string;
  withSeparator?: boolean;
} & WithClassNameProps;

export const ProfileSection = ({
  items,
  className,
  title,
  withSeparator,
}: ProfileSectionProps): ReactElement => {
  return (
    <>
      <section className={classNames('flex flex-col', className)}>
        {title && (
          <Typography
            bold
            color={TypographyColor.Quaternary}
            type={TypographyType.Footnote}
            className="p-1"
          >
            {title}
          </Typography>
        )}
        {items.map((item) => (
          <ProfileSectionItem
            {...item}
            key={`${item.title.trim().toLowerCase().replace(' ', '-')}`}
          />
        ))}
      </section>

      {withSeparator && <HorizontalSeparator />}
    </>
  );
};
