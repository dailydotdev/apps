import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ModalProps } from '../common/Modal';
import { Modal } from '../common/Modal';
import Logo from '../../Logo';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';
import { TextField } from '../../fields/TextField';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { MinusIcon } from '../../icons/Minus';
import { PlusIcon } from '../../icons/Plus';
import { useAuthContext } from '../../../contexts/AuthContext';
import {
  maxRecruiterSeats,
  addOpportunitySeatsSchema,
} from '../../../lib/schema/opportunity';
import { ModalClose } from '../common/ModalClose';
import { recruiterPricesQueryOptions } from '../../../features/opportunity/queries';
import { Divider } from '../../utilities';
import { Loader } from '../../Loader';
import { formatCurrency } from '../../../lib/utils';
import { addOpportunitySeatsMutationOptions } from '../../../features/opportunity/mutations';
import type {
  ApiErrorResult,
  ApiResponseError,
  ApiZodErrorExtension,
} from '../../../graphql/common';
import { ApiError } from '../../../graphql/common';
import { labels } from '../../../lib/labels';
import { useToastNotification } from '../../../hooks/useToastNotification';

export interface RecruiterIntroModalProps extends ModalProps {
  opportunityId: string;
  onNext: () => void;
}

export const RecruiterSeatsModal = ({
  opportunityId,
  onNext,
  onRequestClose,
  ...modalProps
}: RecruiterIntroModalProps): ReactElement => {
  const { user, isLoggedIn } = useAuthContext();
  const { displayToast } = useToastNotification();

  const { data: prices, promise } = useQuery({
    experimental_prefetchInRender: true,
    ...recruiterPricesQueryOptions({
      user,
      isLoggedIn,
    }),
  });

  const { mutateAsync: addSeats, isPending } = useMutation({
    ...addOpportunitySeatsMutationOptions(),
    onError: async (error: ApiErrorResult) => {
      let errorMessage =
        error.response?.errors?.[0]?.message || labels.error.generic;

      if (
        error.response?.errors?.[0]?.extensions?.code ===
        ApiError.ZodValidationError
      ) {
        const apiError = error.response
          .errors[0] as ApiResponseError<ApiZodErrorExtension>;

        errorMessage = apiError.extensions.issues[0].message;
      }

      displayToast(errorMessage);
    },
  });

  const { control, setValue, handleSubmit } = useForm({
    resolver: zodResolver(addOpportunitySeatsSchema),
    defaultValues: async () => {
      const pricesData = await promise;
      const defaultPricePlan = pricesData?.[0];

      return {
        seats: defaultPricePlan
          ? [
              {
                priceId: defaultPricePlan.priceId,
                quantity: 1,
              },
            ]
          : [],
      };
    },
  });

  const onSubmit = handleSubmit(async (value) => {
    await addSeats({
      id: opportunityId,
      payload: value,
    });

    onRequestClose(null);

    onNext();
  });

  const seats = useWatch({ control, name: 'seats' });
  const selectedSeatsCount =
    seats?.reduce((acc, seat) => acc + seat.quantity, 0) || 0;

  const pricePlan = prices?.[0];

  return (
    <Modal
      {...modalProps}
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.Large}
      onRequestClose={onRequestClose}
    >
      <Modal.Body>
        <div className="flex flex-1 gap-4">
          <section className="flex flex-1 flex-col gap-4">
            <Logo isRecruiter />
            <Typography bold>
              You need more seats to publish this job
            </Typography>
            <div className="flex flex-col gap-2">
              <Typography type={TypographyType.Callout}>
                Number of seats
              </Typography>
              <Controller
                name="seats"
                control={control}
                disabled={!pricePlan}
                render={({ field }) => {
                  return (
                    <div className={classNames('flex flex-col gap-4')}>
                      <div className="flex gap-1">
                        <TextField
                          label={null}
                          inputId="team-size"
                          value={selectedSeatsCount}
                          type="number"
                          className={{
                            container: 'min-w-0 flex-1 tablet:max-w-60',
                          }}
                          max={maxRecruiterSeats}
                          focused
                          disabled={!pricePlan}
                          onChange={(event) => {
                            setValue('seats', [
                              {
                                priceId: pricePlan.priceId,
                                quantity: Math.min(
                                  +event.target.value,
                                  maxRecruiterSeats,
                                ),
                              },
                            ]);
                          }}
                        />
                        <Button
                          size={ButtonSize.Large}
                          variant={ButtonVariant.Secondary}
                          icon={<MinusIcon />}
                          disabled={selectedSeatsCount < 1 || !pricePlan}
                          onClick={() => {
                            const existingSeat = field.value.find(
                              (seat) => seat.priceId === pricePlan.priceId,
                            );

                            if (existingSeat?.quantity > 1) {
                              setValue('seats', [
                                {
                                  priceId: pricePlan.priceId,
                                  quantity: existingSeat.quantity - 1,
                                },
                              ]);
                            } else {
                              setValue('seats', []);
                            }
                          }}
                        />
                        <Button
                          size={ButtonSize.Large}
                          variant={ButtonVariant.Secondary}
                          icon={<PlusIcon />}
                          disabled={
                            selectedSeatsCount >= maxRecruiterSeats ||
                            !pricePlan
                          }
                          onClick={() => {
                            const existingSeat = field.value.find(
                              (seat) => seat.priceId === pricePlan.priceId,
                            );

                            setValue('seats', [
                              {
                                priceId: pricePlan.priceId,
                                quantity: existingSeat
                                  ? existingSeat.quantity + 1
                                  : 1,
                              },
                            ]);
                          }}
                        />
                      </div>
                    </div>
                  );
                }}
              />
            </div>
            <Typography bold type={TypographyType.Body}>
              Billing cycle
            </Typography>

            {!!pricePlan && (
              <div className="flex h-14 items-center gap-1 rounded-10 border border-border-subtlest-tertiary px-3">
                <Typography bold type={TypographyType.Callout}>
                  {pricePlan.metadata.title}
                </Typography>

                <div className="ml-auto flex flex-col gap-0.5 text-right">
                  <Typography type={TypographyType.Body}>
                    <span className="font-bold">
                      {pricePlan.price.monthly.formatted}
                    </span>{' '}
                    <span className="text-text-secondary">
                      {pricePlan.currency.code}
                    </span>
                  </Typography>

                  <Typography
                    type={TypographyType.Footnote}
                    color={TypographyColor.Tertiary}
                  >
                    per role/month
                  </Typography>
                </div>
              </div>
            )}
          </section>
          <aside className="relative -my-6 -mr-6 flex flex-1 flex-col gap-4 rounded-12 border-x border-border-subtlest-tertiary p-4">
            <ModalClose
              className="fixed right-2 top-2"
              onClick={onRequestClose}
            />
            <Typography bold type={TypographyType.Body}>
              Summary
            </Typography>
            {!!pricePlan && (
              <div className="flex w-full flex-1 flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <Typography type={TypographyType.Callout}>
                    daily.dev Recruiter {pricePlan.metadata.title}
                  </Typography>
                  <Typography type={TypographyType.Caption1}>
                    {selectedSeatsCount} role{selectedSeatsCount > 1 ? 's' : ''}
                  </Typography>
                </div>
                <Divider className="bg-border-subtlest-tertiary" />
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-1">
                    <Typography bold type={TypographyType.Callout}>
                      Total
                    </Typography>
                    <Typography bold type={TypographyType.Body}>
                      {formatCurrency(
                        pricePlan.price.monthly.amount * selectedSeatsCount,
                        {
                          style: 'currency',
                          currency: pricePlan.currency.code,
                        },
                      )}
                      {` ${pricePlan.currency.code}`}
                    </Typography>
                  </div>
                  <Divider className="bg-border-subtlest-tertiary" />
                  <Typography type={TypographyType.Caption1}>
                    Charged immidiatelly. Added to your monthly recruiter
                    subscription price.
                  </Typography>
                </div>
                <Button
                  className="mt-auto w-full"
                  variant={ButtonVariant.Primary}
                  onClick={onSubmit}
                  disabled={selectedSeatsCount < 1}
                  size={ButtonSize.Medium}
                  loading={isPending}
                >
                  Pay now
                </Button>
              </div>
            )}
            {!pricePlan && <Loader />}
          </aside>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default RecruiterSeatsModal;
