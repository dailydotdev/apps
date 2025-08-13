import React, { useCallback, useMemo } from 'react';
import { format } from 'date-fns';
import { useRouter } from 'next/router';
import {
  useActions,
  usePlusSubscription,
  useToastNotification,
} from '../../../hooks';
import { useAuthContext } from '../../../contexts/AuthContext';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import {
  CoreIcon,
  DevPlusIcon,
  MagicIcon,
  StraightArrowIcon,
  TimerIcon,
} from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { Card } from '../../../components/cards/common/Card';
import { PlusList } from '../../../components/plus/PlusList';
import type { PlusItem } from '../../../components/plus/PlusListItem';
import { PlusItemStatus } from '../../../components/plus/PlusListItem';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { BriefingType } from '../../../graphql/posts';
import { Radio } from '../../../components/fields/Radio';
import { webappUrl } from '../../../lib/constants';
import { ActionType } from '../../../graphql/actions';
import { BriefPlusUpgradeCTA } from './BriefPlusUpgradeCTA';
import { useGenerateBrief } from '../hooks/useGenerateBrief';

const briefingListItems: Array<PlusItem> = [
  {
    label: 'Get the briefings on your schedule',
    tooltip:
      'Your AI agent auto-generates the brief for you. Choose daily or weekly delivery, whenever it fits your workflow.',
  },
  {
    label: 'Delivered where you want them',
    tooltip: 'In-app, email, or even Slack. Fully integrated.',
  },
  {
    label: 'Tailored to your interests',
    tooltip: 'Based on your tags, reading behavior, and preferred sources.',
  },
  {
    label: 'Additional Plus-only features included',
    tooltip:
      'Unlimited access, more AI superpowers, clickbait detection and more.',
    className: 'underline',
  },
].map((item) => ({
  ...item,
  status: PlusItemStatus.Ready,
  icon: <DevPlusIcon size={IconSize.Size16} aria-hidden />,
}));

const briefPricesByType = {
  [BriefingType.Daily]: 300,
  [BriefingType.Weekly]: 500,
};

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

const PlusAdvantagesCard = () => {
  return (
    <Card className="clickable flex flex-col !border-action-upvote-active !bg-action-upvote-float p-4">
      <Typography type={TypographyType.Callout} bold>
        Want unlimited briefings?
      </Typography>
      <PlusList
        className="flex-1 !py-3"
        iconProps={{
          size: IconSize.XSmall,
          className: 'text-status-success',
        }}
        items={briefingListItems}
        typographyProps={{
          className: 'typo-footnote py-0.5',
        }}
      />
      <BriefPlusUpgradeCTA size={ButtonSize.Medium} className="w-full" />
    </Card>
  );
};

const PayForBriefCard = () => {
  const { user } = useAuthContext();
  const { checkHasCompleted, isActionsFetched, completeAction } = useActions();
  const router = useRouter();
  const { displayToast } = useToastNotification();
  const [selected, setSelected] = React.useState<BriefingType>(
    BriefingType.Daily,
  );
  const price = briefPricesByType[selected];
  const isFirstBrief =
    isActionsFetched && !checkHasCompleted(ActionType.GeneratedBrief);

  const { isGenerating, generateBrief } = useGenerateBrief({
    onSuccess: async () => {
      displayToast(`Your Presidential's Briefing is being generated ✅`);
      await completeAction(ActionType.GeneratedBrief);
      return router.push('/');
    },
    onError: () => {
      displayToast(
        'There was an error generating your Presidential Briefing. Please try again later.',
      );
    },
  });

  const onClickGenerate = useCallback(() => {
    // Logic to generate the briefing
    if (isFirstBrief && !isGenerating) {
      generateBrief({ type: selected });
      return;
    }

    // If it's not the first brief, should check if the user has enough cores
    const amount = user?.balance?.amount || 0;
    const hasEnoughCores = amount >= price;

    if (hasEnoughCores && !isGenerating) {
      generateBrief({ type: selected });
    } else {
      // Handle insufficient cores case, e.g., show a message or redirect to purchase
    }
  }, [
    generateBrief,
    isFirstBrief,
    isGenerating,
    price,
    selected,
    user?.balance?.amount,
  ]);

  return (
    <Card className="clickable flex flex-col gap-3 p-4">
      <div>
        <Typography type={TypographyType.Callout} bold>
          Want just this one?
        </Typography>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
          className="mt-2 text-balance"
        >
          Generate a one-off Presidential Briefing based on the past day or
          week. No commitment. Yours now.
        </Typography>
      </div>
      <div className="flex-1">
        <Radio
          name="brief-type"
          onChange={(value) => setSelected(value)}
          options={[
            { value: BriefingType.Daily, label: 'Daily - last 24 hours' },
            { value: BriefingType.Weekly, label: 'Weekly - last 7 days' },
          ]}
          value={selected}
        />
      </div>
      <Button
        disabled={!isActionsFetched}
        onClick={() => onClickGenerate()}
        size={ButtonSize.Medium}
        variant={ButtonVariant.Secondary}
      >
        Generate for
        {isFirstBrief ? (
          ' free'
        ) : (
          <>
            <CoreIcon className="mx-1" aria-hidden /> {price}
          </>
        )}
      </Button>
    </Card>
  );
};

export const GenerateBriefForFreeUserPage = () => {
  const { isPlus } = usePlusSubscription();
  const { isAuthReady, user } = useAuthContext();

  const headerContent = useMemo(
    () => ({
      dateLabel: format(new Date(), 'MMMM dd, yyyy'),
      heading: `${user?.name || user?.username}'s Presidential Briefing`,
      saved: `Save 3.5h of reading`,
    }),
    [user.name, user.username],
  );

  if (isAuthReady && (isPlus || !user)) {
    return null;
  }

  return (
    <div className="my-6 px-4 tablet:px-8">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <Typography
          color={TypographyColor.Secondary}
          type={TypographyType.Callout}
        >
          {headerContent.dateLabel}
        </Typography>
        <Typography type={TypographyType.LargeTitle} bold>
          {headerContent.heading}
        </Typography>
        <Typography
          color={TypographyColor.Secondary}
          type={TypographyType.Footnote}
          className="flex gap-1"
        >
          <TimerIcon size={IconSize.Size16} aria-hidden /> {headerContent.saved}
        </Typography>
      </div>
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
            <PlusAdvantagesCard />
            <PayForBriefCard />
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
