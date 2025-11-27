import { type ReactElement } from 'react';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import type { PublicProfile } from '../../../lib/user';
import Markdown from '../../../components/Markdown';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import {
  Typography,
  TypographyType,
  TypographyColor,
} from '../../../components/typography/Typography';
import {
  BlueskyIcon,
  CodePenIcon,
  GitHubIcon,
  LinkedInIcon,
  LinkIcon,
  MastodonIcon,
  RedditIcon,
  RoadmapIcon,
  StackOverflowIcon,
  ThreadsIcon,
  TwitterIcon,
  YoutubeIcon,
} from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { SimpleTooltip } from '../../../components/tooltips/SimpleTooltip';
import { ExpandableContent } from '../../../components/ExpandableContent';
import { useLogContext } from '../../../contexts/LogContext';
import { combinedClicks } from '../../../lib/click';
import { LogEvent, TargetType } from '../../../lib/log';
import { anchorDefaultRel } from '../../../lib/strings';

export interface AboutMeProps {
  user: PublicProfile;
  className?: string;
}

interface SocialLink {
  id: string;
  url: string;
  icon: ReactElement;
  label: string;
}

export function AboutMe({
  user,
  className,
}: AboutMeProps): ReactElement | null {
  const readme = user?.readmeHtml;
  const { logEvent } = useLogContext();

  // Markdown is supported only in the client due to sanitization
  const isClient = typeof window !== 'undefined';

  const socialLinks = useMemo(() => {
    return [
      user.github && {
        id: 'github',
        url: `https://github.com/${user.github}`,
        icon: <GitHubIcon size={IconSize.XSmall} />,
        label: 'GitHub',
      },
      user.linkedin && {
        id: 'linkedin',
        url: `https://linkedin.com/in/${user.linkedin}`,
        icon: <LinkedInIcon size={IconSize.XSmall} />,
        label: 'LinkedIn',
      },
      user.portfolio && {
        id: 'portfolio',
        url: user.portfolio,
        icon: <LinkIcon size={IconSize.XSmall} />,
        label: 'Portfolio',
      },
      user.twitter && {
        id: 'twitter',
        url: `https://x.com/${user.twitter}`,
        icon: <TwitterIcon size={IconSize.XSmall} />,
        label: 'Twitter',
      },
      user.youtube && {
        id: 'youtube',
        url: `https://youtube.com/@${user.youtube}`,
        icon: <YoutubeIcon size={IconSize.XSmall} />,
        label: 'YouTube',
      },
      user.stackoverflow && {
        id: 'stackoverflow',
        url: `https://stackoverflow.com/users/${user.stackoverflow}`,
        icon: <StackOverflowIcon size={IconSize.XSmall} />,
        label: 'Stack Overflow',
      },
      user.reddit && {
        id: 'reddit',
        url: `https://reddit.com/user/${user.reddit}`,
        icon: <RedditIcon size={IconSize.XSmall} />,
        label: 'Reddit',
      },
      user.roadmap && {
        id: 'roadmap',
        url: `https://roadmap.sh/u/${user.roadmap}`,
        icon: <RoadmapIcon size={IconSize.XSmall} />,
        label: 'Roadmap.sh',
      },
      user.codepen && {
        id: 'codepen',
        url: `https://codepen.io/${user.codepen}`,
        icon: <CodePenIcon size={IconSize.XSmall} />,
        label: 'CodePen',
      },
      user.mastodon && {
        id: 'mastodon',
        url: user.mastodon,
        icon: <MastodonIcon size={IconSize.XSmall} />,
        label: 'Mastodon',
      },
      user.bluesky && {
        id: 'bluesky',
        url: `https://bsky.app/profile/${user.bluesky}`,
        icon: <BlueskyIcon size={IconSize.XSmall} />,
        label: 'Bluesky',
      },
      user.threads && {
        id: 'threads',
        url: `https://threads.net/@${user.threads}`,
        icon: <ThreadsIcon size={IconSize.XSmall} />,
        label: 'Threads',
      },
    ].filter(Boolean) as SocialLink[];
  }, [user]);

  const shouldShowReadme = readme && isClient;
  const shouldShowSocialLinks = socialLinks.length > 0;

  if (!shouldShowReadme && !shouldShowSocialLinks) {
    return null;
  }

  return (
    <div className={classNames('py-4', className)}>
      <ExpandableContent maxHeight={320}>
        <div className="flex flex-col gap-4">
          <Typography
            type={TypographyType.Body}
            color={TypographyColor.Primary}
            bold
          >
            About me
          </Typography>

          <div className="flex flex-1 flex-col gap-4">
            {shouldShowSocialLinks && (
              <div className="flex flex-wrap items-center gap-2">
                {socialLinks.map((link) => (
                  <SimpleTooltip key={link.id} content={link.label}>
                    <Button
                      variant={ButtonVariant.Subtle}
                      size={ButtonSize.Small}
                      tag="a"
                      href={link.url}
                      target="_blank"
                      rel={anchorDefaultRel}
                      icon={link.icon}
                      aria-label={link.label}
                      data-testid={`social-link-${link.id}`}
                      {...combinedClicks(() => {
                        logEvent({
                          event_name: LogEvent.Click,
                          target_type: TargetType.SocialLink,
                          target_id: link.id,
                        });
                      })}
                    />
                  </SimpleTooltip>
                ))}
              </div>
            )}

            {shouldShowReadme && (
              <div>
                <Markdown content={readme} />
              </div>
            )}
          </div>
        </div>
      </ExpandableContent>
    </div>
  );
}
