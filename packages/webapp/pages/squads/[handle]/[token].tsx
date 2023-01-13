import {
  fadedBackgroundStyle,
  PageContainer,
} from '@dailydotdev/shared/src/components/utilities';
import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import {
  getSquadInvitation,
  SquadMember,
} from '@dailydotdev/shared/src/graphql/squads';
import { Edge } from '@dailydotdev/shared/src/graphql/common';
import { ProfileImageLink } from '@dailydotdev/shared/src/components/profile/ProfileImageLink';
import classed from '@dailydotdev/shared/src/lib/classed';
import Link from 'next/link';
import SourceButton from '@dailydotdev/shared/src/components/cards/SourceButton';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import React, { ReactElement } from 'react';
import { getLayout } from '../../../components/layouts/MainLayout';

const getOthers = (others: Edge<SquadMember>[]) => {
  const { length } = others;
  if (length === 0) {
    return 'is';
  }

  if (length === 1) {
    const member = others[0].node.user.name;
    return `and ${member} are`;
  }

  return `and ${length} others are`;
};

const BodyParagraph = classed('p', 'typo-body text-theme-label-tertiary');
const HighlightedText = classed('span', 'font-bold text-theme-label-primary');

const SquadReferral = (): ReactElement => {
  const router = useRouter();
  const { data } = useQuery(['squad_referral', router.query], () =>
    getSquadInvitation(router.query),
  );

  if (!data) {
    return null;
  }

  const {
    member: { user },
    source,
  } = data;
  const others = getOthers(
    source.members.edges.filter(({ node }) => node.user.id !== user.id),
  );

  return (
    <PageContainer className="relative justify-center items-center min-h-[calc(100vh-3.5rem)]">
      <div
        className="absolute -top-4 -right-20 -left-20 h-40 rounded-26"
        style={fadedBackgroundStyle}
      />
      <h1 className="typo-title1">You are invited to join {source.name}</h1>
      <BodyParagraph className="mt-6">
        {source.name} is your place to stay up to date as a squad. You and your
        squad members can share knowledge and content in one place. Join now to
        start collaborating.
      </BodyParagraph>
      <span className="flex flex-row items-center mt-10">
        <ProfileImageLink user={user} />
        <BodyParagraph>
          <HighlightedText className="ml-4">{user.name}</HighlightedText>{' '}
          <Link href={user.permalink}>
            <a href={user.permalink}>(@{user.username})</a>
          </Link>{' '}
          has invited you to <HighlightedText>{source.name}</HighlightedText>
        </BodyParagraph>
      </span>
      <div className="flex flex-col p-6 my-10 w-full border rounded-24 border-theme-color-cabbage">
        <span className="flex flex-row items-center">
          <SourceButton source={source} size="xxlarge" />
          <div className="flex flex-col ml-4">
            <h2 className="flex flex-col typo-headline">{source.name}</h2>
            <BodyParagraph className="mt-2">@{source.handle}</BodyParagraph>
          </div>
          <Button className="ml-auto btn-primary" buttonSize="large">
            Join Squad
          </Button>
        </span>
        <BodyParagraph className="mt-3 ml-[4.5rem]">
          {source.description}
        </BodyParagraph>
      </div>
      <BodyParagraph>
        {user.name} {others} waiting for you inside. Join them now!
      </BodyParagraph>
      <span className="flex flex-row gap-2 mt-6">
        {source.members.edges.slice(0, 10).map(({ node }) => (
          <ProfileImageLink key={node.user.id} user={node.user} />
        ))}
      </span>
    </PageContainer>
  );
};

SquadReferral.getLayout = getLayout;
SquadReferral.layoutProps = { showOnlyLogo: true };

export default SquadReferral;
