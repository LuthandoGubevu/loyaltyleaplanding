
import { Suspense } from "react";
import { DashboardContent } from "../../../components/admin/dashboard/content";
import { DashboardSkeleton } from "../../../components/admin/dashboard/skeleton";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-4">
        <div className="w-full">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full rounded-lg bg-background pl-8"
            />
          </div>
        </div>
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}
