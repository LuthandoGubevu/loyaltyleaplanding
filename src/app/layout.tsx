import type {Metadata} from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { InstallPwa } from '@/components/install-pwa';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Loyalty Leap - Turn Shoppers into Loyal Customers',
  description: 'Loyalty Leap helps small businesses drive repeat visits with a white-labeled loyalty platform.',
  manifest: '/manifest.json',
  themeColor: '#E26C5E',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Loyalty Leap',
  },
  icons: {
    apple: '/icons/192x192.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <Toaster />
        <InstallPwa />
      </body>
    </html>
  );
}
