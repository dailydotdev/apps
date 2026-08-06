import type { ReactElement } from 'react';
import React, { useEffect, useMemo, useState } from 'react';
import { BorderBeam } from 'border-beam';
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
import { MiniCloseIcon, SendAirplaneIcon } from '../../../components/icons';
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
import { AgentUsageMeter } from './AgentUsageMeter';
import { AgentAttachmentChip, attachmentIcon } from './AgentAttachmentChip';
import type { AgentMenuItem } from './AgentComposerMenu';
import { AgentComposerMenu } from './AgentComposerMenu';

const maxComposerHeight = 160;

/** The `@thing` being typed at the caret, if there is one. */
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
    stopCommand,
    messages,
    openContent,
    openContentTarget,
    setSettingsOpen,
    attachments,
    attachContext,
    detachContext,
    composerRef,
  } = useAgent();
  const isLight = useIsLightTheme();
  // The beam injects its stylesheet as a React `<style>` child, and SSR
  // escapes the quotes in its selectors. `<style>` holds raw text, so those
  // entities are never decoded and every rule silently fails to match — so it
  // is only ever mounted on the client, where React sets the text directly.
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => setIsMounted(true), []);
  const [feedback, setFeedback] = useState('');
  // The command becomes a token in the field rather than staying as text, so
  // what is left in the field is only ever the argument to it.
  const [command, setCommand] = useState<AgentCommand>();
  const [activeIndex, setActiveIndex] = useState(0);
  // The query that Escape was pressed on. Reopening on the next keystroke is
  // right; reopening on a re-render of the same text is not.
  const [dismissed, setDismissed] = useState<string>();

  const slash = commandQuery(feedback);
  const mention = mentionQuery(feedback);
  // Identifies the menu *and* what it is filtered by, so one Escape only ever
  // dismisses the list as it stands right now.
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

  useEffect(() => setActiveIndex(0), [query]);

  const focusInput = () => composerRef.current?.focus();

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
    // The field has not been re-rendered with the new value yet, so it is
    // measured on the next frame rather than against the old text.
    requestAnimationFrame(resize);
  };

  // Picking a command arms it instead of firing it, so one that takes an
  // argument can still be given one. Enter sends.
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
    // A command typed out in full and sent without ever opening the menu still
    // has to resolve, so the field is parsed when no token is armed.
    const typed = command ? undefined : parseCommand(trimmed);
    const sending = command ?? typed?.command;
    const args = typed ? typed.args : trimmed;

    if (!sending && !trimmed) {
      return;
    }

    // Local commands spend no run: they open a part of the workspace, the way
    // `/config` does rather than the way a prompt does.
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
      // Escape is the workspace's brake on the run and the panel's close, both
      // bound to the window. While the menu is up it belongs to the menu.
      event.stopPropagation();
      setDismissed(query);

      return;
    }

    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      onSubmit();

      return;
    }

    // Backspacing out of an empty field takes the nearest token with it, the
    // last one added first.
    if (event.key === 'Backspace' && !feedback) {
      if (attachments.length) {
        detachContext(attachments[attachments.length - 1].id);
      } else {
        setCommand(undefined);
      }
    }
  };

  // The field says what will happen to what is typed into it, which is a
  // different thing in each of the four states it can be in.
  const placeholder = (() => {
    if (command) {
      return command.ask ?? 'Press enter to run it…';
    }

    // A run in flight does not block the field, it queues behind it.
    return isWorking
      ? 'Send feedback and it runs next…'
      : 'Ask anything, or / for commands…';
  })();

  return (
    <div className="relative shrink-0 px-5 pb-4 tablet:px-8 tablet:pb-5 laptop:px-10">
      {/* Softens the hard cut where the transcript disappears behind the bar,
          so the last line fades out instead of being sliced. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-full h-12 bg-gradient-to-t from-background-default to-transparent"
      />
      <FlexCol className="relative mx-auto w-full max-w-[45rem] gap-2">
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

        {/* The upstream component rather than a port of it: it carries the
            colour ramps, the hue-shift, the fade in and out and the radius
            auto-detection, and `active` drives all of that off the run. */}
        <ConditionalWrapper
          condition={isMounted}
          wrapper={(children) => (
            <BorderBeam
              size="md"
              colorVariant="colorful"
              strength={1}
              theme={isLight ? 'light' : 'dark'}
              active={isWorking}
            >
              {children}
            </BorderBeam>
          )}
        >
          <FlexCol className="relative min-h-12 justify-center gap-2 rounded-16 border border-border-subtlest-tertiary bg-surface-float px-3 py-2 transition-colors focus-within:border-border-subtlest-secondary">
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

            {/* On the same line as the text it governs, not on a row of its
                own: the field grew by a whole line for a token narrower than
                the word next to it. */}
            <FlexRow className="items-center gap-1.5">
              {command && (
                <Tooltip
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
                  <span className="flex items-center gap-1 rounded-8 bg-brand-float py-0.5 pl-1.5 pr-0.5">
                    <span className="text-brand-default">
                      <command.icon size={IconSize.Size16} />
                    </span>
                    <Typography
                      type={TypographyType.Caption1}
                      color={TypographyColor.Brand}
                      bold
                    >
                      /{command.name}
                    </Typography>
                    <button
                      type="button"
                      aria-label={`Remove the ${command.name} command`}
                      onClick={() => {
                        setCommand(undefined);
                        focusInput();
                      }}
                      className="flex size-4 shrink-0 items-center justify-center rounded-6 text-brand-default transition-colors hover:bg-surface-hover"
                    >
                      <MiniCloseIcon size={IconSize.Size16} />
                    </button>
                  </span>
                </Tooltip>
              )}
              <textarea
                ref={composerRef}
                id="agent-composer"
                name="agent-composer"
                rows={1}
                aria-label="Tell the agent what to change"
                placeholder={placeholder}
                value={feedback}
                className="min-w-0 flex-1 resize-none self-center bg-transparent text-text-primary outline-none typo-callout placeholder:text-text-quaternary"
                onChange={(event) => {
                  setFeedback(event.target.value);
                  setDismissed(undefined);
                  resize();
                }}
                onKeyDown={onKeyDown}
              />
              {isWorking ? (
                <Button
                  // No stop glyph in the icon set, and a drawn square is the
                  // universal one — so it is rendered rather than imported.
                  icon={
                    <span
                      aria-hidden
                      className="size-2.5 rounded-2 bg-text-primary"
                    />
                  }
                  size={ButtonSize.Small}
                  variant={ButtonVariant.Tertiary}
                  className="self-center"
                  aria-label="Stop the agent"
                  onClick={stopCommand}
                />
              ) : (
                <Button
                  icon={
                    // The airplane's mass sits left of its bounding box, so
                    // centring the box leaves it reading low and left.
                    <SendAirplaneIcon
                      size={IconSize.XSmall}
                      className="translate-x-px"
                    />
                  }
                  size={ButtonSize.Small}
                  variant={ButtonVariant.Tertiary}
                  className="self-center"
                  aria-label="Send to agent"
                  disabled={!feedback.trim() && !command}
                  onClick={onSubmit}
                />
              )}
            </FlexRow>
          </FlexCol>
        </ConditionalWrapper>

        <FlexRow className="items-center gap-2 px-0.5">
          <FlexRow className="no-scrollbar min-w-0 flex-1 items-center gap-1.5 overflow-x-auto">
            {quickCommands.map((quick) => (
              <Tooltip
                key={quick.name}
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
          <AgentUsageMeter />
        </FlexRow>
      </FlexCol>
    </div>
  );
};
