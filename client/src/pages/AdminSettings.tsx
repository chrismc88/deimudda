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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { Settings, Save, RefreshCw, Shield, DollarSign, Clock, Users } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// System settings schema
const systemSettingsSchema = z.object({
  siteName: z.string().min(1, "Site name is required"),
  siteDescription: z.string().min(1, "Site description is required"),
  adminEmail: z.string().email("Valid email is required"),
  maintenanceMode: z.boolean(),
  userRegistrationEnabled: z.boolean(),
  listingApprovalRequired: z.boolean(),
  maxListingImages: z.number().min(1).max(20),
  maxListingPrice: z.number().min(0),
  transactionFeePercent: z.number().min(0).max(100),
  minSellerRating: z.number().min(0).max(5),
  sessionTimeoutMinutes: z.number().min(15).max(480),
});

type SystemSettings = z.infer<typeof systemSettingsSchema>;

export default function AdminSettings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("general");

  // Get system settings query
  const { data: settings, isLoading, error, refetch } = trpc.admin.getSystemSettings.useQuery(undefined, {
    enabled: user?.role === "super_admin",
  });

  // Update settings mutation
  const updateSettingsMutation = trpc.admin.updateSystemSettings.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const form = useForm({
    // resolver: zodResolver(systemSettingsSchema),
    defaultValues: {
      siteName: "deimudda",
      siteDescription: "Premium Cannabis Genetics Marketplace",
      adminEmail: "admin@deimudda.de",
      maintenanceMode: false,
      userRegistrationEnabled: true,
      listingApprovalRequired: false,
      maxListingImages: 10,
      maxListingPrice: 10000,
      transactionFeePercent: 5,
      minSellerRating: 0,
      sessionTimeoutMinutes: 120,
    },
  });

  const onSubmit = (data: any) => {
    updateSettingsMutation.mutate(data);
  };

  // Check if user is super admin AFTER all hooks
  if (user?.role !== "super_admin") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Alert className="w-full max-w-md">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Super Admin access required to view system settings.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span>Loading system settings...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Alert className="w-full max-w-md" variant="destructive">
          <AlertDescription>
            Failed to load system settings: {error.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const tabs = [
    { id: "general", label: "General", icon: Settings },
    { id: "security", label: "Security", icon: Shield },
    { id: "commerce", label: "Commerce", icon: DollarSign },
    { id: "limits", label: "Limits & Timeouts", icon: Clock },
    { id: "users", label: "User Settings", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <AdminNav />
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold">System Settings</h1>
            <Badge variant="destructive" className="ml-2">Super Admin Only</Badge>
          </div>
          <p className="text-gray-600">
            Configure global platform settings and behavior
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Navigation Tabs */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Settings Categories</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="flex flex-col">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-3 px-4 py-3 text-left border-b hover:bg-gray-50 transition-colors ${
                        activeTab === tab.id ? "bg-blue-50 border-r-2 border-r-blue-600" : ""
                      }`}
                    >
                      <tab.icon className="h-4 w-4" />
                      <span className={activeTab === tab.id ? "font-medium text-blue-600" : ""}>
                        {tab.label}
                      </span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                {/* General Settings */}
                {activeTab === "general" && (
                  <Card>
                    <CardHeader>
                      <CardTitle>General Platform Settings</CardTitle>
                      <CardDescription>
                        Basic configuration for your platform
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="siteName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Site Name</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="deimudda" />
                            </FormControl>
                            <FormDescription>
                              The name displayed throughout the platform
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="siteDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Site Description</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Premium Cannabis Genetics Marketplace" />
                            </FormControl>
                            <FormDescription>
                              Short description used for SEO and marketing
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="adminEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Admin Email</FormLabel>
                            <FormControl>
                              <Input {...field} type="email" placeholder="admin@deimudda.de" />
                            </FormControl>
                            <FormDescription>
                              Primary admin contact email for system notifications
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                )}

                {/* Security Settings */}
                {activeTab === "security" && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Security & Access Control</CardTitle>
                      <CardDescription>
                        Configure security settings and access controls
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="maintenanceMode"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center gap-3">
                              <FormControl>
                                <input
                                  type="checkbox"
                                  checked={field.value}
                                  onChange={field.onChange}
                                  className="h-4 w-4"
                                />
                              </FormControl>
                              <FormLabel className="!mb-0">Maintenance Mode</FormLabel>
                            </div>
                            <FormDescription>
                              When enabled, only admins can access the platform
                            </FormDescription>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="userRegistrationEnabled"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center gap-3">
                              <FormControl>
                                <input
                                  type="checkbox"
                                  checked={field.value}
                                  onChange={field.onChange}
                                  className="h-4 w-4"
                                />
                              </FormControl>
                              <FormLabel className="!mb-0">User Registration Enabled</FormLabel>
                            </div>
                            <FormDescription>
                              Allow new users to register on the platform
                            </FormDescription>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="sessionTimeoutMinutes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Session Timeout (Minutes)</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                min="15"
                                max="480"
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormDescription>
                              How long before users are automatically logged out (15-480 minutes)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                )}

                {/* Commerce Settings */}
                {activeTab === "commerce" && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Commerce & Transaction Settings</CardTitle>
                      <CardDescription>
                        Configure fees, payments, and commerce behavior
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="transactionFeePercent"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Platform Transaction Fee (%)</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                min="0"
                                max="100"
                                step="0.1"
                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                              />
                            </FormControl>
                            <FormDescription>
                              Percentage fee charged on each transaction
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="maxListingPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Maximum Listing Price (€)</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                min="0"
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormDescription>
                              Maximum allowed price for listings
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="minSellerRating"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Minimum Seller Rating</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                min="0"
                                max="5"
                                step="0.1"
                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                              />
                            </FormControl>
                            <FormDescription>
                              Minimum rating required to sell on the platform
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                )}

                {/* Limits & Timeouts */}
                {activeTab === "limits" && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Platform Limits & Restrictions</CardTitle>
                      <CardDescription>
                        Configure upload limits and content restrictions
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="maxListingImages"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Maximum Listing Images</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                min="1"
                                max="20"
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormDescription>
                              Maximum number of images per listing (1-20)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                )}

                {/* User Settings */}
                {activeTab === "users" && (
                  <Card>
                    <CardHeader>
                      <CardTitle>User Management Settings</CardTitle>
                      <CardDescription>
                        Configure user behavior and approval processes
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="listingApprovalRequired"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center gap-3">
                              <FormControl>
                                <input
                                  type="checkbox"
                                  checked={field.value}
                                  onChange={field.onChange}
                                  className="h-4 w-4"
                                />
                              </FormControl>
                              <FormLabel className="!mb-0">Listing Approval Required</FormLabel>
                            </div>
                            <FormDescription>
                              Require admin approval before listings go live
                            </FormDescription>
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                )}

                {/* Save Button */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-500">
                        Changes will take effect immediately
                      </div>
                      <Button 
                        type="submit" 
                        disabled={updateSettingsMutation.isPending}
                        className="flex items-center gap-2"
                      >
                        {updateSettingsMutation.isPending ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        Save Settings
                      </Button>
                    </div>
                    
                    {updateSettingsMutation.isSuccess && (
                      <Alert className="mt-4">
                        <AlertDescription>
                          Settings updated successfully!
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {updateSettingsMutation.isError && (
                      <Alert variant="destructive" className="mt-4">
                        <AlertDescription>
                          Failed to update settings: {updateSettingsMutation.error?.message}
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}