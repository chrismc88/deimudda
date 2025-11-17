import { trpc } from "@/lib/trpc";

export function useSiteName() {
  const { data, isLoading, isError } = trpc.admin.getSystemSetting.useQuery('site_name', { staleTime: 600000 });
  return {
    siteName: data || 'Deimudda',
    isLoading,
    isError,
  };
}
