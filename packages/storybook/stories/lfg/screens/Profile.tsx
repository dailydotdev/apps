import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import ProfileHeader from '@dailydotdev/shared/src/components/profile/ProfileHeader';
import { AboutMe } from '@dailydotdev/shared/src/features/profile/components/AboutMe';
import { Separator } from '@dailydotdev/shared/src/components/cards/common/common';
import type { PublicProfile } from '@dailydotdev/shared/src/lib/user';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons/Arrow';
import { PlusIcon } from '@dailydotdev/shared/src/components/icons/Plus';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import type { LfgUser } from '../data';
import { avatar, ME_ID } from '../data';
import { myRequestTo, openPostOf, useProto, userFor } from '../store';
import {
  daysLeft,
  HelperLine,
  KindLine,
  LookingTeaser,
  relativeDays,
} from '../ui';
import { PhoneHeader } from '../shell';
import { LfgIcon } from '../icons';
import { HelperModal } from './Helper';

// The production profile header takes a PublicProfile; the prototype's
// people are mapped onto it.
const toPublicProfile = (user: LfgUser): PublicProfile =>
  ({
    id: user.id,
    name: user.name,
    username: user.username,
    image: user.image,
    bio: user.bio,
    createdAt: user.joined,
    reputation: user.reputation,
    permalink: `#${user.username}`,
    isPlus: false,
    github: user.github,
    readmeHtml: `<p>${user.bio}</p>`,
    companies: user.company
      ? [
          {
            id: user.company,
            name: user.company,
            image: avatar(3),
            createdAt: new Date(user.joined),
            updatedAt: new Date(user.joined),
          },
        ]
      : [],
  } as unknown as PublicProfile);

// A section of the profile's divided list, in AboutMe's own format.
const Section = ({
  title,
  children,
}: {
  title: ReactNode;
  children: ReactNode;
}): ReactElement => (
  <div className="flex flex-col gap-4 py-4">
    <Typography type={TypographyType.Body} color={TypographyColor.Primary} bold>
      {title}
    </Typography>
    {children}
  </div>
);

// The LFG addition to the avatar the production header draws: the ring and
// the LFG tag, placed over its avatar (left-4 top-28 size-20, tablet left-6
// top-16 size-30).
const AvatarBadge = (): ReactElement => (
  <div
    aria-hidden
    className="pointer-events-none absolute left-4 top-28 z-1 size-20 rounded-16 ring-2 ring-accent-avocado-default ring-offset-2 ring-offset-background-default tablet:left-6 tablet:top-16 tablet:size-[7.5rem]"
  >
    <span className="absolute -bottom-2.5 left-1/2 flex -translate-x-1/2 items-center gap-0.5 rounded-8 bg-accent-avocado-default px-1.5 py-0.5 font-bold text-white ring-2 ring-background-default typo-caption2">
      <LfgIcon size={IconSize.XXSmall} secondary />
      LFG
    </span>
  </div>
);

export const ProfileScreen = ({ userId }: { userId: string }): ReactElement => {
  const { state, back, navigate, openComposer, reachOutsLeft } = useProto();
  const [isHelperOpen, setHelperOpen] = useState(false);
  const user = userFor(state, userId);
  const isMe = userId === ME_ID;
  const post = openPostOf(state, userId);
  const helper = state.helpers[userId];
  const first = user.name.split(' ')[0];
  const request = post ? myRequestTo(state, post.id) : undefined;
  const profile = toPublicProfile(user);
  const isPrelaunch = state.phase === 'prelaunch';

  return (
    <>
      <PhoneHeader title={user.name} onBack={isMe ? undefined : back} />
      <div className="profile-page m-auto flex w-full flex-col pb-12 tablet:pb-0 laptop:max-w-5xl laptop:flex-row laptop:gap-4 laptop:p-4 laptop:pb-6 laptopL:max-w-6xl">
        <main className="relative flex flex-1 flex-col laptop:max-w-2xl laptopL:max-w-3xl">
          <div className="tablet:rounded-16 tablet:border tablet:border-t-0 tablet:border-border-subtlest-tertiary laptop:border-t">
            <div className="relative">
              <ProfileHeader
                user={profile}
                userStats={{
                  upvotes: Math.round(user.reputation * 0.6),
                  numFollowers: Math.round(user.reputation / 25),
                  numFollowing: 38,
                }}
                isSameUser={isMe}
              />
              {post && <AvatarBadge />}
            </div>
            <div className="flex flex-col divide-y divide-border-subtlest-tertiary px-4 py-6 tablet:px-6">
              <div />
              {post && (
                <Section
                  title={
                    <span className="flex items-center gap-1.5">
                      <LfgIcon
                        size={IconSize.Small}
                        secondary
                        className="text-accent-avocado-default"
                      />
                      Looking for group
                    </span>
                  }
                >
                  {isPrelaunch && !isMe ? (
                    <LookingTeaser
                      post={post}
                      onPostYours={
                        openPostOf(state, ME_ID)
                          ? undefined
                          : () => navigate({ name: 'create' })
                      }
                    />
                  ) : (
                    <>
                      <button
                        type="button"
                        className="flex items-start gap-3 rounded-16 border border-border-subtlest-tertiary p-4 text-left hover:bg-surface-hover"
                        onClick={() => navigate({ name: 'post', id: post.id })}
                      >
                        <span className="flex min-w-0 flex-1 flex-col gap-1">
                          <KindLine post={post} />
                          <Typography type={TypographyType.Callout} bold>
                            {post.title}
                          </Typography>
                          <Typography
                            type={TypographyType.Footnote}
                            color={TypographyColor.Tertiary}
                            className="line-clamp-2"
                          >
                            {post.body}
                          </Typography>
                          <Typography
                            type={TypographyType.Footnote}
                            color={TypographyColor.Tertiary}
                            className="tabular-nums"
                          >
                            {request && !isMe && (
                              <>
                                <strong className="text-text-secondary">
                                  Requested
                                </strong>
                                <Separator />
                              </>
                            )}
                            {isPrelaunch ? (
                              'Goes live when connections open'
                            ) : (
                              <>
                                Posted {relativeDays(post.createdAt)}
                                <Separator />
                                {daysLeft(post.expiresAt)} days left
                              </>
                            )}
                          </Typography>
                        </span>
                        <ArrowIcon
                          size={IconSize.Small}
                          className="mt-1 shrink-0 rotate-90 text-text-tertiary"
                        />
                      </button>
                      {isMe ? (
                        <Button
                          type="button"
                          className="self-start"
                          variant={ButtonVariant.Secondary}
                          size={ButtonSize.Small}
                          onClick={() =>
                            navigate({ name: 'post', id: post.id })
                          }
                        >
                          Manage post
                        </Button>
                      ) : (
                        !request && (
                          <Button
                            type="button"
                            className="self-start"
                            variant={ButtonVariant.Primary}
                            size={ButtonSize.Small}
                            disabled={reachOutsLeft === 0}
                            onClick={() => openComposer(post.id)}
                          >
                            Reach out to {first}
                          </Button>
                        )
                      )}
                    </>
                  )}
                </Section>
              )}
              {!post && isMe && (
                <Section title="Looking for group">
                  <Typography
                    type={TypographyType.Callout}
                    color={TypographyColor.Tertiary}
                  >
                    Looking for someone to build with, learn with or ask for
                    help? While your post is up, your avatar wears the LFG badge
                    everywhere you comment.
                  </Typography>
                  <Button
                    type="button"
                    className="self-start"
                    variant={ButtonVariant.Secondary}
                    size={ButtonSize.Small}
                    icon={<PlusIcon />}
                    onClick={() => navigate({ name: 'create' })}
                  >
                    New post
                  </Button>
                </Section>
              )}
              {isMe && (
                <Section title="Open to helping">
                  {helper ? (
                    <HelperLine helper={helper} showTitle={false} />
                  ) : (
                    <Typography
                      type={TypographyType.Callout}
                      color={TypographyColor.Tertiary}
                    >
                      Get a heads-up when someone needs help with what you know.
                    </Typography>
                  )}
                  <Typography
                    type={TypographyType.Footnote}
                    color={TypographyColor.Quaternary}
                  >
                    Only you can see this.
                  </Typography>
                  {isMe && (
                    <Button
                      type="button"
                      className="self-start"
                      variant={
                        helper ? ButtonVariant.Float : ButtonVariant.Secondary
                      }
                      size={ButtonSize.Small}
                      onClick={() => setHelperOpen(true)}
                    >
                      {helper ? 'Edit' : 'Open to helping'}
                    </Button>
                  )}
                </Section>
              )}
              <AboutMe user={profile} />
            </div>
          </div>
        </main>
      </div>
      {isHelperOpen && <HelperModal onClose={() => setHelperOpen(false)} />}
    </>
  );
};
