import React, { ReactElement } from 'react';
import classNames from 'classnames';
import styles from '../../../cards/Card.module.css';
import { Ad } from '../../../../graphql/posts';
import { Image } from './Image';

type AdImageProps = { ad: Ad };
export default function AdImage({ ad }: AdImageProps): ReactElement {
  const showBlurredImage = ad.source === 'Carbon' || ad.source === 'EthicalAds';
  return (
    <div className="overflow-hidden relative rounded-xl">
      <Image
        alt="Ad image"
        src={ad.image}
        className={classNames(
          'w-full z-1 h-40',
          showBlurredImage && 'inset-0 m-auto absolute',
        )}
        style={{ objectFit: showBlurredImage ? 'contain' : 'cover' }}
      />
      {showBlurredImage && (
        <Image
          alt="Ad image background"
          src={ad.image}
          className={classNames('-z-1 w-full h-40', styles.blur)}
        />
      )}
    </div>
  );
}
