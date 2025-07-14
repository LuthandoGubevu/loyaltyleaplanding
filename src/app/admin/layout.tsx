
import { Suspense } from "react";
import { AdminBottomNav } from "@/components/admin/bottom-nav";
import { AdminHeader } from "@/components/admin/admin-header";
import { Skeleton } from "@/components/ui/skeleton";

function AdminHeaderSkeleton() {
  return (
    <div className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <Skeleton className="h-6 w-32 hidden sm:flex" />
      <Skeleton className="h-9 w-[200px]" />
      <div className="relative ml-auto flex-1 md:grow-0">
        <Skeleton className="h-9 w-full rounded-lg md:w-[200px] lg:w-[336px]" />
      </div>
      <Skeleton className="h-10 w-10 rounded-full" />
    </div>
  )
}


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Suspense fallback={<AdminHeaderSkeleton />}>
        <AdminHeader />
      </Suspense>
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 pb-20 sm:pb-4">
          {children}
      </main>
      <AdminBottomNav />
    </div>
  )
}
