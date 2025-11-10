import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Post } from '../../../graphql/posts';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';
import SocialIconButton from './SocialIconButton';
import { socials } from '../../../lib/socialMedia';

type SocialBarProps = {
  post: Post;
  className?: string;
};

const SocialBar = ({ post, className }: SocialBarProps): ReactElement => {
  return (
    <aside
      className={classNames(
        'rounded-16 border-border-subtlest-tertiary tablet:flex-row flex flex-col items-center justify-between gap-2 border px-4 py-3',
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
          <SocialIconButton key={social} post={post} platform={social} />
        ))}
      </div>
    </aside>
  );
};

export default SocialBar;
