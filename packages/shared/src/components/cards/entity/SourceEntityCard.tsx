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
  source?: SourceTooltip;
  className?: {
    container?: string;
  };
};

const SourceEntityCard = ({ source, className }: SourceEntityCardProps) => {
  const { showActionBtn } = useShowFollowAction({
    entityId: source?.id,
    entityType: ContentPreferenceType.Source,
  });

  const { data: contentPreference } = useContentPreferenceStatusQuery({
    id: source?.id,
    entity: ContentPreferenceType.Source,
  });
  const menuProps = useSourceMenuProps({ source });

  const { description, membersCount, flags, name, image, permalink } =
    source || {};
  return (
    <EntityCard
      permalink={permalink}
      image={image}
      type="source"
      className={{
        container: className?.container,
        image: 'size-10 rounded-full',
      }}
      entityName={name}
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
              entityId={source?.id}
              entityName={source?.name}
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
        <Link passHref href={permalink}>
          <Typography
            tag={TypographyTag.Link}
            className="flex"
            type={TypographyType.Body}
            color={TypographyColor.Primary}
            bold
          >
            {name}
          </Typography>
        </Link>
        {description && <EntityDescription copy={description} length={100} />}
        <div className="flex items-center gap-1 text-text-tertiary">
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            {largeNumberFormat(membersCount) || 0} Followers
          </Typography>
          <Separator />
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            {largeNumberFormat(flags?.totalUpvotes) || 0} Upvotes
          </Typography>
        </div>
      </div>
    </EntityCard>
  );
};

export default SourceEntityCard;
