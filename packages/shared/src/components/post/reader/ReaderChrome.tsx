import type { ReactElement } from 'react';
import React, { useContext, useMemo } from 'react';
import classNames from 'classnames';
import { getPostReadTarget } from '../../../graphql/posts';
import type { Post } from '../../../graphql/posts';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import {
  MiniCloseIcon as CloseIcon,
  RefreshIcon,
  SidebarArrowRight,
} from '../../icons';
import { Tooltip } from '../../tooltip/Tooltip';
import { apiUrl } from '../../../lib/config';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../typography/Typography';
import SettingsContext from '../../../contexts/SettingsContext';

type ReaderChromeProps = {
  post: Post;
  onClose: () => void;
  isRailOpen: boolean;
  onToggleRail: () => void;
  onRefreshContent: () => void;
  isPostPage?: boolean;
};

export function ReaderChrome({
  post,
  onClose,
  isRailOpen,
  onToggleRail,
  onRefreshContent,
  isPostPage = false,
}: ReaderChromeProps): ReactElement {
  const { target: readTarget } = getPostReadTarget(post);
  const { openNewTab } = useContext(SettingsContext);
  const isInternalDailyHost = (host: string | null): boolean =>
    !!host &&
    (host.toLowerCase() === 'daily.dev' ||
      host.toLowerCase().endsWith('.daily.dev'));
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
  const iconButtonClassName = '!h-8 !w-8 !min-w-8 !rounded-10 !p-0';

  const faviconSrc = useMemo(() => {
    const pixelRatio = globalThis?.window?.devicePixelRatio ?? 1;
    const iconSize = Math.max(Math.round(16 * pixelRatio), 96);
    const host = sourceDomain.length > 0 ? sourceDomain : 'source';
    return `${apiUrl}/icon?url=${encodeURIComponent(host)}&size=${iconSize}`;
  }, [sourceDomain]);

  const chromeGroupClasses =
    'pointer-events-auto flex h-9 items-center gap-px rounded-12 border border-border-subtlest-tertiary bg-background-default/70 p-px shadow-3 backdrop-blur-md backdrop-saturate-150';
  const showDiscussionButton = (
    <Tooltip content="Show discussion">
      <Button
        icon={<SidebarArrowRight />}
        size={ButtonSize.Small}
        variant={ButtonVariant.Tertiary}
        type="button"
        className={iconButtonClassName}
        onClick={onToggleRail}
        aria-label="Show discussion panel"
        aria-pressed={false}
      />
    </Tooltip>
  );
  const refreshContentButton = (
    <Tooltip content="Refresh article">
      <Button
        icon={<RefreshIcon />}
        size={ButtonSize.Small}
        variant={ButtonVariant.Tertiary}
        type="button"
        className={iconButtonClassName}
        onClick={onRefreshContent}
        aria-label="Refresh article content"
      />
    </Tooltip>
  );

  return (
    <div
      className="z-30 pointer-events-none absolute inset-x-3 top-3 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2"
      role="banner"
    >
      <div
        className={classNames(chromeGroupClasses, 'justify-self-start')}
        aria-label="Header controls left"
      >
        {!isRailOpen && showDiscussionButton}
        {refreshContentButton}
      </div>

      {readHref ? (
        <a
          className={classNames(
            chromeGroupClasses,
            'mx-auto h-7 min-w-[7.5rem] max-w-[16rem] gap-1 px-2 hover:border-border-subtlest-secondary',
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
            className="min-w-0 truncate text-center"
            title={sourceLabel}
          >
            {sourceLabel}
          </Typography>
        </a>
      ) : (
        <div
          className={classNames(
            chromeGroupClasses,
            'mx-auto h-7 min-w-[7.5rem] max-w-[16rem] gap-1 px-2',
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
            className="min-w-0 truncate text-center"
            title={sourceLabel}
          >
            {sourceLabel}
          </Typography>
        </div>
      )}

      {isPostPage ? (
        <div className="justify-self-end" aria-hidden />
      ) : (
        <div
          className={classNames(chromeGroupClasses, 'justify-self-end')}
          aria-label="Reader actions"
        >
          <Tooltip side="bottom" content="Close">
            <Button
              variant={ButtonVariant.Tertiary}
              icon={<CloseIcon />}
              size={ButtonSize.Small}
              type="button"
              className={iconButtonClassName}
              onClick={onClose}
              aria-label="Close reader"
            />
          </Tooltip>
        </div>
      )}
    </div>
  );
}
