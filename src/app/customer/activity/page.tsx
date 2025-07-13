
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table";

  const pointHistory = [
    { date: "2024-05-20", action: "Purchase at The Cozy Cafe", points: "+50" },
    { date: "2024-05-18", action: "Redeemed: Free Coffee", points: "-100" },
    { date: "2024-05-15", action: "Birthday Bonus", points: "+200" },
    { date: "2024-05-10", action: "Purchase at Modern Cuts", points: "+150" },
    { date: "2024-05-05", action: "Purchase at Bloom & Grow", points: "+75" },
    { date: "2024-05-01", action: "Welcome Bonus", points: "+100" },
  ];
  
  export default function ActivityPage() {
    return (
      <div className="flex-1 p-4 md:p-6">
        <Card>
            <CardHeader className="px-7">
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                A log of your recent points activity.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead className="text-right">Points</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pointHistory.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="font-medium text-muted-foreground">{item.date}</div>
                      </TableCell>
                       <TableCell>{item.action}</TableCell>
                      <TableCell className={`text-right ${item.points.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>{item.points}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
      </div>
    );
  }
  