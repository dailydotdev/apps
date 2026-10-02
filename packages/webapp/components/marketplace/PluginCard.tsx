import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
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
import { PlusUserBadge } from '@dailydotdev/shared/src/components/PlusUserBadge';
import { ReputationUserBadge } from '@dailydotdev/shared/src/components/ReputationUserBadge';
import { VerifiedCompanyUserBadge } from '@dailydotdev/shared/src/components/VerifiedCompanyUserBadge';
import type { Plugin } from '@dailydotdev/shared/src/graphql/plugins';
import { getMarketplacePluginUrl } from '@dailydotdev/shared/src/graphql/plugins';

export const getPluginLinkHost = (url: string): string => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
};

const PluginLabel = ({
  className,
  children,
}: {
  className: string;
  children: ReactNode;
}): ReactElement => (
  <Typography
    type={TypographyType.Caption1}
    bold
    className={classNames('rounded-8 px-2 py-0.5', className)}
  >
    {children}
  </Typography>
);

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
        <span className="flex shrink-0 gap-1">
          <PluginLabel className="bg-accent-cabbage-flat text-accent-cabbage-default">
            Plugin
          </PluginLabel>
          {plugin.hasSkillMd && (
            <PluginLabel className="bg-accent-avocado-flat text-accent-avocado-default">
              Agent skill
            </PluginLabel>
          )}
        </span>
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
          <PlusUserBadge
            user={plugin.author}
            size={IconSize.XSmall}
            tooltip={false}
          />
          <ReputationUserBadge user={plugin.author} />
          {!!plugin.author.companies?.length && (
            <VerifiedCompanyUserBadge user={plugin.author} />
          )}
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
