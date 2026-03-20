import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import type { SidebarMenuItem } from '../common';
import { Section } from '../Section';
import { webappUrl } from '../../../lib/constants';
import type { SidebarSectionProps } from './common';
import { HashtagIcon } from '../../icons';
import { useBrandSponsorship } from '../../../hooks/useBrandSponsorship';

// Mock trending tags data - in production this would come from an API
const TRENDING_TAGS = ['ai', 'webdev', 'react', 'typescript', 'devops'];

export const TrendingTagsSection = ({
  isItemsButton,
  ...defaultRenderSectionProps
}: SidebarSectionProps): ReactElement => {
  const { getSponsoredTag } = useBrandSponsorship();

  const menuItems: SidebarMenuItem[] = useMemo(() => {
    return TRENDING_TAGS.map((tag) => {
      const tagPath = `${webappUrl}tags/${tag}`;
      const sponsorInfo = getSponsoredTag(tag);

      return {
        icon: (active: boolean) => (
          <HashtagIcon secondary={active} className="size-5" />
        ),
        title: tag,
        path: tagPath,
        rightIcon: sponsorInfo.isSponsored
          ? () => (
              <span className="flex items-center gap-1 text-text-quaternary typo-caption2">
                {sponsorInfo.brandLogo && (
                  <img
                    src={sponsorInfo.brandLogo}
                    alt={sponsorInfo.brandName}
                    className="size-3.5 rounded-full"
                  />
                )}
                <span className="truncate">
                  by {sponsorInfo.brandName?.split(' ')[0]}
                </span>
              </span>
            )
          : undefined,
      };
    });
  }, [getSponsoredTag]);

  return (
    <Section
      {...defaultRenderSectionProps}
      items={menuItems}
      isItemsButton={isItemsButton}
      className="hidden laptop:block"
    />
  );
};
