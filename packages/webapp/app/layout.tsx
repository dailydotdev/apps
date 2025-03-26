import Providers from './providers';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <>{children}</>
        </Providers>
      </body>
    </html>
  );
}
