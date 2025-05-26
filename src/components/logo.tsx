import Link from 'next/link';

export function Logo() {
  return (
    <Link href="/" className="text-2xl font-bold text-primary hover:text-primary/90 transition-colors" aria-label="Loyalty Leap Home">
      Loyalty Leap
    </Link>
  );
}
