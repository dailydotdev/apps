import React from 'react';
import Link from '../../utilities/Link';
import EntityCard from './EntityCard';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../typography/Typography';
import type { SourceTooltip } from '../../../graphql/sources';
import { largeNumberFormat } from '../../../lib';
import CustomFeedOptionsMenu from '../../CustomFeedOptionsMenu';
import { ButtonVariant } from '../../buttons/Button';
import { Separator } from '../common/common';
import EntityDescription from './EntityDescription';
import useSourceMenuProps from '../../../hooks/useSourceMenuProps';
import { ContentPreferenceType } from '../../../graphql/contentPreference';
import useShowFollowAction from '../../../hooks/useShowFollowAction';
import { FollowButton } from '../../contentPreference/FollowButton';
import { useContentPreferenceStatusQuery } from '../../../hooks/contentPreference/useContentPreferenceStatusQuery';

type SourceEntityCardProps = {
  source: SourceTooltip;
  className?: {
    container?: string;
  };
};

const SourceEntityCard = ({ source, className }: SourceEntityCardProps) => {
  const sourceId = source?.id ?? '';
  const { showActionBtn } = useShowFollowAction({
    entityId: sourceId,
    entityType: ContentPreferenceType.Source,
  });

  const { data: contentPreference } = useContentPreferenceStatusQuery({
    id: sourceId,
    entity: ContentPreferenceType.Source,
  });
  const menuProps = useSourceMenuProps({ source });

  if (!source?.id || !source.name || !source.image || !source.permalink) {
    return null;
  }

  return (
    <EntityCard
      permalink={source.permalink}
      image={source.image}
      type="source"
      className={{
        container: className?.container,
        image: 'size-10 rounded-full',
      }}
      entityName={source.name}
      actionButtons={
        <>
          <CustomFeedOptionsMenu
            buttonVariant={ButtonVariant.Option}
            className={{
              menu: 'z-[9999]',
              button: 'invisible group-hover/menu:visible',
            }}
            {...menuProps}
          />
          {showActionBtn && (
            <FollowButton
              entityId={source.id ?? ''}
              entityName={source.name}
              type={ContentPreferenceType.Source}
              variant={ButtonVariant.Primary}
              status={contentPreference?.status}
              showSubscribe={false}
            />
          )}
        </>
      }
    >
      <div className="mt-3 flex w-full flex-col gap-2">
        <Link passHref href={source.permalink}>
          <Typography
            tag={TypographyTag.Link}
            className="flex hover:underline"
            type={TypographyType.Body}
            color={TypographyColor.Primary}
            bold
            title={source.permalink}
          >
            {source.name}
          </Typography>
        </Link>
        {source.description && (
          <EntityDescription copy={source.description} length={100} />
        )}
        <div className="flex items-center gap-1 text-text-tertiary">
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            {largeNumberFormat(source.membersCount ?? 0) || 0} Followers
          </Typography>
          <Separator />
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            {largeNumberFormat(source.flags?.totalUpvotes ?? 0) || 0} Upvotes
          </Typography>
        </div>
      </div>
    </EntityCard>
  );
};

export default SourceEntityCard;
