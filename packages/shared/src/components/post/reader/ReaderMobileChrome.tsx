import type { ReactElement } from 'react';
import React, { useContext, useMemo } from 'react';
import classNames from 'classnames';
import type { Post } from '../../../graphql/posts';
import { getPostReadTarget } from '../../../graphql/posts';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { MiniCloseIcon as CloseIcon, RefreshIcon } from '../../icons';
import { apiUrl } from '../../../lib/config';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../typography/Typography';
import SettingsContext from '../../../contexts/SettingsContext';

type ReaderMobileChromeProps = {
  post: Post;
  onClose: () => void;
  onRefresh: () => void;
  /** Distance from layout top to the bottom sheet’s top edge (px). Anchors chrome just above the sheet. */
  sheetTopPx: number;
  isHidden?: boolean;
  className?: string;
  isPostPage?: boolean;
};

const isInternalDailyHost = (host: string | null): boolean =>
  !!host &&
  (host.toLowerCase() === 'daily.dev' ||
    host.toLowerCase().endsWith('.daily.dev'));

export function ReaderMobileChrome({
  post,
  onClose,
  onRefresh,
  sheetTopPx,
  isHidden = false,
  className,
  isPostPage = false,
}: ReaderMobileChromeProps): ReactElement {
  const { target: readTarget } = getPostReadTarget(post);
  const { openNewTab } = useContext(SettingsContext);
  const readHref = readTarget?.permalink ?? post.permalink;

  const sourceDomain = useMemo((): string => {
    const normalizedReadTargetDomain = readTarget?.domain?.trim();
    if (
      normalizedReadTargetDomain &&
      !isInternalDailyHost(normalizedReadTargetDomain)
    ) {
      return normalizedReadTargetDomain;
    }
    const normalizedPostDomain = post.domain?.trim();
    if (normalizedPostDomain && !isInternalDailyHost(normalizedPostDomain)) {
      return normalizedPostDomain;
    }
    return '';
  }, [readTarget?.domain, post.domain]);

  const sourceLabel = sourceDomain || 'source';
  const faviconSrc = useMemo(() => {
    const pixelRatio = globalThis?.window?.devicePixelRatio ?? 1;
    const iconSize = Math.max(Math.round(16 * pixelRatio), 96);
    const host = sourceDomain.length > 0 ? sourceDomain : 'source';
    return `${apiUrl}/icon?url=${encodeURIComponent(host)}&size=${iconSize}`;
  }, [sourceDomain]);

  const iconButtonClassName = '!h-8 !w-8 !min-w-8 !rounded-10 !p-0';
  const chromeGroupClasses =
    'pointer-events-auto flex h-9 items-center gap-px rounded-12 border border-border-subtlest-tertiary bg-background-default/85 p-px shadow-3 backdrop-blur-md backdrop-saturate-150';

  return (
    <div
      className={classNames(
        'z-40 pointer-events-none absolute inset-x-3 transition-opacity duration-300 ease-in-out',
        isHidden ? 'pointer-events-none opacity-0' : 'opacity-100',
        className,
      )}
      style={{
        top: sheetTopPx,
        transform: 'translateY(calc(-100% - 0.5rem))',
      }}
      role="banner"
    >
      <div className="flex items-center justify-between gap-2">
        {isPostPage ? (
          <span aria-hidden />
        ) : (
          <div className={chromeGroupClasses} aria-label="Close reader">
            <Button
              variant={ButtonVariant.Tertiary}
              icon={<CloseIcon />}
              size={ButtonSize.Small}
              type="button"
              className={iconButtonClassName}
              onClick={onClose}
              aria-label="Close reader"
            />
          </div>
        )}

        {readHref ? (
          <a
            className={classNames(
              chromeGroupClasses,
              'h-7 min-w-0 max-w-[14rem] flex-1 gap-1 px-2 hover:border-border-subtlest-secondary',
            )}
            aria-label={`Read on ${sourceLabel}`}
            href={readHref}
            target={openNewTab ? '_blank' : '_self'}
            rel={openNewTab ? 'noopener noreferrer' : undefined}
          >
            <img
              src={faviconSrc}
              alt=""
              className="size-4 shrink-0 rounded-4"
              loading="lazy"
              aria-hidden
            />
            <Typography
              tag={TypographyTag.Span}
              type={TypographyType.Caption2}
              color={TypographyColor.Tertiary}
              className="min-w-0 flex-1 truncate text-center"
              title={sourceLabel}
            >
              {sourceLabel}
            </Typography>
          </a>
        ) : (
          <div
            className={classNames(
              chromeGroupClasses,
              'h-7 min-w-0 max-w-[14rem] flex-1 gap-1 px-2',
            )}
            aria-label="Article source"
          >
            <img
              src={faviconSrc}
              alt=""
              className="size-4 shrink-0 rounded-4"
              loading="lazy"
              aria-hidden
            />
            <Typography
              tag={TypographyTag.Span}
              type={TypographyType.Caption2}
              color={TypographyColor.Tertiary}
              className="min-w-0 flex-1 truncate text-center"
              title={sourceLabel}
            >
              {sourceLabel}
            </Typography>
          </div>
        )}

        <div className={chromeGroupClasses} aria-label="Article view controls">
          <Button
            icon={<RefreshIcon />}
            size={ButtonSize.Small}
            variant={ButtonVariant.Tertiary}
            type="button"
            className={iconButtonClassName}
            onClick={onRefresh}
            aria-label="Refresh article"
          />
        </div>
      </div>
    </div>
  );
}
