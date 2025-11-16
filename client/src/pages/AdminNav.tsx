import { useAuth } from "../_core/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Package, 
  Settings, 
  BarChart3, 
  Shield,
  DollarSign,
  ChevronRight
} from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Card, CardContent } from "../components/ui/card";

export default function AdminNav() {
  const { user } = useAuth();
  const [location] = useLocation();

  // Only show for admin/super_admin
  if (!user || !["admin", "super_admin"].includes(user.role)) {
    return null;
  }

  const adminNavItems = [
    {
      path: "/admin/dashboard",
      label: "Dashboard", 
      icon: LayoutDashboard,
      description: "Overview & Stats"
    },
    {
      path: "/admin/users",
      label: "Users",
      icon: Users,
      description: "User Management"
    },
    {
      path: "/admin/transactions", 
      label: "Transactions",
      icon: CreditCard,
      description: "Payment Oversight"
    },
    {
      path: "/admin/listings",
      label: "Listings", 
      icon: Package,
      description: "Content Moderation"
    },
    {
      path: "/admin/stats",
      label: "Analytics",
      icon: BarChart3,
      description: "Business Intelligence"
    },
    {
      path: "/admin/fees",
      label: "Fees",
      icon: DollarSign,
      description: "Fee Management",
      superAdminOnly: true
    },
    {
      path: "/admin/settings",
      label: "Settings",
      icon: Settings,
      description: "System Config",
      superAdminOnly: true
    },
    {
      path: "/admin/security",
      label: "Security",
      icon: Shield,
      description: "IP & Logs",
      superAdminOnly: true
    }
  ];

  const filteredNavItems = adminNavItems.filter(item => 
    !item.superAdminOnly || user.role === "super_admin"
  );

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-sm">Admin Navigation</span>
            <Badge variant={user.role === "super_admin" ? "destructive" : "secondary"} className="text-xs">
              {user.role === "super_admin" ? "Super Admin" : "Admin"}
            </Badge>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-2">
          {filteredNavItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = location === item.path || location.startsWith(item.path);
            
            return (
              <Link key={item.path} href={item.path}>
                <div className={`
                  p-3 rounded-lg border transition-all cursor-pointer group
                  ${isActive 
                    ? 'bg-blue-50 border-blue-200 text-blue-700' 
                    : 'hover:bg-gray-50 hover:border-gray-300'
                  }
                `}>
                  <div className="flex items-center justify-between mb-1">
                    <IconComponent className={`h-4 w-4 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                    {isActive && <ChevronRight className="h-3 w-3 text-blue-600" />}
                  </div>
                  <div className={`font-medium text-sm ${isActive ? 'text-blue-700' : 'text-gray-700'}`}>
                    {item.label}
                  </div>
                  <div className={`text-xs ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                    {item.description}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}