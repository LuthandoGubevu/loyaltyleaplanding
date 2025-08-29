
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
              With Loyalty Leap, earning points at your favorite cafes, boutiques, and shops is simple. No app needed—just scan and save every time you support a local business.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
               <InstallPwaButton />
            </div>
             <div className="mt-4 md:hidden">
                <AuthButtons />
            </div>
          </div>
          <div className="flex justify-center items-center">
            <Image
              src="/HeroImage.jpg"
              alt="A smiling shopper scanning a QR code with their phone at a checkout counter."
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
