import type { ReactElement } from 'react';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ActivityContainer, ActivitySectionHeader } from './ActivitySection';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { coresDocsLink } from '../../lib/constants';
import { ClickableText } from '../buttons/ClickableText';
import { Image } from '../image/Image';
import {
  userProductSummaryQueryOptions,
  ProductType,
} from '../../graphql/njord';

type AwardProps = {
  image: string;
  amount: number;
};
const Award = ({ image, amount }: AwardProps): ReactElement => {
  return (
    <div className="flex size-fit flex-col items-center justify-center rounded-14 bg-surface-float p-1">
      <Image src={image} alt="Award" className="size-20" />
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Secondary}
      >
        {amount}
      </Typography>
    </div>
  );
};

export const Awards = ({ userId }: { userId: string }): ReactElement => {
  const { data: awards } = useQuery({
    ...userProductSummaryQueryOptions({
      userId,
      type: ProductType.Award,
    }),
    enabled: !!userId,
  });

  if (!awards?.length) {
    return null;
  }

  return (
    <ActivityContainer>
      <ActivitySectionHeader title="Awards" className="!mb-2" />
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Quaternary}
      >
        Learn more about how Awards are earned in the{' '}
        <ClickableText
          className="!inline"
          tag="a"
          target="_blank"
          href={coresDocsLink}
        >
          daily.dev docs
        </ClickableText>
      </Typography>
      <div className="mt-6 flex flex-wrap gap-2">
        {awards?.map((award) => {
          return (
            <Award key={award.id} image={award.image} amount={award.count} />
          );
        })}
      </div>
    </ActivityContainer>
  );
};
