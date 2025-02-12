import type { ReactElement } from 'react';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  TypographyType,
  TypographyColor,
  Typography,
} from '../typography/Typography';
import { PlusUser } from '../PlusUser';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { IconSize } from '../Icon';
import { managePlusUrl } from '../../lib/constants';
import type { WithClassNameProps } from '../utilities/common';
import { useAuthContext } from '../../contexts/AuthContext';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';
import { getPlusGifterUser } from '../../graphql/users';
import classed from '../../lib/classed';
import { Loader } from '../Loader';

export type PlusPlusProps = WithClassNameProps;

const Container = classed(
  'div',
  'flex flex-1 flex-col items-center justify-center gap-4 text-center',
);

export const PlusPlus = ({ className }: PlusPlusProps): ReactElement => {
  const { user } = useAuthContext();
  const { data: gifter, isPending } = useQuery({
    queryKey: generateQueryKey(RequestKey.GifterUser, user),
    queryFn: getPlusGifterUser,
    enabled: Boolean(user?.isPlus),
    staleTime: StaleTime.Default,
  });

  if (isPending) {
    return (
      <Container>
        <Loader />
      </Container>
    );
  }

  const manageCopy = gifter
    ? ''
    : ` Manage your subscription anytime to update your plan, payment details, or preferences`;

  return (
    <Container className={className}>
      <PlusUser
        iconSize={IconSize.XSmall}
        typographyType={TypographyType.Callout}
      />
      <div className="flex flex-col gap-2">
        <Typography
          type={TypographyType.Body}
          bold
          color={TypographyColor.Primary}
        >
          {`You're already a Plus member!`}
        </Typography>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
        >
          Thanks for supporting daily.dev and unlocking our most powerful
          experience.{manageCopy}.
        </Typography>
      </div>
      {!gifter && (
        <Button
          tag="a"
          className="max-w-48"
          size={ButtonSize.Small}
          variant={ButtonVariant.Secondary}
          href={managePlusUrl}
          target="_blank"
        >
          Manage subscription
        </Button>
      )}
    </Container>
  );
};
