import type { ReactElement } from 'react';
import React from 'react';
import { useQueries } from '@tanstack/react-query';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import { Image } from '../image/Image';
import { CoreIcon } from '../icons';
import { IconSize } from '../Icon';
import { useAuthContext } from '../../contexts/AuthContext';
import { squadWalletQueryOptions } from '../../graphql/squadWallet';
import { SourcePermissions } from '../../graphql/sources';
import { verifyPermission } from '../../graphql/squads';
import { formatCoresCurrency } from '../../lib/utils';

/**
 * The Cores wallets of the daily.dev for Startups squads where the user holds
 * a paid seat. Seats go to admins and moderators, so only their squads are
 * checked.
 */
export const SquadWallets = (): ReactElement | null => {
  const { user, squads } = useAuthContext();
  const moderated =
    squads?.filter((squad) =>
      verifyPermission(squad, SourcePermissions.ModeratePost),
    ) ?? [];
  const wallets = useQueries({
    queries: moderated.map((squad) =>
      squadWalletQueryOptions({ user, sourceId: squad.id }),
    ),
  });
  const rows = moderated.flatMap((squad, index) => {
    const wallet = wallets[index]?.data;

    return wallet ? [{ squad, wallet }] : [];
  });

  if (!rows.length) {
    return null;
  }

  return (
    <section className="flex flex-col gap-3">
      <Typography type={TypographyType.Body} bold>
        Squad wallets
      </Typography>
      <ul className="flex flex-col gap-2">
        {rows.map(({ squad, wallet }) => (
          <li
            key={squad.id}
            className="flex items-center gap-3 rounded-16 border border-border-subtlest-tertiary p-3"
          >
            <Image
              src={squad.image}
              alt=""
              className="size-10 shrink-0 rounded-max object-cover"
            />
            <span className="flex min-w-0 flex-1 flex-col">
              <Typography
                tag={TypographyTag.Span}
                type={TypographyType.Callout}
                className="truncate"
                bold
              >
                {wallet.name}
              </Typography>
              <Typography
                tag={TypographyTag.Span}
                type={TypographyType.Footnote}
                color={TypographyColor.Tertiary}
              >
                For boosts, topped up with every plan payment
              </Typography>
            </span>
            <Typography
              tag={TypographyTag.Span}
              type={TypographyType.Callout}
              className="flex shrink-0 items-center gap-1 tabular-nums"
              bold
            >
              <CoreIcon size={IconSize.Size16} />
              {formatCoresCurrency(wallet.balance)}
            </Typography>
          </li>
        ))}
      </ul>
    </section>
  );
};
