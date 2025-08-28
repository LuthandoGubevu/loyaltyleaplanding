import type {Metadata, Viewport} from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/hooks/use-auth';
import { PwaInstallProvider } from '@/hooks/use-pwa-install';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Loyalty Leap - Turn Shoppers into Loyal Customers',
  description: 'Loyalty Leap helps small businesses drive repeat visits with a white-labeled loyalty platform.',
  manifest: '/manifest.json',
  icons: {
    icon: '/gift.png',
    apple: '/gift.png',
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
          <PwaInstallProvider>
            {children}
            <Toaster />
          </PwaInstallProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
