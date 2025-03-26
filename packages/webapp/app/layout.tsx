import Providers from './providers';
import { Provider as JotaiProvider } from 'jotai/react';

export default function RootLayout({ children }) {
  return (
    <JotaiProvider>
      <html lang="en">
        <body>
          <Providers>{children}</Providers>
        </body>
      </html>
    </JotaiProvider>
  );
}
