import type { ReactElement, ReactNode, RefObject } from 'react';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import type { Comment } from '../../graphql/comments';
import { SelectionShareBar } from './SelectionShareBar';
import { useTextSelectionShare } from '../../hooks/useTextSelectionShare';

/**
 * What the bar and its logging actually read off a post. Lists that fetch a
 * deliberate subset — highlights, for one — satisfy this without a cast.
 */
export interface SelectionSharePost {
  id: string;
  commentsPermalink: string;
  type?: string;
  title?: string;
  permalink?: string;
  image?: string;
  createdAt?: string;
  readTime?: number;
  numComments?: number;
  numUpvotes?: number;
  tags?: string[];
  trending?: number;
  source?: { id?: string; type?: string };
  author?: { id?: string };
  scout?: { id?: string };
}

export interface SelectionShareTarget {
  post: SelectionSharePost;
  /** Set when the region is a comment or reply rather than post content. */
  comment?: Comment;
  /** False where the surrounding surface renders no comment composer. */
  canQuote?: boolean;
  /** Opens a reply to this comment, seeded with the quote. */
  onQuote?: (markdownQuote: string) => void;
}

type GetTarget = () => SelectionShareTarget;
type Register = (element: HTMLElement, getTarget: GetTarget) => () => void;

const SelectionShareContext = createContext<Register | null>(null);

/**
 * Marks an element as quotable and attributes whatever is selected inside it.
 *
 * Registration is all a region does — no listeners, no queries. A thread with
 * 150 comments therefore costs 150 map entries rather than 150 copies of the
 * selection machinery.
 */
export const useSelectionShareArea = (
  target: SelectionShareTarget,
): RefObject<HTMLDivElement> => {
  const ref = useRef<HTMLDivElement>(null);
  const register = useContext(SelectionShareContext);

  // The target closes over per-render values (`onQuote` most of all). Reading it
  // through a ref keeps registration a mount-time concern instead of
  // re-registering every region on every render.
  const latest = useRef(target);
  latest.current = target;

  useEffect(() => {
    const element = ref.current;

    if (!register || !element) {
      return undefined;
    }

    return register(element, () => latest.current);
  }, [register]);

  return ref;
};

export interface SelectionShareProviderProps {
  children: ReactNode;
}

/**
 * Runs the selection watcher once for a whole page and renders the single share
 * bar it can ever need, attributed to whichever registered region the selection
 * landed in.
 */
export function SelectionShareProvider({
  children,
}: SelectionShareProviderProps): ReactElement {
  const areas = useRef(new Map<HTMLElement, GetTarget>()).current;

  const register = useCallback<Register>(
    (element, getTarget) => {
      areas.set(element, getTarget);

      return () => {
        areas.delete(element);
      };
    },
    [areas],
  );

  const resolveArea = useCallback(
    (node: Node | null): HTMLElement | null => {
      if (!node) {
        return null;
      }

      let owner: HTMLElement | null = null;

      areas.forEach((_, element) => {
        if (!element.contains(node)) {
          return;
        }

        // Regions nest — a comment sits inside the discussion, which sits
        // inside the page. The innermost one owns the selection.
        if (!owner || owner.contains(element)) {
          owner = element;
        }
      });

      return owner;
    },
    [areas],
  );

  const { text, rect, area, clear } = useTextSelectionShare({ resolveArea });
  const target = useMemo(() => area && areas.get(area)?.(), [area, areas]);

  const value = useMemo(() => register, [register]);

  return (
    <SelectionShareContext.Provider value={value}>
      {children}
      {!!text && !!rect && !!target && (
        <SelectionShareBar
          canQuote={target.canQuote}
          clear={clear}
          comment={target.comment}
          onQuote={target.onQuote}
          post={target.post}
          rect={rect}
          text={text}
        />
      )}
    </SelectionShareContext.Provider>
  );
}
