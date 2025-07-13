
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Gift, QrCode, Store, History, LayoutGrid, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/customer/dashboard", icon: LayoutGrid, label: "Dashboard" },
  { href: "/customer/rewards", icon: Gift, label: "Rewards" },
  { href: "/customer/scan", icon: QrCode, label: "Scan", isCenter: true },
  { href: "/customer/shops", icon: Store, label: "Shops" },
  { href: "/", icon: LogOut, label: "Logout" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 h-16 bg-background border-t border-border/40 shadow-[0_-1px_4px_rgba(0,0,0,0.05)] z-50">
      <div className="flex justify-around items-center h-full max-w-md mx-auto">
        {navItems.map((item) => {
          // Updated active check to handle dynamic routes like /customer/store/[id]
          const isActive = item.href === '/customer/dashboard'
            ? pathname === item.href || pathname.startsWith('/customer/store')
            : pathname === item.href;
            
          if (item.isCenter) {
            return (
              <Link href={item.href} key={item.href} className="-mt-8">
                <div
                  className={cn(
                    "flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground shadow-lg transform transition-transform hover:scale-105",
                    isActive && "ring-4 ring-primary/30"
                  )}
                >
                  <item.icon className="h-8 w-8" />
                  <span className="sr-only">{item.label}</span>
                </div>
              </Link>
            );
          }
          return (
            <Link
              href={item.href}
              key={item.href}
              className={cn(
                "flex flex-col items-center justify-center text-muted-foreground hover:text-primary transition-colors w-16",
                isActive && "text-primary"
              )}
            >
              <item.icon className="h-6 w-6 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
