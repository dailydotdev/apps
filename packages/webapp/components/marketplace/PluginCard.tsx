import type { ReactElement } from 'react';
import React from 'react';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  ProfileImageSize,
  ProfilePicture,
} from '@dailydotdev/shared/src/components/ProfilePicture';
import { LinkIcon } from '@dailydotdev/shared/src/components/icons/Link';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import type { Plugin } from '@dailydotdev/shared/src/graphql/plugins';
import { getMarketplacePluginUrl } from '@dailydotdev/shared/src/graphql/plugins';

export const getPluginLinkHost = (url: string): string => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
};

interface PluginCardProps {
  plugin: Plugin;
}

export const PluginCard = ({ plugin }: PluginCardProps): ReactElement => (
  <Link href={getMarketplacePluginUrl(plugin.id)} prefetch={false}>
    <a className="flex flex-col gap-3 rounded-16 border border-border-subtlest-tertiary p-4 hover:bg-surface-hover">
      <div className="flex items-start justify-between gap-2">
        <Typography type={TypographyType.Body} bold className="line-clamp-1">
          {plugin.name}
        </Typography>
        {plugin.hasSkillMd && (
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
            className="shrink-0 rounded-8 bg-surface-float px-2 py-0.5"
          >
            Agent skill
          </Typography>
        )}
      </div>
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Secondary}
        className="line-clamp-3 flex-1"
      >
        {plugin.description}
      </Typography>
      <div className="flex items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-2">
          <ProfilePicture
            user={plugin.author}
            size={ProfileImageSize.XSmall}
            nativeLazyLoading
          />
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
            className="truncate"
          >
            {plugin.author.name}
          </Typography>
        </span>
        {plugin.url && (
          <span className="flex min-w-0 items-center gap-1 text-text-tertiary typo-footnote">
            <LinkIcon size={IconSize.XSmall} className="shrink-0" />
            <span className="truncate">{getPluginLinkHost(plugin.url)}</span>
          </span>
        )}
      </div>
    </a>
  </Link>
);
