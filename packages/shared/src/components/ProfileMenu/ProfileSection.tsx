import React from 'react';
import type { ReactElement } from 'react';
import classNames from 'classnames';
import type { WithClassNameProps } from '../utilities/common';
import { HorizontalSeparator } from '../utilities/common';
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
  // Forwarded to every row; v2 reveals external-link icons on hover only.
  linkIconHoverOnly?: boolean;
} & WithClassNameProps;

export const ProfileSection = ({
  items,
  className,
  title,
  withSeparator,
  linkIconHoverOnly,
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
            linkIconHoverOnly={item.linkIconHoverOnly ?? linkIconHoverOnly}
            key={`${item.title.trim().toLowerCase().replace(' ', '-')}`}
          />
        ))}
      </section>

      {withSeparator && <HorizontalSeparator />}
    </>
  );
};
