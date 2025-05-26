import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { MaxWidthWrapper } from '@/components/max-width-wrapper';
import Link from 'next/link';

export function HeroSection() {
  return (
    <section id="hero" className="relative py-20 md:py-32 bg-gradient-to-br from-[hsl(var(--hero-peach-hsl))] to-[hsl(var(--hero-teal-hsl))] text-white">
      <MaxWidthWrapper className="relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold !text-white drop-shadow-md">
              Turn One-Time Shoppers into Loyal Customers
            </h1>
            <p className="mt-6 text-lg md:text-xl !text-white/90 drop-shadow-sm max-w-xl mx-auto md:mx-0">
              Loyalty Leap empowers small businesses like yours to effortlessly build customer loyalty, drive repeat visits, and boost revenue with a simple, effective, and fully branded rewards program.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Button size="lg" asChild className="bg-white text-primary hover:bg-white/90 shadow-lg px-8 py-3">
                <Link href="#demo">Book a Demo</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-white text-white hover:bg-white/10 shadow-lg px-8 py-3">
                <Link href="#how-it-works">Learn More</Link>
              </Button>
            </div>
          </div>
          <div className="flex justify-center items-center">
            <Image
              src="https://placehold.co/500x450.png"
              alt="Shopper scanning QR code for loyalty points"
              width={500}
              height={450}
              className="rounded-xl shadow-2xl object-cover"
              data-ai-hint="shopper qr-code mobile phone"
              priority
            />
          </div>
        </div>
      </MaxWidthWrapper>
    </section>
  );
}
