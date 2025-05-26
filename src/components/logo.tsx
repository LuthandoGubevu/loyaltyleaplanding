import Link from 'next/link';
import Image from 'next/image';

export function Logo() {
  return (
    <Link href="/" className="flex items-center text-2xl font-bold text-primary hover:text-primary/90 transition-colors" aria-label="Loyalty Leap Home">
      Loyalty Leap
      <Image
        src="/gift.png"
        alt="Loyalty Leap Gift Icon"
        width={28}
        height={28}
        className="ml-2"
        data-ai-hint="gift icon"
      />
    </Link>
  );
}
