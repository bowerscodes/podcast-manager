import type { Metadata } from 'next';
import { Roboto } from 'next/font/google';

import './globals.css';
import Providers from '@/providers/Providers';
import AuthProvider from '@/providers/Providers';
import TopNav from '@/components/ui/navbar/TopNav';

const robotoSans = Roboto({
  weight: ["300", "400", "500", "700"],
  variable: "--font-roboto",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Podcast Manager",
  description:
    "Easily manage and distribute your podcasts to all major outlets",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${robotoSans.variable} antialiased font-sans h-full`}>
        <Providers>
          <AuthProvider>
            <TopNav />
            <main className="relative z-10 min-h-screen">{children}</main>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
