import React from 'react';
import type { ReactElement } from 'react';

import {
  contentGuidelines,
  privacyPolicy,
  termsOfService,
} from '../../lib/constants';
import { anchorDefaultRel } from '../../lib/strings';
import Logo from '../Logo';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';

const items = {
  terms: {
    title: 'Terms',
    href: termsOfService,
  },
  privacy: {
    title: 'Privacy',
    href: privacyPolicy,
  },
  guidelines: {
    title: 'Guidelines',
    href: contentGuidelines,
  },
};

export const ProfileMenuFooter = (): ReactElement => {
  return (
    <div className="flex gap-2">
      {Object.entries(items).map(([key, { title, href }]) => (
        <Typography
          key={`profile-menu-footer-${key}`}
          tag={TypographyTag.Link}
          color={TypographyColor.Quaternary}
          type={TypographyType.Footnote}
          href={href}
          target="_blank"
          rel={anchorDefaultRel}
        >
          {title}
        </Typography>
      ))}

      <Logo
        className="ml-auto"
        logoClassName={{
          container: 'size-5',
        }}
        compact
      />
    </div>
  );
};
