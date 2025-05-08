import type { ComponentProps } from 'react';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import { LazyImage } from '../../../components/LazyImage';
import { sanitizeMessage } from './utils';
import type { FunnelBannerMessageParameters } from '../types/funnel';

type FunnelBannerMessageProps = FunnelBannerMessageParameters &
  ComponentProps<'div'>;

export const FunnelBannerMessage = ({
  image,
  content,
  className,
}: FunnelBannerMessageProps) => {
  const contentHtml = useMemo(() => sanitizeMessage(content), [content]);

  return (
    <div
      className={classNames(
        `bg-theme-overlay-quaternary px-8 py-6`,
        'tablet:relative tablet:left-1/2 tablet:min-w-[100dvw] tablet:-translate-x-1/2 tablet:justify-center',
        className,
      )}
    >
      <div className="mx-auto flex max-w-md gap-4">
        {image?.src && (
          <LazyImage
            aria-hidden
            className="size-10 object-contain object-center"
            imgAlt=""
            imgSrc={image.src}
            role="presentation"
          />
        )}
        <div
          className="flex-1"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />
      </div>
    </div>
  );
};
