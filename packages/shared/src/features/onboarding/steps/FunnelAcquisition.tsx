import type { ReactElement } from 'react';
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
import { ACQUISITION_FORM_OPTIONS } from '../../../components/cards/AcquisitionForm/common/common';
import { shuffleArray } from '../../../lib/func';
import { IconSize } from '../../../components/Icon';
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

// Brand colours come from each logo's own `secondary` art. X stays on its
// theme-following art, since its colour file is near-black and vanishes on
// the dark theme. Hacker News is drawn the way the post page's community
// sentiment draws it, and ChatGPT as its app icon: the mark on black.
// Channels with no brand of their own get their filled icon in an accent tint.
const channelIcons: Record<AcquisitionChannel, ReactElement> = {
  [AcquisitionChannel.Friend]: (
    <InviteIcon secondary className="text-brand-default" />
  ),
  [AcquisitionChannel.X]: <TwitterIcon />,
  [AcquisitionChannel.Reddit]: <RedditIcon secondary />,
  [AcquisitionChannel.LinkedIn]: <LinkedInIcon secondary />,
  [AcquisitionChannel.InstagramFacebook]: <FacebookIcon secondary />,
  [AcquisitionChannel.YouTube]: <YoutubeIcon secondary />,
  [AcquisitionChannel.TikTok]: <TikTokIcon />,
  [AcquisitionChannel.HackerNews]: (
    <span
      className="grid size-5 place-items-center font-bold text-white typo-footnote"
      style={{ backgroundColor: '#FF6600' }}
    >
      Y
    </span>
  ),
  [AcquisitionChannel.SearchEngine]: <GoogleIcon secondary />,
  [AcquisitionChannel.AI]: (
    <span className="flex size-5 items-center justify-center rounded-6 border border-border-subtlest-tertiary bg-black text-white">
      <OpenAIIcon size={IconSize.XXSmall} />
    </span>
  ),
  [AcquisitionChannel.ExtensionStore]: <ChromeIcon />,
  [AcquisitionChannel.NewsletterBlog]: (
    <MailIcon secondary className="text-accent-water-default" />
  ),
  [AcquisitionChannel.Advertisement]: (
    <MegaphoneIcon secondary className="text-accent-ketchup-default" />
  ),
  [AcquisitionChannel.Other]: (
    <MenuIcon secondary className="text-text-tertiary" />
  ),
};

// The same marks as favicon-style tiles: one shape for every channel, the
// brand's colour behind a white glyph. Google and Chrome keep their colour art
// on white, the way their own favicons do. The hairline keeps the white and
// black tiles square against either theme.
const tile = (glyph: ReactElement, tone: string, color?: string) => (
  <span
    className={classNames(
      'flex size-6 items-center justify-center overflow-hidden rounded-6 border border-border-subtlest-tertiary',
      tone,
    )}
    style={color ? { backgroundColor: color } : undefined}
  >
    {glyph}
  </span>
);

const channelTiles: Record<AcquisitionChannel, ReactElement> = {
  [AcquisitionChannel.Friend]: tile(
    <InviteIcon secondary size={IconSize.Size16} />,
    'bg-brand-default text-white',
  ),
  [AcquisitionChannel.X]: tile(
    <TwitterIcon size={IconSize.Size16} />,
    'text-white',
    '#000000',
  ),
  [AcquisitionChannel.Reddit]: tile(
    <RedditIcon size={IconSize.Size16} />,
    'text-white',
    '#FF4500',
  ),
  [AcquisitionChannel.LinkedIn]: tile(
    <LinkedInIcon size={IconSize.Size16} />,
    'text-white',
    '#0A66C2',
  ),
  [AcquisitionChannel.InstagramFacebook]: tile(
    <FacebookIcon size={IconSize.Size16} />,
    'text-white',
    '#1877F2',
  ),
  [AcquisitionChannel.YouTube]: tile(
    <YoutubeIcon size={IconSize.Size16} />,
    'text-white',
    '#FF0000',
  ),
  [AcquisitionChannel.TikTok]: tile(
    <TikTokIcon size={IconSize.Size16} />,
    'text-white',
    '#000000',
  ),
  [AcquisitionChannel.HackerNews]: tile(
    <span className="font-bold typo-footnote">Y</span>,
    'text-white',
    '#FF6600',
  ),
  [AcquisitionChannel.SearchEngine]: tile(
    <GoogleIcon secondary size={IconSize.Size16} />,
    '',
    '#FFFFFF',
  ),
  [AcquisitionChannel.AI]: tile(
    <OpenAIIcon size={IconSize.Size16} />,
    'text-white',
    '#000000',
  ),
  [AcquisitionChannel.ExtensionStore]: tile(
    <ChromeIcon size={IconSize.Size16} />,
    '',
    '#FFFFFF',
  ),
  [AcquisitionChannel.NewsletterBlog]: tile(
    <MailIcon secondary size={IconSize.Size16} />,
    'bg-accent-water-default text-white',
  ),
  [AcquisitionChannel.Advertisement]: tile(
    <MegaphoneIcon secondary size={IconSize.Size16} />,
    'bg-accent-ketchup-default text-white',
  ),
  [AcquisitionChannel.Other]: tile(
    <MenuIcon secondary size={IconSize.Size16} />,
    'bg-background-default text-text-tertiary',
  ),
};

// "Other" is a catch-all, so it stays last however the rest are ordered.
const orderOptions = (
  options: AcquisitionChannel[] | undefined,
  shuffle: boolean,
) => {
  const selected = options?.length
    ? ACQUISITION_FORM_OPTIONS.filter(({ value }) => options.includes(value))
        // Config order, not the constant's.
        .sort((a, b) => options.indexOf(a.value) - options.indexOf(b.value))
    : ACQUISITION_FORM_OPTIONS;
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
  // Shuffled once per mount: re-ordering the list under a user who is halfway
  // through reading it is worse than the position bias it corrects.
  const [inputOptions] = useState(() =>
    orderOptions(options, shuffle).map((option) => ({
      ...option,
      icon: (iconStyle === 'tile' ? channelTiles : channelIcons)[option.value],
    })),
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
