import type { ReactElement } from 'react';
import type { DetectedUrl } from '../../../../hooks/post/useSmartComposer';
import type { ExternalLinkPreview } from '../../../../graphql/posts';
import type { LiveRoomMode } from '../../../../graphql/liveRooms';

/**
 * The kind a user is composing. New post types are added by dropping a file
 * into `composer/variants/` and registering it in `registry.ts`.
 *
 * Note: `'text'` covers both freeform and shared-link posts. The `'text'`
 * variant decides which submission shape to produce based on whether a URL
 * was detected in the body.
 */
export type ComposerKind = 'text' | 'poll' | 'standup';

export interface StandupConfig {
  topic: string;
  mode: LiveRoomMode;
  /** Required when `mode === LiveRoomMode.FreeForAll`. */
  speakerLimit?: number;
}

export interface ComposerCoverImage {
  url: string;
  file?: File;
}

export interface ComposerState {
  kind: ComposerKind;
  title: string;
  body: string;
  coverImage?: ComposerCoverImage | null;
  preview?: ExternalLinkPreview | null;
  detectedUrl?: DetectedUrl | null;
  pollOptions: string[];
  pollDurationDays?: number;
  standup: StandupConfig;
}

/**
 * Resolved context that the shell hands to a variant at submit time. The shell
 * is responsible for any async preparation (cover upload, etc.) so that
 * `serialize` can stay synchronous and pure.
 */
export interface ComposerSerializeContext {
  /** Cover image URL, already uploaded to storage. */
  coverImageUrl?: string | null;
  /** Single-source audience id (set when posting to one squad). */
  audienceId?: string;
  /** Multi-source audience ids (set when posting to multiple squads). */
  audienceIds?: string[];
}

export type ComposerSubmission =
  | {
      kind: 'text-freeform';
      payload: {
        title: string;
        content: string;
        image?: File;
      };
    }
  | {
      kind: 'text-share-existing';
      payload: {
        sharedPostId: string;
        commentary: string;
        title?: string;
      };
    }
  | {
      kind: 'text-share-external';
      payload: {
        externalLink: string;
        title: string;
        imageUrl?: string;
        commentary: string;
      };
    }
  | {
      kind: 'poll';
      payload: {
        title: string;
        options: string[];
        durationDays?: number;
      };
    }
  | {
      kind: 'standup';
      payload: {
        topic: string;
        mode: LiveRoomMode;
        speakerLimit?: number;
      };
    };

export interface ComposerValidationResult {
  isValid: boolean;
  /** Optional reason surfaced to telemetry/devs; not user-facing copy. */
  reason?: string;
}

/**
 * Lightweight context passed to a variant's `isEnabled` check. Add fields here
 * (feature flags, user role, audience permissions) as variants need them.
 */
export interface ComposerEnabledContext {
  isPlus: boolean;
}

export interface ComposerVariantPicker {
  label: string;
  icon: ReactElement;
  shortcut?: string;
  description?: string;
}

export interface ComposerVariant<K extends ComposerKind = ComposerKind> {
  kind: K;
  picker: ComposerVariantPicker;
  /** Whether this variant should appear in the picker for the current user. */
  isEnabled: (ctx: ComposerEnabledContext) => boolean;
  /** Action-button label, e.g. "Post" or "Go live". */
  submitLabel: (state: ComposerState) => string;
  validate: (state: ComposerState) => ComposerValidationResult;
  /**
   * Returns the submission payload for the active state, or `null` if the
   * state cannot be serialized (e.g. share variant without a resolvable URL).
   * `null` should normally never happen — callers should always run
   * `validate` first.
   */
  serialize: (
    state: ComposerState,
    ctx: ComposerSerializeContext,
  ) => ComposerSubmission | null;
}
