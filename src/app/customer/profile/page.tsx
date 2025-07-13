
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
import { Edit } from "lucide-react";
import Link from "next/link";
  
// Mock Data
const customer = {
  name: "Sarah",
  email: "sarah@example.com",
  tier: "Gold",
};

export default function ProfilePage() {
  return (
    <div className="flex-1 p-4 md:p-6 max-w-lg mx-auto">
      <Card>
        <CardHeader className="flex flex-row items-start sm:items-center">
            <div className="grid gap-2 flex-1">
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>
                Manage your personal information.
            </CardDescription>
            </div>
            <Button asChild size="sm" className="ml-auto gap-1 shrink-0">
            <Link href="#">
                Edit Profile
                <Edit className="h-4 w-4" />
            </Link>
            </Button>
        </CardHeader>
        <CardContent>
            <div className="grid gap-2 text-sm sm:text-base">
                <div className="flex items-center">
                    <span className="font-semibold w-24">Name:</span>
                    <span>{customer.name}</span>
                </div>
                 <div className="flex items-center">
                    <span className="font-semibold w-24">Email:</span>
                    <span>{customer.email}</span>
                </div>
                <div className="flex items-center">
                    <span className="font-semibold w-24">Tier:</span>
                    <span>{customer.tier}</span>
                </div>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
