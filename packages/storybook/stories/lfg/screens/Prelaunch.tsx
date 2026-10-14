import type { ReactElement } from 'react';
import React, { useState } from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { ProfileImageSize } from '@dailydotdev/shared/src/components/ProfilePicture';
import { SquadWidget } from '@dailydotdev/shared/src/features/squads/components/widgets/SquadWidget';
import { SquadSectionHeader } from '@dailydotdev/shared/src/features/squads/components/discover/SquadDiscoverSections';
import { PlusIcon } from '@dailydotdev/shared/src/components/icons/Plus';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { me } from '../data';
import { currentMe, openPostOf, useProto } from '../store';
import { LfgAvatar } from '../ui';
import { PhoneHeader } from '../shell';
import { Frame, pageHeaderClassName } from '../frame';
import { LfgIcon } from '../icons';
import { HelperModal } from './Helper';
import { HelperWidget } from './BoardWidgets';

const steps = [
  {
    title: 'Post what you need',
    text: 'A teammate, a study buddy, a mentor. It goes live when connections open.',
  },
  {
    title: 'Wear the badge',
    text: 'Your avatar shows LFG in comments and on your profile, so people know you’re looking.',
  },
  {
    title: 'Talk in DMs once connections open',
    text: 'Replies come as message requests with a pitch. You pick who to talk to.',
  },
];

const OpeningPill = (): ReactElement => (
  <span className="flex w-fit items-center gap-1.5 rounded-8 bg-action-upvote-float px-2 py-1 font-bold text-accent-avocado-default typo-caption1">
    <LfgIcon size={IconSize.Size16} secondary />
    Connections open in a few days
  </span>
);

// The board before launch. Nothing posted is visible yet: people post or
// opt in to help, wear the badge meanwhile, and the board opens once there
// are enough posts.
export const PrelaunchBoard = (): ReactElement => {
  const { state, navigate } = useProto();
  const [isHelperOpen, setHelperOpen] = useState(false);
  const mine = openPostOf(state, me.id);
  const helper = state.helpers[me.id];
  const newPost = () => navigate({ name: 'create' });

  return (
    <>
      <PhoneHeader
        title="Looking for group"
        actions={
          !mine && (
            <Button
              type="button"
              className="!h-[2.375rem] !rounded-14"
              variant={ButtonVariant.Primary}
              size={ButtonSize.Small}
              onClick={newPost}
            >
              Write your post
            </Button>
          )
        }
      />
      <header className={pageHeaderClassName}>
        <OpeningPill />
        <div className="flex flex-1 justify-end">
          {!mine && (
            <Button
              type="button"
              variant={ButtonVariant.Subtle}
              size={ButtonSize.Small}
              icon={<PlusIcon />}
              onClick={newPost}
            >
              Write your post
            </Button>
          )}
        </div>
      </header>
      <Frame
        side={
          <>
            {mine ? (
              <SquadWidget
                title="Your post is in"
                action={
                  <Button
                    type="button"
                    variant={ButtonVariant.Subtle}
                    size={ButtonSize.Small}
                    onClick={() => navigate({ name: 'post', id: mine.id })}
                  >
                    Open
                  </Button>
                }
              >
                <Typography
                  type={TypographyType.Callout}
                  className="mt-2 line-clamp-2"
                >
                  {mine.title}
                </Typography>
                <Typography
                  type={TypographyType.Footnote}
                  color={TypographyColor.Tertiary}
                  className="mt-1"
                >
                  It goes live when connections open. Your LFG badge is already
                  on.
                </Typography>
              </SquadWidget>
            ) : (
              <SquadWidget title="Be there from day one">
                <Typography
                  type={TypographyType.Footnote}
                  color={TypographyColor.Tertiary}
                  className="mt-1"
                >
                  Everything posted before connections open goes live together
                  on day one.
                </Typography>
                <Button
                  type="button"
                  className="mt-3 w-full"
                  variant={ButtonVariant.Secondary}
                  size={ButtonSize.Small}
                  icon={<PlusIcon />}
                  onClick={newPost}
                >
                  Write your post
                </Button>
              </SquadWidget>
            )}
            <HelperWidget onOpen={() => setHelperOpen(true)} />
          </>
        }
      >
        <div className="flex flex-col gap-8 px-4 pb-6 pt-5 tablet:px-6 laptop:pt-6">
          <section className="flex flex-col gap-4">
            <span className="laptop:hidden">
              <OpeningPill />
            </span>
            <Typography
              tag={TypographyTag.H1}
              type={TypographyType.Title2}
              bold
            >
              Find your people
            </Typography>
            <Typography
              type={TypographyType.Body}
              color={TypographyColor.Secondary}
            >
              Work has never been more remote, more AI-assisted or more solo.
              Looking for group is for getting together again: find people to
              build with, learn with, or get unstuck with. Post what you&apos;re
              looking for now, or let us know you&apos;re open to helping.
              Connections open in a few days.
            </Typography>
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
            >
              Pro bono, always. No gigs, hiring or selling services.
            </Typography>
            <div className="flex flex-wrap gap-2">
              {mine ? (
                <Button
                  type="button"
                  variant={ButtonVariant.Secondary}
                  size={ButtonSize.Medium}
                  onClick={() => navigate({ name: 'post', id: mine.id })}
                >
                  View your post
                </Button>
              ) : (
                <Button
                  type="button"
                  variant={ButtonVariant.Primary}
                  size={ButtonSize.Medium}
                  onClick={newPost}
                >
                  Write your post
                </Button>
              )}
              <Button
                type="button"
                variant={ButtonVariant.Float}
                size={ButtonSize.Medium}
                onClick={() => setHelperOpen(true)}
              >
                {helper ? "You're open to helping" : "I'd rather help"}
              </Button>
            </div>
          </section>

          <section className="flex items-center gap-4 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4">
            <LfgAvatar
              user={currentMe(state)}
              size={ProfileImageSize.XXLarge}
              looking
            />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <Typography type={TypographyType.Callout} bold>
                {mine ? 'Your badge is on' : 'Your badge goes on right away'}
              </Typography>
              <Typography
                type={TypographyType.Footnote}
                color={TypographyColor.Tertiary}
              >
                {mine
                  ? 'People see it on your comments, your hover card and your profile, so they know you’re looking before connections even open.'
                  : 'Post now and your avatar wears the LFG badge on your comments, hover card and profile, so people know you’re looking before connections even open.'}
              </Typography>
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <SquadSectionHeader title="How it works" />
            <ol className="grid grid-cols-1 gap-3 tablet:grid-cols-3">
              {steps.map((step, index) => (
                <li
                  key={step.title}
                  className="flex flex-col gap-2 rounded-16 bg-surface-float p-4"
                >
                  <span className="flex size-6 items-center justify-center rounded-8 bg-background-default font-bold tabular-nums typo-footnote">
                    {index + 1}
                  </span>
                  <Typography type={TypographyType.Callout} bold>
                    {step.title}
                  </Typography>
                  <Typography
                    type={TypographyType.Footnote}
                    color={TypographyColor.Tertiary}
                  >
                    {step.text}
                  </Typography>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </Frame>
      {isHelperOpen && <HelperModal onClose={() => setHelperOpen(false)} />}
    </>
  );
};
