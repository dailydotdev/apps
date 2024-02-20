import React, { ReactElement, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Button, ButtonVariant } from '../buttons/Button';
import { Drawer, DrawerProps } from './Drawer';

export function StorybookDrawerTrigger({
  children,
  ...props
}: DrawerProps): ReactElement {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <QueryClientProvider client={new QueryClient()}>
      <Button variant={ButtonVariant.Primary} onClick={() => setIsOpen(true)}>
        Trigger
      </Button>
      {isOpen && (
        <Drawer {...props} onClose={() => setIsOpen(false)}>
          {children}
          <Button
            variant={ButtonVariant.Float}
            onClick={() => setIsOpen(false)}
          >
            Close
          </Button>
        </Drawer>
      )}
    </QueryClientProvider>
  );
}
