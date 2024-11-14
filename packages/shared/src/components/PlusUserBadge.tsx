import React, { ReactElement } from 'react';
import type { PublicProfile } from '../lib/user';
import { SimpleTooltip } from './tooltips';
import { useAuthContext } from '../contexts/AuthContext';
import { PlusUser } from './PlusUser';
import { plusUrl } from '../lib/constants';
import Link from './utilities/Link';
import {
  Typography,
  TypographyColor,
  TypographyTag,
} from './typography/Typography';
import ConditionalWrapper from './ConditionalWrapper';
import { DateFormat } from './utilities';
import { TimeFormatType } from '../lib/dateFormat';

export type Props = {
  user: Pick<PublicProfile, 'isPlus' | 'plusMemberSince'>;
  tooltip?: boolean;
};

export const PlusUserBadge = ({
  user,
  tooltip = true,
}: Props): ReactElement => {
  const { user: myself, isLoggedIn } = useAuthContext();
  const { isPlus, plusMemberSince } = user;

  if (!isPlus) {
    return null;
  }

  return (
    <ConditionalWrapper
      condition={tooltip}
      wrapper={(child) => (
        <SimpleTooltip
          interactive
          content={
            <>
              <DateFormat
                prefix="Plus member since "
                date={plusMemberSince}
                type={TimeFormatType.PlusMember}
              />
              {isLoggedIn && !myself?.isPlus && (
                <Link passHref href={plusUrl}>
                  <Typography
                    tag={TypographyTag.Link}
                    color={TypographyColor.Link}
                  >
                    Upgrade to Plus!
                  </Typography>
                </Link>
              )}
            </>
          }
          placement="top"
          container={{
            className: 'text-center flex-col',
          }}
        >
          {child as ReactElement}
        </SimpleTooltip>
      )}
    >
      <div className="ml-1 flex items-center">
        <PlusUser withText={false} />
      </div>
    </ConditionalWrapper>
  );
};
