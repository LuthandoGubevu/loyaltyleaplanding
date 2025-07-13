
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
  
  export default function ActivityPage() {
    return (
      <div className="flex-1 p-4 md:p-6">
        <Card>
          <CardHeader>
            <CardTitle>Activity</CardTitle>
            <CardDescription>
              This is where the user's activity log will be displayed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Activity feed content goes here.</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  