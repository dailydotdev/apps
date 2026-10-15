import type { ReactElement, ReactNode } from 'react';
import React, { useRef, useState } from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from '../../../../components/utilities/Link';
import { timezoneSettingsUrl } from '../../../../lib/constants';
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
import Textarea from '../../../../components/fields/Textarea';
import { TextField } from '../../../../components/fields/TextField';
import { Switch } from '../../../../components/fields/Switch';
import { Checkbox } from '../../../../components/fields/Checkbox';
import { IconSize } from '../../../../components/Icon';
import { ShieldCheckIcon } from '../../../../components/icons/ShieldCheck';
import { ShieldWarningIcon } from '../../../../components/icons/ShieldWarning';
import { ShellPrimaryPill } from '../../../../components/shell/ShellSquare';
import { SquadWidget } from '../../../squads/components/widgets/SquadWidget';
import { SquadSubPageHeader } from '../../../squads/components/SquadSubPageHeader';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { useLogContext } from '../../../../contexts/LogContext';
import { useActions } from '../../../../hooks/useActions';
import { useToastNotification } from '../../../../hooks/useToastNotification';
import { useDirtyForm } from '../../../../hooks/useDirtyForm';
import useFeedSettings from '../../../../hooks/useFeedSettings';
import useLogEventOnce from '../../../../hooks/log/useLogEventOnce';
import { ActionType } from '../../../../graphql/actions';
import type { ApiErrorResult } from '../../../../graphql/common';
import { ApiError, getApiError } from '../../../../graphql/common';
import { LogEvent, Origin, TargetType } from '../../../../lib/log';
import type { LfgAsk, LfgPost, LfgPostInput } from '../../types';
import { LfgAskType, LfgCommitment, LfgKind, LfgPostStatus } from '../../types';
import {
  LFG_ASK_LABEL_MAX_LENGTH,
  LFG_BODY_MAX_LENGTH,
  LFG_CUSTOM_ASK_ID,
  LFG_MAX_ASKS,
  LFG_MAX_TAGS,
  LFG_POST_LIFETIME_DAYS,
  LFG_TITLE_MAX_LENGTH,
  lfgAskPresets,
  lfgCommitmentLabel,
  lfgKindBlurb,
  lfgKindLabel,
  lfgKinds,
} from '../../constants';
import { createLfgPost, editLfgPost } from '../../graphql';
import { myLfgPostQueryOptions, updateLfgPostCaches } from '../../queries';
import {
  formatUtcOffset,
  getLfgUrl,
  getUtcOffsetForTimeZone,
} from '../../lib/format';
import { LfgFrame, lfgPanelClassName } from '../LfgFrame';
import { LfgKindIcon } from '../LfgKind';
import { LfgRow } from '../LfgRow';
import { LfgTagPicker } from '../LfgTagPicker';
import { LfgHouseRulesModal } from './LfgHouseRulesModal';
import { LfgMessagesOffNotice } from '../LfgMessagesOffNotice';

const emptyDraft: LfgPostInput = {
  kind: LfgKind.Build,
  title: '',
  body: '',
  tags: [],
  commitment: LfgCommitment.FewWeeks,
  showCountry: false,
  asks: [lfgAskPresets[LfgKind.Build][0]],
};

const toInput = (post: LfgPost): LfgPostInput => ({
  kind: post.kind,
  title: post.title,
  body: post.body,
  tags: post.tags,
  commitment: post.commitment,
  showCountry: post.showCountry,
  asks: post.asks.map(({ id, label, type }) => ({ id, label, type })),
});

const Step = ({
  index,
  title,
  hint,
  children,
}: {
  index: number;
  title: string;
  hint?: string;
  children: ReactNode;
}): ReactElement => (
  <section
    className={classNames(
      'flex flex-col gap-3',
      index > 1 && 'border-t border-border-subtlest-tertiary pt-6',
    )}
  >
    <div className="flex flex-col gap-0.5">
      <Typography tag={TypographyTag.H2} type={TypographyType.Callout} bold>
        {title}
      </Typography>
      {hint && (
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          {hint}
        </Typography>
      )}
    </div>
    {children}
  </section>
);

const SectionLabel = ({ children }: { children: string }): ReactElement => (
  <Typography
    type={TypographyType.Footnote}
    color={TypographyColor.Tertiary}
    bold
  >
    {children}
  </Typography>
);

const KindCard = ({
  kind,
  isActive,
  isDisabled,
  onClick,
}: {
  kind: LfgKind;
  isActive: boolean;
  isDisabled: boolean;
  onClick: () => void;
}): ReactElement => (
  <button
    type="button"
    aria-pressed={isActive}
    disabled={isDisabled}
    onClick={onClick}
    className={classNames(
      'flex flex-1 flex-col gap-1 rounded-16 border p-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-64',
      isActive
        ? 'border-border-subtlest-primary bg-surface-float'
        : 'border-border-subtlest-tertiary hover:bg-surface-hover',
    )}
  >
    <span className="flex items-center gap-1.5">
      <LfgKindIcon kind={kind} />
      <Typography type={TypographyType.Callout} bold>
        {lfgKindLabel[kind]}
      </Typography>
    </span>
    <Typography type={TypographyType.Footnote} color={TypographyColor.Tertiary}>
      {lfgKindBlurb[kind]}
    </Typography>
  </button>
);

interface LfgComposerProps {
  // Editing an existing post; a new one otherwise.
  post?: LfgPost;
  isLaunched: boolean;
}

export const LfgComposer = ({
  post,
  isLaunched,
}: LfgComposerProps): ReactElement => {
  const router = useRouter();
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const { logEvent } = useLogContext();
  const { displayToast } = useToastNotification();
  const { checkHasCompleted, completeAction, isActionsFetched } = useActions();
  const { feedSettings } = useFeedSettings();
  const isEdit = !!post;
  const { data: openPost } = useQuery(
    myLfgPostQueryOptions(user, { enabled: !isEdit }),
  );
  const [initial] = useState<LfgPostInput>(() =>
    post ? toInput(post) : emptyDraft,
  );
  const [draft, setDraft] = useState<LfgPostInput>(initial);
  const [isRulesOpen, setRulesOpen] = useState(false);
  const update = (patch: Partial<LfgPostInput>) =>
    setDraft((current) => ({ ...current, ...patch }));
  // A post written back from a mutation lacks hasReachOuts, so the counts
  // stand in until the page reloads it.
  const hasReachOuts =
    !!post &&
    (post.hasReachOuts ??
      (post.pendingCount ?? 0) + (post.acceptedCount ?? 0) > 0);
  const presets = lfgAskPresets[draft.kind];
  const askIds = draft.asks.map(({ id }) => id);
  const customAsk = draft.asks.find(({ id }) => id === LFG_CUSTOM_ASK_ID);
  const isAsksFull = draft.asks.length >= LFG_MAX_ASKS;
  const offset = getUtcOffsetForTimeZone(user?.timezone);
  const country = user?.location?.country;
  const hasOpenPost = !isEdit && !!openPost;
  const isDirty = JSON.stringify(draft) !== JSON.stringify(initial);
  const canPublish =
    !!draft.title.trim() &&
    !!draft.body.trim() &&
    draft.tags.length > 0 &&
    !hasOpenPost;
  // Until the actions load, the rules show rather than risk the API refusing
  // a first post without them.
  const needsPledge =
    !isEdit &&
    !(isActionsFetched && checkHasCompleted(ActionType.LfgHouseRules));

  // The unsaved-changes prompt's Save publishes, which is defined below.
  const publishRef = useRef<() => Promise<void>>();
  const { allowNavigation } = useDirtyForm(isDirty, {
    onSave: () => publishRef.current?.(),
  });

  useLogEventOnce(
    () => ({
      event_name: LogEvent.StartLfgPost,
      extra: JSON.stringify({ launched: isLaunched }),
    }),
    { condition: !isEdit },
  );

  const { mutateAsync: publish, isPending } = useMutation({
    mutationFn: ({ pledge }: { pledge?: boolean }) => {
      const input: LfgPostInput = {
        ...draft,
        title: draft.title.trim(),
        body: draft.body.trim(),
      };

      return post
        ? editLfgPost({ id: post.id, input })
        : createLfgPost({ input, pledge });
    },
    onSuccess: (saved, { pledge }) => {
      updateLfgPostCaches(queryClient, user, saved);
      logEvent({
        event_name: isEdit ? LogEvent.EditLfgPost : LogEvent.PublishLfgPost,
        target_type: TargetType.LfgPost,
        target_id: saved.id,
        extra: JSON.stringify({
          kind: saved.kind,
          commitment: saved.commitment,
          tags: saved.tags.length,
          asks: saved.asks.length,
          custom_ask: saved.asks.some(({ id }) => id === LFG_CUSTOM_ASK_ID),
          show_country: saved.showCountry,
          launched: isLaunched,
        }),
      });

      if (pledge) {
        completeAction(ActionType.LfgHouseRules);
        logEvent({ event_name: LogEvent.AgreeLfgHouseRules });
      }

      if (isEdit) {
        displayToast('Your post is updated');
      } else {
        displayToast(
          isLaunched
            ? `Your post is live for ${LFG_POST_LIFETIME_DAYS} days`
            : "You're in. Your post goes live when connections open, and your LFG badge is on.",
        );
      }

      allowNavigation();
      router.push(getLfgUrl(saved.id));
    },
    onError: (error: ApiErrorResult) => {
      if (getApiError(error, ApiError.Conflict)) {
        displayToast('You already have an open post. Close it to post again.');
        return;
      }

      displayToast(
        getApiError(error, ApiError.GraphqlValidationFailed)?.message ??
          getApiError(error, ApiError.RateLimited)?.message ??
          "Couldn't save your post. Please try again.",
      );
    },
  });

  const onPublish = async () => {
    if (!canPublish || isPending) {
      return;
    }

    if (needsPledge) {
      setRulesOpen(true);
      return;
    }

    await publish({}).catch(() => null);
  };
  publishRef.current = onPublish;

  const toggleAsk = (ask: LfgAsk) =>
    update({
      asks: askIds.includes(ask.id)
        ? draft.asks.filter(({ id }) => id !== ask.id)
        : [...draft.asks, ask],
    });

  const preview: LfgPost = {
    ...draft,
    id: post?.id ?? 'preview',
    author: {
      id: user?.id ?? '',
      name: user?.name ?? '',
      username: user?.username ?? '',
      image: user?.image ?? '',
      permalink: user?.permalink ?? '',
      reputation: user?.reputation ?? 0,
      createdAt: '',
    },
    country: country ?? null,
    utcOffset: offset,
    title: draft.title || 'Your headline shows here',
    body: draft.body || 'A few lines about what you need and why.',
    status: LfgPostStatus.Open,
    isPaused: false,
    pendingCount: null,
    acceptedCount: null,
    createdAt: post?.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    expiresAt: post?.expiresAt ?? new Date().toISOString(),
    myReachOut: null,
  };

  const title = isEdit ? 'Edit post' : 'New post';
  const publishLabel = isEdit ? 'Save' : 'Publish';

  return (
    <>
      <LfgFrame
        side={
          <SquadWidget title="Preview">
            <div className="mt-2">
              <LfgRow
                post={preview}
                viewerId={user?.id}
                isLaunched={isLaunched}
                isPreview
              />
            </div>
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
              className="mt-1"
            >
              How your post shows on the board.
            </Typography>
          </SquadWidget>
        }
      >
        <SquadSubPageHeader
          title={title}
          backUrl={post ? getLfgUrl(post.id) : getLfgUrl()}
          backLabel={post ? 'Back to your post' : 'Back to Looking for group'}
          action={
            <Button
              type="button"
              variant={ButtonVariant.Primary}
              size={ButtonSize.Small}
              disabled={!canPublish}
              loading={isPending}
              onClick={onPublish}
            >
              {publishLabel}
            </Button>
          }
          phoneActions={
            <ShellPrimaryPill
              disabled={!canPublish || isPending}
              className="disabled:opacity-64"
              onClick={onPublish}
            >
              {publishLabel}
            </ShellPrimaryPill>
          }
        />
        <div className={lfgPanelClassName()}>
          {hasOpenPost && openPost && (
            <div className="flex items-start gap-2 rounded-12 bg-surface-float px-3 py-2">
              <Typography
                type={TypographyType.Footnote}
                color={TypographyColor.Secondary}
                className="min-w-0 flex-1"
              >
                You already have an open post. Mark it found or delete it to
                post something new.{' '}
                <Link href={getLfgUrl(openPost.id)} passHref>
                  <a className="text-text-link hover:underline">
                    Go to your post
                  </a>
                </Link>
              </Typography>
            </div>
          )}
          {!isEdit && (
            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Tertiary}
            >
              Say who you&apos;re looking for. People reply with a pitch, and
              you pick who to talk to.
            </Typography>
          )}
          <div className="flex min-w-0 flex-col gap-6">
            <LfgMessagesOffNotice>
              People answer your post with a chat request, so turn on direct
              messages to hear from them.
            </LfgMessagesOffNotice>
            <Step
              index={1}
              title="What are you looking for?"
              hint={
                hasReachOuts
                  ? "Kind and asks can't change once someone reached out."
                  : undefined
              }
            >
              <div className="flex flex-col gap-2 tablet:flex-row">
                {lfgKinds.map((kind) => (
                  <KindCard
                    key={kind}
                    kind={kind}
                    isActive={draft.kind === kind}
                    isDisabled={hasReachOuts}
                    onClick={() =>
                      update({ kind, asks: [lfgAskPresets[kind][0]] })
                    }
                  />
                ))}
              </div>
            </Step>

            <Step index={2} title="The details">
              <TextField
                inputId="lfg-title"
                name="title"
                label="Headline"
                maxLength={LFG_TITLE_MAX_LENGTH}
                value={draft.title}
                valueChanged={(value) => update({ title: value })}
              />
              <Textarea
                inputId="lfg-body"
                name="body"
                label="What you're working on, what you need and a bit about you"
                rows={6}
                maxLength={LFG_BODY_MAX_LENGTH}
                value={draft.body}
                valueChanged={(value) => update({ body: value })}
              />
              <div className="flex items-start gap-2 rounded-12 border border-status-warning px-3 py-2">
                <ShieldWarningIcon
                  size={IconSize.Size16}
                  className="mt-0.5 shrink-0 text-status-warning"
                />
                <Typography
                  type={TypographyType.Footnote}
                  className="min-w-0 flex-1"
                >
                  This isn&apos;t a freelance marketplace. Posts that offer or
                  look for paid work get taken down. Equity between co-founders
                  is fine.
                </Typography>
              </div>
            </Step>

            <Step index={3} title="Help the right people find it">
              <div className="flex flex-col gap-2">
                <SectionLabel>Topics</SectionLabel>
                <LfgTagPicker
                  value={draft.tags}
                  onChange={(tags) => update({ tags })}
                  max={LFG_MAX_TAGS}
                  suggestions={feedSettings?.includeTags ?? []}
                  origin={Origin.LfgPost}
                />
                <Typography
                  type={TypographyType.Footnote}
                  color={TypographyColor.Tertiary}
                >
                  {draft.tags.length >= LFG_MAX_TAGS
                    ? `That's ${LFG_MAX_TAGS}, the most a post can have.`
                    : `Pick at least one and up to ${LFG_MAX_TAGS}, from the tags on daily.dev. People filter the board by them.`}
                </Typography>
              </div>
              <div className="flex flex-col gap-2">
                <SectionLabel>Time commitment</SectionLabel>
                <div className="flex flex-wrap gap-2">
                  {Object.values(LfgCommitment).map((commitment) => (
                    <Button
                      key={commitment}
                      type="button"
                      size={ButtonSize.Small}
                      variant={
                        draft.commitment === commitment
                          ? ButtonVariant.Primary
                          : ButtonVariant.Float
                      }
                      aria-pressed={draft.commitment === commitment}
                      onClick={() => update({ commitment })}
                    >
                      {lfgCommitmentLabel[commitment]}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-2 rounded-12 bg-surface-float px-3 py-2">
                <Typography
                  type={TypographyType.Footnote}
                  color={TypographyColor.Secondary}
                >
                  {user?.timezone ? (
                    `Time zone: ${formatUtcOffset(offset)}, from your profile`
                  ) : (
                    <>
                      Time zone: UTC+0, since your profile has none.{' '}
                      <Link href={timezoneSettingsUrl} passHref>
                        <a
                          href={timezoneSettingsUrl}
                          target="_blank"
                          rel="noopener"
                          className="text-text-link underline"
                        >
                          Set yours
                        </a>
                      </Link>
                    </>
                  )}
                </Typography>
                {country && (
                  <Switch
                    inputId="lfg-country"
                    name="lfg-country"
                    compact
                    checked={draft.showCountry}
                    onToggle={() => update({ showCountry: !draft.showCountry })}
                  >
                    Also show my country ({country})
                  </Switch>
                )}
              </div>
            </Step>

            <Step
              index={4}
              title="What should people include?"
              hint={`Pick up to ${LFG_MAX_ASKS}. Everyone also writes a short pitch.`}
            >
              <div className="flex flex-col gap-1">
                {presets.map((ask) => (
                  <Checkbox
                    key={ask.id}
                    name={`lfg-ask-${ask.id}`}
                    checked={askIds.includes(ask.id)}
                    disabled={
                      hasReachOuts || (!askIds.includes(ask.id) && isAsksFull)
                    }
                    onToggleCallback={() => toggleAsk(ask)}
                  >
                    {ask.label}
                    {ask.type === LfgAskType.Link && ' (link)'}
                  </Checkbox>
                ))}
              </div>
              <TextField
                inputId="lfg-custom-ask"
                name="custom-ask"
                label="Or ask your own question"
                maxLength={LFG_ASK_LABEL_MAX_LENGTH}
                disabled={hasReachOuts || (!customAsk && isAsksFull)}
                value={customAsk?.label ?? ''}
                valueChanged={(label) =>
                  update({
                    asks: label.trim()
                      ? [
                          ...draft.asks.filter(
                            ({ id }) => id !== LFG_CUSTOM_ASK_ID,
                          ),
                          {
                            id: LFG_CUSTOM_ASK_ID,
                            label,
                            type: LfgAskType.Text,
                          },
                        ]
                      : draft.asks.filter(({ id }) => id !== LFG_CUSTOM_ASK_ID),
                  })
                }
              />
              <div className="flex items-start gap-2 rounded-12 bg-surface-float px-3 py-2">
                <ShieldCheckIcon
                  size={IconSize.Size16}
                  secondary
                  className="mt-0.5 shrink-0 text-accent-avocado-default"
                />
                <Typography
                  type={TypographyType.Footnote}
                  color={TypographyColor.Secondary}
                  className="min-w-0 flex-1"
                >
                  Every reach-out comes with details from the person&apos;s
                  profile: reputation, how long they&apos;ve been on daily.dev,
                  work experience, and a verified workplace and GitHub when they
                  have them.
                </Typography>
              </div>
            </Step>

            {!isEdit && (
              <Typography
                type={TypographyType.Footnote}
                color={TypographyColor.Tertiary}
                className="border-t border-border-subtlest-tertiary pt-6"
              >
                {isLaunched
                  ? `Stays up for ${LFG_POST_LIFETIME_DAYS} days, and your avatar shows the LFG badge while it's up.`
                  : `Goes live when connections open, then stays up for ${LFG_POST_LIFETIME_DAYS} days. Your avatar shows the LFG badge right away.`}
              </Typography>
            )}
          </div>
        </div>
      </LfgFrame>
      {isRulesOpen && (
        <LfgHouseRulesModal
          isPending={isPending}
          onClose={() => setRulesOpen(false)}
          onAgree={async () => {
            await publish({ pledge: true }).catch(() => null);
            setRulesOpen(false);
          }}
        />
      )}
    </>
  );
};
