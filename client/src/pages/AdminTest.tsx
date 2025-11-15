import { useAuth } from "../_core/hooks/useAuth";
import DevAdminLogin from "../components/DevAdminLogin";
import AdminNav from "./AdminNav";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Shield, Settings, Users, BarChart3 } from "lucide-react";
import { Link } from "wouter";

export default function AdminTest() {
  const { user } = useAuth();

  // Show login if not admin
  if (!user || !["admin", "super_admin"].includes(user.role)) {
    return <DevAdminLogin />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <AdminNav />
        
        {/* Test Dashboard */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold">Admin System Test</h1>
            <Badge variant="secondary">Development Mode</Badge>
          </div>
          <p className="text-gray-600">
            Welcome {user.name}! Test all admin features below.
          </p>
        </div>

        {/* Quick Test Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Test user moderation features like warn, suspend, and ban.
              </p>
              <Button asChild className="w-full">
                <Link href="/admin/users">Test User Management</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                View platform statistics and business intelligence.
              </p>
              <Button asChild className="w-full">
                <Link href="/admin/stats">Test Analytics</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                System Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Configure platform settings and security options.
              </p>
              <Button asChild className="w-full">
                <Link href="/admin/settings">Test Settings</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Manage IP blocking and security monitoring.
              </p>
              <Button asChild className="w-full">
                <Link href="/admin/security">Test Security</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Current User Info */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Current Admin Session</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium">Name:</span> {user.name}
              </div>
              <div>
                <span className="font-medium">Email:</span> {user.email}
              </div>
              <div>
                <span className="font-medium">Role:</span> 
                <Badge variant={user.role === "super_admin" ? "destructive" : "secondary"} className="ml-2">
                  {user.role}
                </Badge>
              </div>
              <div>
                <span className="font-medium">Status:</span> 
                <Badge variant="default" className="ml-2">{user.status}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}