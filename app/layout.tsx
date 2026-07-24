import './globals.css';
import { ReactNode } from 'react';

export const metadata = {
  title: 'My Private Gallery',
  description: 'A password-protected image gallery',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
