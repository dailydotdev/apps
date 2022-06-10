import React, { ReactElement } from 'react';
import classNames from 'classnames';
import XIcon from './icons/Close';
import { Button } from './buttons/Button';
import { isTesting } from '../lib/constants';
import { BannerData } from '../graphql/banner';

interface PromotionalBannerProps {
  bannerData: BannerData;
  setLastSeen: (value: Date) => Promise<void>;
}
export default function PromotionalBanner({
  bannerData,
  setLastSeen,
}: PromotionalBannerProps): ReactElement {
  // Disable this component in Jest environment
  if (isTesting) {
    return <></>;
  }

  if (!bannerData?.banner) {
    return <></>;
  }

  const { banner } = bannerData;
  return (
    <div
      className={classNames(
        'relative z-3 laptop:fixed flex flex-col items-start py-3 pl-3 pr-12 typo-footnote laptop:h-8 laptop:flex-row laptop:items-center laptop:justify-center laptop:p-0 w-full',
        banner.theme === 'title-bacon' && 'text-theme-label-bun',
        banner.theme === 'gradient-bacon-onion'
          ? 'bg-theme-bg-bun'
          : 'bg-theme-bg-primary',
      )}
    >
      <div>
        <strong>{banner.title}</strong>
        <span className="ml-0.5">{banner.subtitle}</span>
      </div>
      <Button
        tag="a"
        href={banner.url}
        buttonSize="xsmall"
        className={classNames(
          'mt-2 laptop:ml-4 laptop:mt-0',
          banner.theme === 'cta-bacon-onion'
            ? 'btn-primary-bacon'
            : 'btn-primary',
        )}
      >
        {banner.cta}
      </Button>
      <Button
        buttonSize="xsmall"
        className="laptop:inset-y-0 top-2 right-2 laptop:my-auto btn-tertiary"
        style={{ position: 'absolute' }}
        icon={<XIcon />}
        onClick={() =>
          setLastSeen(new Date(new Date(banner.timestamp).getTime() + 60_000))
        }
      />
    </div>
  );
}
