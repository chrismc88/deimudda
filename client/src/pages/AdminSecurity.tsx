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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { 
  Shield, 
  Ban, 
  CheckCircle2, 
  XCircle, 
  Plus,
  RefreshCw,
  AlertTriangle,
  Lock,
  Unlock,
  Clock,
  User,
  Globe
} from "lucide-react";

interface BlockedIP {
  id: number;
  ipAddress: string;
  reason: string;
  blockedAt: Date;
  blockedBy: string;
  isActive: boolean;
}

interface SecurityLog {
  id: number;
  type: "ip_block" | "ip_unblock" | "failed_login" | "suspicious_activity";
  ipAddress: string;
  details: string;
  timestamp: Date;
  adminId?: number;
  adminName?: string;
}

export default function AdminSecurity() {
  const { user } = useAuth();
  const [blockIPDialog, setBlockIPDialog] = useState(false);
  const [newIPAddress, setNewIPAddress] = useState("");
  const [blockReason, setBlockReason] = useState("");

  // Check if user is admin or super admin
  if (!user || !["admin", "super_admin"].includes(user.role)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Alert className="w-full max-w-md">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Admin access required to view security settings.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Get blocked IPs
  const { data: blockedIPs, isLoading: loadingIPs, refetch: refetchIPs } = trpc.admin.getBlockedIPs.useQuery();

  // Get security logs
  const { data: securityLogs, isLoading: loadingLogs } = trpc.admin.getSecurityLogs.useQuery();

  // Mutations
  const blockIPMutation = trpc.admin.blockIP.useMutation({
    onSuccess: () => {
      refetchIPs();
      setBlockIPDialog(false);
      setNewIPAddress("");
      setBlockReason("");
    },
  });

  const unblockIPMutation = trpc.admin.unblockIP.useMutation({
    onSuccess: () => {
      refetchIPs();
    },
  });

  const validateIP = (ip: string): boolean => {
    const ipPattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipPattern.test(ip);
  };

  const handleBlockIP = () => {
    if (!validateIP(newIPAddress)) {
      alert("Please enter a valid IP address");
      return;
    }
    if (!blockReason.trim()) {
      alert("Please provide a reason for blocking");
      return;
    }

    blockIPMutation.mutate({
      ipAddress: newIPAddress,
      reason: blockReason,
    });
  };

  const handleUnblockIP = (ipAddress: string) => {
    if (window.confirm(`Are you sure you want to unblock IP ${ipAddress}?`)) {
      unblockIPMutation.mutate({ ipAddress });
    }
  };

  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat("de-DE", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const getLogTypeIcon = (type: SecurityLog["type"]) => {
    switch (type) {
      case "ip_block":
        return <Ban className="h-4 w-4 text-red-500" />;
      case "ip_unblock":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "failed_login":
        return <Lock className="h-4 w-4 text-yellow-500" />;
      case "suspicious_activity":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      default:
        return <Shield className="h-4 w-4 text-gray-500" />;
    }
  };

  const getLogTypeLabel = (type: SecurityLog["type"]) => {
    switch (type) {
      case "ip_block":
        return "IP Blocked";
      case "ip_unblock":
        return "IP Unblocked";
      case "failed_login":
        return "Failed Login";
      case "suspicious_activity":
        return "Suspicious Activity";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <AdminNav />
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-red-600" />
              <h1 className="text-3xl font-bold">Security Management</h1>
              <Badge variant="destructive" className="ml-2">High Security Zone</Badge>
            </div>
            <Button 
              onClick={() => setBlockIPDialog(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Block IP Address
            </Button>
          </div>
          <p className="text-gray-600">
            Monitor and manage platform security including IP blocking and security logs
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Blocked IPs Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Ban className="h-5 w-5 text-red-500" />
                      Blocked IP Addresses
                    </CardTitle>
                    <CardDescription>
                      Currently blocked IP addresses and their details
                    </CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => refetchIPs()}
                    disabled={loadingIPs}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className={`h-4 w-4 ${loadingIPs ? "animate-spin" : ""}`} />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loadingIPs ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                    Loading blocked IPs...
                  </div>
                ) : blockedIPs && blockedIPs.length > 0 ? (
                  <div className="space-y-4">
                    {blockedIPs.map((blockedIP: BlockedIP) => (
                      <div key={blockedIP.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-gray-500" />
                            <span className="font-mono font-medium">{blockedIP.ipAddress}</span>
                            {blockedIP.isActive ? (
                              <Badge variant="destructive">Blocked</Badge>
                            ) : (
                              <Badge variant="secondary">Inactive</Badge>
                            )}
                          </div>
                          {blockedIP.isActive && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUnblockIP(blockedIP.ipAddress)}
                              disabled={unblockIPMutation.isPending}
                              className="flex items-center gap-1"
                            >
                              <Unlock className="h-3 w-3" />
                              Unblock
                            </Button>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div><strong>Reason:</strong> {blockedIP.reason}</div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>Blocked: {formatDate(blockedIP.blockedAt)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span>By: {blockedIP.blockedBy}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Shield className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No blocked IP addresses</p>
                    <p className="text-sm">All systems secure</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Security Logs Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Security Activity Log
                </CardTitle>
                <CardDescription>
                  Recent security events and administrative actions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingLogs ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                    Loading security logs...
                  </div>
                ) : securityLogs && securityLogs.length > 0 ? (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {securityLogs.map((log: SecurityLog) => (
                      <div key={log.id} className="border-l-4 border-l-orange-200 pl-4 py-2">
                        <div className="flex items-center gap-2 mb-1">
                          {getLogTypeIcon(log.type)}
                          <span className="font-medium">{getLogTypeLabel(log.type)}</span>
                          <Badge variant="outline" className="text-xs">
                            {log.ipAddress}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 mb-1">
                          {log.details}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center justify-between">
                          <span>{formatDate(log.timestamp)}</span>
                          {log.adminName && (
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {log.adminName}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Shield className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No security events logged</p>
                    <p className="text-sm">System is secure</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Security Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-500" />
                  Security Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {(blockedIPs as any)?.filter((ip: any) => ip.isActive).length || 0}
                    </div>
                    <div className="text-sm text-red-600">Active Blocks</div>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {(securityLogs as any)?.filter((log: any) => {
                        const logDate = new Date(log.timestamp);
                        const today = new Date();
                        const diffTime = Math.abs(today.getTime() - logDate.getTime());
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        return diffDays <= 7;
                      }).length || 0}
                    </div>
                    <div className="text-sm text-orange-600">Events (7d)</div>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="text-center">
                  <div className="text-lg font-semibold text-green-600 mb-1">
                    System Status: Secure
                  </div>
                  <div className="text-sm text-gray-600">
                    All security systems operational
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Block IP Dialog */}
        <Dialog open={blockIPDialog} onOpenChange={setBlockIPDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Ban className="h-5 w-5 text-red-500" />
                Block IP Address
              </DialogTitle>
              <DialogDescription>
                Enter the IP address and reason for blocking. This will immediately prevent access from this IP.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label htmlFor="ip" className="block text-sm font-medium mb-1">
                  IP Address
                </label>
                <Input
                  id="ip"
                  value={newIPAddress}
                  onChange={(e) => setNewIPAddress(e.target.value)}
                  placeholder="192.168.1.1"
                  className="font-mono"
                />
                {newIPAddress && !validateIP(newIPAddress) && (
                  <p className="text-sm text-red-600 mt-1">Please enter a valid IP address</p>
                )}
              </div>
              <div>
                <label htmlFor="reason" className="block text-sm font-medium mb-1">
                  Reason for Blocking
                </label>
                <Input
                  id="reason"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="Suspicious activity, spam, etc."
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setBlockIPDialog(false)}
                disabled={blockIPMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleBlockIP}
                disabled={blockIPMutation.isPending || !validateIP(newIPAddress) || !blockReason.trim()}
                className="bg-red-600 hover:bg-red-700"
              >
                {blockIPMutation.isPending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Blocking...
                  </>
                ) : (
                  <>
                    <Ban className="h-4 w-4 mr-2" />
                    Block IP
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}