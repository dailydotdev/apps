import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { ActivityContainer } from '../../../../components/profile/ActivitySection';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../../components/typography/Typography';
import {
  CopyIcon,
  TwitterIcon,
  WhatsappIcon,
  FacebookIcon,
  RedditIcon,
  LinkedInIcon,
  TelegramIcon,
  MenuIcon,
} from '../../../../components/icons';
import {
  getFacebookShareLink,
  getTwitterShareLink,
  getWhatsappShareLink,
  getRedditShareLink,
  getLinkedInShareLink,
  getTelegramShareLink,
  ShareProvider,
} from '../../../../lib/share';
import { useShareOrCopyLink } from '../../../../hooks/useShareOrCopyLink';
import { useGetShortUrl } from '../../../../hooks/utils/useGetShortUrl';
import { webappUrl } from '../../../../lib/constants';
import { LogEvent, TargetType } from '../../../../lib/log';
import { useLogContext } from '../../../../contexts/LogContext';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import { Tooltip } from '../../../../components/tooltip/Tooltip';
import { Divider } from '../../../../components/utilities/Divider';
import { anchorDefaultRel } from '../../../../lib/strings';

interface ShareProps {
  username: string;
  className?: string;
}

export const Share = ({ username, className }: ShareProps): ReactElement => {
  const baseUrl =
    webappUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  const profileUrl = `${baseUrl}/${username}`;
  const { logEvent } = useLogContext();
  const { getShortUrl } = useGetShortUrl();
  const shareText = 'Check out my profile on daily.dev!';
  const [shortUrl, setShortUrl] = useState<string>(profileUrl);

  useEffect(() => {
    const fetchShortUrl = async () => {
      try {
        const url = await getShortUrl(profileUrl);
        setShortUrl(url);
      } catch (err) {
        // Fallback to original URL if shortening fails
        setShortUrl(profileUrl);
      }
    };

    fetchShortUrl();
  }, [profileUrl, getShortUrl]);

  const getLogObject = (provider: ShareProvider) => ({
    event_name: LogEvent.ShareProfile,
    target_type: TargetType.ProfilePage,
    extra: JSON.stringify({ provider }),
  });

  const [copying, onShareOrCopy] = useShareOrCopyLink({
    link: profileUrl,
    text: shareText,
    logObject: getLogObject,
  });

  const logShare = (provider: ShareProvider) => {
    logEvent(getLogObject(provider));
  };

  const handleNativeShare = async () => {
    await navigator.share({
      title: 'My daily.dev profile',
      text: shareText,
      url: shortUrl,
    });
    logEvent(getLogObject(ShareProvider.Native));
  };

  const socialShareConfig = [
    {
      icon: <TwitterIcon />,
      tooltip: 'Share on X',
      href: getTwitterShareLink(shortUrl, shareText),
      provider: ShareProvider.Twitter,
    },
    {
      icon: <WhatsappIcon />,
      tooltip: 'Share on WhatsApp',
      href: getWhatsappShareLink(shortUrl),
      provider: ShareProvider.WhatsApp,
    },
    {
      icon: <FacebookIcon />,
      tooltip: 'Share on Facebook',
      href: getFacebookShareLink(shortUrl),
      provider: ShareProvider.Facebook,
    },
    {
      icon: <RedditIcon />,
      tooltip: 'Share on Reddit',
      href: getRedditShareLink(shortUrl, shareText),
      provider: ShareProvider.Reddit,
    },
    {
      icon: <LinkedInIcon />,
      tooltip: 'Share on LinkedIn',
      href: getLinkedInShareLink(shortUrl),
      provider: ShareProvider.LinkedIn,
    },
    {
      icon: <TelegramIcon />,
      tooltip: 'Share on Telegram',
      href: getTelegramShareLink(shortUrl, shareText),
      provider: ShareProvider.Telegram,
    },
  ];

  return (
    <ActivityContainer
      className={classNames(
        'max-w-full rounded-none border-x-0 px-0 laptop:rounded-16 laptop:border-x laptop:p-4',
        className,
      )}
    >
      <div className="flex w-full items-center gap-1">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Primary}
            bold
          >
            Public profile & URL
          </Typography>
          <Typography
            type={TypographyType.Subhead}
            color={TypographyColor.Secondary}
            truncate
          >
            {profileUrl}
          </Typography>
        </div>
        <Tooltip content={copying ? 'Copied!' : 'Copy link'}>
          <Button
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.XSmall}
            icon={<CopyIcon secondary={copying} />}
            onClick={onShareOrCopy}
            aria-label={copying ? 'Copied!' : 'Copy link'}
          />
        </Tooltip>
      </div>

      <Divider className="my-2 bg-border-subtlest-tertiary opacity-0 laptop:opacity-100" />

      <div className="flex flex-wrap items-center gap-2">
        <Typography
          type={TypographyType.Subhead}
          color={TypographyColor.Tertiary}
        >
          Share
        </Typography>
        {socialShareConfig.map(({ icon, tooltip, href, provider }) => (
          <Tooltip content={tooltip} key={provider}>
            <Button
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.XSmall}
              icon={icon}
              tag="a"
              href={href}
              target="_blank"
              rel={anchorDefaultRel}
              onClick={() => logShare(provider)}
              aria-label={tooltip}
            />
          </Tooltip>
        ))}
        {globalThis?.navigator?.share && (
          <Tooltip content="Share via...">
            <Button
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.XSmall}
              icon={<MenuIcon className="rotate-90" />}
              onClick={handleNativeShare}
              aria-label="Share via..."
            />
          </Tooltip>
        )}
      </div>
    </ActivityContainer>
  );
};
