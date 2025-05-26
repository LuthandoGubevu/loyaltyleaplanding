import Image from 'next/image';
import { PlayCircle } from 'lucide-react';
import { MaxWidthWrapper } from '@/components/max-width-wrapper';

export function VideoSection() {
  return (
    <section id="demo-video" className="py-16 md:py-24 bg-background">
      <MaxWidthWrapper>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            See Loyalty Leap in Action
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Watch our quick demo to understand how easily you can boost customer retention.
          </p>
        </div>
        <div className="relative aspect-video w-full max-w-3xl mx-auto rounded-xl overflow-hidden shadow-2xl group cursor-pointer">
          <Image
            src="https://placehold.co/1280x720.png"
            alt="Demo video placeholder"
            width={1280}
            height={720}
            className="object-cover w-full h-full"
            data-ai-hint="product demo video"
          />
          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
            <PlayCircle className="w-16 h-16 md:w-20 md:h-20 text-white/80 group-hover:text-white transition-transform group-hover:scale-110" />
          </div>
        </div>
        <p className="text-center mt-6 text-muted-foreground">
          See how Loyalty Leap works in 60 seconds.
        </p>
      </MaxWidthWrapper>
    </section>
  );
}
