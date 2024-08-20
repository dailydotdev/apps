import React, { ReactElement, ReactNode } from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import { Card } from '../cards/Card';
import { SourceType, Squad } from '../../graphql/sources';
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

type SourceCardActionType = 'link' | 'action';

interface SourceCardAction {
  type: SourceCardActionType;
  text: string;
  href?: string;
  target?: string;
  onClick?: () => void;
}

interface SourceCardProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: SourceCardAction;
  description?: string;
  source?: Squad;
}
export const UnfeaturedSourceCard = ({
  source,
  title,
  subtitle,
  icon,
  action,
  description,
}: SourceCardProps): ReactElement => {
  const router = useRouter();

  return (
    <Card className={classNames('overflow-hidden border-0 p-4')}>
      {/* <CardOverlay post={post} onPostCardClick={() => source?.permalink} /> */}
      <div className="mb-3 flex items-end justify-between">
        {source?.image ? (
          <img
            className="h-16 w-16 rounded-full"
            src={source?.image}
            alt={`${title} source`}
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-pepper-subtle">
            {icon}
          </div>
        )}
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
        {/* {source?.membersCount > 0 && ( */}
        {/*  <SquadMemberShortList */}
        {/*    squad={{ */}
        {/*      ...source, */}
        {/*      type: SourceType.Squad, */}
        {/*    }} */}
        {/*    members={source?.members?.edges?.reduce((acc, current) => { */}
        {/*      acc.push(current.node); */}
        {/*      return acc; */}
        {/*    }, [])} */}
        {/*  /> */}
        {/* )} */}
      </div>
      <Typography tag={TypographyTag.H1} type={TypographyType.Body} bold>
        {title}
      </Typography>
      <Typography
        tag={TypographyTag.P}
        type={TypographyType.Callout}
        color={TypographyColor.Tertiary}
        className="multi-truncate line-clamp-5"
      >
        {source?.description || description} hhhghjggjh
      </Typography>

      {subtitle && (
        <div className="mt-2">
          {subtitle} {largeNumberFormat(source.membersCount)}
        </div>
      )}
    </Card>
  );
};
