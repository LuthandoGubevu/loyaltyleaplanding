
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
  
  export default function ProfilePage() {
    return (
      <div className="flex-1 p-4 md:p-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              This is the customer profile page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Profile content goes here.</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  