type PopListener = (tagNames: string[]) => void;
type RecommendListener = (tags: string[]) => void;

const popListeners = new Set<PopListener>();
const recommendListeners = new Set<RecommendListener>();

export function subscribePersonaSelection(listener: PopListener): () => void {
  popListeners.add(listener);
  return () => {
    popListeners.delete(listener);
  };
}

export function broadcastPersonaSelection(tagNames: string[]): void {
  popListeners.forEach((listener) => listener(tagNames));
}

export function subscribeRecommendRequest(
  listener: RecommendListener,
): () => void {
  recommendListeners.add(listener);
  return () => {
    recommendListeners.delete(listener);
  };
}

export function broadcastRecommendRequest(tags: string[]): void {
  recommendListeners.forEach((listener) => listener(tags));
}
