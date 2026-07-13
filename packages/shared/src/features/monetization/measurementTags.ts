import type { AdMeasurementTag } from '../../graphql/posts';
import type { AdMacroContext } from './adMacros';
import { substituteMacros } from './adMacros';

/**
 * Injects third-party measurement markup (DoubleVerify / CM360 JS) into a
 * container. This is the single execution core shared by the web inline path
 * and the web-origin frame page, so tag handling never drifts between surfaces.
 *
 * `innerHTML` does not execute injected <script> elements, so each script is
 * recreated as a fresh node with its attributes and inline body copied over.
 * All attributes are preserved verbatim, including `attributionsrc` (Privacy
 * Sandbox Attribution Reporting), which must survive as a real attribute.
 */

const injectedFlag = 'data-ddmf-injected';

const cloneExecutableScript = (
  source: HTMLScriptElement,
): HTMLScriptElement => {
  const script = source.ownerDocument.createElement('script');

  Array.from(source.attributes).forEach((attr) => {
    script.setAttribute(attr.name, attr.value);
  });

  if (source.textContent) {
    script.textContent = source.textContent;
  }

  return script;
};

const executeScripts = (container: HTMLElement): void => {
  const scripts = Array.from(container.querySelectorAll('script'));
  scripts.forEach((script) => {
    script.replaceWith(cloneExecutableScript(script as HTMLScriptElement));
  });
};

/**
 * Substitute macros in a single tag's markup and append it to the container,
 * executing any scripts it contains.
 */
const injectTag = (
  container: HTMLElement,
  tag: AdMeasurementTag,
  ctx: AdMacroContext,
): void => {
  if (!tag?.markup) {
    return;
  }

  const wrapper = container.ownerDocument.createElement('div');
  // 0-size, non-interactive: measurement markup must never affect card layout
  // or steal clicks from the native ad card.
  wrapper.style.cssText =
    'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none;';
  wrapper.innerHTML = substituteMacros(tag.markup, ctx);

  container.appendChild(wrapper);
  executeScripts(wrapper);
};

export const injectMeasurementTags = (
  container: HTMLElement,
  tags: AdMeasurementTag[] | undefined,
  ctx: AdMacroContext = {},
): void => {
  if (!container || !tags?.length) {
    return;
  }

  // Guard against double injection (React strict mode double-invoke, re-renders).
  if (container.getAttribute(injectedFlag) === 'true') {
    return;
  }
  container.setAttribute(injectedFlag, 'true');

  tags.forEach((tag) => injectTag(container, tag, ctx));
};

/** Whether any tag requires the frame to cover the creative (viewability). */
export const tagsRequireOverlay = (
  tags: AdMeasurementTag[] | undefined,
): boolean => !!tags?.some((tag) => tag.overlay);
