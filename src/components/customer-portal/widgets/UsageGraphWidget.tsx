import { useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import CustomerPortalApi from '@/api/CustomerPortalApi';
import { Card } from '@/components/atoms';
import { CustomerUsageChart } from '@/components/molecules';
import { DashboardAnalyticsRequest } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { UsageGraphConfig } from '@/types/dto/PortalConfig';

interface UsageGraphWidgetProps {
	config: UsageGraphConfig;
	/** Resolved by SectionContent (shared date filter — same cache key as UsageBreakdownWidget) */
	analyticsParams: DashboardAnalyticsRequest;
	label?: string;
}

/**
 * Renders ONLY the usage chart (line chart).
 * The breakdown table is a separate widget (UsageBreakdownWidget).
 * Both share the same React Query cache entry — one API call serves both.
 * Returns null if no data — no empty state container shown.
 */
const UsageGraphWidget = ({ config, analyticsParams, label }: UsageGraphWidgetProps) => {
	const {
		data: analyticsData,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ['portal-analytics', analyticsParams],
		queryFn: () => CustomerPortalApi.getAnalytics(analyticsParams),
	});

	useEffect(() => {
		if (isError) toast.error('Failed to load usage analytics');
	}, [isError]);

	// Client-side feature filter
	const filteredItems = useMemo(() => {
		if (!analyticsData?.items) return [];
		const { feature_filter_mode, feature_ids } = config;
		if (feature_filter_mode === 'include_list' && feature_ids?.length) {
			return analyticsData.items.filter((item) => feature_ids.includes(item.feature_id));
		}
		if (feature_filter_mode === 'exclude_list' && feature_ids?.length) {
			return analyticsData.items.filter((item) => !feature_ids.includes(item.feature_id));
		}
		return analyticsData.items;
	}, [analyticsData, config]);

	// Return null if no data — no empty container
	if (!isLoading && filteredItems.length === 0) return null;

	const filteredAnalyticsData = analyticsData ? { ...analyticsData, items: filteredItems } : undefined;

	return (
		<Card className='bg-white border border-[#E9E9E9] rounded-xl overflow-hidden'>
			<div className='p-6 border-b border-[#E9E9E9]'>
				<h3 className='text-base font-medium text-zinc-950'>{label || 'Usage Trend'}</h3>
			</div>
			<div className='p-6'>
				{isLoading ? (
					<Skeleton className='h-64 w-full' />
				) : filteredAnalyticsData ? (
					<CustomerUsageChart data={filteredAnalyticsData} />
				) : null}
			</div>
		</Card>
	);
};

export default UsageGraphWidget;
