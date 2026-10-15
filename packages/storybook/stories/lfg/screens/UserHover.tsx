import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import HoverCard from '@dailydotdev/shared/src/components/cards/common/HoverCard';
import UserEntityCard from '@dailydotdev/shared/src/components/cards/entity/UserEntityCard';
import type { UserShortProfile } from '@dailydotdev/shared/src/lib/user';
import type { LfgUser } from '../data';
import { avatar, me } from '../data';
import { openPostOf, useProto } from '../store';
import { LookingStrip, LookingTeaser } from '../ui';

// The real card's links would leave the prototype, so it gets a local
// permalink and clicks inside it open the prototype's profile instead.
const toShortProfile = (user: LfgUser): UserShortProfile =>
  ({
    id: user.id,
    name: user.name,
    username: user.username,
    image: user.image,
    bio: user.bio,
    reputation: user.reputation,
    createdAt: new Date(user.joined),
    permalink: `#${user.username}`,
    isPlus: false,
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
  } as UserShortProfile);

// The production profile hover card (UserEntityCard in a HoverCard), with
// the Looking for group strip underneath when the person has an open post.
export const UserHover = ({
  user,
  children,
}: {
  user: LfgUser;
  children: ReactNode;
}): ReactElement => {
  const { state, navigate, track } = useProto();
  const post = openPostOf(state, user.id);

  return (
    <HoverCard
      align="start"
      side="bottom"
      sideOffset={8}
      trigger={
        <button
          type="button"
          className="flex shrink-0"
          aria-label={`${user.name}'s profile`}
          onMouseEnter={() => track('hover-card')}
          onClick={() => {
            track('hover-card');
            navigate({ name: 'profile', userId: user.id });
          }}
        >
          {children}
        </button>
      }
    >
      <div
        className="w-80 overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-popover"
        onClickCapture={(event) => {
          const link = (event.target as HTMLElement).closest('a');
          if (link) {
            event.preventDefault();
            navigate({ name: 'profile', userId: user.id });
          }
        }}
      >
        <UserEntityCard
          user={toShortProfile(user)}
          className={{ container: '!w-full !rounded-none !border-0' }}
        />
        {post && (
          <div className="flex flex-col gap-3 border-t border-border-subtlest-tertiary p-4">
            {post &&
              (state.phase === 'prelaunch' && post.authorId !== me.id ? (
                <LookingTeaser
                  post={post}
                  onPostYours={
                    openPostOf(state, me.id)
                      ? undefined
                      : () => navigate({ name: 'create' })
                  }
                />
              ) : (
                <LookingStrip
                  post={post}
                  onOpen={() => navigate({ name: 'post', id: post.id })}
                />
              ))}
          </div>
        )}
      </div>
    </HoverCard>
  );
};
