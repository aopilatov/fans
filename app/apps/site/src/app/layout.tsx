import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

import Menu from './menu';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Fans app',
  description: 'Subscribe for content makers',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en">
    <body className={inter.className}>
      <div className="flex flex-col w-screen h-screen">
        <div className="grow p-2">{children}</div>

        <div className="flex justify-center pb-2">
          <Menu />
        </div>
      </div>
    </body>
  </html>);
}
