import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useState } from 'react';
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
import { Modal } from '@dailydotdev/shared/src/components/modals/common/Modal';
import { ModalSize } from '@dailydotdev/shared/src/components/modals/common/types';
import { Justify } from '@dailydotdev/shared/src/components/utilities/common';
import Textarea from '@dailydotdev/shared/src/components/fields/Textarea';
import { TextField } from '@dailydotdev/shared/src/components/fields/TextField';
import { LinkIcon } from '@dailydotdev/shared/src/components/icons/Link';
import { ShieldWarningIcon } from '@dailydotdev/shared/src/components/icons/ShieldWarning';
import { ShieldCheckIcon } from '@dailydotdev/shared/src/components/icons/ShieldCheck';
import { GitHubIcon } from '@dailydotdev/shared/src/components/icons/GitHub';
import { OrganizationIcon } from '@dailydotdev/shared/src/components/icons/Organization';
import { JobIcon } from '@dailydotdev/shared/src/components/icons/Job';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import type { LfgPost, LfgUser } from '../data';
import {
  ANSWER_MAX_LENGTH,
  AskType,
  DAILY_REACH_OUTS,
  me,
  moneyPattern,
  PITCH_MAX_LENGTH,
  users,
} from '../data';
import { currentMe, findPost, useProto } from '../store';
import { getReceipts, LfgContextCard, ReceiptList, SectionLabel } from '../ui';

const contactPattern =
  /(t\.me\/|telegram|whats\s?app|wa\.me|signal|discord\.gg|discord|skype|[\w.+-]+@[\w-]+\.[\w.]+|\+?\d[\d\s-]{8,}\d)/i;

const normalize = (text: string): string =>
  text.toLowerCase().replace(/[^a-z0-9]/g, '');

export const isOwnRepo = (url: string, user: LfgUser): boolean =>
  !!user.github &&
  url.toLowerCase().includes(`github.com/${user.github.toLowerCase()}/`);

export const LinkVerification = ({
  url,
  user,
}: {
  url: string;
  user: LfgUser;
}): ReactElement | null => {
  if (!url.trim()) {
    return null;
  }
  if (isOwnRepo(url, user)) {
    return (
      <span className="flex items-center gap-1 text-accent-avocado-default typo-caption1">
        <ShieldCheckIcon size={IconSize.Size16} secondary />
        Verified: a repo on {user.id === me.id ? 'your' : 'their'} connected
        GitHub
      </span>
    );
  }
  const whose = user.id === me.id ? 'your' : 'their';
  return (
    <span className="text-text-quaternary typo-caption1">
      {user.github
        ? `Not verified. Only repos on ${whose} connected GitHub get the badge.`
        : `Not verified. ${
            user.id === me.id ? "You haven't" : "They haven't"
          } connected GitHub.`}
    </span>
  );
};

const Notice = ({
  tone,
  children,
}: {
  tone: 'warning' | 'neutral';
  children: ReactNode;
}): ReactElement => (
  <div
    role={tone === 'warning' ? 'alert' : undefined}
    className={
      tone === 'warning'
        ? 'flex items-start gap-2 rounded-12 border border-status-warning px-3 py-2 text-text-primary typo-footnote'
        : 'flex items-start gap-2 rounded-12 bg-surface-float px-3 py-2 text-text-secondary typo-footnote'
    }
  >
    {tone === 'warning' && (
      <ShieldWarningIcon
        size={IconSize.Size16}
        className="mt-0.5 shrink-0 text-status-warning"
      />
    )}
    <span className="min-w-0 flex-1">{children}</span>
  </div>
);

const StandOutRow = ({
  icon,
  title,
  description,
  action,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action: string;
  onClick: () => void;
}): ReactElement => (
  <div className="flex items-center gap-3">
    <span className="flex size-8 shrink-0 items-center justify-center rounded-10 bg-background-default text-text-primary">
      {icon}
    </span>
    <span className="flex min-w-0 flex-1 flex-col">
      <Typography type={TypographyType.Footnote} bold>
        {title}
      </Typography>
      <Typography
        type={TypographyType.Caption1}
        color={TypographyColor.Tertiary}
      >
        {description}
      </Typography>
    </span>
    <Button
      type="button"
      variant={ButtonVariant.Secondary}
      size={ButtonSize.XSmall}
      onClick={onClick}
    >
      {action}
    </Button>
  </div>
);

// Nudges toward the details that make a yes easier, right where the
// reach-out is being written. Work experience already on the profile goes
// out with the request; without it, a CV fills it in.
const StandOut = (): ReactElement | null => {
  const { state, verify } = useProto();
  const { github, company, experience } = state.verified;
  if (github && company && experience) {
    return null;
  }
  return (
    <div className="flex flex-col gap-3 rounded-16 bg-surface-float p-4">
      <div className="flex flex-col gap-0.5">
        <Typography type={TypographyType.Callout} bold>
          Stand out
        </Typography>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          These make it easier to say yes. Each takes a few seconds.
        </Typography>
      </div>
      {!github && (
        <StandOutRow
          icon={<GitHubIcon size={IconSize.Size16} />}
          title="Connect GitHub"
          description="Links to your own repos get a verified badge"
          action="Connect"
          onClick={() => verify('github')}
        />
      )}
      {!company && (
        <StandOutRow
          icon={<OrganizationIcon size={IconSize.Size16} />}
          title="Verify where you work"
          description="Confirm with your work email. Only the company name shows."
          action="Verify"
          onClick={() => verify('company')}
        />
      )}
      {!experience && (
        <StandOutRow
          icon={<JobIcon size={IconSize.Size16} />}
          title="Add your work experience"
          description="Upload your CV and it fills in your profile."
          action="Upload CV"
          onClick={() => verify('experience')}
        />
      )}
    </div>
  );
};

const Composer = ({ post }: { post: LfgPost }): ReactElement => {
  const { state, closeComposer, sendReachOut, reachOutsLeft, track } =
    useProto();
  const author = users[post.authorId];
  const first = author.name.split(' ')[0];
  const [pitch, setPitch] = useState(state.composerPrefill?.pitch ?? '');
  const [answers, setAnswers] = useState<Record<string, string>>(
    state.composerPrefill?.answers ?? {},
  );
  const self = currentMe(state);

  const hasContact = [pitch, ...Object.values(answers)].some((value) =>
    contactPattern.test(value.replace(/https?:\/\/github\.com\/\S+/g, '')),
  );
  const isDuplicate =
    !!pitch.trim() &&
    state.reachOuts.some(
      (item) =>
        item.fromId === me.id &&
        item.postId !== post.id &&
        normalize(item.pitch) === normalize(pitch),
    );
  const hasMoney = [pitch, ...Object.values(answers)].some((value) =>
    moneyPattern.test(value),
  );
  const outOfCredits = reachOutsLeft === 0;
  const missingAnswer = post.asks.some((ask) => !answers[ask.id]?.trim());
  const canSend =
    !!pitch.trim() &&
    !missingAnswer &&
    !hasContact &&
    !hasMoney &&
    !isDuplicate &&
    !outOfCredits;

  useEffect(() => {
    if (isDuplicate) {
      track('dup-warning');
    }
  }, [isDuplicate, track]);
  useEffect(() => {
    if (hasContact) {
      track('contact-warning');
    }
  }, [hasContact, track]);
  useEffect(() => {
    if (hasMoney) {
      track('money-warning');
    }
  }, [hasMoney, track]);
  useEffect(() => {
    if (outOfCredits) {
      track('credits-warning');
    }
  }, [outOfCredits, track]);

  return (
    <Modal
      isOpen
      isDrawerOnMobile
      size={ModalSize.Medium}
      onRequestClose={closeComposer}
    >
      <Modal.Header title={`Reach out to ${first}`} />
      <Modal.Body className="flex flex-col gap-5">
        <LfgContextCard post={post} label={`About ${first}'s post`} />

        <div className="flex flex-col gap-2">
          <Textarea
            inputId="lfg-pitch"
            label="Your pitch"
            placeholder="I can help with X because I've done Y. Free for Z."
            rows={4}
            maxLength={PITCH_MAX_LENGTH}
            value={pitch}
            valueChanged={setPitch}
          />
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            Say what you bring and why this post. Copy-paste pitches get held
            back.
          </Typography>
          {isDuplicate && (
            <Notice tone="warning">
              You sent this same pitch to another post today. Make it about{' '}
              {first}&apos;s post to send it.
            </Notice>
          )}
          {hasContact && (
            <Notice tone="warning">
              Contact details stay out until {first} accepts. Then you can share
              whatever you like in the chat.
            </Notice>
          )}
          {hasMoney && (
            <Notice tone="warning">
              Looking for group is pro bono, so pricing and paid work can&apos;t
              go in a pitch. Take it out to send.
            </Notice>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <SectionLabel>{first} asked for</SectionLabel>
          {post.asks.map((ask) => (
            <div key={ask.id} className="flex flex-col gap-1">
              <TextField
                inputId={`lfg-ask-${ask.id}`}
                label={ask.label}
                placeholder={
                  ask.type === AskType.Link
                    ? 'https://github.com/you/project'
                    : undefined
                }
                leftIcon={
                  ask.type === AskType.Link ? (
                    <LinkIcon size={IconSize.Small} />
                  ) : undefined
                }
                maxLength={ANSWER_MAX_LENGTH}
                showMaxLength={false}
                value={answers[ask.id] ?? ''}
                valueChanged={(value) =>
                  setAnswers((prev) => ({ ...prev, [ask.id]: value }))
                }
              />
              {ask.type === AskType.Link && (
                <LinkVerification url={answers[ask.id] ?? ''} user={self} />
              )}
            </div>
          ))}
        </div>

        <StandOut />

        <div className="flex flex-col gap-3">
          <SectionLabel>Sent with your request</SectionLabel>
          <ReceiptList items={getReceipts(self)} />
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Quaternary}
          >
            These come from your profile.
          </Typography>
        </div>

        {outOfCredits && (
          <Notice tone="neutral">
            You&apos;ve used today&apos;s {DAILY_REACH_OUTS} reach-outs. They
            refill tomorrow, and every accepted one comes back right away.
          </Notice>
        )}
      </Modal.Body>
      <Modal.Footer justify={Justify.Between}>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          {reachOutsLeft} of {DAILY_REACH_OUTS} left today
        </Typography>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={ButtonVariant.Tertiary}
            onClick={closeComposer}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant={ButtonVariant.Primary}
            disabled={!canSend}
            onClick={() =>
              sendReachOut({
                postId: post.id,
                pitch: pitch.trim(),
                answers,
              })
            }
          >
            Send request
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export const ReachOutModal = (): ReactElement | null => {
  const { state } = useProto();
  // react-modal looks up the #__next app root while rendering, so a story
  // that opens with the composer has to wait for the root to mount.
  const [isMounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const post = findPost(state, state.composerFor);
  if (!post || !isMounted) {
    return null;
  }
  return <Composer key={`${post.id}-${state.composerKey}`} post={post} />;
};
