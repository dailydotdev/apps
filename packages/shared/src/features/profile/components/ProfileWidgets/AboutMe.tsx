import type { ReactElement } from 'react';
import React, { useMemo, useState } from 'react';
import classNames from 'classnames';
import type { PublicProfile } from '../../../../lib/user';
import Markdown from '../../../../components/Markdown';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import {
  Typography,
  TypographyType,
  TypographyColor,
} from '../../../../components/typography/Typography';
import {
  BlueskyIcon,
  CodePenIcon,
  CopyIcon,
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
} from '../../../../components/icons';
import { IconSize } from '../../../../components/Icon';
import { useCopyLink } from '../../../../hooks/useCopy';
import { SimpleTooltip } from '../../../../components/tooltips/SimpleTooltip';
import { ExpandableContent } from '../../../../components/ExpandableContent';
import { useLogContext } from '../../../../contexts/LogContext';
import { combinedClicks } from '../../../../lib/click';
import { LogEvent, TargetType } from '../../../../lib/log';

export interface AboutMeProps {
  user: PublicProfile;
  className?: string;
}

const MAX_VISIBLE_LINKS = 3;

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
  const [showAllLinks, setShowAllLinks] = useState(false);
  const readme = user?.readmeHtml;
  const [, copyLink] = useCopyLink();
  const { logEvent } = useLogContext();

  // Markdown is supported only in the client due to sanitization
  const isClient = typeof window !== 'undefined';

  // Memoize social links to avoid recalculating on every render
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
        url: user.linkedin,
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

  const visibleLinks = showAllLinks
    ? socialLinks
    : socialLinks.slice(0, MAX_VISIBLE_LINKS);
  const hasMoreLinks = socialLinks.length > MAX_VISIBLE_LINKS;

  if (!readme || !isClient) {
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
            <div className="flex flex-wrap items-center gap-2">
              <SimpleTooltip content="Copy profile link">
                <Button
                  variant={ButtonVariant.Subtle}
                  size={ButtonSize.Small}
                  onClick={() => copyLink({ link: user.permalink })}
                  icon={<CopyIcon size={IconSize.XSmall} />}
                  aria-label="Copy profile link"
                  data-testid="copy-profile-link"
                  {...combinedClicks(() => {
                    logEvent({
                      event_name: LogEvent.Click,
                      target_type: TargetType.ProfilePage,
                      target_id: 'copy_profile_link',
                    });
                  })}
                />
              </SimpleTooltip>
              {visibleLinks.map((link) => (
                <SimpleTooltip key={link.id} content={link.label}>
                  <Button
                    variant={ButtonVariant.Subtle}
                    size={ButtonSize.Small}
                    tag="a"
                    href={link.url}
                    target="_blank"
                    rel="noopener"
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
              {hasMoreLinks && !showAllLinks && (
                <SimpleTooltip content="Show all links">
                  <Button
                    variant={ButtonVariant.Subtle}
                    size={ButtonSize.Small}
                    onClick={() => setShowAllLinks(true)}
                    data-testid="show-all-links"
                  >
                    +{socialLinks.length - MAX_VISIBLE_LINKS}
                  </Button>
                </SimpleTooltip>
              )}
            </div>
            <div>
              <Markdown content={readme} />
            </div>
          </div>
        </div>
      </ExpandableContent>
    </div>
  );
}
