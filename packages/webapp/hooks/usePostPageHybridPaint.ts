import { useEffect } from 'react';
import { storageWrapper as storage } from '@dailydotdev/shared/src/lib/storageWrapper';

const ARM_STORAGE_KEY = 'post_page_hybrid:arm';
const PENDING_ATTRIBUTE = 'data-post-hybrid-pending';
const REVEAL_AFTER_LOAD_MS = 1000;
const REVEAL_AT_MOST_MS = 6000;

/** Marks the classic layout so the pending state can hide it. */
export const postPageClassicClassName = 'post-page-classic';

/**
 * The page is static, so its HTML is always the classic layout. A reader the
 * experiment put in the hybrid arm on an earlier visit would see it paint and
 * then swap. This runs before the first paint, only on a full page load, and
 * hides the classic layout for them until the page settles the arm. Should
 * the app never get there, it shows a second after the scripts load, or after
 * six seconds at most. Crawlers have no stored arm.
 */
export const postPageHybridPrePaintScript = `(function(){try{if(document.readyState!=='loading'||localStorage.getItem('${ARM_STORAGE_KEY}')!=='1')return;var d=document.documentElement,r=function(){d.removeAttribute('${PENDING_ATTRIBUTE}')};d.setAttribute('${PENDING_ATTRIBUTE}','');addEventListener('load',function(){setTimeout(r,${REVEAL_AFTER_LOAD_MS})});setTimeout(r,${REVEAL_AT_MOST_MS})}catch(e){}})();`;

export const postPageHybridPrePaintStyle = `html[${PENDING_ATTRIBUTE}] .${postPageClassicClassName}{visibility:hidden}`;

interface UsePostPageHybridPaint {
  isEligible: boolean;
  isEvaluated: boolean;
  showHybrid: boolean;
}

export const usePostPageHybridPaint = ({
  isEligible,
  isEvaluated,
  showHybrid,
}: UsePostPageHybridPaint): void => {
  useEffect(() => {
    if (isEvaluated) {
      storage.setItem(ARM_STORAGE_KEY, showHybrid ? '1' : '0');
    }

    if (!isEligible || isEvaluated) {
      document.documentElement.removeAttribute(PENDING_ATTRIBUTE);
    }
  }, [isEligible, isEvaluated, showHybrid]);
};
