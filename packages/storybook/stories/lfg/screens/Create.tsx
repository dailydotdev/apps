import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import Textarea from '@dailydotdev/shared/src/components/fields/Textarea';
import { TextField } from '@dailydotdev/shared/src/components/fields/TextField';
import { Switch } from '@dailydotdev/shared/src/components/fields/Switch';
import { Checkbox } from '@dailydotdev/shared/src/components/fields/Checkbox';
import { Modal } from '@dailydotdev/shared/src/components/modals/common/Modal';
import { ModalSize } from '@dailydotdev/shared/src/components/modals/common/types';
import { ShieldCheckIcon } from '@dailydotdev/shared/src/components/icons/ShieldCheck';
import { ShieldWarningIcon } from '@dailydotdev/shared/src/components/icons/ShieldWarning';
import { VolunteeringIcon } from '@dailydotdev/shared/src/components/icons/Volunteering';
import { RaiseHandIcon } from '@dailydotdev/shared/src/components/icons/RaiseHand';
import { MiniCloseIcon } from '@dailydotdev/shared/src/components/icons/MiniClose';
import { PlusIcon } from '@dailydotdev/shared/src/components/icons/Plus';
import { SearchField } from '@dailydotdev/shared/src/components/fields/SearchField';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { SquadWidget } from '@dailydotdev/shared/src/features/squads/components/widgets/SquadWidget';
import type { LfgAsk, LfgPost } from '../data';
import {
  askPresets,
  AskType,
  Commitment,
  commitmentLabel,
  CUSTOM_ASK_MAX_LENGTH,
  HEADLINE_MAX_LENGTH,
  knownTags,
  MAX_TAGS,
  myFollowedTags,
  kindBlurb,
  kindLabel,
  LfgKind,
  MAX_ASKS,
  me,
  moneyPattern,
  NOW,
  POST_LIFETIME_DAYS,
  POST_TEXT_MAX_LENGTH,
  PostStatus,
} from '../data';
import type { NewPostInput } from '../store';
import { useProto } from '../store';
import { KindIcon, LfgRow, SectionLabel } from '../ui';
import { PhoneHeader } from '../shell';
import { Frame, panelClassName, SubPageHeader } from '../frame';

export const exampleDraft: NewPostInput = {
  kind: LfgKind.Learn,
  title: 'Learning Rust together, one small project a week',
  body: "I write TypeScript all day and want to get comfortable with Rust. Plan: pick a tiny CLI each week, build it separately, then review each other's code on a call.",
  tags: ['rust', 'typescript', 'cli'],
  commitment: Commitment.FewWeeks,
  about:
    "Full-stack developer, six years in, mostly TypeScript and Postgres. I'm new to Rust but I stick to a schedule.",
  showCountry: false,
  asks: [askPresets[LfgKind.Learn][0], askPresets[LfgKind.Learn][2]],
};

export const emptyDraft: NewPostInput = {
  kind: LfgKind.Build,
  title: '',
  body: '',
  tags: [],
  commitment: Commitment.FewWeeks,
  about: '',
  showCountry: false,
  asks: [askPresets[LfgKind.Build][0]],
};

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

const OptionCard = ({
  active,
  onClick,
  title,
  description,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  description: string;
  icon?: ReactNode;
}): ReactElement => (
  <button
    type="button"
    aria-pressed={active}
    onClick={onClick}
    className={classNames(
      'flex flex-1 flex-col gap-1 rounded-16 border p-3 text-left transition-colors',
      active
        ? 'border-border-subtlest-primary bg-surface-float'
        : 'border-border-subtlest-tertiary hover:bg-surface-hover',
    )}
  >
    <span className="flex items-center gap-1.5">
      {icon}
      <Typography type={TypographyType.Callout} bold>
        {title}
      </Typography>
    </span>
    <Typography type={TypographyType.Footnote} color={TypographyColor.Tertiary}>
      {description}
    </Typography>
  </button>
);

const Chip = ({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}): ReactElement => (
  <Button
    type="button"
    size={ButtonSize.Small}
    variant={active ? ButtonVariant.Primary : ButtonVariant.Float}
    aria-pressed={active}
    onClick={onClick}
  >
    {children}
  </Button>
);

const rules: { icon: ReactNode; title: string; body: string }[] = [
  {
    icon: <VolunteeringIcon size={IconSize.Small} secondary />,
    title: 'No paid work',
    body: "Don't post or pitch gigs, hiring or services for sale. Equity between co-founders is fine.",
  },
  {
    icon: <RaiseHandIcon size={IconSize.Small} secondary />,
    title: 'Be specific',
    body: 'Say what you need and a little about yourself. Go through the requests you get, even if the answer is no.',
  },
  {
    icon: <ShieldCheckIcon size={IconSize.Small} secondary />,
    title: 'Stay safe',
    body: "Keep chats on daily.dev until you trust someone. Never pay to join, and never run code you haven't read.",
  },
];

// Shown once, before a first post.
const HouseRules = ({
  onAgree,
  onClose,
}: {
  onAgree: () => void;
  onClose: () => void;
}): ReactElement => (
  <Modal
    isOpen
    isDrawerOnMobile
    size={ModalSize.Small}
    onRequestClose={onClose}
  >
    <Modal.Header title="Before you post" />
    <Modal.Body className="flex flex-col gap-4">
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Secondary}
      >
        Looking for group is for finding people, not customers.
      </Typography>
      {rules.map((rule) => (
        <div key={rule.title} className="flex items-start gap-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-10 bg-surface-float text-accent-avocado-default">
            {rule.icon}
          </span>
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <Typography type={TypographyType.Callout} bold>
              {rule.title}
            </Typography>
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
            >
              {rule.body}
            </Typography>
          </span>
        </div>
      ))}
    </Modal.Body>
    <Modal.Footer>
      <Button type="button" variant={ButtonVariant.Tertiary} onClick={onClose}>
        Cancel
      </Button>
      <Button type="button" variant={ButtonVariant.Primary} onClick={onAgree}>
        I&apos;m in, publish
      </Button>
    </Modal.Footer>
  </Modal>
);

export const CreateScreen = (): ReactElement => {
  const { state, back, publishPost, setDraft, pledge, track } = useProto();
  const [tagQuery, setTagQuery] = useState('');
  const [isRulesOpen, setRulesOpen] = useState(false);
  const draft = state.draft ?? emptyDraft;
  const update = (patch: Partial<NewPostInput>) =>
    setDraft({ ...draft, ...patch });
  const presets = askPresets[draft.kind];
  const askIds = draft.asks.map((item) => item.id);
  const customAsk = draft.asks.find((item) => item.id === 'custom');
  const { tags } = draft;
  const isTagsFull = tags.length >= MAX_TAGS;
  const search = tagQuery.trim().toLowerCase().replace(/^#/, '');
  const tagSuggestions = (
    search ? knownTags.filter((tag) => tag.includes(search)) : myFollowedTags
  )
    .filter((tag) => !tags.includes(tag))
    .slice(0, 8);
  const addTag = (tag: string) => {
    if (!isTagsFull) {
      update({ tags: [...tags, tag] });
      setTagQuery('');
    }
  };
  const hasMoney = moneyPattern.test(
    `${draft.title} ${draft.body} ${draft.about}`,
  );
  const canPublish =
    draft.title.trim().length > 0 && draft.body.trim().length > 0 && !hasMoney;

  useEffect(() => {
    if (hasMoney) {
      track('money-post');
    }
  }, [hasMoney, track]);

  const toggleAsk = (item: LfgAsk) =>
    update({
      asks: askIds.includes(item.id)
        ? draft.asks.filter((value) => value.id !== item.id)
        : [...draft.asks, item],
    });

  const publish = () => publishPost(draft);
  const onPublish = () => (state.pledged ? publish() : setRulesOpen(true));

  const preview: LfgPost = {
    ...draft,
    tags,
    id: 'preview',
    authorId: me.id,
    title: draft.title || 'Your headline shows here',
    body: draft.body || 'A few lines about what you need and why.',
    createdAt: NOW.toISOString(),
    expiresAt: new Date(
      NOW.getTime() + POST_LIFETIME_DAYS * 86_400_000,
    ).toISOString(),
    status: PostStatus.Open,
    outsidePending: 0,
  };

  return (
    <>
      <PhoneHeader
        title="New post"
        onBack={back}
        actions={
          <Button
            type="button"
            className="!h-[2.375rem] !rounded-14"
            variant={ButtonVariant.Primary}
            size={ButtonSize.Small}
            disabled={!canPublish}
            onClick={onPublish}
          >
            Publish
          </Button>
        }
      />
      <Frame
        side={
          <SquadWidget title="Preview">
            <div className="mt-2">
              <LfgRow post={preview} state={state} onOpen={() => undefined} />
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
        <SubPageHeader
          title="New post"
          onBack={back}
          action={
            <Button
              type="button"
              variant={ButtonVariant.Primary}
              size={ButtonSize.Small}
              disabled={!canPublish}
              onClick={onPublish}
            >
              Publish
            </Button>
          }
        />
        <div className={panelClassName()}>
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            Say who you&apos;re looking for. People reply with a pitch, and you
            pick who to talk to.
          </Typography>
          <div className="flex min-w-0 flex-col gap-6">
            <Step index={1} title="What are you looking for?">
              <div className="flex flex-col gap-2 tablet:flex-row">
                {[LfgKind.Build, LfgKind.Learn, LfgKind.Help].map((kind) => (
                  <OptionCard
                    key={kind}
                    active={draft.kind === kind}
                    onClick={() =>
                      update({ kind, asks: [askPresets[kind][0]] })
                    }
                    icon={<KindIcon kind={kind} />}
                    title={kindLabel[kind]}
                    description={kindBlurb[kind]}
                  />
                ))}
              </div>
            </Step>

            <Step index={2} title="The details">
              <TextField
                inputId="lfg-title"
                label="Headline"
                maxLength={HEADLINE_MAX_LENGTH}
                value={draft.title}
                valueChanged={(title) => update({ title })}
              />
              <Textarea
                inputId="lfg-body"
                label="What you're working on and what you need"
                rows={6}
                maxLength={POST_TEXT_MAX_LENGTH}
                value={draft.body}
                valueChanged={(body) => update({ body })}
              />
              <Textarea
                inputId="lfg-about"
                label="About you (optional)"
                placeholder="Your background and how you like to work"
                rows={4}
                maxLength={POST_TEXT_MAX_LENGTH}
                value={draft.about}
                valueChanged={(about) => update({ about })}
              />
              <div
                role={hasMoney ? 'alert' : undefined}
                className="flex items-start gap-2 rounded-12 border border-status-warning px-3 py-2"
              >
                <ShieldWarningIcon
                  size={IconSize.Size16}
                  className="mt-0.5 shrink-0 text-status-warning"
                />
                <Typography
                  type={TypographyType.Footnote}
                  className="min-w-0 flex-1"
                >
                  {hasMoney
                    ? 'This reads like paid work. Take out pay, rates and hiring to publish. Equity between co-founders is fine.'
                    : "This isn't a freelance marketplace. Posts that offer or look for paid work get taken down. Equity between co-founders is fine."}
                </Typography>
              </div>
            </Step>

            <Step index={3} title="Topics, time and commitment">
              <div className="flex flex-col gap-2">
                <SectionLabel>Topics</SectionLabel>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Button
                        key={tag}
                        type="button"
                        variant={ButtonVariant.Primary}
                        size={ButtonSize.Small}
                        icon={<MiniCloseIcon />}
                        iconPosition={ButtonIconPosition.Right}
                        aria-label={`Remove #${tag}`}
                        onClick={() =>
                          update({
                            tags: tags.filter((value) => value !== tag),
                          })
                        }
                      >
                        #{tag}
                      </Button>
                    ))}
                  </div>
                )}
                {!isTagsFull && (
                  <>
                    <SearchField
                      inputId="lfg-tag-search"
                      placeholder="Search tags"
                      value={tagQuery}
                      valueChanged={setTagQuery}
                    />
                    <div className="flex flex-wrap gap-2">
                      {tagSuggestions.map((tag) => (
                        <Button
                          key={tag}
                          type="button"
                          variant={ButtonVariant.Float}
                          size={ButtonSize.Small}
                          icon={<PlusIcon />}
                          onClick={() => addTag(tag)}
                        >
                          #{tag}
                        </Button>
                      ))}
                      {search && tagSuggestions.length === 0 && (
                        <Typography
                          type={TypographyType.Footnote}
                          color={TypographyColor.Quaternary}
                        >
                          No tag called #{search} yet.
                        </Typography>
                      )}
                    </div>
                  </>
                )}
                <Typography
                  type={TypographyType.Footnote}
                  color={TypographyColor.Tertiary}
                >
                  {isTagsFull
                    ? `That's ${MAX_TAGS}, the most a post can have.`
                    : `Up to ${MAX_TAGS}, from the tags on daily.dev.${
                        search ? '' : ' These are tags you follow.'
                      } People who follow them get a heads-up.`}
                </Typography>
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.values(Commitment).map((commitment) => (
                  <Chip
                    key={commitment}
                    active={draft.commitment === commitment}
                    onClick={() => update({ commitment })}
                  >
                    {commitmentLabel[commitment]}
                  </Chip>
                ))}
              </div>
              <div className="flex flex-col gap-2 rounded-12 bg-surface-float px-3 py-2">
                <Typography
                  type={TypographyType.Footnote}
                  color={TypographyColor.Secondary}
                >
                  Time zone: {me.timezone}, from your profile
                </Typography>
                <Switch
                  inputId="lfg-country"
                  name="lfg-country"
                  compact
                  checked={draft.showCountry}
                  onToggle={() => update({ showCountry: !draft.showCountry })}
                >
                  Also show my country ({me.country})
                </Switch>
              </div>
            </Step>

            <Step
              index={4}
              title="What should people include?"
              hint={`Pick up to ${MAX_ASKS}. Everyone also writes a short pitch.`}
            >
              <div className="flex flex-col gap-1">
                {presets.map((item) => (
                  <Checkbox
                    key={item.id}
                    name={`lfg-ask-${item.id}`}
                    checked={askIds.includes(item.id)}
                    disabled={
                      !askIds.includes(item.id) && draft.asks.length >= MAX_ASKS
                    }
                    onToggleCallback={() => toggleAsk(item)}
                  >
                    {item.label}
                    {item.type === AskType.Link && ' (link)'}
                  </Checkbox>
                ))}
              </div>
              <TextField
                inputId="lfg-custom-ask"
                label="Or ask your own question"
                maxLength={CUSTOM_ASK_MAX_LENGTH}
                disabled={!customAsk && draft.asks.length >= MAX_ASKS}
                value={customAsk?.label ?? ''}
                valueChanged={(label) =>
                  update({
                    asks: label
                      ? [
                          ...draft.asks.filter((item) => item.id !== 'custom'),
                          { id: 'custom', label, type: AskType.Text },
                        ]
                      : draft.asks.filter((item) => item.id !== 'custom'),
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

            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
              className="border-t border-border-subtlest-tertiary pt-6"
            >
              {state.phase === 'prelaunch'
                ? `Goes live when connections open, then stays up for ${POST_LIFETIME_DAYS} days. Your avatar shows the LFG badge right away.`
                : `Stays up for ${POST_LIFETIME_DAYS} days, and your avatar shows the LFG badge while it's up.`}
            </Typography>
          </div>
        </div>
      </Frame>
      {isRulesOpen && (
        <HouseRules
          onClose={() => setRulesOpen(false)}
          onAgree={() => {
            pledge();
            setRulesOpen(false);
            publish();
          }}
        />
      )}
    </>
  );
};
