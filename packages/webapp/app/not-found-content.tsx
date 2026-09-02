'use client';

import type { ReactElement } from 'react';
import React from 'react';
import Custom404 from '@dailydotdev/shared/src/components/Custom404';

export const NotFoundContent = (): ReactElement => (
  <Custom404 showRecoveryLinks />
);
