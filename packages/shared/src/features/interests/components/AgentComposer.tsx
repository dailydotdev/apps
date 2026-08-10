import type { ComponentType, ReactElement } from 'react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
// Type-only, so it is erased at compile time and pulls none of the module's 74KB
// into this chunk — which is the whole point of fetching the component below.
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
import { AgentUsageMeter } from './AgentUsageMeter';
import { AgentAttachmentChip, attachmentIcon } from './AgentAttachmentChip';
import type { AgentMenuItem } from './AgentComposerMenu';
import {
  AgentComposerMenu,
  composerMenuId,
  composerOptionId,
} from './AgentComposerMenu';
import { AgentSendButton } from './AgentSendButton';

const maxComposerHeight = 160;

/**
 * The bar the field sits in, and the field's own frame.
 *
 * Shared with the start field on the agents home: the two screens are one
 * shell with a different top half, so the thing you type into cannot move or
 * change shape between them.
 */
export const composerBar =
  'relative shrink-0 px-5 pb-4 tablet:px-8 tablet:pb-5 laptop:px-10';
export const composerFrame =
  'relative min-h-12 justify-center gap-2 rounded-16 border border-border-subtlest-tertiary bg-surface-float px-3 py-2 transition-colors focus-within:border-border-subtlest-secondary';
/**
 * The column the bar's contents sit in. Shared so the field, the agents home and
 * the loading skeleton cannot drift: the skeleton had the frame without this and
 * spanned the whole window while the real one stopped at the transcript's width.
 */
export const composerColumn = 'relative mx-auto w-full max-w-[45rem]';
/**
 * The first line of the field, and anything that has to sit on it.
 *
 * The send button is taller than a line of text, and the row bottom-aligns them
 * so a prompt six lines long does not leave it hovering in the middle of the
 * text. That left a single line sitting 6px below the frame's centre, so the
 * line box is padded out to the button's height instead of the text being
 * dragged down to meet it.
 */
const fieldLine = 'min-h-8 py-1.5';

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
    draft,
    clearDraft,
  } = useAgent();
  const isLight = useIsLightTheme();
  // Fetched rather than imported, for two reasons that were one hack before.
  //
  // It injects its stylesheet as a React `<style>` child, and SSR escapes the
  // quotes in its selectors — `<style>` holds raw text, so those entities never
  // decode and every rule silently fails to match. It can only mount on the
  // client. And it is 74KB of generated gradients for one border on one screen,
  // in `shared`, which the extension also bundles: as an import it rides along
  // in builds that can never render it.
  //
  // So the chunk arrives only where the composer does. The frame renders bare
  // until it lands, which is the same thing the mount gate used to do, without
  // an unexplained flash between mount and module.
  const [Beam, setBeam] = useState<ComponentType<BorderBeamProps>>();

  useEffect(() => {
    let isCurrent = true;

    import('border-beam')
      .then(({ BorderBeam }) => {
        if (isCurrent) {
          setBeam(() => BorderBeam);
        }
      })
      // A chunk that 404s after a deploy is a decoration that never arrives,
      // not an error worth taking the field down with. The frame renders bare.
      .catch(() => undefined);

    return () => {
      isCurrent = false;
    };
  }, []);
  const [feedback, setFeedback] = useState('');
  // The command becomes a token in the field rather than staying as text, so
  // what is left in the field is only ever the argument to it.
  const [command, setCommand] = useState<AgentCommand>();
  // How far the first line has to start in to clear the command sitting over
  // it. Measured in a ref callback rather than an effect: that runs inside the
  // commit, so the text never paints once under the label and then jump.
  const [commandIndent, setCommandIndent] = useState(0);

  const measureCommand = (node: HTMLSpanElement | null) => {
    // A space between the command and the argument, as if it were typed.
    const next = node ? node.offsetWidth + 6 : 0;

    setCommandIndent((current) => (current === next ? current : next));
  };
  const [activeIndex, setActiveIndex] = useState(0);
  // The query that Escape was pressed on. Reopening on the next keystroke is
  // right; reopening on a re-render of the same text is not.
  const [dismissed, setDismissed] = useState<string>();
  const resizeFrame = useRef<number>();

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
  const hasMenuItems = isMenuOpen && !!items.length;
  const activeOptionId =
    hasMenuItems && items[activeIndex]
      ? composerOptionId(items[activeIndex].id)
      : undefined;

  useEffect(() => setActiveIndex(0), [query]);

  const focusInput = () => composerRef.current?.focus();

  // The measuring frame is dropped on unmount: it reaches for the field, and a
  // composer that has left takes the field with it.
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
    // The field has not been re-rendered with the new value yet, so it is
    // measured on the next frame rather than against the old text.
    resizeFrame.current = requestAnimationFrame(resize);
  };

  // Text written from elsewhere on the screen — the "tell it why" under a
  // vote, so far. Taken and cleared, so pressing the same link twice writes
  // it twice instead of the second press being swallowed as unchanged.
  useEffect(() => {
    if (typeof draft !== 'string') {
      return;
    }

    write(draft);
    clearDraft();
    // `write` is redeclared every render; the draft is the only real trigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);

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
    <div className={composerBar}>
      {/* Softens the hard cut where the transcript disappears behind the bar,
          so the last line fades out instead of being sliced. */}
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

        {/* The upstream component rather than a port of it: it carries the
            colour ramps, the hue-shift, the fade in and out and the radius
            auto-detection, and `active` drives all of that off the run. */}
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

            {/* The send sits at the foot of the field rather than in the
                middle of it, so a prompt that runs to six lines does not leave
                it hovering in the text. */}
            <FlexRow className="items-end gap-1.5">
              <div className="relative min-w-0 flex-1">
                {command && (
                  <Tooltip
                    // Undoes the app-wide `flex-shrink: 0` for this tooltip's
                    // own child: a two-line block wider than the surface
                    // otherwise refuses to shrink and the text runs out past
                    // the rounding.
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
                      every render and a Radix trigger cannot hold one.

                      Sits over the first line of the field with the text
                      indented past it, so the command reads as the first word
                      of the prompt and everything after it wraps full width.
                      No close button: Backspace on an empty field takes it
                      back, which is where the hand already is. */}
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
                  // The field is the combobox and the menu is its popup: the
                  // list never takes focus, so the row the arrow keys are on is
                  // only reachable by pointing at it from here.
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
                  className="shrink-0"
                  aria-label="Stop the agent"
                  onClick={stopCommand}
                />
              ) : (
                <AgentSendButton
                  label="Send to agent"
                  className="shrink-0"
                  disabled={!feedback.trim() && !command}
                  onClick={onSubmit}
                />
              )}
            </FlexRow>
          </FlexCol>
        </ConditionalWrapper>

        <FlexRow className="items-center gap-2 px-0.5">
          {/* `pr-6` is the fade's own width: it gives the row an inch of
              trailing space so the last chip lands clear of the mask at the
              end of the scroll instead of sitting half-dimmed under it. */}
          <FlexRow className="agent-fade-right no-scrollbar min-w-0 flex-1 items-center gap-1.5 overflow-x-auto pr-6">
            {quickCommands.map((quick) => (
              <Tooltip
                key={quick.name}
                // Undoes the app-wide `flex-shrink: 0` for this tooltip's own
                // child: a two-line block wider than the surface otherwise
                // refuses to shrink and the text runs out past the rounding.
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
          <AgentUsageMeter />
        </FlexRow>
      </FlexCol>
    </div>
  );
};
