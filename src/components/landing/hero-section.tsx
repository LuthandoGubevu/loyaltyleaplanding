
'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { MaxWidthWrapper } from '@/components/max-width-wrapper';
import Link from 'next/link';
import { InstallPwaButton } from '@/hooks/use-pwa-install';
import { AuthButtons } from '../auth-buttons';

export function HeroSection() {
  return (
    <section id="hero" className="relative py-20 md:py-32 bg-gradient-to-br from-[hsl(var(--hero-peach-hsl))] to-[hsl(var(--hero-teal-hsl))] text-white">
      <MaxWidthWrapper className="relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold !text-white drop-shadow-md">
              Get Rewarded for Shopping Local
            </h1>
            <p className="mt-6 text-lg md:text-xl !text-white/90 drop-shadow-sm max-w-xl mx-auto md:mx-0">
              Collect stamps at your favourite cafés, salons and shops every time you visit. Scan the QR code at the till, or just give your cellphone number. No download, and no smartphone needed.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
               <AuthButtons />
            </div>
            <div className="mt-4 flex justify-center md:justify-start">
                <InstallPwaButton />
            </div>
          </div>
          <div className="flex justify-center items-center">
            <Image
              src="/HeroImage.jpg"
              alt="A smiling shopper collecting a loyalty stamp at a checkout counter."
              width={500}
              height={450}
              className="rounded-xl shadow-2xl object-cover"
              data-ai-hint="loyalty program interface"
              priority
            />
          </div>
        </div>
      </MaxWidthWrapper>
    </section>
  );
}
