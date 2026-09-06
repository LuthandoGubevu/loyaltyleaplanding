
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Store } from "lucide-react";

export default function ShopsPage() {
  return (
    <div className="flex-1 p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Explore Shops</CardTitle>
          <CardDescription>
            Discover all the great places where you can earn and redeem points.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg">
            <Store className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold">No Shops Yet</h3>
            <p className="text-muted-foreground">
              Shops will appear here once they join the loyalty program.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
