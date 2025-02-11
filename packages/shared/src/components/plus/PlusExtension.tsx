import type { ReactElement } from 'react';
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiUrl } from '../../lib/config';
import PlusProductList from './PlusProductList';
import { PlusUser } from '../PlusUser';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import { IconSize } from '../Icon';
import { PlusList } from './PlusList';
import { plusRedBackgroundImage } from '../../lib/image';
import { Image } from '../image/Image';
import { Button, ButtonVariant } from '../buttons/Button';
import { webappUrl } from '../../lib/constants';

const PlusExtension = (): ReactElement => {
  const { data: productOptions } = useQuery({
    queryKey: ['productOptions'],
    queryFn: async () => {
      const response = await fetch(`${apiUrl}/price_previews`);
      const json = await response.json();
      return json?.details?.lineItems.map((item) => ({
        label: item.price.description,
        value: item.price.id,
        price: item.formattedTotals.total,
        priceUnformatted: Number(item.totals.total),
        currencyCode: json?.currencyCode as string,
        extraLabel: item.price.customData?.label as string,
      }));
    },
  });

  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  return (
    <div>
      <div className="flex flex-row pl-6">
        <div className="flex w-[28.5rem] flex-col gap-8 pb-32 pr-10 pt-6">
          <PlusUser
            iconSize={IconSize.Large}
            typographyType={TypographyType.Title1}
          />
          <Typography
            tag={TypographyTag.H1}
            color={TypographyColor.Primary}
            type={TypographyType.LargeTitle}
            bold
          >
            Fast-track your growth
          </Typography>
          <Typography
            tag={TypographyTag.H2}
            color={TypographyColor.Secondary}
            type={TypographyType.Body}
          >
            Work smarter, learn faster, and stay ahead with AI tools, custom
            feeds, and pro features. Because copy-pasting code isn’t a long-term
            strategy.
          </Typography>
          <div className="flex flex-col gap-4">
            <Typography
              tag={TypographyTag.P}
              type={TypographyType.Callout}
              color={TypographyColor.Tertiary}
              bold
            >
              Billing cycle
            </Typography>
            {productOptions && productOptions.length > 0 && (
              <PlusProductList
                productList={productOptions}
                selected={selectedOption}
                onChange={setSelectedOption}
              />
            )}
          </div>
          <Button
            variant={ButtonVariant.Primary}
            tag="a"
            href={`${webappUrl}plus/payment?pid=${selectedOption}`}
            disabled={!selectedOption}
          >
            Upgrade to Plus
          </Button>
        </div>
        <div className="relative flex w-[28.5rem] flex-col gap-8 bg-black pr-6">
          <PlusUser
            iconSize={IconSize.Large}
            typographyType={TypographyType.Title1}
            className="opacity-0"
          />
          <Image className="absolute bottom-0" src={plusRedBackgroundImage} />
          <PlusList className="pl-10" />
        </div>
      </div>
    </div>
  );
};

export default PlusExtension;
