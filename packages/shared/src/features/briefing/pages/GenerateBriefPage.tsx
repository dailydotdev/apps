import React, { useMemo } from 'react';
import { format } from 'date-fns';
import { usePlusSubscription } from '../../../hooks';
import { useAuthContext } from '../../../contexts/AuthContext';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import {
  AnalyticsIcon,
  MagicIcon,
  StraightArrowIcon,
  TimerIcon,
} from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { webappUrl } from '../../../lib/constants';
import { BriefPayForGenerateCard } from '../components/BriefPayForGenerateCard';
import { BriefPlusAdvantagesCard } from '../components/BriefPlusAdvantagesCard';
import { BriefPostHeader } from '../components/BriefPostHeader';

const MockPresidentialBrief = () => (
  <div
    aria-hidden
    className="pointer-events-none absolute left-0 right-0 top-0 z-1 flex select-none flex-col gap-4 py-4"
  >
    <Typography className="mb-4" type={TypographyType.Title2} bold>
      Must know
    </Typography>
    <Typography type={TypographyType.Body}>
      Meta expands AI and privacy efforts
    </Typography>
    <Typography type={TypographyType.Body}>
      Meta is rolling out a standalone AI assistant and integrating AI tools
      into WhatsApp (now over 3B users). They’ve resumed training AI models on
      EU user data and updated privacy policies for Ray-Ban smart glasses,
      especially around voice recordings. There’s tension between Meta’s claims
      of privacy and external skepticism—review privacy settings if you use
      these products.
    </Typography>
  </div>
);

export const GenerateBriefPage = () => {
  const { isPlus } = usePlusSubscription();
  const { isAuthReady, user } = useAuthContext();

  const headerProps = {
    date: new Date(),
    heading: `${user?.name || user?.username}'s Presidential Briefing`,
    stats: [
      {
        Icon: TimerIcon,
        label: '3.5h of reading saved',
      },
      {
        Icon: AnalyticsIcon,
        label: '847 posts analyzed',
      },
    ],
  };

  if (isAuthReady && (isPlus || !user)) {
    return null;
  }

  return (
    <div className="my-6 px-4 tablet:px-8">
      {/* Header */}
      <BriefPostHeader {...headerProps} />
      {/* Unlock this Presidential Briefing */}
      <div className="relative mt-6">
        <MockPresidentialBrief />
        <div
          className={`
          relative z-2 -mx-4
          flex flex-col gap-6 bg-gradient-to-b from-transparent
          from-0% to-surface-invert to-40% px-4 pt-20  backdrop-blur tablet:to-95%
          `}
        >
          <div className="mx-auto mb-6 flex flex-col gap-2 text-center">
            <Typography
              className="text-balance"
              type={TypographyType.Title2}
              bold
            >
              Unlock this Presidential Briefing
            </Typography>
            <Typography
              color={TypographyColor.Tertiary}
              type={TypographyType.Callout}
              className="mx-auto mb-2 tablet:w-2/3 tablet:text-balance"
            >
              You don’t need to keep up. Your AI agent already did. This
              briefing compresses everything that matters into just a few
              minutes.
            </Typography>
            <Typography
              type={TypographyType.Footnote}
              className="flex justify-center gap-1"
            >
              <TimerIcon size={IconSize.Size16} aria-hidden />
              <span>15-20 hours of content</span>
              <StraightArrowIcon
                className="-rotate-90"
                size={IconSize.Size16}
                aria-hidden
              />
              <MagicIcon size={IconSize.Size16} aria-hidden />
              <span>2-3 minutes reading</span>
            </Typography>
          </div>
          {/*  Cards */}
          <div className="flex grid-cols-2 flex-col gap-4 tablet:grid">
            <BriefPlusAdvantagesCard />
            <BriefPayForGenerateCard />
          </div>
          {/* Skip and go home */}
          <div className="text-center">
            <Typography
              className="hover:underline"
              color={TypographyColor.Tertiary}
              href={webappUrl}
              tag={TypographyTag.Link}
              title="Go back to main feed"
              type={TypographyType.Callout}
            >{`I'm good without briefings`}</Typography>
          </div>
        </div>
      </div>
    </div>
  );
};
