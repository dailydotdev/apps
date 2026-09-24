import type { CSSProperties, ReactElement } from 'react';
import React, { useCallback, useMemo, useState } from 'react';
import classNames from 'classnames';
import { useMutation } from '@tanstack/react-query';
import type { FunnelStepAcquisition } from '../types/funnel';
import { FunnelStepTransitionType } from '../types/funnel';
import {
  CheckboxGroupBehaviour,
  FormInputCheckboxGroup,
} from '../../common/components/FormInputCheckboxGroup';
import {
  FunnelStepCtaWrapper,
  funnelStepRail,
} from '../shared/FunnelStepCtaWrapper';
import { sanitizeMessage } from '../lib/utils';
import { withIsActiveGuard } from '../shared/withActiveGuard';
import { withShouldSkipStepGuard } from '../shared/withShouldSkipStepGuard';
import {
  OnboardingHeadline,
  OnboardingSubheadline,
} from '../../../components/onboarding/common';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useLogContext } from '../../../contexts/LogContext';
import { UserAcquisitionEvent } from '../../../lib/log';
import {
  AcquisitionChannel,
  updateUserAcquisition,
} from '../../../graphql/users';
import { shuffleArray } from '../../../lib/func';
import { acquisitionBrandColors } from '../../../styles/custom';
import type { IconProps } from '../../../components/Icon';
import { IconSize } from '../../../components/Icon';
import { SourceBadge } from '../../../components/post/focus/CommunitySentimentBreakdown';
import { ChromeIcon } from '../../../components/icons/Browser/Chrome';
import { FacebookIcon } from '../../../components/icons/Facebook';
import { GoogleIcon } from '../../../components/icons/Google';
import { InviteIcon } from '../../../components/icons/Invite';
import { LinkedInIcon } from '../../../components/icons/LinkedIn';
import { MailIcon } from '../../../components/icons/Mail';
import { MegaphoneIcon } from '../../../components/icons/Megaphone';
import { MenuIcon } from '../../../components/icons/Menu';
import { OpenAIIcon } from '../../../components/icons/OpenAI';
import { RedditIcon } from '../../../components/icons/Reddit';
import { TikTokIcon } from '../../../components/icons/TikTok';
import { TwitterIcon } from '../../../components/icons/Twitter';
import { YoutubeIcon } from '../../../components/icons/Youtube';

const DEFAULT_HEADLINE = 'How did you hear about us?';

type Icon = (props: IconProps) => ReactElement;

// Each channel's mark in both styles: the logo on its own, or the same mark in
// a favicon-style tile. The hairline keeps white and black tiles square
// against either theme.
interface ChannelMark {
  logo: ReactElement;
  tile: ReactElement;
}

const Tile = ({
  children,
  className,
  style,
}: {
  children: ReactElement;
  className?: string;
  style?: CSSProperties;
}): ReactElement => (
  <span
    className={classNames(
      'flex size-6 items-center justify-center overflow-hidden rounded-6 border border-border-subtlest-tertiary',
      className,
    )}
    style={style}
  >
    {children}
  </span>
);

const onColor = (backgroundColor: string): CSSProperties => ({
  backgroundColor,
  color: acquisitionBrandColors.glyph,
});

// The logo is the brand's own colour art; the tile puts its white art on the
// brand colour. X's colour art is near-black and vanishes on the dark theme,
// so its logo stays on the theme-following art.
const brandMark = (
  BrandIcon: Icon,
  color: string,
  logo: ReactElement = <BrandIcon secondary />,
): ChannelMark => ({
  logo,
  tile: (
    <Tile style={onColor(color)}>
      <BrandIcon size={IconSize.Size16} />
    </Tile>
  ),
});

// Google and Chrome keep their colour art on white, as their own favicons do.
const faviconMark = (BrandIcon: Icon): ChannelMark => ({
  logo: <BrandIcon secondary />,
  tile: (
    <Tile style={{ backgroundColor: acquisitionBrandColors.favicon }}>
      <BrandIcon secondary size={IconSize.Size16} />
    </Tile>
  ),
});

// Channels with no brand of their own: the filled icon in an accent colour.
const accentMark = (
  AccentIcon: Icon,
  colorVariable: string,
  textClassName: string,
): ChannelMark => ({
  logo: <AccentIcon secondary className={textClassName} />,
  tile: (
    <Tile style={onColor(`var(${colorVariable})`)}>
      <AccentIcon secondary size={IconSize.Size16} />
    </Tile>
  ),
});

const CHANNEL_OPTIONS: Array<
  { value: AcquisitionChannel; label: string } & ChannelMark
> = [
  {
    value: AcquisitionChannel.Friend,
    label: 'Referred by a friend or colleague',
    ...accentMark(InviteIcon, '--theme-brand-default', 'text-brand-default'),
  },
  {
    value: AcquisitionChannel.X,
    label: 'X (Twitter)',
    ...brandMark(TwitterIcon, acquisitionBrandColors.x, <TwitterIcon />),
  },
  {
    value: AcquisitionChannel.Reddit,
    label: 'Reddit',
    ...brandMark(RedditIcon, acquisitionBrandColors.reddit),
  },
  {
    value: AcquisitionChannel.LinkedIn,
    label: 'LinkedIn',
    ...brandMark(LinkedInIcon, acquisitionBrandColors.linkedIn),
  },
  {
    value: AcquisitionChannel.InstagramFacebook,
    label: 'Instagram or Facebook',
    ...brandMark(FacebookIcon, acquisitionBrandColors.facebook),
  },
  {
    value: AcquisitionChannel.YouTube,
    label: 'YouTube',
    ...brandMark(YoutubeIcon, acquisitionBrandColors.youTube),
  },
  {
    value: AcquisitionChannel.TikTok,
    label: 'TikTok',
    ...brandMark(TikTokIcon, acquisitionBrandColors.tikTok),
  },
  {
    value: AcquisitionChannel.HackerNews,
    label: 'Hacker News',
    logo: <SourceBadge className="size-5 typo-footnote" source="hackernews" />,
    tile: (
      <Tile>
        <SourceBadge className="size-full typo-footnote" source="hackernews" />
      </Tile>
    ),
  },
  {
    value: AcquisitionChannel.SearchEngine,
    label: 'Search engine',
    ...faviconMark(GoogleIcon),
  },
  {
    value: AcquisitionChannel.AI,
    label: 'AI search or chat, like ChatGPT',
    ...brandMark(
      OpenAIIcon,
      acquisitionBrandColors.openAI,
      <span
        className="flex size-5 items-center justify-center rounded-6 border border-border-subtlest-tertiary"
        style={onColor(acquisitionBrandColors.openAI)}
      >
        <OpenAIIcon size={IconSize.XXSmall} />
      </span>,
    ),
  },
  {
    value: AcquisitionChannel.ExtensionStore,
    label: 'Browser extension store',
    ...faviconMark(ChromeIcon),
  },
  {
    value: AcquisitionChannel.NewsletterBlog,
    label: 'A newsletter or blog',
    ...accentMark(
      MailIcon,
      '--theme-accent-water-default',
      'text-accent-water-default',
    ),
  },
  {
    value: AcquisitionChannel.Advertisement,
    label: 'Advertisement or sponsorship',
    ...accentMark(
      MegaphoneIcon,
      '--theme-accent-ketchup-default',
      'text-accent-ketchup-default',
    ),
  },
  {
    value: AcquisitionChannel.Other,
    label: 'Other',
    logo: <MenuIcon secondary className="text-text-tertiary" />,
    tile: (
      <Tile className="bg-background-default text-text-tertiary">
        <MenuIcon secondary size={IconSize.Size16} />
      </Tile>
    ),
  },
];

// "Other" is a catch-all, so it stays last however the rest are ordered.
const orderOptions = (
  options: AcquisitionChannel[] | undefined,
  shuffle: boolean,
) => {
  const selected = options?.length
    ? CHANNEL_OPTIONS.filter(({ value }) => options.includes(value))
        // Config order, not the constant's.
        .sort((a, b) => options.indexOf(a.value) - options.indexOf(b.value))
    : CHANNEL_OPTIONS;
  const other = selected.filter(
    ({ value }) => value === AcquisitionChannel.Other,
  );
  const rest = selected.filter(
    ({ value }) => value !== AcquisitionChannel.Other,
  );

  return [...(shuffle ? shuffleArray(rest) : rest), ...other];
};

function FunnelAcquisitionComponent({
  id,
  parameters: {
    headline,
    explainer,
    cta,
    options,
    shuffle = true,
    skip,
    iconStyle = 'logo',
  },
  onTransition,
}: FunnelStepAcquisition): ReactElement {
  const { logEvent } = useLogContext();
  const [value, setValue] = useState<AcquisitionChannel>();
  // Shuffled once per option set: re-ordering the list under a user who is
  // halfway through reading it is worse than the position bias it corrects.
  const order = useMemo(
    () => orderOptions(options, shuffle),
    [options, shuffle],
  );
  const inputOptions = useMemo(
    () =>
      order.map(({ value: channel, label, ...marks }) => ({
        value: channel,
        label,
        icon: marks[iconStyle],
      })),
    [iconStyle, order],
  );
  const headlineHtml = useMemo(
    () => sanitizeMessage(headline || DEFAULT_HEADLINE),
    [headline],
  );

  const complete = useCallback(
    (channel: AcquisitionChannel) => {
      logEvent({
        event_name: UserAcquisitionEvent.Submit,
        target_id: channel,
      });
      onTransition({
        type: FunnelStepTransitionType.Complete,
        details: { acquisitionChannel: channel },
      });
    },
    [logEvent, onTransition],
  );

  const { mutate: submit, isPending } = useMutation({
    mutationFn: updateUserAcquisition,
    onSuccess: (_, channel) => complete(channel),
    // The answer is analytics, not something the funnel should stall on.
    onError: (_, channel) => complete(channel),
  });

  const onChange = useCallback((input: string[]) => {
    setValue(input.at(-1) as AcquisitionChannel);
  }, []);

  const onSkip = useCallback(() => {
    onTransition({ type: FunnelStepTransitionType.Skip });
  }, [onTransition]);

  return (
    <FunnelStepCtaWrapper
      isGlass
      cta={{ label: cta }}
      disabled={!value}
      loading={isPending}
      onClick={() => value && submit(value)}
      skip={skip ? { cta: skip, onClick: onSkip } : undefined}
      containerClassName="flex w-full flex-1 flex-col items-center overflow-hidden"
    >
      <div
        className={classNames(
          funnelStepRail,
          'z-1 flex flex-col items-center gap-6 py-6 pt-3',
        )}
      >
        <OnboardingHeadline
          dangerouslySetInnerHTML={{ __html: headlineHtml }}
        />
        {!!explainer && (
          <OnboardingSubheadline>{explainer}</OnboardingSubheadline>
        )}
        {/* The rail centres its children, and the group sizes to its content. */}
        <div className="w-full">
          <FormInputCheckboxGroup
            behaviour={CheckboxGroupBehaviour.Radio}
            name={id}
            onValueChange={onChange}
            options={inputOptions}
          />
        </div>
      </div>
    </FunnelStepCtaWrapper>
  );
}

export const FunnelAcquisition = withShouldSkipStepGuard(
  withIsActiveGuard(FunnelAcquisitionComponent),
  () => {
    const { user } = useAuthContext();

    return { shouldSkip: !!user?.acquisitionChannel };
  },
);
