import type { ComponentType, ReactElement } from 'react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
// Type-only, so it is erased at compile time and pulls none of the module's 74KB
// into this chunk, which is the point of fetching the component below.
import type { BorderBeamProps } from 'border-beam';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import ConditionalWrapper from '../../../components/ConditionalWrapper';
import { FlexCol, FlexRow } from '../../../components/utilities';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { Tooltip } from '../../../components/tooltip/Tooltip';
import { IconSize } from '../../../components/Icon';
import { useIsLightTheme } from '../../../hooks/utils/useThemedAsset';
import { useAgent } from '../AgentContext';
import type { AgentCommand } from '../commands';
import {
  commandQuery,
  findCommand,
  matchCommands,
  parseCommand,
  quickCommandNames,
} from '../commands';
import type { AgentAttachment } from '../chat';
import { mentionCandidates } from '../attachments';
import { AgentAttachmentChip, attachmentIcon } from './AgentAttachmentChip';
import type { AgentMenuItem } from './AgentComposerMenu';
import {
  AgentComposerMenu,
  composerMenuId,
  composerOptionId,
} from './AgentComposerMenu';
import { AgentSendButton } from './AgentSendButton';

const maxComposerHeight = 160;
const commandGapPx = 6;

export const composerBar =
  'relative shrink-0 px-5 pb-4 tablet:px-8 tablet:pb-5 laptop:px-10';
export const composerFrame =
  'relative min-h-12 justify-center gap-2 rounded-16 border border-border-subtlest-tertiary bg-surface-float px-3 py-2 transition-colors focus-within:border-border-subtlest-secondary';
// Shared so the field, the agents home and the loading skeleton cannot drift.
export const composerColumn = 'relative mx-auto w-full max-w-[45rem]';
// Padded out to the send button's height: the row bottom-aligns them, which left
// a single line of text sitting below the frame's centre.
const fieldLine = 'min-h-8 py-1.5';

const mentionQuery = (value: string): string | undefined =>
  /(?:^|\s)@([^\s@]*)$/.exec(value)?.[1];

const quickCommands = quickCommandNames.flatMap(
  (name) => findCommand(name) ?? [],
);

const commandItem = ({
  name,
  hint,
  description,
  icon: Icon,
}: AgentCommand): AgentMenuItem => ({
  id: name,
  icon: <Icon size={IconSize.Size16} />,
  name: `/${name}`,
  hint,
  description,
});

const mentionItem = (attachment: AgentAttachment): AgentMenuItem => ({
  id: attachment.id,
  icon: attachmentIcon[attachment.kind],
  name: attachment.label,
  description: attachment.detail,
});

export const AgentComposer = (): ReactElement => {
  const {
    isWorking,
    runCommand,
    messages,
    openContent,
    openContentTarget,
    setSettingsOpen,
    attachments,
    attachContext,
    detachContext,
    composerRef,
    draft,
    clearDraft,
  } = useAgent();
  const isLight = useIsLightTheme();
  // Client-only: it injects its stylesheet as a React `<style>` child and SSR
  // escapes the quotes in its selectors, so every rule silently fails to match.
  const [Beam, setBeam] = useState<ComponentType<BorderBeamProps>>();

  useEffect(() => {
    let isCurrent = true;

    import('border-beam')
      .then(({ BorderBeam }) => {
        if (isCurrent) {
          setBeam(() => BorderBeam);
        }
      })
      // A chunk that 404s after a deploy leaves the frame bare, which is fine.
      .catch(() => undefined);

    return () => {
      isCurrent = false;
    };
  }, []);
  const [feedback, setFeedback] = useState('');
  const [command, setCommand] = useState<AgentCommand>();
  const [commandIndent, setCommandIndent] = useState(0);

  // A ref callback rather than an effect: it runs inside the commit, so the text
  // never paints once under the command label and then jumps.
  const measureCommand = (node: HTMLSpanElement | null) => {
    const next = node ? node.offsetWidth + commandGapPx : 0;

    setCommandIndent((current) => (current === next ? current : next));
  };
  const [activeIndex, setActiveIndex] = useState(0);
  const [dismissed, setDismissed] = useState<string>();
  const resizeFrame = useRef<number>();

  const slash = commandQuery(feedback);
  const mention = mentionQuery(feedback);
  // Prefixed so one Escape dismisses only the list as it stands right now.
  const slashKey = typeof slash === 'string' ? `/${slash}` : undefined;
  const mentionKey = typeof mention === 'string' ? `@${mention}` : undefined;
  const query = slashKey ?? mentionKey;

  const candidates = useMemo(
    () => mentionCandidates({ openContent, messages }),
    [openContent, messages],
  );

  const commandMatches = typeof slash === 'string' ? matchCommands(slash) : [];
  const mentionMatches =
    typeof mention === 'string'
      ? candidates.filter(({ label, detail }) =>
          `${label} ${detail ?? ''}`
            .toLowerCase()
            .includes(mention.toLowerCase()),
        )
      : [];

  const isCommandMenu = typeof slash === 'string';
  const items = isCommandMenu
    ? commandMatches.map(commandItem)
    : mentionMatches.map(mentionItem);
  const isMenuOpen = !!query && query !== dismissed;
  const hasMenuItems = isMenuOpen && !!items.length;
  const activeOptionId =
    hasMenuItems && items[activeIndex]
      ? composerOptionId(items[activeIndex].id)
      : undefined;

  useEffect(() => setActiveIndex(0), [query]);

  const focusInput = () => composerRef.current?.focus();

  useEffect(
    () => () => {
      if (resizeFrame.current) {
        cancelAnimationFrame(resizeFrame.current);
      }
    },
    [],
  );

  const resize = () => {
    const input = composerRef.current;

    if (!input) {
      return;
    }

    input.style.height = 'auto';
    input.style.height = `${Math.min(input.scrollHeight, maxComposerHeight)}px`;
  };

  const write = (value: string) => {
    setFeedback(value);
    setDismissed(undefined);
    focusInput();
    // The field has not re-rendered with the new value yet, so it is measured on
    // the next frame rather than against the old text.
    resizeFrame.current = requestAnimationFrame(resize);
  };

  // Cleared after it is taken, so pressing the same link twice writes it twice
  // instead of the second press being swallowed as unchanged.
  useEffect(() => {
    if (typeof draft !== 'string') {
      return;
    }

    write(draft);
    clearDraft();
    // `write` is redeclared every render; the draft is the only real trigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);

  const pickCommand = (picked: AgentCommand) => {
    setCommand(picked);
    write('');
  };

  const pickMention = (attachment: AgentAttachment) => {
    write(feedback.replace(/@[^\s@]*$/, ''));
    attachContext(attachment);
  };

  const pick = (index: number) => {
    if (isCommandMenu) {
      const picked = commandMatches[index];

      if (picked) {
        pickCommand(picked);
      }

      return;
    }

    const attachment = mentionMatches[index];

    if (attachment) {
      pickMention(attachment);
    }
  };

  const clear = () => {
    setCommand(undefined);
    write('');
  };

  const onSubmit = () => {
    const trimmed = feedback.trim();
    const typed = command ? undefined : parseCommand(trimmed);
    const sending = command ?? typed?.command;
    const args = typed ? typed.args : trimmed;

    if (!sending && !trimmed) {
      return;
    }

    if (sending?.opens) {
      if (sending.opens === 'settings') {
        setSettingsOpen(true);
      } else {
        openContentTarget(
          sending.opens === 'activity'
            ? { type: 'activity' }
            : { type: 'debug' },
        );
      }

      clear();

      return;
    }

    runCommand({
      text: sending?.prompt ? sending.prompt(args) : trimmed,
      label: sending ? sending.label : `Applying “${trimmed}”`,
      attachments,
    });
    clear();
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (isMenuOpen && items.length) {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        const step = event.key === 'ArrowDown' ? 1 : -1;
        setActiveIndex(
          (current) => (current + step + items.length) % items.length,
        );

        return;
      }

      if (event.key === 'Enter' || event.key === 'Tab') {
        event.preventDefault();
        pick(activeIndex);

        return;
      }
    }

    if (isMenuOpen && event.key === 'Escape') {
      // Escape also stops the run and closes the panel, both bound to the
      // window. While the menu is up it belongs to the menu.
      event.stopPropagation();
      setDismissed(query);

      return;
    }

    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      onSubmit();

      return;
    }

    if (event.key === 'Backspace' && !feedback) {
      if (attachments.length) {
        detachContext(attachments[attachments.length - 1].id);
      } else {
        setCommand(undefined);
      }
    }
  };

  const placeholder = (() => {
    if (command) {
      return command.ask ?? 'Press enter to run it…';
    }

    return isWorking
      ? 'Send feedback and it runs next…'
      : 'Ask anything, or / for commands…';
  })();

  return (
    <div className={composerBar}>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-full -mb-px h-12 bg-gradient-to-t from-background-default to-transparent"
      />
      <FlexCol className={classNames(composerColumn, 'gap-2')}>
        {isMenuOpen && (
          <AgentComposerMenu
            label={isCommandMenu ? 'Commands' : 'Add context'}
            items={items}
            activeIndex={activeIndex}
            emptyLabel={
              isCommandMenu
                ? 'No command by that name.'
                : 'Nothing open or found by that name yet.'
            }
            onHover={setActiveIndex}
            onPick={pick}
          />
        )}

        <ConditionalWrapper
          condition={!!Beam}
          wrapper={(children) =>
            Beam ? (
              <Beam
                size="md"
                colorVariant="colorful"
                strength={1}
                theme={isLight ? 'light' : 'dark'}
                active={isWorking}
              >
                {children}
              </Beam>
            ) : (
              <>{children}</>
            )
          }
        >
          <FlexCol className={composerFrame}>
            {!!attachments.length && (
              <FlexRow className="flex-wrap items-center gap-1">
                {attachments.map((attachment) => (
                  <AgentAttachmentChip
                    key={attachment.id}
                    attachment={attachment}
                    onRemove={() => detachContext(attachment.id)}
                  />
                ))}
              </FlexRow>
            )}

            <FlexRow className="items-end gap-1.5">
              <div className="relative min-w-0 flex-1">
                {command && (
                  <Tooltip
                    // Undoes the app-wide `flex-shrink: 0`, without which a
                    // two-line block runs out past the surface's rounding.
                    className="[&>*]:shrink"
                    content={
                      <FlexCol className="gap-0.5">
                        <Typography type={TypographyType.Caption1} bold>
                          /{command.name} {command.hint}
                        </Typography>
                        <Typography
                          type={TypographyType.Caption2}
                          color={TypographyColor.Tertiary}
                        >
                          {command.description}
                          {command.ask && ' The argument is optional.'}
                        </Typography>
                      </FlexCol>
                    }
                  >
                    {/* A plain span, not a classed() component: those remount
                        every render and a Radix trigger cannot hold one. */}
                    <span
                      ref={measureCommand}
                      className="pointer-events-auto absolute left-0 top-1.5 whitespace-nowrap text-brand-default typo-callout"
                    >
                      /{command.name}
                    </span>
                  </Tooltip>
                )}
                <textarea
                  ref={composerRef}
                  id="agent-composer"
                  name="agent-composer"
                  rows={1}
                  aria-label="Tell the agent what to change"
                  role="combobox"
                  aria-expanded={isMenuOpen}
                  aria-autocomplete="list"
                  aria-controls={hasMenuItems ? composerMenuId : undefined}
                  aria-activedescendant={activeOptionId}
                  placeholder={placeholder}
                  value={feedback}
                  className={classNames(
                    'block w-full resize-none bg-transparent text-text-primary outline-none typo-callout placeholder:text-text-quaternary',
                    fieldLine,
                  )}
                  style={{ textIndent: commandIndent }}
                  onChange={(event) => {
                    setFeedback(event.target.value);
                    setDismissed(undefined);
                    resize();
                  }}
                  onKeyDown={onKeyDown}
                />
              </div>
              <AgentSendButton
                label="Send to agent"
                className="shrink-0"
                disabled={!feedback.trim() && !command}
                onClick={onSubmit}
              />
            </FlexRow>
          </FlexCol>
        </ConditionalWrapper>

        <FlexRow className="items-center gap-2 px-0.5">
          {/* `pr-6` matches the fade's width, so the last chip clears the mask
              when the row is scrolled to its end. */}
          <FlexRow className="agent-fade-right no-scrollbar min-w-0 flex-1 items-center gap-1.5 overflow-x-auto pr-6">
            {quickCommands.map((quick) => (
              <Tooltip
                key={quick.name}
                // Undoes the app-wide `flex-shrink: 0`, without which a two-line
                // block runs out past the surface's rounding.
                className="[&>*]:shrink"
                content={
                  <FlexCol className="gap-0.5">
                    <Typography type={TypographyType.Caption1} bold>
                      /{quick.name} {quick.hint}
                    </Typography>
                    <Typography
                      type={TypographyType.Caption2}
                      color={TypographyColor.Tertiary}
                    >
                      {quick.description} Press enter to run it as it is, or
                      keep typing to steer it.
                    </Typography>
                  </FlexCol>
                }
              >
                <Button
                  icon={<quick.icon size={IconSize.Size16} />}
                  size={ButtonSize.XSmall}
                  variant={ButtonVariant.Subtle}
                  className="shrink-0"
                  onClick={() => pickCommand(quick)}
                >
                  {quick.label}
                </Button>
              </Tooltip>
            ))}
          </FlexRow>
        </FlexRow>
      </FlexCol>
    </div>
  );
};
