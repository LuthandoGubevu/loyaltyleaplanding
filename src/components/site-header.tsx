import Link from 'next/link';
import { Logo } from './logo';
import { MaxWidthWrapper } from './max-width-wrapper';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from 'lucide-react';

export function SiteHeader() {
  const navItems = [
    { label: "How It Works", href: "#how-it-works" },
    { label: "Benefits", href: "#benefits" },
    { label: "Pricing", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <MaxWidthWrapper>
        <div className="flex h-16 items-center justify-between">
          <Logo />
          <nav className="hidden md:flex items-center space-x-2 lg:space-x-4">
            {navItems.map((item) => (
              <Button variant="ghost" asChild key={item.label}>
                <Link href={item.href}>{item.label}</Link>
              </Button>
            ))}
            <Button asChild>
              <Link href="/customer/dashboard">Customer View</Link>
            </Button>
             <Button variant="secondary" asChild>
                <Link href="/admin/login">Admin View</Link>
              </Button>
          </nav>
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader className="text-left">
                  <SheetTitle className="sr-only">Navigation</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col space-y-4 p-4">
                  <Logo />
                  {navItems.map((item) => (
                    <Button variant="ghost" asChild key={item.label} className="justify-start">
                      <Link href={item.href}>{item.label}</Link>
                    </Button>
                  ))}
                  <Button asChild>
                    <Link href="/customer/dashboard">Customer View</Link>
                  </Button>
                  <Button variant="secondary" asChild>
                    <Link href="/admin/login">Admin View</Link>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </MaxWidthWrapper>
    </header>
  );
}
