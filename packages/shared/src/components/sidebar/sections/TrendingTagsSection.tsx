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
  const { activeBrand, isTagSponsored } = useBrandSponsorship();

  const menuItems: SidebarMenuItem[] = useMemo(() => {
    return TRENDING_TAGS.map((tag) => {
      const tagPath = `${webappUrl}tags/${tag}`;
      const isSponsored = isTagSponsored(tag);

      return {
        icon: (active: boolean) => (
          <HashtagIcon secondary={active} className="size-5" />
        ),
        title: tag,
        path: tagPath,
        rightIcon:
          isSponsored && activeBrand
            ? () => (
                <span className="flex items-center gap-1 typo-caption2 text-text-quaternary">
                  {activeBrand.logo && (
                    <img
                      src={activeBrand.logo}
                      alt={activeBrand.name}
                      className="size-3.5 rounded-full"
                    />
                  )}
                  <span className="truncate">by {activeBrand.name.split(' ')[0]}</span>
                </span>
              )
            : undefined,
      };
    });
  }, [activeBrand, isTagSponsored]);

  return (
    <Section
      {...defaultRenderSectionProps}
      items={menuItems}
      isItemsButton={isItemsButton}
      className="hidden laptop:block"
    />
  );
};
