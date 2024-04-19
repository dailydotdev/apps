import { cloudinary } from '../../../lib/image';
import { rebrandly } from '../../../lib/constants';
import {
  MarketingCta,
  MarketingCtaVariant,
} from '../../cards/MarketingCta/common';

export const promotion: Record<string, MarketingCta> = {
  migrateStreaks: {
    campaignId: 'bookmarks on mobile',
    createdAt: new Date(2024, 3, 19),
    variant: MarketingCtaVariant.Popover,
    flags: {
      title: 'Goodbye weekly goals,\nWelcome reading streaks!',
      description:
        'Unlock the magic of consistently learning with our new reading streaks system',
      image: cloudinary.streak.migrate,
      ctaText: 'Install the app',
      ctaUrl: rebrandly.migrateUserToStreaks,
      tagColor: 'avocado',
      tagText: 'New Release',
    },
  },
  bookmarkPromoteMobile: {
    campaignId: 'streaks migration',
    createdAt: new Date(2024, 3, 19),
    variant: MarketingCtaVariant.Popover,
    flags: {
      title: 'Get back to your bookmarks on the go',
      description:
        'Your saved posts are waiting for you on daily.dev mobile. Perfect for reading anytime, anywhere.',
      image: cloudinary.promotions.bookmarkLoops,
      ctaText: 'Install the app',
      ctaUrl: rebrandly.bookmarkLoops,
      tagColor: 'cabbage',
      tagText: 'Mobile version',
    },
  },
};
