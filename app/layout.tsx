import './globals.css';
import { Inter } from 'next/font/google';
import { Providers } from '@/app/providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Grow Easy',
  description: 'AI-Powered Review Management for Your Business',
};

export default async function RootLayout({
  children,
}: { 
  children: React.ReactNode 
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
