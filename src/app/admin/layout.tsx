
"use client";

import * as React from "react";
import { AdminRoute } from "@/hooks/use-auth";
import Link from "next/link";
import {
  Home,
  LineChart,
  Package2,
  Settings,
  Users,
  Gift,
  PanelLeft,
  LogOut,
  ScanLine,
} from "lucide-react";
import { getAuth, signOut } from "firebase/auth";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
  SheetTitle
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AdminHeader } from "@/components/admin/admin-header";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

function AdminLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const auth = getAuth();
    await signOut(auth);
    router.push('/login');
  };

  const navItems = [
    { href: "/admin/dashboard", icon: Home, label: "Dashboard" },
    { href: "/admin/till", icon: ScanLine, label: "Till" },
    { href: "/admin/customers", icon: Users, label: "Customers" },
    { href: "/admin/rewards", icon: Gift, label: "Rewards" },
    { href: "/admin/analytics", icon: LineChart, label: "Analytics" },
    { href: "/admin/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <TooltipProvider>
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
          <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
            <Link
              href="/admin/dashboard"
              className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
            >
              <Package2 className="h-4 w-4 transition-all group-hover:scale-110" />
              <span className="sr-only">Loyalty Leap</span>
            </Link>
            {navItems.map((item) => (
              <Tooltip key={item.label}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8",
                      pathname.startsWith(item.href) &&
                        "bg-accent text-accent-foreground"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="sr-only">{item.label}</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            ))}
          </nav>
          <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  size="icon"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="sr-only">Logout</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Logout</TooltipContent>
            </Tooltip>
          </nav>
        </aside>
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
            <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button size="icon" variant="outline" className="sm:hidden">
                        <PanelLeft className="h-5 w-5" />
                        <span className="sr-only">Toggle Menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="sm:max-w-xs">
                        <SheetHeader>
                            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                        </SheetHeader>
                        <nav className="grid gap-6 text-lg font-medium">
                            <Link
                                href="#"
                                className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
                            >
                                <Package2 className="h-5 w-5 transition-all group-hover:scale-110" />
                                <span className="sr-only">Loyalty Leap</span>
                            </Link>
                            {navItems.map((item) => (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                                >
                                    <item.icon className="h-5 w-5" />
                                    {item.label}
                                </Link>
                            ))}
                              <Button
                                onClick={handleLogout}
                                variant="ghost"
                                className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground justify-start"
                              >
                                <LogOut className="h-5 w-5" />
                                Logout
                              </Button>
                        </nav>
                    </SheetContent>
                </Sheet>
                <React.Suspense>
                    <AdminHeader />
                </React.Suspense>
            </header>
            <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 pb-20 sm:pb-4">
                {children}
            </main>
        </div>
      </div>
    </TooltipProvider>
  );
}


export default function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminRoute>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AdminRoute>
  )
}
