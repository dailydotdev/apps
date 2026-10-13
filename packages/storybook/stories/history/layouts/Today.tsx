import type { ReactElement } from 'react';
import React from 'react';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  DownvoteIcon,
  LinkIcon,
  MenuIcon,
  SearchIcon,
  UpvoteIcon,
} from '@dailydotdev/shared/src/components/icons';
import { Image } from '@dailydotdev/shared/src/components/image/Image';
import {
  ProfileImageSize,
  ProfilePicture,
} from '@dailydotdev/shared/src/components/ProfilePicture';
import { Separator } from '@dailydotdev/shared/src/components/cards/common/common';
import { groupByDay } from '../data';
import { useHistory } from '../kit';

// /history as it ships: ResponsivePageContainer's bordered 42.5rem column,
// the search field, day labels and PostItemCard with vote, copy and ⋯ on
// every row.

export const Today = (): ReactElement => {
  const { items } = useHistory();
  return (
    <div className="mx-auto flex min-h-full w-full max-w-[42.5rem] flex-col border-x border-border-subtlest-tertiary py-6">
      <label className="m-4 flex h-12 items-center gap-2 rounded-14 bg-surface-float px-3 text-text-tertiary">
        <SearchIcon />
        <span className="typo-body">Search history</span>
      </label>
      {groupByDay(items).map((group) => (
        <section key={group.id} className="flex flex-col">
          <p className="my-3 px-6 text-text-tertiary typo-body">
            {group.label}
          </p>
          {group.items.map((item) => (
            <article
              key={item.key}
              className="relative flex w-full flex-row items-center py-3 pl-9 pr-5"
            >
              <Image
                src={item.image}
                alt=""
                className="h-16 w-24 rounded-16 object-cover"
              />
              <span className="absolute left-5 -my-1 size-8 rounded-full bg-background-default" />
              <ProfilePicture
                size={ProfileImageSize.Small}
                rounded="full"
                className="absolute left-6"
                user={{ image: item.source.image, username: item.source.name }}
              />
              <div className="flex flex-1 flex-row">
                <div className="ml-4 flex flex-1 flex-col">
                  <h3 className="mr-6 line-clamp-2 break-words text-left typo-callout">
                    {item.title}
                  </h3>
                  <span className="mt-1 flex items-center text-text-tertiary typo-footnote">
                    {item.readTime}m read
                    <Separator />
                    {item.numUpvotes} upvotes
                  </span>
                </div>
                <div className="mt-1 flex">
                  <Button
                    size={ButtonSize.Small}
                    variant={ButtonVariant.Tertiary}
                    color={ButtonColor.Avocado}
                    pressed={item.vote === 'up'}
                    icon={<UpvoteIcon secondary={item.vote === 'up'} />}
                  />
                  <Button
                    size={ButtonSize.Small}
                    variant={ButtonVariant.Tertiary}
                    color={ButtonColor.Ketchup}
                    icon={<DownvoteIcon />}
                  />
                  <Button
                    size={ButtonSize.Small}
                    variant={ButtonVariant.Tertiary}
                    icon={<LinkIcon />}
                  />
                  <Button
                    size={ButtonSize.Small}
                    variant={ButtonVariant.Tertiary}
                    icon={<MenuIcon />}
                  />
                </div>
              </div>
            </article>
          ))}
        </section>
      ))}
    </div>
  );
};
