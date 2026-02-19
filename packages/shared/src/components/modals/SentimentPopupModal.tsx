import type { ReactElement } from 'react';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import classNames from 'classnames';
import type { ModalProps } from './common/Modal';
import { Modal } from './common/Modal';
import { ModalSize } from './common/types';
import { submitFeedSentiment } from '../../graphql/feedSentiment';
import type { FeedSentiment } from '../../graphql/feedSentiment';
import { useToastNotification } from '../../hooks/useToastNotification';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent, TargetType } from '../../lib/log';

const emojis = [
  { emoji: '😊', sentiment: 'good' as const, label: 'Happy' },
  { emoji: '😐', sentiment: 'neutral' as const, label: 'Neutral' },
  { emoji: '😞', sentiment: 'bad' as const, label: 'Unhappy' },
];

// Fisher-Yates shuffle
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const SentimentPopupModal = ({
  onRequestClose,
  ...props
}: ModalProps): ReactElement => {
  const { displayToast } = useToastNotification();
  const { logEvent } = useLogContext();
  const [selectedSentiment, setSelectedSentiment] =
    useState<FeedSentiment | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const shuffledEmojis = useMemo(() => shuffleArray(emojis), []);

  useEffect(() => {
    logEvent({
      event_name: LogEvent.OpenFeedSentiment,
      target_type: TargetType.FeedSentiment,
    });
  }, [logEvent]);

  const { mutate: submitMutation, isPending } = useMutation({
    mutationFn: (sentiment: FeedSentiment) => submitFeedSentiment(sentiment),
    onSuccess: () => {
      setShowSuccess(true);
      setTimeout(() => {
        onRequestClose?.(null);
      }, 1500);
    },
    onError: () => {
      displayToast('Failed to submit feedback. Please try again.');
      setIsSelecting(false);
    },
  });

  const handleEmojiClick = useCallback(
    (sentiment: FeedSentiment) => {
      if (isPending || isSelecting) return;

      setSelectedSentiment(sentiment);
      setIsSelecting(true);

      logEvent({
        event_name: LogEvent.SubmitFeedSentiment,
        target_type: TargetType.FeedSentiment,
        extra: JSON.stringify({ sentiment }),
      });

      submitMutation(sentiment);
    },
    [isPending, isSelecting, logEvent, submitMutation],
  );

  return (
    <Modal
      {...props}
      onRequestClose={onRequestClose}
      size={ModalSize.Small}
      shouldCloseOnOverlayClick={!isPending}
      className={{
        overlay:
          'bg-overlay-quaternary-onion backdrop-blur-[8px] animate-fade-in',
        modal: classNames(
          'relative overflow-hidden',
          'border-2 border-border-subtlest-tertiary',
          'shadow-2 animate-slide-up',
          'before:absolute before:-top-0.5 before:left-1/2 before:-translate-x-1/2',
          'before:w-3/5 before:h-0.5',
          'before:bg-gradient-to-r before:from-transparent before:via-accent-avocado-default before:via-40% before:via-accent-cheese-default before:via-60% before:to-transparent',
          'before:opacity-60 before:blur-[1px]',
        ),
      }}
    >
      <div className="relative px-14 py-12">
        {/* Question */}
        <h2
          className={classNames(
            'mb-9 text-center font-bold typo-title2',
            'bg-gradient-to-br from-text-primary to-text-secondary',
            'bg-clip-text text-transparent',
            'animate-fade-slide-in',
          )}
        >
          How happy with the feed are you?
        </h2>

        {/* Emoji options */}
        <div
          className={classNames(
            'flex items-center justify-center gap-5',
            isSelecting && 'selecting',
          )}
          role="radiogroup"
          aria-label="Feed sentiment options"
        >
          {shuffledEmojis.map((item, index) => (
            <button
              key={item.sentiment}
              type="button"
              role="radio"
              aria-label={item.label}
              aria-checked={selectedSentiment === item.sentiment}
              disabled={isPending || isSelecting}
              onClick={() => handleEmojiClick(item.sentiment)}
              className={classNames(
                'relative flex h-24 w-24 items-center justify-center',
                'rounded-full border-2 border-border-subtlest-tertiary',
                'bg-surface-float text-5xl',
                'transition-all duration-150',
                'hover:scale-110 hover:-rotate-3 hover:border-border-subtlest-secondary',
                'active:scale-95 active:rotate-0',
                'disabled:pointer-events-none',
                'animate-pop-in',
                index === 0 && 'animation-delay-300',
                index === 1 && 'animation-delay-380',
                index === 2 && 'animation-delay-460',
                'before:absolute before:-inset-1 before:rounded-full before:opacity-0',
                'before:transition-opacity before:duration-300',
                'hover:before:opacity-30',
                item.sentiment === 'good' &&
                  'before:bg-[radial-gradient(circle,var(--theme-accent-avocado-default)_0%,transparent_70%)]',
                item.sentiment === 'neutral' &&
                  'before:bg-[radial-gradient(circle,var(--theme-accent-cheese-default)_0%,transparent_70%)]',
                item.sentiment === 'bad' &&
                  'before:bg-[radial-gradient(circle,var(--theme-accent-bacon-default)_0%,transparent_70%)]',
                // Selection state
                selectedSentiment === item.sentiment &&
                  isSelecting &&
                  'animate-emoji-select before:!opacity-80 before:animate-glow-pulse',
                // Hide non-selected when selecting
                isSelecting &&
                  selectedSentiment !== item.sentiment &&
                  'animate-emoji-disappear',
              )}
            >
              <span className="relative z-10">{item.emoji}</span>
            </button>
          ))}
        </div>

        {/* Success message */}
        {showSuccess && (
          <div
            className={classNames(
              'absolute inset-0 flex flex-col items-center justify-center',
              'animate-fade-in',
            )}
          >
            <div className="mb-4 text-6xl animate-success-bounce">✨</div>
            <div className="font-bold text-accent-avocado-default typo-title3 animate-success-fade">
              Thanks for your feedback!
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default SentimentPopupModal;
