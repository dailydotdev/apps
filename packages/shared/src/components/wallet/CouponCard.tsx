import type { ReactElement } from 'react';
import React, { useState, useCallback } from 'react';
import classNames from 'classnames';
import type { BrandCoupon, BrandConfig } from '../../lib/brand';
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
import { CheckIcon, CopyIcon, ArrowIcon } from '../icons';
import { IconSize } from '../Icon';
import { useToastNotification } from '../../hooks/useToastNotification';
import { anchorDefaultRel } from '../../lib/strings';

interface CouponCardProps {
  coupon: BrandCoupon;
  brand: Pick<BrandConfig, 'name' | 'logo' | 'colors'>;
  className?: string;
}

/**
 * CouponCard Component
 *
 * Displays a brand coupon with:
 * - Brand logo and name
 * - Discount description
 * - Copy code button
 * - Redeem link to external store
 * - Expiration date
 * - Mark as used option
 */
export const CouponCard = ({
  coupon,
  brand,
  className,
}: CouponCardProps): ReactElement => {
  const [copied, setCopied] = useState(false);
  const { displayToast } = useToastNotification();

  const handleCopyCode = useCallback(async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(coupon.code);
      setCopied(true);
      displayToast('Coupon code copied to clipboard!');

      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      displayToast('Failed to copy code');
    }
  }, [coupon.code, displayToast]);

  const isExpired = new Date(coupon.expiresAt) < new Date();
  const daysUntilExpiry = Math.ceil(
    (new Date(coupon.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );

  const expiryText = isExpired
    ? 'Expired'
    : daysUntilExpiry === 1
      ? 'Expires tomorrow'
      : daysUntilExpiry <= 7
        ? `Expires in ${daysUntilExpiry} days`
        : `Expires ${new Date(coupon.expiresAt).toLocaleDateString()}`;

  return (
    <div
      className={classNames(
        'relative flex flex-col gap-4 rounded-16 border p-4 transition-all',
        {
          'border-border-subtlest-tertiary bg-surface-float': !coupon.isUsed && !isExpired,
          'border-border-subtlest-tertiary bg-surface-float opacity-60':
            coupon.isUsed || isExpired,
        },
        className,
      )}
      style={
        !coupon.isUsed && !isExpired && brand.colors
          ? {
              borderColor: `${brand.colors.primary}40`,
              background: `linear-gradient(135deg, ${brand.colors.primary}08 0%, ${brand.colors.secondary}08 100%)`,
            }
          : undefined
      }
    >
      {/* Header: Brand info */}
      <div className="flex items-center gap-3">
        {brand.logo && (
          <img
            src={brand.logo}
            alt={brand.name}
            className="size-10 rounded-full object-cover"
            style={
              brand.colors
                ? { boxShadow: `0 0 12px ${brand.colors.primary}40` }
                : undefined
            }
          />
        )}
        <div className="flex flex-1 flex-col">
          <Typography type={TypographyType.Callout} bold>
            {brand.name}
          </Typography>
          <div className="flex items-center gap-1">
            <Typography
              type={TypographyType.Footnote}
              color={
                isExpired
                  ? TypographyColor.StatusError
                  : daysUntilExpiry <= 7
                    ? TypographyColor.StatusWarning
                    : TypographyColor.Tertiary
              }
            >
              {expiryText}
            </Typography>
            {coupon.termsUrl && (
              <>
                <span className="text-text-quaternary">·</span>
                <a
                  href={coupon.termsUrl}
                  target="_blank"
                  rel={anchorDefaultRel}
                  className="typo-footnote text-text-quaternary underline hover:text-text-tertiary"
                >
                  Terms
                </a>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      <Typography type={TypographyType.Body} className="text-text-secondary">
        {coupon.description}
      </Typography>

      {/* Code section */}
      <div className="flex items-center gap-2">
        <div
          className="flex flex-1 items-center justify-center rounded-10 border border-dashed border-border-subtlest-secondary bg-background-subtle px-4 py-2"
          style={
            brand.colors
              ? { borderColor: `${brand.colors.primary}60` }
              : undefined
          }
        >
          <Typography
            type={TypographyType.Title3}
            bold
            className="font-mono tracking-wider"
            style={brand.colors ? { color: brand.colors.primary } : undefined}
          >
            {coupon.code}
          </Typography>
        </div>
        <Button
          variant={ButtonVariant.Secondary}
          size={ButtonSize.Medium}
          onClick={handleCopyCode}
          disabled={coupon.isUsed || isExpired}
          icon={
            copied ? (
              <CheckIcon size={IconSize.Small} />
            ) : (
              <CopyIcon size={IconSize.Small} />
            )
          }
          className={classNames({
            '!bg-status-success !text-white': copied,
          })}
        >
          {copied ? 'Copied!' : 'Copy'}
        </Button>
      </div>

      {/* Actions */}
      <Button
        variant={ButtonVariant.Primary}
        size={ButtonSize.Medium}
        tag="a"
        href={coupon.redeemUrl}
        target="_blank"
        rel={anchorDefaultRel}
        disabled={coupon.isUsed || isExpired}
        className="w-full"
        style={
          brand.colors && !coupon.isUsed && !isExpired
            ? { backgroundColor: brand.colors.primary }
            : undefined
        }
      >
        Redeem on site
        <ArrowIcon size={IconSize.Small} className="ml-1 rotate-90" />
      </Button>
    </div>
  );
};

export default CouponCard;
