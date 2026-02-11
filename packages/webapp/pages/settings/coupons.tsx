import type { ReactElement } from 'react';
import React, { useEffect, useMemo, useState } from 'react';
import type { NextSeoProps } from 'next-seo';
import { useRouter } from 'next/router';
import { SearchField } from '@dailydotdev/shared/src/components/fields/SearchField';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  GiftIcon,
  LinkIcon,
  StarIcon,
} from '@dailydotdev/shared/src/components/icons';
import { useToastNotification } from '@dailydotdev/shared/src/hooks/useToastNotification';
import classNames from 'classnames';
import { Modal } from '@dailydotdev/shared/src/components/modals/common/Modal';
import { ModalSize } from '@dailydotdev/shared/src/components/modals/common/types';
import { settingsUrl } from '@dailydotdev/shared/src/lib/constants';
import { AccountPageContainer } from '../../components/layouts/SettingsLayout/AccountPageContainer';
import { getSettingsLayout } from '../../components/layouts/SettingsLayout';
import { defaultSeo } from '../../next-seo';
import { getTemplatedTitle } from '../../components/layouts/utils';

const seo: NextSeoProps = {
  ...defaultSeo,
  title: getTemplatedTitle('Coupons'),
};

// TODO: Re-enable when ready - page is temporarily hidden
const COUPONS_PAGE_ENABLED = false;

interface Coupon {
  id: string;
  company: string;
  logo: string;
  title: string;
  description: string;
  code: string;
  discount: string;
  expiresAt: string;
  category: string;
  redeemUrl: string;
}

// Mock coupon data - in production this would come from an API
const mockCoupons: Coupon[] = [
  {
    id: '1',
    company: 'GitHub',
    logo: 'https://github.githubassets.com/favicons/favicon.svg',
    title: '50% off GitHub Copilot',
    description: 'Get 50% off your first year of GitHub Copilot Individual.',
    code: 'DAILYDEV50',
    discount: '50%',
    expiresAt: '2026-12-31',
    category: 'Developer Tools',
    redeemUrl: 'https://github.com/features/copilot',
  },
  {
    id: '2',
    company: 'JetBrains',
    logo: 'https://resources.jetbrains.com/storage/products/company/brand/logos/jb_beam.svg',
    title: '25% off All IDEs',
    description:
      'Exclusive discount on all JetBrains IDEs for daily.dev community members.',
    code: 'DAILYDEV25',
    discount: '25%',
    expiresAt: '2026-06-30',
    category: 'Developer Tools',
    redeemUrl: 'https://www.jetbrains.com/',
  },
  {
    id: '3',
    company: 'Vercel',
    logo: 'https://assets.vercel.com/image/upload/front/favicon/vercel/favicon.ico',
    title: 'Free Pro Plan for 3 Months',
    description: 'Try Vercel Pro free for 3 months with all premium features.',
    code: 'DAILYDEVPRO',
    discount: '3 months free',
    expiresAt: '2026-09-30',
    category: 'Hosting',
    redeemUrl: 'https://vercel.com/',
  },
  {
    id: '4',
    company: 'Notion',
    logo: 'https://www.notion.so/images/favicon.ico',
    title: '20% off Plus Plan',
    description:
      'Upgrade to Notion Plus with 20% discount for the first year.',
    code: 'DAILYNOTION',
    discount: '20%',
    expiresAt: '2026-08-15',
    category: 'Productivity',
    redeemUrl: 'https://www.notion.so/',
  },
  {
    id: '5',
    company: 'Figma',
    logo: 'https://static.figma.com/app/icon/1/favicon.ico',
    title: '30% off Professional Plan',
    description: 'Design better with Figma Professional at 30% off.',
    code: 'DAILYFIGMA30',
    discount: '30%',
    expiresAt: '2026-10-31',
    category: 'Design',
    redeemUrl: 'https://www.figma.com/',
  },
  {
    id: '6',
    company: 'Linear',
    logo: 'https://linear.app/favicon.ico',
    title: 'Free Plus Plan for 6 Months',
    description: 'Streamline your workflow with Linear Plus, free for 6 months.',
    code: 'DAILYLINEAR6',
    discount: '6 months free',
    expiresAt: '2026-11-30',
    category: 'Productivity',
    redeemUrl: 'https://linear.app/',
  },
];

const FAVORITES_STORAGE_KEY = 'dailydev_coupon_favorites';

const getFavoritesFromStorage = (): string[] => {
  if (typeof window === 'undefined') {
    return [];
  }
  const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

const saveFavoritesToStorage = (favorites: string[]): void => {
  localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
};

interface CouponCardProps {
  coupon: Coupon;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

const CouponCard = ({
  coupon,
  isFavorite,
  onToggleFavorite,
}: CouponCardProps): ReactElement => {
  const { displayToast } = useToastNotification();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(coupon.code);
    displayToast('Coupon code copied to clipboard!');
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(coupon.id);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <button
        type="button"
        className="flex cursor-pointer flex-col gap-3 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4 text-left transition-colors hover:border-border-subtlest-secondary"
        onClick={() => setIsModalOpen(true)}
      >
        <div className="flex w-full items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src={coupon.logo}
              alt={coupon.company}
              className="size-10 rounded-8 bg-background-default object-contain p-1"
            />
            <div>
              <Typography
                tag={TypographyTag.H3}
                type={TypographyType.Callout}
                bold
              >
                {coupon.company}
              </Typography>
              <Typography
                type={TypographyType.Footnote}
                color={TypographyColor.Tertiary}
              >
                {coupon.category}
              </Typography>
            </div>
          </div>
          <Button
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            icon={
              <StarIcon
                secondary={isFavorite}
                className={classNames(
                  isFavorite && 'text-accent-cheese-default',
                )}
              />
            }
            onClick={handleFavoriteClick}
            aria-label={
              isFavorite ? 'Remove from favorites' : 'Add to favorites'
            }
          />
        </div>

        <div>
          <Typography type={TypographyType.Body} bold>
            {coupon.title}
          </Typography>
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Secondary}
            className="mt-1"
          >
            {coupon.description}
          </Typography>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-8 bg-accent-avocado-default px-2 py-1 font-bold text-raw-pepper-90 typo-footnote">
            {coupon.discount}
          </span>
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            Expires: {new Date(coupon.expiresAt).toLocaleDateString()}
          </Typography>
        </div>
      </button>

      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onRequestClose={handleCloseModal}
          size={ModalSize.Small}
          shouldCloseOnOverlayClick
        >
          <Modal.Header title={coupon.company} />
          <Modal.Body className="flex flex-col gap-4 p-6">
            <div className="flex items-center gap-3">
              <img
                src={coupon.logo}
                alt={coupon.company}
                className="size-12 rounded-8 bg-surface-float object-contain p-1"
              />
              <div>
                <Typography type={TypographyType.Title3} bold>
                  {coupon.title}
                </Typography>
                <Typography
                  type={TypographyType.Callout}
                  color={TypographyColor.Tertiary}
                >
                  {coupon.category}
                </Typography>
              </div>
            </div>

            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Secondary}
            >
              {coupon.description}
            </Typography>

            <div>
              <Typography
                type={TypographyType.Footnote}
                color={TypographyColor.Tertiary}
                className="mb-2"
              >
                Your coupon code
              </Typography>
              <div className="flex items-center gap-2 rounded-10 bg-surface-float p-3">
                <code className="flex-1 font-mono font-bold text-text-primary typo-body">
                  {coupon.code}
                </code>
                <Button
                  variant={ButtonVariant.Secondary}
                  size={ButtonSize.Small}
                  onClick={handleCopyCode}
                >
                  Copy
                </Button>
              </div>
            </div>

            <div>
              <Typography
                type={TypographyType.Footnote}
                color={TypographyColor.Tertiary}
                className="mb-2"
              >
                How to redeem
              </Typography>
              <ol className="list-inside list-decimal space-y-1 text-text-secondary typo-callout">
                <li>Copy the coupon code above</li>
                <li>Visit {coupon.company}&apos;s website</li>
                <li>Apply the code at checkout</li>
              </ol>
            </div>

            <div className="flex items-center gap-2 text-text-tertiary typo-footnote">
              <span className="rounded-8 bg-accent-avocado-default px-2 py-1 font-bold text-raw-pepper-90">
                {coupon.discount}
              </span>
              <span>Expires: {new Date(coupon.expiresAt).toLocaleDateString()}</span>
            </div>

            <Button
              variant={ButtonVariant.Primary}
              size={ButtonSize.Large}
              icon={<LinkIcon size={IconSize.Small} />}
              onClick={() => {
                handleCopyCode();
                window.open(coupon.redeemUrl, '_blank');
              }}
              className="w-full"
            >
              Visit {coupon.company}
            </Button>
          </Modal.Body>
        </Modal>
      )}
    </>
  );
};

const CouponsPage = (): ReactElement => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>(getFavoritesFromStorage);

  // TODO: Re-enable when ready - redirect if page is disabled
  useEffect(() => {
    if (!COUPONS_PAGE_ENABLED) {
      router.replace(settingsUrl);
    }
  }, [router]);

  if (!COUPONS_PAGE_ENABLED) {
    return null;
  }

  const handleToggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const newFavorites = prev.includes(id)
        ? prev.filter((fav) => fav !== id)
        : [...prev, id];
      saveFavoritesToStorage(newFavorites);
      return newFavorites;
    });
  };

  const filteredAndSortedCoupons = useMemo(() => {
    const filtered = mockCoupons.filter((coupon) => {
      const query = searchQuery.toLowerCase();
      return (
        coupon.company.toLowerCase().includes(query) ||
        coupon.title.toLowerCase().includes(query) ||
        coupon.description.toLowerCase().includes(query) ||
        coupon.category.toLowerCase().includes(query)
      );
    });

    // Sort favorites to the top
    return filtered.sort((a, b) => {
      const aFav = favorites.includes(a.id);
      const bFav = favorites.includes(b.id);
      if (aFav && !bFav) {
        return -1;
      }
      if (!aFav && bFav) {
        return 1;
      }
      return 0;
    });
  }, [searchQuery, favorites]);

  const favoriteCount = favorites.length;

  return (
    <AccountPageContainer title="Coupons">
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <GiftIcon size={IconSize.Large} className="text-accent-bacon-default" />
          <div>
            <Typography type={TypographyType.Body} bold>
              Exclusive deals for the daily.dev community
            </Typography>
            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Tertiary}
            >
              Save on your favorite developer tools and services
            </Typography>
          </div>
        </div>

        <SearchField
          inputId="coupon-search"
          placeholder="Search coupons by company, category, or description..."
          valueChanged={setSearchQuery}
        />

        {favoriteCount > 0 && (
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Secondary}
            className="flex items-center gap-1"
          >
            <StarIcon size={IconSize.XSmall} secondary className="text-accent-cheese-default" />
            {favoriteCount} favorite{favoriteCount !== 1 ? 's' : ''} pinned to top
          </Typography>
        )}
      </div>

      {filteredAndSortedCoupons.length === 0 ? (
        <div className="mt-16 flex flex-col items-center text-text-secondary">
          <GiftIcon size={IconSize.XXXLarge} />
          <Typography type={TypographyType.Body} className="mt-2">
            {searchQuery
              ? 'No coupons match your search'
              : 'No coupons available at the moment'}
          </Typography>
        </div>
      ) : (
        <div className="grid gap-4 tablet:grid-cols-2">
          {filteredAndSortedCoupons.map((coupon) => (
            <CouponCard
              key={coupon.id}
              coupon={coupon}
              isFavorite={favorites.includes(coupon.id)}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
      )}
    </AccountPageContainer>
  );
};

CouponsPage.getLayout = getSettingsLayout;
CouponsPage.layoutProps = { seo };

export default CouponsPage;
