import { useState } from "react";
import { useAuth } from "../_core/hooks/useAuth";
import { trpc } from "../lib/trpc";
import AdminNav from "./AdminNav";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Button } from "../components/ui/button";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  ShoppingBag, 
  DollarSign,
  Calendar,
  RefreshCw,
  Download,
  Shield,
  Activity
} from "lucide-react";

type TimeRange = "7d" | "30d" | "90d" | "1y" | "all";

interface StatsData {
  totalUsers: number;
  newUsers: number;
  totalListings: number;
  newListings: number;
  totalTransactions: number;
  newTransactions: number;
  totalRevenue: number;
  newRevenue: number;
  userGrowthRate: number;
  listingGrowthRate: number;
  revenueGrowthRate: number;
  avgTransactionValue: number;
  topSellers: Array<{
    id: number;
    name: string;
    revenue: number;
    transactions: number;
  }>;
  revenueByMonth: Array<{
    month: string;
    revenue: number;
    transactions: number;
  }>;
  usersByStatus: Array<{
    status: string;
    count: number;
  }>;
  listingsByCategory: Array<{
    category: string;
    count: number;
  }>;
}

export default function AdminStats() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const [selectedMetric, setSelectedMetric] = useState("revenue");

  // Check if user is admin or super admin
  if (!user || !["admin", "super_admin"].includes(user.role)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Alert className="w-full max-w-md">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Admin access required to view analytics.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Get analytics data
  const { data: stats, isLoading, error, refetch } = trpc.admin.getAnalytics.useQuery({
    timeRange,
  });

  const timeRangeOptions = [
    { value: "7d", label: "Last 7 days" },
    { value: "30d", label: "Last 30 days" },
    { value: "90d", label: "Last 3 months" },
    { value: "1y", label: "Last year" },
    { value: "all", label: "All time" },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("de-DE").format(num);
  };

  const formatPercentage = (num: number) => {
    const sign = num > 0 ? "+" : "";
    return `${sign}${num.toFixed(1)}%`;
  };

  const exportData = () => {
    if (!stats) return;
    
    const csvData = [
      "Metric,Value,Growth Rate",
      `Total Users,${stats.totalUsers},${stats.userGrowthRate}%`,
      `Total Listings,${stats.totalListings},${stats.listingGrowthRate}%`,
      `Total Transactions,${stats.totalTransactions},${stats.revenueGrowthRate}%`,
      `Total Revenue,${stats.totalRevenue},${stats.revenueGrowthRate}%`,
    ].join("\\n");

    const blob = new Blob([csvData], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `deimudda-analytics-${timeRange}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span>Loading analytics...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Alert className="w-full max-w-md" variant="destructive">
          <AlertDescription>
            Failed to load analytics: {error.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <AdminNav />
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold">Analytics & Statistics</h1>
              <Badge variant="secondary" className="ml-2">Live Data</Badge>
            </div>
            <div className="flex items-center gap-3">
              <Select value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeRangeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={exportData} variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
              <Button onClick={() => refetch()} variant="outline" className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
          <p className="text-gray-600">
            Comprehensive platform analytics for {timeRangeOptions.find(o => o.value === timeRange)?.label.toLowerCase()}
          </p>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(stats.totalUsers)}</div>
              <div className="flex items-center text-sm">
                <span className="text-muted-foreground">+{formatNumber(stats.newUsers)} new</span>
                <div className={`ml-2 flex items-center ${stats.userGrowthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.userGrowthRate >= 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {formatPercentage(stats.userGrowthRate)}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(stats.totalListings)}</div>
              <div className="flex items-center text-sm">
                <span className="text-muted-foreground">+{formatNumber(stats.newListings)} new</span>
                <div className={`ml-2 flex items-center ${stats.listingGrowthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.listingGrowthRate >= 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {formatPercentage(stats.listingGrowthRate)}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
              <div className="flex items-center text-sm">
                <span className="text-muted-foreground">+{formatCurrency(stats.newRevenue)} new</span>
                <div className={`ml-2 flex items-center ${stats.revenueGrowthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.revenueGrowthRate >= 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {formatPercentage(stats.revenueGrowthRate)}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Transaction</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.avgTransactionValue)}</div>
              <div className="text-sm text-muted-foreground">
                {formatNumber(stats.totalTransactions)} total transactions
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Over Time</CardTitle>
              <CardDescription>Monthly revenue and transaction volume</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <BarChart3 className="h-8 w-8 mr-2" />
                Chart would be displayed here (integrate with Chart.js or similar)
              </div>
            </CardContent>
          </Card>

          {/* Top Sellers */}
          <Card>
            <CardHeader>
              <CardTitle>Top Sellers</CardTitle>
              <CardDescription>Best performing sellers by revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(stats.topSellers as any)?.slice(0, 5).map((seller: any, index: number) => (
                  <div key={seller.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        index === 0 ? 'bg-yellow-100 text-yellow-800' :
                        index === 1 ? 'bg-gray-100 text-gray-800' :
                        index === 2 ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        #{index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{seller.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {seller.transactions} transactions
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(seller.revenue)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* User Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>User Status Distribution</CardTitle>
              <CardDescription>Breakdown of user account statuses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(stats.usersByStatus as any)?.map((statusData: any) => (
                  <div key={statusData.status} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize">{statusData.status}</span>
                      <span>{formatNumber(statusData.count)}</span>
                    </div>
                    <Progress 
                      value={(statusData.count / stats.totalUsers) * 100} 
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Category Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Listing Categories</CardTitle>
              <CardDescription>Most popular listing categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(stats.listingsByCategory as any)?.slice(0, 8).map((category: any) => (
                  <div key={category.category} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize">{category.category}</span>
                      <span>{formatNumber(category.count)}</span>
                    </div>
                    <Progress 
                      value={(category.count / stats.totalListings) * 100} 
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Revenue Details */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Monthly Performance Details</CardTitle>
            <CardDescription>Detailed breakdown of monthly revenue and transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Month</th>
                    <th className="text-right py-2">Revenue</th>
                    <th className="text-right py-2">Transactions</th>
                    <th className="text-right py-2">Avg Value</th>
                  </tr>
                </thead>
                <tbody>
                  {(stats.revenueByMonth as any)?.map((monthData: any) => (
                    <tr key={monthData.month} className="border-b hover:bg-gray-50">
                      <td className="py-2 font-medium">{monthData.month}</td>
                      <td className="text-right py-2">{formatCurrency(monthData.revenue)}</td>
                      <td className="text-right py-2">{formatNumber(monthData.transactions)}</td>
                      <td className="text-right py-2">
                        {formatCurrency(monthData.transactions > 0 ? monthData.revenue / monthData.transactions : 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}