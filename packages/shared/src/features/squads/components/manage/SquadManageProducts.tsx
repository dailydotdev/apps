import type { ReactElement } from 'react';
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import { ArrowIcon, EditIcon, PlusIcon } from '../../../../components/icons';
import Link from '../../../../components/utilities/Link';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../../components/typography/Typography';
import { squadProductPricingLabel } from '../../../../graphql/squadProducts';
import { useSquadPageContext } from '../../SquadPageContext';
import { useSquadProducts } from '../../hooks/useSquadProducts';
import { useSquadProductMutations } from '../../hooks/useSquadProductMutations';
import { SQUAD_PRODUCTS_MAX } from '../../lib/limits';
import {
  getSquadManageUrl,
  getSquadProductFormUrl,
  SquadManageSection,
} from '../../lib/routes';
import { SquadProductLogo } from '../products/SquadProductLogo';
import { SquadProductForm } from '../products/SquadProductForm';
import {
  SquadManagePanel,
  SquadManageSaveButton,
  SquadManageSectionPanel,
} from './SquadManageLayout';

const moveItem = (ids: string[], from: number, to: number): string[] => {
  const next = [...ids];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);

  return next;
};

export const SquadManageProducts = (): ReactElement => {
  const { squad } = useSquadPageContext();
  const { products, isPending } = useSquadProducts(squad);
  const { onReorder } = useSquadProductMutations(squad);
  const ids = products.map(({ id }) => id);
  const canAdd = products.length < SQUAD_PRODUCTS_MAX;
  const addUrl = getSquadProductFormUrl(squad.handle);

  return (
    <SquadManageSectionPanel
      section={SquadManageSection.Products}
      action={
        canAdd && (
          <Link href={addUrl} passHref>
            <Button
              tag="a"
              variant={ButtonVariant.Subtle}
              size={ButtonSize.Small}
              icon={<PlusIcon />}
            >
              Add
            </Button>
          </Link>
        )
      }
    >
      <div className="flex flex-col gap-4 px-4 py-6 tablet:px-6">
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          {`Up to ${SQUAD_PRODUCTS_MAX} products, shown on the page in this order.`}
        </Typography>
        {!isPending && !products.length && (
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Secondary}
          >
            No products yet. Add the first one to show it on the page.
          </Typography>
        )}
        <ul className="flex flex-col gap-4">
          {products.map((product, index) => {
            const editUrl = getSquadProductFormUrl(squad.handle, product.id);
            const meta = [
              product.category,
              product.pricingModel &&
                squadProductPricingLabel[product.pricingModel],
            ].filter(Boolean);

            return (
              <li key={product.id} className="flex items-center gap-3">
                <SquadProductLogo product={product} className="size-10" />
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <Typography type={TypographyType.Subhead} bold truncate>
                    {product.title}
                  </Typography>
                  {!!product.tagline && (
                    <Typography
                      type={TypographyType.Footnote}
                      color={TypographyColor.Secondary}
                      truncate
                    >
                      {product.tagline}
                    </Typography>
                  )}
                  {!!meta.length && (
                    <Typography
                      type={TypographyType.Footnote}
                      color={TypographyColor.Tertiary}
                    >
                      {meta.join(' · ')}
                    </Typography>
                  )}
                </div>
                <Button
                  type="button"
                  variant={ButtonVariant.Tertiary}
                  size={ButtonSize.XSmall}
                  icon={<ArrowIcon />}
                  aria-label={`Move ${product.title} up`}
                  disabled={index === 0}
                  onClick={() => onReorder(moveItem(ids, index, index - 1))}
                />
                <Button
                  type="button"
                  variant={ButtonVariant.Tertiary}
                  size={ButtonSize.XSmall}
                  icon={<ArrowIcon className="rotate-180" />}
                  aria-label={`Move ${product.title} down`}
                  disabled={index === products.length - 1}
                  onClick={() => onReorder(moveItem(ids, index, index + 1))}
                />
                <Link href={editUrl} passHref>
                  <Button
                    tag="a"
                    variant={ButtonVariant.Tertiary}
                    size={ButtonSize.XSmall}
                    icon={<EditIcon />}
                    aria-label={`Edit ${product.title}`}
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </SquadManageSectionPanel>
  );
};

const productFormId = 'squad-product-form';

export const SquadManageProductForm = ({
  productId,
}: {
  /** Undefined adds a product. */
  productId?: string;
}): ReactElement | null => {
  const router = useRouter();
  const { squad } = useSquadPageContext();
  const { products, isPending } = useSquadProducts(squad);
  const [isSaving, setIsSaving] = useState(false);
  const product = productId
    ? products.find(({ id }) => id === productId)
    : undefined;
  const listUrl = getSquadManageUrl(squad.handle, SquadManageSection.Products);

  if (productId && !product) {
    return isPending ? null : (
      <SquadManagePanel
        title="Product not found"
        backUrl={listUrl}
        backLabel="Back to Products"
        hasLaptopBack
      >
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Secondary}
          className="px-4 py-6 tablet:px-6"
        >
          This product is no longer listed on the Squad.
        </Typography>
      </SquadManagePanel>
    );
  }

  return (
    <SquadManagePanel
      title={product ? 'Edit product' : 'Add product'}
      backUrl={listUrl}
      backLabel="Back to Products"
      hasLaptopBack
      action={
        <SquadManageSaveButton formId={productFormId} isLoading={isSaving} />
      }
    >
      <SquadProductForm
        key={product?.id ?? 'new'}
        squad={squad}
        formId={productFormId}
        product={product}
        onDone={() => router.push(listUrl)}
        onSavingChange={setIsSaving}
      />
    </SquadManagePanel>
  );
};
