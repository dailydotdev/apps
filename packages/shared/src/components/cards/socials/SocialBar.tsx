import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Post } from '../../../graphql/posts';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';
import SocialShareButton from './SocialShareButton';
import { socials } from '../../../lib/socialMedia';

type SocialBarProps = {
  post: Post;
  className?: string;
};

const SocialBar = ({ post, className }: SocialBarProps): ReactElement => {
  return (
    <aside
      className={classNames(
        'flex flex-col items-center justify-between gap-2 rounded-16 border border-border-subtlest-tertiary px-4 py-3 tablet:flex-row',
        className,
      )}
    >
      <Typography
        color={TypographyColor.Tertiary}
        type={TypographyType.Callout}
        bold
      >
        Why not share it on social, too?
      </Typography>
      <div className="flex flex-row items-center gap-2">
        {socials.map((social) => (
          <SocialShareButton key={social} post={post} platform={social} />
        ))}
      </div>
    </aside>
  );
};

export default SocialBar;
