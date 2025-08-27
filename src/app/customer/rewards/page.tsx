
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Gift } from "lucide-react";

// Mock Data removed
const customer = {
  name: "New Customer",
  totalPoints: 0,
  tier: "Bronze",
};

const availableRewards: any[] = [];

export default function RewardsPage() {
  return (
    <div className="flex-1 p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Available Rewards</CardTitle>
          <CardDescription>
            Use your points to claim these exclusive rewards.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableRewards.length > 0 ? (
            availableRewards.map((reward) => (
              <Card key={reward.name} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Gift className="h-5 w-5 text-primary" />
                    {reward.name}
                  </CardTitle>
                  <CardDescription>{reward.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <Badge variant="outline">{reward.points} Points</Badge>
                </CardContent>
                <CardFooter>
                  <Button
                    size="sm"
                    disabled={customer.totalPoints < reward.points}
                    className="w-full"
                  >
                    Redeem
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
             <div className="col-span-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg">
                <Gift className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold">No Rewards Available</h3>
                <p className="text-muted-foreground">
                    Check back later or visit a store to see available rewards.
                </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
