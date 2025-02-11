import type { ReactElement } from 'react';
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiUrl } from '../../lib/config';
import { PlusUser } from '../PlusUser';
import { TypographyType } from '../typography/Typography';
import { IconSize } from '../Icon';
import { PlusList } from './PlusList';
import { plusRedBackgroundImage } from '../../lib/image';
import { Image } from '../image/Image';
import { Button, ButtonVariant } from '../buttons/Button';
import { webappUrl } from '../../lib/constants';
import { PlusInfo } from './PlusInfo';

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
        <div className="flex w-[28.5rem] flex-col pb-32 pr-10 pt-6">
          {productOptions && productOptions.length > 0 && (
            <PlusInfo
              productOptions={productOptions}
              selectedOption={selectedOption}
              onChange={setSelectedOption}
              showPlusList={false}
              showDailyDevLogo
            />
          )}
          <Button
            variant={ButtonVariant.Primary}
            tag="a"
            href={`${webappUrl}plus/payment?pid=${selectedOption}`}
            disabled={!selectedOption}
            className="mt-8"
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
