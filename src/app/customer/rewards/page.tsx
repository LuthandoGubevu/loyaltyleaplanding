
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

// Mock Data
const customer = {
  name: "Sarah",
  totalPoints: 1250,
  tier: "Gold",
};

const availableRewards = [
  {
    name: "Free Coffee or Pastry",
    points: 100,
    description: "Enjoy a complimentary coffee or pastry on your next visit.",
  },
  {
    name: "R50 Off Your Purchase",
    points: 500,
    description: "Get R50 off when you spend R200 or more.",
  },
  {
    name: "25% Off Haircut",
    points: 1000,
    description: "A special treat from Modern Cuts salon.",
  },
  {
    name: "Exclusive Tote Bag",
    points: 2000,
    description: "A limited edition branded tote bag.",
  },
];

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
          {availableRewards.map((reward) => (
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
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
