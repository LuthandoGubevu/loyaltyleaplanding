import { MaxWidthWrapper } from './max-width-wrapper';
import { Logo } from './logo';
import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="border-t border-border/40 py-8 bg-secondary/50">
      <MaxWidthWrapper>
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <div className="flex flex-col items-center md:items-start">
            <Logo />
            <p className="text-sm text-muted-foreground mt-2 max-w-xs">
              Turn one-time shoppers into loyal customers with our seamless loyalty platform.
            </p>
          </div>
          <div className="flex flex-col items-center md:items-end space-y-2">
            <div className="flex space-x-4">
              <Link href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</Link>
              <Link href="#benefits" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Benefits</Link>
              <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
              <Link href="#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">FAQ</Link>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Loyalty Leap. All rights reserved.
            </p>
          </div>
        </div>
      </MaxWidthWrapper>
    </footer>
  );
}
