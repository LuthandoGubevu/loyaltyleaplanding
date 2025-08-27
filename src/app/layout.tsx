import type {Metadata, Viewport} from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { InstallPwa } from '@/components/install-pwa';
import { AuthProvider } from '@/hooks/use-auth';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Loyalty Leap - Turn Shoppers into Loyal Customers',
  description: 'Loyalty Leap helps small businesses drive repeat visits with a white-labeled loyalty platform.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Loyalty Leap',
  },
  icons: {
    apple: '/icons/192x192.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#E26C5E',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} antialiased`}>
        <AuthProvider>
          {children}
          <Toaster />
          <InstallPwa />
        </AuthProvider>
      </body>
    </html>
  );
}
