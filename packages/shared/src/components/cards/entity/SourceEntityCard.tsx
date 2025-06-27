import React from 'react';
import Link from '../../utilities/Link';
import EntityCard from './EntityCard';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';
import type { Source, SourceTooltip } from '../../../graphql/sources';
import { largeNumberFormat } from '../../../lib';
import CustomFeedOptionsMenu from '../../CustomFeedOptionsMenu';
import SourceActionsFollow from '../../sources/SourceActions/SourceActionsFollow';
import { ButtonVariant } from '../../buttons/Button';
import { useSourceActions } from '../../../hooks';
import { Separator } from '../common/common';
import EntityDescription from './EntityDescription';
import useSourceMenuProps from '../../../hooks/useSourceMenuProps';

type SourceEntityCardProps = {
  source: SourceTooltip;
  className?: {
    container?: string;
  };
};

const SourceEntityCard = ({ source, className }: SourceEntityCardProps) => {
  const { isFollowing, toggleFollow } = useSourceActions({
    source: source as Source,
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
            }}
            {...menuProps}
          />
          <SourceActionsFollow
            isFetching={false}
            isSubscribed={isFollowing}
            onClick={toggleFollow}
            variant={ButtonVariant.Primary}
          />
        </>
      }
    >
      <div className="mt-3 flex w-full flex-col gap-2">
        <Link href={permalink}>
          <Typography
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
