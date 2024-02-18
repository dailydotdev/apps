import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { Card } from '../atoms/Card';
import { Typography, TypographyType } from '../../../typography/Typography';
import { CardContainer } from '../atoms/CardContainer';
import { Image } from '../atoms/Image';
import { Ad } from '../../../../graphql/posts';
import styles from '../../../cards/Card.module.css';
import AdAttribution from '../../../cards/AdAttribution';

export const AdCard = ({ ad }: { ad: Ad }): ReactElement => {
  const showBlurredImage = ad.source === 'Carbon' || ad.source === 'EthicalAds';

  return (
    <CardContainer>
      <Card>
        {/* <CardButton post={post} /> */}
        <section className="flex flex-1">
          <div className="mx-4 flex flex-1 flex-col">
            <Typography
              type={TypographyType.Title3}
              bold
              className="my-2 line-clamp-4"
            >
              {ad.description}
            </Typography>
          </div>
        </section>

        <section>
          <Image
            alt="Ad image"
            src={ad.image}
            className={classNames(
              'z-1 w-full',
              showBlurredImage && 'absolute inset-0 m-auto',
            )}
            style={{ objectFit: showBlurredImage ? 'contain' : 'cover' }}
          />
          {showBlurredImage && (
            <Image
              alt="Ad image background"
              src={ad.image}
              className={classNames('-z-1 w-full', styles.blur)}
            />
          )}
        </section>
        <footer className="mx-4 flex flex-row justify-between">
          <AdAttribution ad={ad} className={{ main: 'mb-2 mt-4' }} />
        </footer>
        {ad.pixel?.map((pixel) => (
          <img
            src={pixel}
            key={pixel}
            data-testid="pixel"
            className="hidden h-0 w-0"
            alt="Pixel"
          />
        ))}
      </Card>
    </CardContainer>
  );
};
