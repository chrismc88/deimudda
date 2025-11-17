import { useEffect, type ReactNode } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Spinner } from "@/components/ui/spinner";

const PUBLIC_MAINTENANCE_PATHS = ["/maintenance", "/admin/test"];

export default function MaintenanceGate({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const [location, setLocation] = useLocation();
  const { data, isLoading } = trpc.system.getMaintenanceStatus.useQuery(
    undefined,
    {
      refetchInterval: 60_000,
      staleTime: 30_000,
    }
  );

  const maintenanceModeEnabled = data?.maintenanceMode ?? false;
  const isAdmin =
    user && (user.role === "admin" || user.role === "super_admin");

  const isPublicMaintenancePath = PUBLIC_MAINTENANCE_PATHS.some(
    (path) => location === path || location.startsWith(`${path}/`)
  );

  useEffect(() => {
    if (loading || isLoading) return;

    if (
      maintenanceModeEnabled &&
      !isAdmin &&
      !isPublicMaintenancePath &&
      location !== "/maintenance"
    ) {
      setLocation("/maintenance");
      return;
    }

    if (!maintenanceModeEnabled && location === "/maintenance") {
      setLocation("/");
    }
  }, [
    isAdmin,
    isLoading,
    isPublicMaintenancePath,
    loading,
    location,
    maintenanceModeEnabled,
    setLocation,
  ]);

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spinner className="w-8 h-8 text-gray-500" />
      </div>
    );
  }

  return <>{children}</>;
}
