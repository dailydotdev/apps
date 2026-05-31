import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Post } from '../../graphql/posts';
import type { Tag } from '../../graphql/feedSettings';
import { capitalize } from '../../lib/strings';
import { VIcon } from '../../components/icons';
import { IconSize } from '../../components/Icon';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../components/typography/Typography';
import { TagElement } from '../../components/tags/TagElement';
import { onboardingGradientClasses } from '../../components/onboarding/common';
import { authGradientBg } from '../../components/marketing/banners/common';
import { useAnonFeedTags } from './useAnonFeedTags';
import { LivePulse } from './LivePulse';
import { BuildFeedAuthOptions } from './BuildFeedAuthOptions';

interface BuildFeedConversionCardProps {
  post: Post;
}

const MAX_CHIPS = 6;

const Benefit = ({ children }: { children: string }): ReactElement => (
  <li className="flex items-start gap-2">
    <VIcon
      size={IconSize.Size16}
      className="mt-0.5 shrink-0 text-accent-avocado-default"
    />
    <Typography type={TypographyType.Callout} color={TypographyColor.Primary}>
      {children}
    </Typography>
  </li>
);

/**
 * The standout anonymous conversion surface. A focused product hero on the
 * brand gradient: a headline made relevant by the article's topic, three
 * explicit benefits, a real-time activity pulse, no-password topic tuning,
 * and inline one-tap signup — engineered for the aha moment.
 */
export const BuildFeedConversionCard = ({
  post,
}: BuildFeedConversionCardProps): ReactElement => {
  const { chips, selectedTags, toggleTag } = useAnonFeedTags({
    postTags: post?.tags ?? [],
    enabled: true,
  });

  const primaryTopic = chips[0] ? capitalize(chips[0]) : null;
  const topicList = chips.slice(0, 3).map(capitalize).join(', ');

  return (
    <div className="overflow-hidden rounded-16 border border-accent-cabbage-default shadow-2">
      <div className={classNames(authGradientBg, 'flex flex-col gap-3 p-4')}>
        <Typography
          bold
          type={TypographyType.Caption1}
          color={TypographyColor.Tertiary}
          className="uppercase tracking-wider"
        >
          Personalized for you
        </Typography>
        <Typography
          bold
          tag={TypographyTag.H2}
          type={TypographyType.Title2}
          className={onboardingGradientClasses}
        >
          {primaryTopic
            ? `Your daily feed of ${primaryTopic}`
            : 'Your personalized dev feed'}
        </Typography>
        <ul className="flex flex-col gap-2">
          <Benefit>
            {topicList
              ? `The best of ${topicList} — every morning`
              : 'The best dev content — every morning'}
          </Benefit>
          <Benefit>Real discussions with developers who get it</Benefit>
          <Benefit>Save, organize & never lose a great read</Benefit>
        </ul>
        <LivePulse post={post} />
      </div>

      <div className="flex flex-col gap-3 p-4">
        <div className="flex flex-col gap-2">
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
            className="uppercase tracking-wider"
          >
            Tune your topics
          </Typography>
          <div className="flex flex-wrap gap-2">
            {chips.slice(0, MAX_CHIPS).map((tag) => (
              <TagElement
                key={tag}
                tag={{ name: tag } as Tag}
                isSelected={selectedTags.includes(tag)}
                onClick={({ tag: clicked }) =>
                  clicked.name && toggleTag(clicked.name)
                }
              />
            ))}
          </div>
        </div>
        <BuildFeedAuthOptions tags={selectedTags} origin="sidebar" />
      </div>
    </div>
  );
};
