import type { ReactElement } from 'react';
import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../../components/typography/Typography';
import type { LazyModalCommonProps } from '../../../../components/modals/common/Modal';
import { Modal } from '../../../../components/modals/common/Modal';
import { ModalSize } from '../../../../components/modals/common/types';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { useLogContext } from '../../../../contexts/LogContext';
import { useToastNotification } from '../../../../hooks/useToastNotification';
import { useViewSize, ViewSize } from '../../../../hooks/useViewSize';
import type { Origin } from '../../../../lib/log';
import { LogEvent } from '../../../../lib/log';
import type { LfgHelper } from '../../types';
import {
  LFG_HELPER_DEFAULT_PER_MONTH,
  LFG_HELPER_MAX_TAGS,
  LFG_HELPER_PER_MONTH_OPTIONS,
  LFG_UTC_OFFSETS,
} from '../../constants';
import { deleteLfgHelper, setLfgHelper } from '../../graphql';
import {
  lfgHelperQueryKey,
  lfgHelperQueryOptions,
  lfgHelperSuggestedTagsQueryOptions,
} from '../../queries';
import { getLocalUtcOffset } from '../../lib/format';
import { LfgTagPicker } from '../LfgTagPicker';
import { LfgReputationFilter, LfgTimeZoneFilter } from '../board/LfgFilters';
import { LfgMessagesOffNotice } from '../LfgMessagesOffNotice';

export type LfgHelperModalProps = LazyModalCommonProps & {
  origin: Origin;
  // The board's filters, from its Help tab.
  prefill?: Partial<LfgHelper>;
};

const modalTitle = 'Open to helping';

const SectionLabel = ({ children }: { children: string }): ReactElement => (
  <Typography
    type={TypographyType.Footnote}
    color={TypographyColor.Tertiary}
    bold
  >
    {children}
  </Typography>
);

const HelperForm = ({
  isOpen,
  current,
  suggestedTags,
  prefill,
  origin,
  onClose,
}: {
  isOpen: boolean;
  current: LfgHelper | null;
  suggestedTags: string[];
  prefill?: Partial<LfgHelper>;
  origin: Origin;
  onClose: () => void;
}): ReactElement => {
  const isMobile = useViewSize(ViewSize.MobileL);
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const { logEvent } = useLogContext();
  const { displayToast } = useToastNotification();
  const initial = { ...current, ...prefill };
  const [tags, setTags] = useState<string[]>(
    (initial.tags ?? suggestedTags).slice(0, LFG_HELPER_MAX_TAGS),
  );
  const [timezones, setTimezones] = useState(initial.timezones ?? []);
  const [minReputation, setMinReputation] = useState(
    initial.minReputation ?? 0,
  );
  const [perMonth, setPerMonth] = useState(
    initial.perMonth ?? LFG_HELPER_DEFAULT_PER_MONTH,
  );
  const localOffset = getLocalUtcOffset();
  const zones = [
    localOffset,
    ...LFG_UTC_OFFSETS.filter((offset) => offset !== localOffset),
  ];
  const isOn = !!current;

  const { mutate: save, isPending: isSaving } = useMutation({
    mutationFn: () =>
      setLfgHelper({
        // A zone outside the API's list can't be saved, and means a reader
        // whose clock sits between offsets.
        tags,
        perMonth,
        timezones: timezones.filter((zone) => LFG_UTC_OFFSETS.includes(zone)),
        minReputation,
      }),
    onSuccess: (helper) => {
      queryClient.setQueryData(lfgHelperQueryKey(user), helper);
      logEvent({
        event_name: LogEvent.SaveLfgHelper,
        extra: JSON.stringify({
          origin,
          is_new: !isOn,
          tags: helper.tags.length,
          per_month: helper.perMonth,
          timezones: helper.timezones.length,
          min_reputation: helper.minReputation,
        }),
      });
      displayToast(
        isOn
          ? 'Saved. You get a heads-up when a request matches.'
          : "You're open to helping. You'll get a heads-up when a request matches.",
      );
      onClose();
    },
    onError: () => displayToast("Couldn't save that. Please try again."),
  });

  const { mutate: turnOff, isPending: isTurningOff } = useMutation({
    mutationFn: deleteLfgHelper,
    onSuccess: () => {
      queryClient.setQueryData(lfgHelperQueryKey(user), null);
      logEvent({
        event_name: LogEvent.RemoveLfgHelper,
        extra: JSON.stringify({ origin }),
      });
      displayToast("You won't get help requests anymore.");
      onClose();
    },
    onError: () => displayToast("Couldn't turn it off. Please try again."),
  });

  const isPending = isSaving || isTurningOff;
  let topicsHint =
    "Picked from what you read most. Remove any you'd rather not hear about.";

  if (prefill?.tags) {
    topicsHint =
      "From your filters on the board. Remove any you'd rather not hear about.";
  } else if (current) {
    topicsHint = 'You hear about Help posts on these topics.';
  } else if (!suggestedTags.length) {
    topicsHint = 'Pick the topics you know well.';
  }

  const saveLabel = isOn ? 'Save' : 'Turn on';

  return (
    <Modal
      isOpen={isOpen}
      isDrawerOnMobile
      size={ModalSize.Small}
      onRequestClose={onClose}
      // A phone's sheet pins the save button under the thumb.
      formProps={{
        form: '',
        title: modalTitle,
        copy: { right: saveLabel },
        rightButtonProps: {
          type: 'button',
          disabled: !tags.length || isPending,
          loading: isSaving,
          onClick: () => save(),
        },
      }}
    >
      <Modal.Header title={modalTitle} />
      <Modal.Body className="flex flex-col gap-5">
        <LfgMessagesOffNotice>
          You answer help requests in chat, so heads-ups wait until direct
          messages are on.
        </LfgMessagesOffNotice>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Secondary}
        >
          You&apos;ll get a heads-up when someone asks for help with something
          you know. It&apos;s unpaid, and you always pick who to answer. Only
          you can see this.
        </Typography>

        <div className="flex flex-col gap-2">
          <SectionLabel>Topics</SectionLabel>
          <LfgTagPicker
            value={tags}
            onChange={setTags}
            max={LFG_HELPER_MAX_TAGS}
            suggestions={suggestedTags}
            origin={origin}
            selectedVariant={ButtonVariant.Float}
          />
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            {topicsHint}
          </Typography>
        </div>

        <div className="flex flex-col gap-2">
          <SectionLabel>Who you hear from</SectionLabel>
          <div className="flex flex-wrap gap-2">
            <LfgTimeZoneFilter
              zones={zones}
              localOffset={localOffset}
              value={timezones}
              onChange={setTimezones}
              placeholder="Any time zone"
            />
            <LfgReputationFilter
              value={minReputation}
              onChange={setMinReputation}
              placeholder="Any reputation"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <SectionLabel>How often</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {LFG_HELPER_PER_MONTH_OPTIONS.map((value) => (
              <Button
                key={value}
                type="button"
                variant={
                  perMonth === value
                    ? ButtonVariant.Primary
                    : ButtonVariant.Float
                }
                size={ButtonSize.Small}
                aria-pressed={perMonth === value}
                onClick={() => setPerMonth(value)}
              >
                {value === 1 ? 'Once a month' : `Up to ${value} a month`}
              </Button>
            ))}
          </div>
        </div>
        {isMobile && isOn && (
          <Button
            type="button"
            className="self-start"
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            disabled={isPending}
            loading={isTurningOff}
            onClick={() => turnOff()}
          >
            Turn off
          </Button>
        )}
      </Modal.Body>
      <Modal.Footer>
        {isOn ? (
          <Button
            type="button"
            variant={ButtonVariant.Tertiary}
            disabled={isPending}
            loading={isTurningOff}
            onClick={() => turnOff()}
          >
            Turn off
          </Button>
        ) : (
          <Button
            type="button"
            variant={ButtonVariant.Tertiary}
            disabled={isPending}
            onClick={onClose}
          >
            Cancel
          </Button>
        )}
        <Button
          type="button"
          variant={ButtonVariant.Primary}
          disabled={!tags.length || isPending}
          loading={isSaving}
          onClick={() => save()}
        >
          {saveLabel}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export const LfgHelperModal = ({
  isOpen,
  onRequestClose,
  origin,
  prefill,
}: LfgHelperModalProps): ReactElement => {
  const { user } = useAuthContext();
  const { data: current, isPending } = useQuery(lfgHelperQueryOptions(user));
  const { data: suggestedTags, isPending: isSuggestedPending } = useQuery(
    lfgHelperSuggestedTagsQueryOptions(user),
  );
  const isReady = !isPending && !isSuggestedPending;

  if (isReady) {
    return (
      <HelperForm
        isOpen={isOpen}
        current={current ?? null}
        suggestedTags={suggestedTags ?? []}
        prefill={prefill}
        origin={origin}
        onClose={() => onRequestClose()}
      />
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      isDrawerOnMobile
      size={ModalSize.Small}
      onRequestClose={onRequestClose}
    >
      <Modal.Header title={modalTitle} />
      <Modal.Body className="flex flex-col gap-3">
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className="h-12 animate-pulse rounded-12 bg-surface-float"
          />
        ))}
      </Modal.Body>
    </Modal>
  );
};

export default LfgHelperModal;
