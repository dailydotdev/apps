/**
 * Loading an author's object-set module in node.
 *
 * A cache-busting query is the whole trick: node's module cache is keyed on the
 * resolved URL, so without one the second `check` of a process re-runs the first
 * version of the file and reports on source that no longer exists.
 */

import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

let revision = 0;

export async function loadModule(file, suppliedSource) {
  const source = suppliedSource ?? (await readFile(file, 'utf8'));
  revision += 1;
  const url = `${pathToFileURL(file).href}?v=${revision}`;
  try {
    const mod = await import(url);
    return { source, module: mod, error: null };
  } catch (error) {
    /* A syntax error here is the author's, not ours, and the stack is the only
       thing that says which line. Passed through rather than summarised. */
    return { source, module: null, error };
  }
}
