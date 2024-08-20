import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import { Card, CardLink } from '../cards/Card';
import { SourceType } from '../../graphql/sources';
import { Button, ButtonVariant } from '../buttons/Button';
import { SquadJoinButton } from '../squads/SquadJoinButton';
import { Origin } from '../../lib/log';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import { largeNumberFormat } from '../../lib';
import { Separator } from '../cards/common';
import { UnFeaturedSourceCardProps } from './commonTypes';
import { SourceImage } from './SourceImage';

export const UnfeaturedSourceCard = ({
  source,
  title,
  subtitle,
  icon,
  action,
  description,
}: UnFeaturedSourceCardProps): ReactElement => {
  const router = useRouter();

  return (
    <Card className={classNames('overflow-hidden border-0 p-4')}>
      <CardLink
        href={source.permalink}
        rel="noopener"
        title={source.description}
      />
      <div className="mb-3 flex items-center justify-between">
        <SourceImage
          image={source?.image}
          icon={icon}
          title={title}
          size="size-16"
        />
        {!!action &&
        action?.type === 'action' &&
        source?.type === SourceType.Squad ? (
          <SquadJoinButton
            className={{ button: '!btn-tertiaryFloat' }}
            squad={source}
            origin={Origin.SquadDirectory}
            onSuccess={() => router.push(source?.permalink)}
            joinText={action?.text}
            data-testid="squad-action"
          />
        ) : (
          <Button
            variant={ButtonVariant.Float}
            onClick={action?.type === 'action' ? action?.onClick : undefined}
            tag={action?.type === 'link' ? 'a' : undefined}
            href={action?.type === 'link' && action.href}
            target={action?.target ? action.target : '_self'}
            rel="noopener"
            data-testid="source-action"
          >
            {action?.text}
          </Button>
        )}
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
          <strong>{largeNumberFormat(source.membersCount)}</strong>
        </Typography>
      )}
    </Card>
  );
};
