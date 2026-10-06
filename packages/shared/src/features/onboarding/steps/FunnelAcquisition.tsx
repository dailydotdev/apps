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
import { ChromeIcon } from '../../../components/icons/Browser/Chrome';
import { CompassIcon } from '../../../components/icons/Compass';
import { GitHubIcon } from '../../../components/icons/GitHub';
import { GoogleIcon } from '../../../components/icons/Google';
import { HelpIcon } from '../../../components/icons/Help';
import { InviteIcon } from '../../../components/icons/Invite';
import { LinkedInIcon } from '../../../components/icons/LinkedIn';
import { MailIcon } from '../../../components/icons/Mail';
import { OpenAIIcon } from '../../../components/icons/OpenAI';
import { RedditIcon } from '../../../components/icons/Reddit';
import { TwitterIcon } from '../../../components/icons/Twitter';
import { YoutubeIcon } from '../../../components/icons/Youtube';

const DEFAULT_HEADLINE = 'How did you hear about us?';
const OTHER_PLACEHOLDER = 'Where did you hear about us?';
// Long enough for "a talk at a meetup in Berlin", short enough to stay a
// source and not a story.
export const OTHER_DETAIL_MAX_LENGTH = 100;

// Catch-alls stay at the end, in this order, however the rest are ordered.
const PINNED_LAST = [AcquisitionChannel.DontRemember, AcquisitionChannel.Other];

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
    label: 'Friend or colleague',
    ...accentMark(InviteIcon, '--theme-brand-default', 'text-brand-default'),
  },
  {
    value: AcquisitionChannel.SearchEngine,
    label: 'Search engine',
    ...faviconMark(GoogleIcon),
  },
  {
    value: AcquisitionChannel.AI,
    label: 'AI assistant like ChatGPT',
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
    value: AcquisitionChannel.Creator,
    label: 'YouTube, podcast or creator',
    ...brandMark(YoutubeIcon, acquisitionBrandColors.youTube),
  },
  {
    value: AcquisitionChannel.GitHub,
    label: 'GitHub',
    ...brandMark(GitHubIcon, acquisitionBrandColors.gitHub),
  },
  {
    value: AcquisitionChannel.Reddit,
    label: 'Reddit',
    ...brandMark(RedditIcon, acquisitionBrandColors.reddit),
  },
  {
    value: AcquisitionChannel.X,
    label: 'X (Twitter)',
    ...brandMark(TwitterIcon, acquisitionBrandColors.x, <TwitterIcon />),
  },
  {
    value: AcquisitionChannel.LinkedIn,
    label: 'LinkedIn',
    ...brandMark(LinkedInIcon, acquisitionBrandColors.linkedIn),
  },
  {
    value: AcquisitionChannel.NewsletterBlog,
    label: 'Blog, newsletter or website',
    ...accentMark(
      MailIcon,
      '--theme-accent-water-default',
      'text-accent-water-default',
    ),
  },
  {
    value: AcquisitionChannel.AppStore,
    label: 'Chrome Web Store or app store',
    ...faviconMark(ChromeIcon),
  },
  {
    value: AcquisitionChannel.DontRemember,
    label: "I don't remember",
    logo: <HelpIcon secondary className="text-text-tertiary" />,
    tile: (
      <Tile className="bg-background-default text-text-tertiary">
        <HelpIcon secondary size={IconSize.Size16} />
      </Tile>
    ),
  },
  {
    value: AcquisitionChannel.Other,
    label: 'Other',
    logo: <CompassIcon secondary className="text-text-tertiary" />,
    tile: (
      <Tile className="bg-background-default text-text-tertiary">
        <CompassIcon secondary size={IconSize.Size16} />
      </Tile>
    ),
  },
];

// "I don't remember" and "Other" are catch-alls, so they stay last however the
// rest are ordered. "I don't remember" travels with "Other": a funnel config
// that offers Other gets it too, without listing the new key.
const orderOptions = (
  options: AcquisitionChannel[] | undefined,
  shuffle: boolean,
) => {
  const wanted = options?.length
    ? new Set([
        ...options,
        ...(options.includes(AcquisitionChannel.Other)
          ? [AcquisitionChannel.DontRemember]
          : []),
      ])
    : undefined;
  const selected = wanted
    ? CHANNEL_OPTIONS.filter(({ value }) => wanted.has(value))
        // Config order, not the constant's.
        .sort((a, b) => options.indexOf(a.value) - options.indexOf(b.value))
    : CHANNEL_OPTIONS;
  const pinned = PINNED_LAST.flatMap((channel) =>
    selected.filter(({ value }) => value === channel),
  );
  const rest = selected.filter(({ value }) => !PINNED_LAST.includes(value));

  return [...(shuffle ? shuffleArray(rest) : rest), ...pinned];
};

interface OtherDetailProps {
  icon: ReactElement;
  name: string;
  value: string;
  onChange: (value: string) => void;
}

// Picking "Other" swaps its row for a text box in the same place, still in its
// selected state, so the answer reads as a refinement of the choice.
const OtherDetail = ({
  icon,
  name,
  value,
  onChange,
}: OtherDetailProps): ReactElement => (
  <label
    className="flex min-h-14 w-full cursor-text items-center gap-3 rounded-8 border border-solid border-brand-default bg-brand-active px-4 typo-body"
    htmlFor={`${name}-other`}
  >
    <span className="flex size-6 items-center justify-center">{icon}</span>
    <input
      // The row the user just tapped turns into the field; typing is the next
      // thing they do.
      // eslint-disable-next-line jsx-a11y/no-autofocus
      autoFocus
      aria-label={OTHER_PLACEHOLDER}
      className="min-w-0 flex-1 bg-transparent py-3 text-text-primary outline-none placeholder:text-text-tertiary"
      id={`${name}-other`}
      maxLength={OTHER_DETAIL_MAX_LENGTH}
      name={`${name}-other`}
      onChange={(event) => onChange(event.target.value)}
      placeholder={OTHER_PLACEHOLDER}
      type="text"
      value={value}
    />
  </label>
);

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
  const [otherDetail, setOtherDetail] = useState('');
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
  const otherOption = inputOptions.find(
    ({ value: channel }) => channel === AcquisitionChannel.Other,
  );
  const isOtherSelected = value === AcquisitionChannel.Other;
  // While "Other" is a text box, the buttons above it are the whole group.
  const groupOptions = isOtherSelected
    ? inputOptions.filter(({ value: channel }) => channel !== otherOption.value)
    : inputOptions;
  const headlineHtml = useMemo(
    () => sanitizeMessage(headline || DEFAULT_HEADLINE),
    [headline],
  );

  const complete = useCallback(
    (channel: AcquisitionChannel) => {
      const detail = otherDetail.trim();

      logEvent({
        event_name: UserAcquisitionEvent.Submit,
        target_id: channel,
        // The profile keeps the key, so every report still groups on it; what
        // they typed lives on the event.
        ...(channel === AcquisitionChannel.Other &&
          !!detail && { extra: JSON.stringify({ other: detail }) }),
      });
      onTransition({
        type: FunnelStepTransitionType.Complete,
        details: { acquisitionChannel: channel },
      });
    },
    [logEvent, onTransition, otherDetail],
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
        <div className="flex w-full flex-col gap-2">
          <FormInputCheckboxGroup
            behaviour={CheckboxGroupBehaviour.Radio}
            name={id}
            onValueChange={onChange}
            options={groupOptions}
            value={value && !isOtherSelected ? [value] : []}
          />
          {isOtherSelected && (
            <OtherDetail
              icon={otherOption.icon}
              name={id}
              onChange={setOtherDetail}
              value={otherDetail}
            />
          )}
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
