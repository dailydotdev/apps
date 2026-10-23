import type { ReactElement } from 'react';
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import classNames from 'classnames';
import Link from '../../../../components/utilities/Link';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../../components/typography/Typography';
import { Modal } from '../../../../components/modals/common/Modal';
import { ModalSize } from '../../../../components/modals/common/types';
import { Radio } from '../../../../components/fields/Radio';
import { SquadWidget } from '../../../squads/components/widgets/SquadWidget';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { useLogContext } from '../../../../contexts/LogContext';
import { useToastNotification } from '../../../../hooks/useToastNotification';
import { usePrompt } from '../../../../hooks/usePrompt';
import { LogEvent, TargetType } from '../../../../lib/log';
import type { LfgPost } from '../../types';
import { LfgPostStatus } from '../../types';
import { LFG_POST_LIFETIME_DAYS } from '../../constants';
import { deleteLfgPost, markLfgPostFound, renewLfgPost } from '../../graphql';
import {
  invalidateLfgPostLists,
  invalidateLfgReachOutQueries,
  lfgAcceptedReachOutsQueryOptions,
  updateLfgPostCaches,
} from '../../queries';
import {
  getLfgEditUrl,
  getLfgReachOutUrl,
  getLfgUrl,
  lfgDaysLeft,
} from '../../lib/format';

const outsideChoice = 'outside';

const FoundModal = ({
  post,
  onClose,
}: {
  post: LfgPost;
  onClose: () => void;
}): ReactElement => {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const { logEvent } = useLogContext();
  const { displayToast } = useToastNotification();
  const { data: accepted = [] } = useQuery(
    lfgAcceptedReachOutsQueryOptions(user, post.id),
  );
  const [choice, setChoice] = useState<string>();
  const selected = choice ?? accepted[0]?.id ?? outsideChoice;
  const waiting = post.pendingCount ?? 0;
  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      markLfgPostFound({
        id: post.id,
        reachOutId: selected === outsideChoice ? undefined : selected,
      }),
    onSuccess: (updated) => {
      updateLfgPostCaches(queryClient, user, updated);
      invalidateLfgReachOutQueries(queryClient, user);
      logEvent({
        event_name: LogEvent.MarkLfgPostFound,
        target_type: TargetType.LfgPost,
        target_id: post.id,
        extra: JSON.stringify({
          kind: post.kind,
          with_reach_out: selected !== outsideChoice,
          waiting,
        }),
      });
      displayToast(
        waiting
          ? `Marked as found. The ${waiting} ${
              waiting === 1 ? 'person' : 'people'
            } still waiting will see the spot is filled.`
          : 'Marked as found.',
      );
      onClose();
    },
    onError: () => displayToast("Couldn't mark it found. Please try again."),
  });

  return (
    <Modal
      isOpen
      isDrawerOnMobile
      size={ModalSize.Small}
      onRequestClose={onClose}
      formProps={{
        form: '',
        title: 'Found someone?',
        copy: { right: 'Mark as found' },
        rightButtonProps: {
          type: 'button',
          loading: isPending,
          onClick: () => mutate(),
        },
      }}
    >
      <Modal.Header title="Found someone?" />
      <Modal.Body className="flex flex-col gap-4">
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
        >
          Your post comes off the board.
          {waiting > 0 &&
            ` The ${waiting} ${
              waiting === 1 ? 'person' : 'people'
            } still waiting will see the spot is filled, so nobody is left hanging.`}
        </Typography>
        <div className="flex flex-col gap-2">
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
            bold
          >
            Who did you team up with?
          </Typography>
          <Radio
            name="lfg-found-with"
            value={selected}
            onChange={setChoice}
            options={[
              ...accepted.map(({ id, sender }) => ({
                label: sender.name ?? sender.username ?? '',
                value: id,
              })),
              { label: 'Someone I met elsewhere', value: outsideChoice },
            ]}
          />
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button
          type="button"
          variant={ButtonVariant.Tertiary}
          disabled={isPending}
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant={ButtonVariant.Primary}
          loading={isPending}
          onClick={() => mutate()}
        >
          Mark as found
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

const Stat = ({
  value,
  label,
  isUrgent = false,
}: {
  value: number;
  label: string;
  isUrgent?: boolean;
}): ReactElement => (
  <span className="flex flex-col">
    <strong
      className={classNames(
        'tabular-nums typo-callout',
        isUrgent && 'text-status-error',
      )}
    >
      {value}
    </strong>
    <span className="text-text-tertiary typo-footnote">{label}</span>
  </span>
);

const useRenew = (post: LfgPost) => {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const { logEvent } = useLogContext();
  const { displayToast } = useToastNotification();

  return useMutation({
    mutationFn: () => renewLfgPost(post.id),
    onSuccess: (updated) => {
      updateLfgPostCaches(queryClient, user, updated);
      logEvent({
        event_name: LogEvent.RenewLfgPost,
        target_type: TargetType.LfgPost,
        target_id: post.id,
        extra: JSON.stringify({ kind: post.kind, status: post.status }),
      });
      displayToast(
        post.status === LfgPostStatus.Open
          ? `Renewed for another ${LFG_POST_LIFETIME_DAYS} days`
          : `Your post is back up for ${LFG_POST_LIFETIME_DAYS} days`,
      );
    },
    // One open post at a time: reopening an old one fails while another is
    // up.
    onError: () =>
      displayToast(
        post.status === LfgPostStatus.Open
          ? "Couldn't renew it. Please try again."
          : "Couldn't reopen it. Close your open post first.",
      ),
  });
};

const ManageRow = ({ post }: { post: LfgPost }): ReactElement => {
  const router = useRouter();
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const { logEvent } = useLogContext();
  const { displayToast } = useToastNotification();
  const { showPrompt } = usePrompt();
  const { mutate: remove, isPending } = useMutation({
    mutationFn: () => deleteLfgPost(post.id),
    onSuccess: () => {
      logEvent({
        event_name: LogEvent.DeleteLfgPost,
        target_type: TargetType.LfgPost,
        target_id: post.id,
        extra: JSON.stringify({ kind: post.kind, status: post.status }),
      });
      invalidateLfgPostLists(queryClient, user);
      invalidateLfgReachOutQueries(queryClient, user);
      displayToast('Post deleted');
      router.replace(getLfgUrl());
    },
    onError: () => displayToast("Couldn't delete it. Please try again."),
  });

  const onDelete = async () => {
    const confirmed = await showPrompt({
      title: 'Delete your post?',
      description:
        'It comes off the board and your LFG badge goes away. Requests still waiting are declined.',
      okButton: { title: 'Delete', color: ButtonColor.Ketchup },
    });

    if (confirmed) {
      remove();
    }
  };

  return (
    <div className="mt-2 flex gap-2">
      {post.status === LfgPostStatus.Open && (
        <Link href={getLfgEditUrl(post.id)} passHref>
          <Button
            tag="a"
            className="flex-1"
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
          >
            Edit
          </Button>
        </Link>
      )}
      <Button
        type="button"
        className="flex-1"
        variant={ButtonVariant.Tertiary}
        size={ButtonSize.Small}
        loading={isPending}
        onClick={onDelete}
      >
        Delete
      </Button>
    </div>
  );
};

export const LfgOwnerWidget = ({
  post,
  isLaunched,
}: {
  post: LfgPost;
  isLaunched: boolean;
}): ReactElement => {
  const [isFoundOpen, setFoundOpen] = useState(false);
  const { mutate: renew, isPending: isRenewing } = useRenew(post);
  const waiting = post.pendingCount ?? 0;
  const left = lfgDaysLeft(post.expiresAt);

  if (!isLaunched && post.status === LfgPostStatus.Open) {
    return (
      <SquadWidget title="Your post is in">
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
          className="mt-1"
        >
          It goes live when connections open. Until then, your avatar shows the
          LFG badge so people know you&apos;re looking.
        </Typography>
        <Link href={getLfgUrl()} passHref>
          <Button
            tag="a"
            className="mt-3 w-full"
            variant={ButtonVariant.Subtle}
            size={ButtonSize.Small}
          >
            Back to the board
          </Button>
        </Link>
        <ManageRow post={post} />
      </SquadWidget>
    );
  }

  if (post.status !== LfgPostStatus.Open) {
    const isFound = post.status === LfgPostStatus.Found;

    return (
      <SquadWidget title={isFound ? 'You found someone' : 'Your post expired'}>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
          className="mt-1"
        >
          {isFound
            ? 'The post is off the board. Everyone who was waiting can see the spot is filled.'
            : `Posts stay up for ${LFG_POST_LIFETIME_DAYS} days. Reopen it if you're still looking.`}
        </Typography>
        <Button
          type="button"
          className="mt-3 w-full"
          variant={ButtonVariant.Subtle}
          size={ButtonSize.Small}
          loading={isRenewing}
          onClick={() => renew()}
        >
          Reopen post
        </Button>
        <ManageRow post={post} />
      </SquadWidget>
    );
  }

  return (
    <SquadWidget title="Your post">
      <div className="mt-3 flex gap-6 border-b border-border-subtlest-tertiary pb-3">
        <Stat value={waiting} label="Waiting" />
        <Stat value={post.acceptedCount ?? 0} label="Accepted" />
        <Stat value={left} label="Days left" isUrgent={left <= 3} />
      </div>
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
        className="mt-3"
      >
        While it&apos;s up, your avatar shows the LFG badge.
      </Typography>
      {waiting > 0 ? (
        <Link href={getLfgReachOutUrl()} passHref>
          <Button
            tag="a"
            className="mt-3 w-full"
            variant={ButtonVariant.Primary}
            size={ButtonSize.Small}
          >
            Review responses
          </Button>
        </Link>
      ) : (
        <Button
          type="button"
          className="mt-3 w-full"
          variant={ButtonVariant.Primary}
          size={ButtonSize.Small}
          disabled
        >
          Review responses
        </Button>
      )}
      <div className="mt-2 flex gap-2">
        <Button
          type="button"
          className="flex-1"
          variant={ButtonVariant.Subtle}
          size={ButtonSize.Small}
          onClick={() => setFoundOpen(true)}
        >
          Found someone
        </Button>
        <Button
          type="button"
          className="flex-1"
          variant={ButtonVariant.Subtle}
          size={ButtonSize.Small}
          loading={isRenewing}
          onClick={() => renew()}
        >
          Renew
        </Button>
      </div>
      <ManageRow post={post} />
      {isFoundOpen && (
        <FoundModal post={post} onClose={() => setFoundOpen(false)} />
      )}
    </SquadWidget>
  );
};
