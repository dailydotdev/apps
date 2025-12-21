import { useState, useEffect, useCallback } from 'react';

export interface CardConfig {
  id: string;
  component: React.ComponentType<{
    data: unknown;
    isActive: boolean;
    subcard?: number;
    isTouchDevice?: boolean;
    isLoading?: boolean;
    onShare?: () => void;
    cardType?: string;
    imageCache?: Map<string, Blob>;
    onImageFetched?: (cardType: string, blob: Blob) => void;
  }>;
  subcards?: number; // Number of subcards (0 or undefined = no subcards)
}

export interface NavigationEvent {
  cardIndex: number;
  cardId: string;
  isCardChange: boolean;
}

/**
 * Hook for managing card navigation with tap support and subcards
 * Subcards allow transitioning through multiple views within a single card
 * @param onNavigate - Optional callback called on any navigation with details about the target
 */
export function useCardNavigation(
  cards: CardConfig[],
  onNavigate?: (event: NavigationEvent) => void,
) {
  const [currentCard, setCurrentCard] = useState(0);
  const [currentSubcard, setCurrentSubcard] = useState(0);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [isAnimating, setIsAnimating] = useState(false);

  const totalCards = cards.length;

  const goNext = useCallback(() => {
    if (isAnimating) {
      return;
    }

    const currentCardConfig = cards[currentCard];
    const maxSubcard = currentCardConfig?.subcards || 0;

    // If there are more subcards, go to next subcard
    if (currentSubcard < maxSubcard) {
      onNavigate?.({
        cardIndex: currentCard,
        cardId: currentCardConfig.id,
        isCardChange: false,
      });
      setIsAnimating(true);
      setDirection('next');
      setCurrentSubcard(currentSubcard + 1);
      setTimeout(() => setIsAnimating(false), 500);
      return;
    }

    // Otherwise, go to next card (reset subcard to 0)
    if (currentCard < totalCards - 1) {
      const nextCardIndex = currentCard + 1;
      onNavigate?.({
        cardIndex: nextCardIndex,
        cardId: cards[nextCardIndex].id,
        isCardChange: true,
      });
      setIsAnimating(true);
      setDirection('next');
      setCurrentCard(nextCardIndex);
      setCurrentSubcard(0);
      setTimeout(() => setIsAnimating(false), 500);
    }
  }, [cards, currentCard, currentSubcard, isAnimating, onNavigate, totalCards]);

  const goPrev = useCallback(() => {
    if (isAnimating) {
      return;
    }

    // If there are previous subcards, go to previous subcard
    if (currentSubcard > 0) {
      onNavigate?.({
        cardIndex: currentCard,
        cardId: cards[currentCard].id,
        isCardChange: false,
      });
      setIsAnimating(true);
      setDirection('prev');
      setCurrentSubcard(currentSubcard - 1);
      setTimeout(() => setIsAnimating(false), 500);
      return;
    }

    // Otherwise, go to previous card (at its last subcard)
    if (currentCard > 0) {
      const prevCardIndex = currentCard - 1;
      onNavigate?.({
        cardIndex: prevCardIndex,
        cardId: cards[prevCardIndex].id,
        isCardChange: true,
      });
      setIsAnimating(true);
      setDirection('prev');
      const prevCardConfig = cards[prevCardIndex];
      const prevCardMaxSubcard = prevCardConfig?.subcards || 0;
      setCurrentCard(prevCardIndex);
      setCurrentSubcard(prevCardMaxSubcard);
      setTimeout(() => setIsAnimating(false), 500);
    }
  }, [cards, currentCard, currentSubcard, isAnimating, onNavigate]);

  const goToCard = useCallback(
    (cardIndex: number) => {
      if (isAnimating || cardIndex === currentCard) {
        return;
      }

      if (cardIndex >= 0 && cardIndex < totalCards) {
        onNavigate?.({
          cardIndex,
          cardId: cards[cardIndex].id,
          isCardChange: true,
        });
        setIsAnimating(true);
        setDirection(cardIndex > currentCard ? 'next' : 'prev');
        setCurrentCard(cardIndex);
        setCurrentSubcard(0);
        setTimeout(() => setIsAnimating(false), 500);
      }
    },
    [cards, currentCard, isAnimating, onNavigate, totalCards],
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        goNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goPrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goNext, goPrev]);

  return {
    currentCard,
    currentSubcard,
    direction,
    isAnimating,
    goNext,
    goPrev,
    goToCard,
  };
}
