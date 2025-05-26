import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { MaxWidthWrapper } from '@/components/max-width-wrapper';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';

export function LiveQrSection() {
  return (
    <section id="demo" className="py-16 md:py-24 bg-background">
      <MaxWidthWrapper>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Experience Loyalty Leap Firsthand
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-xl">
              Scan the QR code with your phone to see a sample customer loyalty experience. No app needed!
            </p>
            <div className="mt-8 space-y-4 md:space-y-0 md:space-x-4 flex flex-col sm:flex-row justify-center md:justify-start">
              <Button size="lg" asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Link href="#qr-scan">Scan to Try</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-foreground">
                <Link href="#pricing">Book Full Demo</Link>
              </Button>
            </div>
             <p className="mt-6 text-sm text-muted-foreground">
              Want a guided tour or have specific questions? Book a personalized demo with our team.
            </p>
          </div>
          <div id="qr-scan" className="flex justify-center items-center">
            <Card className="p-6 md:p-8 shadow-xl rounded-xl bg-secondary/30 w-full max-w-xs text-center">
              <CardContent className="p-0">
                <Image
                  src="https://placehold.co/300x300.png?text=Scan+Me"
                  alt="Sample QR code for Loyalty Leap demo"
                  width={300}
                  height={300}
                  className="rounded-lg mx-auto shadow-md"
                  data-ai-hint="qr code scan"
                />
                <p className="mt-6 font-semibold text-lg text-foreground">
                  Scan This to Try It Now!
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  (Opens a demo loyalty page)
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </MaxWidthWrapper>
    </section>
  );
}
