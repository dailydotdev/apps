import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { Card, CardLink } from '../Card';
import { ButtonVariant } from '../../buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../typography/Typography';
import { largeNumberFormat } from '../../../lib';
import { Separator } from '../common';
import { SquadImage } from './common/SquadImage';
import { SquadJoinButtonWrapper } from './common/SquadJoinButton';
import { UnFeaturedSquadCardProps } from './common/types';

export const UnfeaturedSquadGrid = ({
  source,
  title,
  subtitle,
  icon,
  action,
  description,
}: UnFeaturedSquadCardProps): ReactElement => {
  return (
    <Card className={classNames('overflow-hidden border-0 p-4')}>
      <CardLink
        href={source.permalink}
        rel="noopener"
        title={source.description}
      />
      <div className="mb-3 flex items-center justify-between">
        <SquadImage
          image={source?.image}
          icon={icon}
          title={title}
          size="size-16"
        />
        <SquadJoinButtonWrapper
          action={action}
          source={source}
          variant={ButtonVariant.Float}
          className={{
            squadJoinButton: '!btn-tertiaryFloat',
          }}
        />
      </div>
      <Typography
        tag={TypographyTag.H1}
        type={TypographyType.Body}
        bold
        truncate
      >
        {title}
      </Typography>
      <Typography
        tag={TypographyTag.P}
        type={TypographyType.Callout}
        color={TypographyColor.Tertiary}
        className="multi-truncate line-clamp-2"
      >
        {source?.description || description}
      </Typography>

      {subtitle && (
        <Typography
          color={TypographyColor.Tertiary}
          type={TypographyType.Footnote}
          className="mt-2"
        >
          {subtitle} <Separator />
          <strong data-testid="squad-members-count">
            {largeNumberFormat(source.membersCount)}
          </strong>
        </Typography>
      )}
    </Card>
  );
};
