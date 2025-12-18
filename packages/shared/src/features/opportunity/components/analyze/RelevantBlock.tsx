import React, { useEffect, useState } from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../../components/typography/Typography';
import { Divider } from '../../../../components/utilities';
import { Chip } from '../../../../components/cards/common/PostTags';
import { useOpportunityPreviewContext } from '../../context/OpportunityPreviewContext';
import { apiUrl } from '../../../../lib/config';
import { Image, ImageType } from '../../../../components/image/Image';
import { OpportunityPreviewStatus } from '../../types';
import { ElementPlaceholder } from '../../../../components/ElementPlaceholder';

const iconSize = 24;

type CompanyItemProps = {
  favicon?: string;
  name: string;
};

const CompanyItem = ({ favicon, name }: CompanyItemProps) => (
  <div className="flex gap-2">
    <img
      src={`${apiUrl}/icon?url=${encodeURIComponent(favicon)}&size=${iconSize}`}
      className="size-4 rounded-2"
      alt={name}
    />
    <Typography type={TypographyType.Footnote} color={TypographyColor.Tertiary}>
      {name}
    </Typography>
  </div>
);

type RelevantBlockProps = {
  loadingStep: number;
};

export const RelevantBlock = ({ loadingStep }: RelevantBlockProps) => {
  const [randomTagsWidths] = useState(() =>
    new Array(16).fill(undefined).map(() => {
      return `${Math.floor(Math.random() * 50) + 40}px`;
    }),
  );
  const data = useOpportunityPreviewContext();
  const totalCount = data?.result?.totalCount ?? 0;
  const tags = data?.result?.tags ?? [];
  const companies = data?.result?.companies ?? [];
  const squads = data?.result?.squads ?? [];
  const hasData =
    data?.result?.status === OpportunityPreviewStatus.READY || tags.length > 0;
  const [animatedCount, setAnimatedCount] = useState(0);
  const [showSubtext, setShowSubtext] = useState(false);

  // Show after step 2 completes (Mapping skills, requirements, and intent)
  const isVisible = hasData && loadingStep >= 2;

  // Animate count from 0 to totalCount
  useEffect(() => {
    if (!isVisible || totalCount === 0) {
      return undefined;
    }

    const duration = 1000; // 1 second animation
    const steps = 30;
    const increment = totalCount / steps;
    const stepDuration = duration / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep += 1;
      if (currentStep >= steps) {
        setAnimatedCount(totalCount);
        setShowSubtext(true);
        clearInterval(timer);
      } else {
        setAnimatedCount(Math.floor(increment * currentStep));
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [isVisible, totalCount]);

  if (!isVisible) {
    return (
      <div className="flex flex-col gap-4">
        <ElementPlaceholder className="h-6 w-full rounded-8" />
        <ElementPlaceholder className="h-6 w-full rounded-8" />
        <Divider className="bg-border-subtlest-tertiary" />
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {randomTagsWidths.map((tagWidth, index) => {
            return (
              <ElementPlaceholder
                //  eslint-disable-next-line react/no-array-index-key
                key={index}
                style={{
                  width: tagWidth,
                }}
                className="h-6 rounded-8"
              />
            );
          })}
        </div>
        <Divider className="bg-border-subtlest-tertiary" />
        <ElementPlaceholder className="h-6 w-full rounded-8" />
        <ElementPlaceholder className="h-4 w-full rounded-8" />
        <ElementPlaceholder className="h-4 w-full rounded-8" />
        <ElementPlaceholder className="h-4 w-full rounded-8" />
        <Divider className="bg-border-subtlest-tertiary" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <Typography type={TypographyType.Body} bold>
          Relevant active developers
        </Typography>
        <Typography
          type={TypographyType.Title2}
          bold
          color={TypographyColor.Brand}
        >
          {animatedCount.toLocaleString()}
        </Typography>
        {showSubtext && (
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            30% searching for job only on daily.dev
          </Typography>
        )}
      </div>
      <Divider className="bg-border-subtlest-tertiary" />
      <Typography type={TypographyType.Footnote} bold>
        Interesting in
      </Typography>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Chip key={tag} className="!my-0">
            #{tag}
          </Chip>
        ))}
      </div>
      <Divider className="bg-border-subtlest-tertiary" />
      <Typography type={TypographyType.Footnote} bold>
        Developers verified work at
      </Typography>
      <div className="grid grid-cols-2 gap-2">
        {companies.map((company) => (
          <CompanyItem
            key={company.name}
            favicon={company.favicon}
            name={company.name}
          />
        ))}
      </div>
      <Divider className="bg-border-subtlest-tertiary" />
      <div>
        <Typography type={TypographyType.Footnote} bold>
          Most active squads
        </Typography>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          Where your matches are most active inside daily.dev.
        </Typography>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {squads.map((squad) => (
          <div className="flex gap-2" key={squad.id}>
            <Image
              src={squad.image}
              alt={squad.name}
              type={ImageType.Squad}
              className="h-4 w-4 rounded-full object-cover"
              loading="lazy"
            />
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
            >
              {squad.name}
            </Typography>
          </div>
        ))}
      </div>
      <Divider className="bg-border-subtlest-tertiary" />
    </div>
  );
};
