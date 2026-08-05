import type { ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import { BorderBeam } from 'border-beam';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import ConditionalWrapper from '../../../components/ConditionalWrapper';
import { FlexCol, FlexRow } from '../../../components/utilities';
import {
  AiIcon,
  FeatherIcon,
  MagicIcon,
  SendAirplaneIcon,
} from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { useIsLightTheme } from '../../../hooks/utils/useThemedAsset';
import { useAgent } from '../AgentContext';
import { AgentUsageMeter } from './AgentUsageMeter';

const quickActions = [
  { label: 'Explore more', icon: <MagicIcon />, command: 'Explore more' },
  {
    label: 'Write a post',
    icon: <FeatherIcon />,
    command: 'Write me a post summarising what you found',
  },
  {
    label: 'Raise the bar',
    icon: <AiIcon />,
    command: 'Raise the bar — only surface top-tier content from now on',
  },
];

const maxComposerHeight = 160;

export const AgentComposer = (): ReactElement => {
  const { isWorking, runCommand, stopCommand } = useAgent();
  const isLight = useIsLightTheme();
  // The beam injects its stylesheet as a React `<style>` child, and SSR
  // escapes the quotes in its selectors. `<style>` holds raw text, so those
  // entities are never decoded and every rule silently fails to match — so it
  // is only ever mounted on the client, where React sets the text directly.
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => setIsMounted(true), []);
  const [feedback, setFeedback] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const resize = () => {
    const input = inputRef.current;

    if (!input) {
      return;
    }

    input.style.height = 'auto';
    input.style.height = `${Math.min(input.scrollHeight, maxComposerHeight)}px`;
  };

  const onSubmit = () => {
    const trimmed = feedback.trim();

    if (!trimmed) {
      return;
    }

    runCommand({ text: trimmed, label: `Applying “${trimmed}”` });
    setFeedback('');

    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
  };

  return (
    <div className="relative shrink-0 px-5 pb-4 tablet:px-8 tablet:pb-5 laptop:px-10">
      {/* Softens the hard cut where the transcript disappears behind the bar,
          so the last line fades out instead of being sliced. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-full h-12 bg-gradient-to-t from-background-default to-transparent"
      />
      <FlexCol className="mx-auto w-full max-w-[45rem] gap-2">
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
          <FlexRow className="relative min-h-12 items-center gap-2 rounded-16 border border-border-subtlest-tertiary bg-surface-float px-3 py-2 transition-colors focus-within:border-border-subtlest-secondary">
            <textarea
              ref={inputRef}
              id="agent-composer"
              name="agent-composer"
              rows={1}
              aria-label="Tell the agent what to change"
              placeholder="Tell the agent what to change…"
              value={feedback}
              className="min-w-0 flex-1 resize-none self-center bg-transparent text-text-primary outline-none typo-callout placeholder:text-text-quaternary"
              onChange={(event) => {
                setFeedback(event.target.value);
                resize();
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  onSubmit();
                }
              }}
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
                variant={ButtonVariant.Float}
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
                variant={ButtonVariant.Float}
                className="self-center"
                aria-label="Send to agent"
                disabled={!feedback.trim()}
                onClick={onSubmit}
              />
            )}
          </FlexRow>
        </ConditionalWrapper>

        <FlexRow className="items-center gap-2 px-0.5">
          <FlexRow className="no-scrollbar min-w-0 flex-1 items-center gap-1.5 overflow-x-auto">
            {quickActions.map(({ label, icon, command }) => (
              <Button
                key={label}
                icon={React.cloneElement(icon, { size: IconSize.Size16 })}
                size={ButtonSize.XSmall}
                variant={ButtonVariant.Subtle}
                className="shrink-0"
                onClick={() => runCommand({ text: command, label })}
              >
                {label}
              </Button>
            ))}
          </FlexRow>
          <AgentUsageMeter />
        </FlexRow>
      </FlexCol>
    </div>
  );
};
