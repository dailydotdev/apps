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
import { IconSize } from '../../../../components/Icon';
import { SimpleTooltip } from '../../../../components/tooltips/SimpleTooltip';
import { ExpandableContent } from '../../../../components/ExpandableContent';
import { useLogContext } from '../../../../contexts/LogContext';
import { combinedClicks } from '../../../../lib/click';
import { LogEvent, TargetType } from '../../../../lib/log';
import { anchorDefaultRel } from '../../../../lib/strings';
import { getUserSocialLinks } from '../../../../lib/socialLink';

export interface AboutMeProps {
  user: PublicProfile;
  className?: string;
}

const MAX_VISIBLE_LINKS = 3;

export function AboutMe({
  user,
  className,
}: AboutMeProps): ReactElement | null {
  const [showAllLinks, setShowAllLinks] = useState(false);
  const readme = user?.readmeHtml;
  const { logEvent } = useLogContext();

  // Markdown is supported only in the client due to sanitization
  const isClient = typeof window !== 'undefined';

  const socialLinks = useMemo(
    () => getUserSocialLinks(user, IconSize.XSmall),
    [user],
  );

  const visibleLinks = showAllLinks
    ? socialLinks
    : socialLinks.slice(0, MAX_VISIBLE_LINKS);
  const hasMoreLinks = socialLinks.length > MAX_VISIBLE_LINKS;

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
                {visibleLinks.map((link) => (
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
