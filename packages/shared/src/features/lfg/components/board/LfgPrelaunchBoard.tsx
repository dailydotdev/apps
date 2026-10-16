import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { useQuery } from '@tanstack/react-query';
import Link from '../../../../components/utilities/Link';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../../components/typography/Typography';
import {
  ProfileImageSize,
  ProfilePicture,
} from '../../../../components/ProfilePicture';
import { ShellPage } from '../../../../components/shell/ShellPageContext';
import { ShellPrimaryPill } from '../../../../components/shell/ShellSquare';
import { pageHeaderClassName } from '../../../../components/layout/PageHeader';
import { IconSize } from '../../../../components/Icon';
import { PlusIcon } from '../../../../components/icons/Plus';
import { SignalIcon } from '../../../../components/icons/Signal';
import { SquadWidget } from '../../../squads/components/widgets/SquadWidget';
import { SquadSectionHeader } from '../../../squads/components/discover/SquadDiscoverSections';
import { useAuthContext } from '../../../../contexts/AuthContext';
import useLogEventOnce from '../../../../hooks/log/useLogEventOnce';
import { LogEvent, Origin } from '../../../../lib/log';
import { lfgHelperQueryOptions, myLfgPostQueryOptions } from '../../queries';
import { getLfgUrl, lfgNewPostUrl } from '../../lib/format';
import { useLfgModals } from '../../hooks/useLfgModals';
import { LfgFrame } from '../LfgFrame';
import {
  LfgBadgeMark,
  LfgBadgeSize,
  lfgAvatarRingClassName,
} from '../LfgAvatarBadge';
import { LfgHelperWidget } from './LfgBoardWidgets';

const steps = [
  {
    title: 'Post what you need',
    text: "Say who you're looking for and why. It goes live when connections open.",
  },
  {
    title: 'Wear the badge',
    text: "Your avatar shows LFG in comments and on your profile, so people know you're looking.",
  },
  {
    title: 'Talk in DMs once connections open',
    text: 'Replies come as message requests with a pitch. You pick who to talk to.',
  },
];

const OpeningPill = (): ReactElement => (
  <span className="flex w-fit items-center gap-1.5 rounded-8 bg-action-upvote-float px-2 py-1 font-bold text-accent-avocado-default typo-caption1">
    <SignalIcon size={IconSize.Size16} secondary />
    Connections open in a few days
  </span>
);

// The board before launch. Nothing posted is listed yet: people post or opt
// in to helping, wear the badge meanwhile, and everything goes live together.
export const LfgPrelaunchBoard = (): ReactElement => {
  const { user } = useAuthContext();
  const { openHelper } = useLfgModals();
  const { data: mine, isPending } = useQuery(myLfgPostQueryOptions(user));
  const { data: helper } = useQuery(lfgHelperQueryOptions(user));
  const canPost = !isPending && !mine;

  useLogEventOnce(() => ({
    event_name: LogEvent.OpenLfgBoard,
    extra: JSON.stringify({ launched: false }),
  }));

  const writeButton = (className?: string) => (
    <Link href={lfgNewPostUrl} passHref>
      <Button
        tag="a"
        className={className}
        variant={ButtonVariant.Secondary}
        size={ButtonSize.Small}
        icon={<PlusIcon />}
      >
        Write your post
      </Button>
    </Link>
  );

  return (
    <>
      <ShellPage
        title="Looking for group"
        actions={
          canPost && (
            <Link href={lfgNewPostUrl} passHref>
              <ShellPrimaryPill>Write your post</ShellPrimaryPill>
            </Link>
          )
        }
      />
      <header
        className={classNames(pageHeaderClassName, 'hidden gap-4 tablet:flex')}
      >
        <OpeningPill />
        <div className="flex flex-1 justify-end">
          {canPost && (
            <Link href={lfgNewPostUrl} passHref>
              <Button
                tag="a"
                variant={ButtonVariant.Subtle}
                size={ButtonSize.Small}
                icon={<PlusIcon />}
              >
                Write your post
              </Button>
            </Link>
          )}
        </div>
      </header>
      <LfgFrame
        side={
          <>
            {mine ? (
              <SquadWidget
                title="Your post is in"
                action={
                  <Link href={getLfgUrl(mine.id)} passHref>
                    <Button
                      tag="a"
                      variant={ButtonVariant.Subtle}
                      size={ButtonSize.Small}
                    >
                      Open
                    </Button>
                  </Link>
                }
              >
                <Typography
                  type={TypographyType.Callout}
                  className="mt-2 line-clamp-2 break-words"
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
                {writeButton('mt-3 w-full')}
              </SquadWidget>
            )}
            <LfgHelperWidget onOpen={() => openHelper(Origin.LfgBoard)} />
          </>
        }
      >
        <div className="flex flex-col gap-8 px-4 pb-6 pt-5 tablet:px-6 laptop:pt-6">
          <section className="flex flex-col gap-4">
            <span className="tablet:hidden">
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
              A lot of us work remotely and alone now, pairing with an AI more
              than with people. Looking for group helps you find people to build
              with, learn with or get unstuck with. Post what you&apos;re
              looking for now, or tell us you&apos;re open to helping.
              Connections open in a few days.
            </Typography>
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
            >
              No gigs, hiring or selling services.
            </Typography>
            <div className="flex flex-wrap gap-2">
              {mine ? (
                <Link href={getLfgUrl(mine.id)} passHref>
                  <Button
                    tag="a"
                    variant={ButtonVariant.Secondary}
                    size={ButtonSize.Medium}
                  >
                    View your post
                  </Button>
                </Link>
              ) : (
                <Link href={lfgNewPostUrl} passHref>
                  <Button
                    tag="a"
                    variant={ButtonVariant.Primary}
                    size={ButtonSize.Medium}
                  >
                    Write your post
                  </Button>
                </Link>
              )}
              <Button
                type="button"
                variant={ButtonVariant.Float}
                size={ButtonSize.Medium}
                onClick={() => openHelper(Origin.LfgBoard)}
              >
                {helper ? "You're open to helping" : "I'd rather help"}
              </Button>
            </div>
          </section>

          {user && (
            <section className="flex items-center gap-4 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4">
              <span
                className={classNames(
                  'relative inline-flex shrink-0 rounded-16',
                  lfgAvatarRingClassName,
                )}
              >
                <ProfilePicture user={user} size={ProfileImageSize.XXLarge} />
                <LfgBadgeMark size={LfgBadgeSize.Ribbon} />
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <Typography type={TypographyType.Callout} bold>
                  {mine ? 'Your badge is on' : 'Your badge goes on right away'}
                </Typography>
                <Typography
                  type={TypographyType.Footnote}
                  color={TypographyColor.Tertiary}
                >
                  {mine
                    ? "People see it on your comments, your hover card and your profile, so they know you're looking before connections even open."
                    : "Post now and your avatar wears the LFG badge on your comments, hover card and profile, so people know you're looking before connections even open."}
                </Typography>
              </div>
            </section>
          )}

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
      </LfgFrame>
    </>
  );
};
