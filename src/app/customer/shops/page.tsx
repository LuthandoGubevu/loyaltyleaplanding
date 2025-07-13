
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
  
  export default function ShopsPage() {
    return (
      <div className="flex-1 p-4 md:p-6">
        <Card>
          <CardHeader>
            <CardTitle>Explore Shops</CardTitle>
            <CardDescription>
              This is where users can explore participating shops.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>A map or list of shops will be implemented here.</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  