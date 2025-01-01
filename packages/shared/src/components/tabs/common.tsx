import type { ReactNode } from 'react';

export type RenderTab = ({
  label,
  isActive,
}: {
  label: string;
  isActive: boolean;
}) => ReactNode | null;
