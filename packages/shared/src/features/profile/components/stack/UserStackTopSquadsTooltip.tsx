import type { ReactElement } from 'react';
import React from 'react';
import Link from '../../../../components/utilities/Link';
import { Image, ImageType } from '../../../../components/image/Image';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../../components/typography/Typography';
import { largeNumberFormat } from '../../../../lib/numberFormat';
import type { ToolTopSquad } from '../../hooks/useToolTopSquads';

interface UserStackTopSquadsTooltipProps {
  toolTitle: string;
  toolFaviconUrl?: string | null;
  topSquads: ToolTopSquad[];
  isPending: boolean;
  hasError: boolean;
}

const ToolHeader = ({
  toolTitle,
  toolFaviconUrl,
}: Pick<UserStackTopSquadsTooltipProps, 'toolTitle' | 'toolFaviconUrl'>) => {
  return (
    <div className="flex items-center gap-2">
      {toolFaviconUrl ? (
        <img src={toolFaviconUrl} alt="" className="size-8 rounded-8" />
      ) : (
        <div className="size-8 rounded-8 bg-surface-hover" />
      )}
      <div className="flex min-w-0 flex-col">
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Primary}
          bold
          truncate
        >
          {toolTitle}
        </Typography>
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Tertiary}
        >
          Top squads using this tool
        </Typography>
      </div>
    </div>
  );
};

const EmptyState = ({
  isPending,
  hasError,
}: Pick<UserStackTopSquadsTooltipProps, 'isPending' | 'hasError'>) => {
  if (isPending) {
    return (
      <Typography
        type={TypographyType.Caption1}
        color={TypographyColor.Secondary}
      >
        Loading squads...
      </Typography>
    );
  }

  if (hasError) {
    return (
      <Typography
        type={TypographyType.Caption1}
        color={TypographyColor.Secondary}
      >
        Couldn&apos;t load squads.
      </Typography>
    );
  }

  return (
    <Typography
      type={TypographyType.Caption1}
      color={TypographyColor.Secondary}
    >
      No squads found for this tool yet.
    </Typography>
  );
};

export const UserStackTopSquadsTooltip = ({
  toolTitle,
  toolFaviconUrl,
  topSquads,
  isPending,
  hasError,
}: UserStackTopSquadsTooltipProps): ReactElement => {
  return (
    <div className="w-[16.5rem] max-w-[calc(100vw-1.5rem)] p-3">
      <ToolHeader toolTitle={toolTitle} toolFaviconUrl={toolFaviconUrl} />

      <div className="mt-2.5 flex flex-col gap-1">
        {!topSquads.length ? (
          <EmptyState isPending={isPending} hasError={hasError} />
        ) : (
          topSquads.map((squad) => (
            <Link key={squad.id} href={`/squads/${squad.handle}`}>
              <a className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-10 px-2 py-1.5 hover:bg-surface-hover">
                <div className="flex min-w-0 items-center gap-2">
                  <Image
                    src={squad.image}
                    alt=""
                    type={ImageType.Squad}
                    className="size-6 rounded-full"
                  />
                  <Typography
                    type={TypographyType.Callout}
                    color={TypographyColor.Primary}
                    truncate
                  >
                    {squad.name}
                  </Typography>
                </div>
                <Typography
                  type={TypographyType.Caption1}
                  color={TypographyColor.Secondary}
                  className="whitespace-nowrap"
                >
                  {largeNumberFormat(squad.membersCount)} users
                </Typography>
              </a>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};
