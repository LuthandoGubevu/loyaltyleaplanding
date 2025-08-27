
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

  // Mock data removed
  const pointHistory: any[] = [];
  
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
                  {pointHistory.length > 0 ? (
                    pointHistory.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <div className="font-medium text-muted-foreground">{item.date}</div>
                        </TableCell>
                        <TableCell>{item.action}</TableCell>
                        <TableCell className={`text-right ${item.points.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>{item.points}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                        <TableCell colSpan={3} className="text-center h-24">
                            No activity to show yet.
                        </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
      </div>
    );
  }
