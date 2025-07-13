
"use client"

import { useSearchParams } from "next/navigation"
import {
  Activity,
  Users,
  CreditCard,
  DollarSign,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts"
import { getLoyaltyData } from "@/lib/mock-data"

const customerGrowthData = [
  { month: "Jan", new: 40, total: 240 },
  { month: "Feb", new: 30, total: 270 },
  { month: "Mar", new: 20, total: 290 },
  { month: "Apr", new: 27, total: 317 },
  { month: "May", new: 18, total: 335 },
  { month: "Jun", new: 23, total: 358 },
  { month: "Jul", new: 34, total: 392 },
];

const pointsData = [
    { name: 'Jan', issued: 4000, redeemed: 2400 },
    { name: 'Feb', issued: 3000, redeemed: 1398 },
    { name: 'Mar', issued: 5000, redeemed: 6800 },
    { name: 'Apr', issued: 2780, redeemed: 3908 },
    { name: 'May', issued: 1890, redeemed: 4800 },
    { name: 'Jun', issued: 2390, redeemed: 3800 },
    { name: 'Jul', issued: 3490, redeemed: 4300 },
];

const recentActivityAllStores = [
    { name: "Olivia Martin", email: "olivia.martin@email.com", action: "Redeemed: Free Coffee", store: "The Cozy Cafe", change: "-50 pts" },
    { name: "Jackson Lee", email: "jackson.lee@email.com", action: "Earned Points", store: "Modern Cuts Salon", change: "+150 pts" },
    { name: "Isabella Nguyen", email: "isabella.nguyen@email.com", action: "Earned Points", store: "Bloom & Grow Florist", change: "+90 pts" },
    { name: "William Kim", email: "will@email.com", action: "Earned Points", store: "Urban Threads Boutique", change: "+30 pts" },
    { name: "Sofia Davis", email: "sofia.davis@email.com", action: "Earned Points", store: "The Cozy Cafe", change: "+40 pts" },
]


export default function AdminDashboard() {
  const searchParams = useSearchParams()
  const storeId = searchParams.get("storeId") || "all"
  
  const recentActivity = storeId === 'all' 
    ? recentActivityAllStores
    : recentActivityAllStores.filter(activity => getLoyaltyData().stores.find(s => s.name === activity.store)?.id === storeId)


  return (
    <div className="flex flex-1 flex-col gap-4">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Customers
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,250</div>
              <p className="text-xs text-muted-foreground">
                +20.1% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Points Redeemed
              </CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+2,350</div>
              <p className="text-xs text-muted-foreground">
                +180.1% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Points Issued</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12,234</div>
              <p className="text-xs text-muted-foreground">
                +19% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Repeat Visit Rate</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">38%</div>
              <p className="text-xs text-muted-foreground">
                +2% from last month
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
            <div className="xl:col-span-2 grid gap-4">
                 <Card>
                    <CardHeader>
                        <CardTitle>Customer Growth</CardTitle>
                        <CardDescription>New vs. Total Customers</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] w-full">
                         <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={customerGrowthData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis yAxisId="left" />
                            <YAxis yAxisId="right" orientation="right" />
                            <Tooltip />
                            <Legend />
                            <Line yAxisId="left" type="monotone" dataKey="new" name="New Customers" stroke="hsl(var(--primary))" activeDot={{ r: 8 }}/>
                            <Line yAxisId="right" type="monotone" dataKey="total" name="Total Customers" stroke="hsl(var(--accent))" />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                 </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Points Activity</CardTitle>
                        <CardDescription>Points Issued vs. Redeemed</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={pointsData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="issued" name="Points Issued" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="redeemed" name="Points Redeemed" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
            <Card>
                <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                    A log of recent customer actions across {storeId === 'all' ? 'all stores' : getLoyaltyData().stores.find(s=>s.id === storeId)?.name}.
                </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-8">
                {recentActivity.map(activity => (
                    <div key={activity.email + activity.action} className="flex items-center gap-4">
                        <Avatar className="hidden h-9 w-9 sm:flex">
                        <AvatarImage src={`https://placehold.co/40x40.png`} alt="Avatar" data-ai-hint="user avatar" />
                        <AvatarFallback>{activity.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="grid gap-1">
                            <p className="text-sm font-medium leading-none">{activity.name}</p>
                            <p className="text-sm text-muted-foreground">
                                {activity.action} at {activity.store}
                            </p>
                        </div>
                        <div className={`ml-auto font-medium ${activity.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>{activity.change}</div>
                    </div>
                ))}
                </CardContent>
            </Card>
        </div>
    </div>
  )
}
