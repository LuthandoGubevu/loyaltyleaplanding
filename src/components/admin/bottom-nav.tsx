
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, Gift, LineChart, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin/dashboard", icon: Home, label: "Dashboard" },
  { href: "/admin/customers", icon: Users, label: "Customers" },
  { href: "/admin/rewards", icon: Gift, label: "Rewards" },
  { href: "/admin/analytics", icon: LineChart, label: "Analytics" },
  { href: "/admin/settings", icon: Settings, label: "Settings" },
];

export function AdminBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-background border-t border-border/40 shadow-[0_-1px_4px_rgba(0,0,0,0.05)] z-50">
      <div className="grid h-full max-w-lg grid-cols-5 mx-auto">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
            
          return (
            <Link
              href={item.href}
              key={item.href}
              className={cn(
                "flex flex-col items-center justify-center text-muted-foreground hover:text-primary transition-colors",
                isActive && "text-primary bg-primary/10"
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
