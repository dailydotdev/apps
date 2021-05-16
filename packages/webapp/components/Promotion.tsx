import React, { ReactElement } from 'react';
import { LazyImage } from '@dailydotdev/shared/src/components/LazyImage';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import styles from './Promotion.module.css';
import classNames from 'classnames';

export default function Promotion(): ReactElement {
  return (
    <div
      className={classNames(
        'fixed hidden bottom-6 flex-col items-stretch mobileL:flex',
        styles.promotion,
      )}
    >
      <LazyImage
        imgSrc="https://daily-now-res.cloudinary.com/image/upload/f_auto,q_auto/v1597305902/webapp/promotion"
        imgAlt="Promotional cover for daily.dev extension"
        ratio="52.8%"
        className="rounded-lg"
      />
      <div className="mt-4 mb-6 text-theme-label-tertiary typo-callout">
        Daily delivers the best programming news every new tab. It is a browser
        extension that boosts your professional growth.
      </div>
      <Button
        className="btn-primary self-start"
        tag="a"
        href="/api/get?r=webapp"
      >
        Get it now
      </Button>
    </div>
  );
}
