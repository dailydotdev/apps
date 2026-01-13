import type { ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import type { Opportunity } from '../../opportunity/types';
import { useAgentMessages } from '../hooks/useAgentMessages';

interface AgentStatusBarProps {
  /**
   * Static message to display (overrides rotating messages).
   * Use for IN_REVIEW and processing payment states.
   */
  staticMessage?: string;
  /**
   * Opportunity data for contextual rotating messages.
   */
  opportunity?: Opportunity;
  /**
   * Opportunity ID for seeded randomization.
   */
  opportunityId?: string;
}

/**
 * Animated waveform bars that pulse continuously.
 */
function WaveformIcon(): ReactElement {
  return (
    <div className="flex h-4 items-center gap-0.5">
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="animate-waveform w-0.5 rounded-full bg-brand-default"
          style={{
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes waveform-pulse {
          0%, 100% {
            height: 6px;
            opacity: 0.5;
          }
          50% {
            height: 16px;
            opacity: 1;
          }
        }
        .animate-waveform {
          animation: waveform-pulse 1.2s ease-in-out infinite;
          height: 6px;
        }
        .animate-dots::after {
          content: '...';
          display: inline-block;
          width: 1.2em;
          text-align: left;
          animation: dots 1.5s steps(4) infinite;
        }
        @keyframes dots {
          0% { content: ''; }
          25% { content: '.'; }
          50% { content: '..'; }
          75%, 100% { content: '...'; }
        }
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes slideOut {
          from {
            transform: translateY(0);
            opacity: 1;
          }
          to {
            transform: translateY(-100%);
            opacity: 0;
          }
        }
        .animate-slide-up {
          animation: slideUp 300ms ease-out forwards;
        }
        .animate-slide-out {
          animation: slideOut 300ms ease-out forwards;
        }
      `}</style>
    </div>
  );
}

/**
 * Agent status bar with waveform icon.
 * Shows the agent is actively working with contextual rotating messages.
 */
export function AgentStatusBar({
  staticMessage,
  opportunity,
  opportunityId = '',
}: AgentStatusBarProps): ReactElement {
  const { currentMessage } = useAgentMessages({
    opportunity,
    opportunityId,
    enabled: !staticMessage,
  });

  const displayMessage = staticMessage || currentMessage;

  // Track messages for slide animation - key changes trigger CSS animation
  const [messageKey, setMessageKey] = useState(0);
  const [prevMessage, setPrevMessage] = useState<string | null>(null);
  const messageRef = useRef(displayMessage);

  useEffect(() => {
    if (displayMessage !== messageRef.current) {
      setPrevMessage(messageRef.current);
      messageRef.current = displayMessage;
      setMessageKey((k) => k + 1);

      // Clean up previous message after animation completes
      const timeout = setTimeout(() => {
        setPrevMessage(null);
      }, 300);

      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [displayMessage]);

  // Strip trailing dots from message for animated dots effect
  const stripDots = (text: string) => text.replace(/\.{1,3}$/, '');

  return (
    <div className="flex items-center justify-center gap-2.5 border-b border-border-subtlest-tertiary bg-brand-float px-4 py-2.5">
      <WaveformIcon />
      <div className="relative h-5 overflow-hidden">
        {/* Previous message sliding out */}
        {prevMessage && (
          <Typography
            key={`prev-${messageKey - 1}`}
            type={TypographyType.Footnote}
            color={TypographyColor.Secondary}
            className="animate-dots animate-slide-out absolute inset-0 whitespace-nowrap"
          >
            {stripDots(prevMessage)}
          </Typography>
        )}
        {/* Current message sliding in */}
        <Typography
          key={`curr-${messageKey}`}
          type={TypographyType.Footnote}
          color={TypographyColor.Secondary}
          className={`animate-dots whitespace-nowrap ${
            prevMessage ? 'animate-slide-up' : ''
          }`}
        >
          {stripDots(displayMessage)}
        </Typography>
      </div>
    </div>
  );
}
