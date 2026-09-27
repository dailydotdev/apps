import type { ReactElement } from 'react';
import React from 'react';
import type { Squad } from '../../../../graphql/sources';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../../components/typography/Typography';
import {
  FacebookIcon,
  LinkedInIcon,
  RedditIcon,
  TelegramIcon,
  TwitterIcon,
  WhatsappIcon,
} from '../../../../components/icons';
import {
  getFacebookShareLink,
  getLinkedInShareLink,
  getRedditShareLink,
  getTelegramShareLink,
  getTwitterShareLink,
  getWhatsappShareLink,
  ShareProvider,
} from '../../../../lib/share';
import { useShareOrCopyLink } from '../../../../hooks/useShareOrCopyLink';
import { LogEvent } from '../../../../lib/log';
import { useLogContext } from '../../../../contexts/LogContext';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import { CopyStateIcon } from '../../../../components/share/CopyStateIcon';
import { Tooltip } from '../../../../components/tooltip/Tooltip';
import { anchorDefaultRel } from '../../../../lib/strings';

interface SquadShareWidgetProps {
  squad: Squad;
}

export const getSquadShareText = (squad: Pick<Squad, 'name'>): string =>
  `Check out the ${squad.name} squad on daily.dev`;

export const SquadShareWidget = ({
  squad,
}: SquadShareWidgetProps): ReactElement => {
  const { logEvent } = useLogContext();
  const { permalink } = squad;
  const shareText = getSquadShareText(squad);
  const getLogObject = (provider: ShareProvider) => ({
    event_name: LogEvent.ShareSource,
    target_id: squad.id,
    extra: JSON.stringify({ provider }),
  });
  const [copying, onShareOrCopy] = useShareOrCopyLink({
    link: permalink,
    text: shareText,
    logObject: getLogObject,
  });

  const networks = [
    {
      icon: <TwitterIcon />,
      label: 'Share on X',
      href: getTwitterShareLink(permalink, shareText),
      provider: ShareProvider.Twitter,
    },
    {
      icon: <WhatsappIcon />,
      label: 'Share on WhatsApp',
      href: getWhatsappShareLink(permalink),
      provider: ShareProvider.WhatsApp,
    },
    {
      icon: <FacebookIcon />,
      label: 'Share on Facebook',
      href: getFacebookShareLink(permalink),
      provider: ShareProvider.Facebook,
    },
    {
      icon: <RedditIcon />,
      label: 'Share on Reddit',
      href: getRedditShareLink(permalink, shareText),
      provider: ShareProvider.Reddit,
    },
    {
      icon: <LinkedInIcon />,
      label: 'Share on LinkedIn',
      href: getLinkedInShareLink(permalink),
      provider: ShareProvider.LinkedIn,
    },
    {
      icon: <TelegramIcon />,
      label: 'Share on Telegram',
      href: getTelegramShareLink(permalink, shareText),
      provider: ShareProvider.Telegram,
    },
  ];

  return (
    <section className="flex flex-col rounded-16 border border-border-subtlest-tertiary p-4">
      <div className="flex w-full items-center gap-1">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <Typography type={TypographyType.Callout} bold>
            Public page & URL
          </Typography>
          <Typography
            type={TypographyType.Subhead}
            color={TypographyColor.Secondary}
            truncate
          >
            {permalink}
          </Typography>
        </div>
        <Tooltip content={copying ? 'Copied!' : 'Copy link'}>
          <Button
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.XSmall}
            icon={<CopyStateIcon copied={copying} />}
            onClick={onShareOrCopy}
            aria-label={copying ? 'Copied!' : 'Copy link'}
          />
        </Tooltip>
      </div>
      <div className="my-2 h-px w-full bg-border-subtlest-tertiary" />
      <div className="flex flex-wrap items-center gap-2">
        <Typography
          type={TypographyType.Subhead}
          color={TypographyColor.Tertiary}
        >
          Share
        </Typography>
        {networks.map(({ icon, label, href, provider }) => (
          <Tooltip content={label} key={provider}>
            <Button
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.XSmall}
              icon={icon}
              tag="a"
              href={href}
              target="_blank"
              rel={anchorDefaultRel}
              onClick={() => logEvent(getLogObject(provider))}
              aria-label={label}
            />
          </Tooltip>
        ))}
      </div>
    </section>
  );
};
