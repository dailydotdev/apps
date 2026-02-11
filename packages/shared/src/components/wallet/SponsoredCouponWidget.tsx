import type { ReactElement } from 'react';
import React, { useCallback } from 'react';
import classNames from 'classnames';
import { useBrandSponsorship } from '../../hooks/useBrandSponsorship';
import {
  Button,
  ButtonVariant,
  ButtonSize,
} from '../buttons/Button';
import {
  Typography,
  TypographyType,
  TypographyColor,
} from '../typography/Typography';
import { ArrowIcon, GiftIcon } from '../icons';
import { IconSize } from '../Icon';
import { useToastNotification } from '../../hooks/useToastNotification';
import { anchorDefaultRel } from '../../lib/strings';

interface SponsoredCouponWidgetProps {
  postTags: string[];
  className?: string;
}

/**
 * SponsoredCouponWidget Component
 *
 * Displays a sponsored coupon in the post modal sidebar when the post
 * has tags that match the active brand sponsorship.
 * Shows "Sponsored Coupon" header with brand discount code.
 */
export const SponsoredCouponWidget = ({
  postTags,
  className,
}: SponsoredCouponWidgetProps): ReactElement | null => {
  const { activeBrand, hasAnySponsoredTag, getCoupons } = useBrandSponsorship();
  const { displayToast } = useToastNotification();

  const hasSponsoredTag = hasAnySponsoredTag(postTags);
  const coupons = getCoupons();
  const coupon = coupons[0]; // Show only the first coupon

  const handleCopyCode = useCallback(async (): Promise<void> => {
    if (!coupon) {
      return;
    }
    try {
      await navigator.clipboard.writeText(coupon.code);
      displayToast('Coupon code copied to clipboard!');
    } catch (error) {
      displayToast('Failed to copy code');
    }
  }, [coupon, displayToast]);

  // Only show if post has sponsored tags and there's an active brand with coupons
  if (!hasSponsoredTag || !activeBrand || !coupon) {
    return null;
  }

  const isExpired = new Date(coupon.expiresAt) < new Date();

  if (isExpired || coupon.isUsed) {
    return null;
  }

  // Extract domain from redeem URL for display
  const redeemDomain = (() => {
    try {
      return new URL(coupon.redeemUrl).hostname.replace('www.', '');
    } catch {
      return 'site';
    }
  })();

  return (
    <div
      className={classNames(
        'flex flex-col gap-4 rounded-16 border p-4',
        className,
      )}
      style={{
        borderColor: `${activeBrand.colors.primary}40`,
        background: `linear-gradient(135deg, ${activeBrand.colors.primary}08 0%, ${activeBrand.colors.secondary}08 100%)`,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
        >
          Sponsored Coupon
        </Typography>
        <GiftIcon
          size={IconSize.XSmall}
          style={{ color: activeBrand.colors.primary }}
        />
      </div>

      {/* Offer description with brand logo */}
      <div className="flex items-start gap-2">
        {activeBrand.logo && (
          <img
            src={activeBrand.logo}
            alt={activeBrand.name}
            className="mt-0.5 size-4 shrink-0 rounded-full object-cover"
          />
        )}
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Primary}
          className="min-w-0 flex-1"
        >
          {coupon.description}
        </Typography>
      </div>

      {/* Clickable coupon code */}
      <button
        type="button"
        onClick={handleCopyCode}
        className="flex cursor-pointer items-center justify-center overflow-hidden rounded-10 border bg-background-subtle px-3 py-2 transition-colors hover:bg-surface-hover"
        style={{ borderColor: `${activeBrand.colors.primary}40` }}
      >
        <Typography
          type={TypographyType.Footnote}
          bold
          className="font-mono tracking-widest"
          style={{ color: activeBrand.colors.primary }}
        >
          {coupon.code}
        </Typography>
      </button>

      {/* Full-width CTA */}
      <Button
        variant={ButtonVariant.Secondary}
        size={ButtonSize.Small}
        tag="a"
        href={coupon.redeemUrl}
        target="_blank"
        rel={anchorDefaultRel}
        className="w-full justify-center"
      >
        Redeem at {redeemDomain}
        <ArrowIcon size={IconSize.XSmall} className="ml-1 rotate-90" />
      </Button>
    </div>
  );
};

export default SponsoredCouponWidget;
