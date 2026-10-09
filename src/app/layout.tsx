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
  description: 'Loyalty Leap helps local businesses drive repeat visits with digital stamp cards that work for every customer: scan a QR code at the till or give a cellphone number.',
  manifest: '/manifest.json',
  // Tab and home-screen icons come from src/app/favicon.ico, icon.png and
  // apple-icon.png (the Loyalty Leap gift logo).
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
