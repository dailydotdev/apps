import { cloudinaryStreakMigrate } from '../../../lib/image';
import { migrateUserToStreaks } from '../../../lib/constants';
import type { MarketingCta } from '../../marketingCta/common';
import { MarketingCtaVariant } from '../../marketingCta/common';

export const promotion: Record<string, MarketingCta> = {
  migrateStreaks: {
    campaignId: 'streaks migration',
    createdAt: new Date(2024, 3, 19),
    variant: MarketingCtaVariant.Popover,
    flags: {
      title: 'Goodbye weekly goals,\nWelcome reading streaks!',
      description:
        'Unlock the magic of consistently learning with our new reading streaks system',
      image: cloudinaryStreakMigrate,
      ctaText: 'Tell me more',
      ctaUrl: migrateUserToStreaks,
      tagColor: 'avocado',
      tagText: 'New Release',
    },
  },
};
