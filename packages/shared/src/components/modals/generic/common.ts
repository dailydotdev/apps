import type { PromotionProps } from './GenericPromotionalModal';
import { cloudinary } from '../../../lib/image';
import { dailyDevApps, migrateUserToStreaks } from '../../../lib/constants';

export const promotion: Record<string, PromotionProps> = {
  migrateStreaks: {
    title: 'Goodbye weekly goals,\nWelcome reading streaks!',
    description:
      'Unlock the magic of consistently learning with our new reading streaks system',
    pill: {
      copy: 'New Release',
      className: 'bg-theme-overlay-float-avocado text-status-success',
    },
    image: cloudinary.streak.migrate,
    cta: { copy: 'Tell me more', link: migrateUserToStreaks },
  },
  bookmarkPromoteMobile: {
    pill: { copy: 'Mobile version' },
    title: 'Get back to your bookmarks on the go',
    description:
      'Your saved posts are waiting for you on daily.dev mobile. Perfect for reading anytime, anywhere.',
    image: '',
    cta: { copy: 'Install the app', link: dailyDevApps },
  },
};
