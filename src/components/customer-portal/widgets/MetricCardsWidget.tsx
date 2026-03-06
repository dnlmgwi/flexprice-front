import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import CustomerPortalApi from '@/api/CustomerPortalApi';
import { CustomAnalyticItem } from '@/types/dto/Events';
import { DashboardAnalyticsRequest } from '@/types';
import { MetricCardsConfig } from '@/types/dto/PortalConfig';
import { Skeleton } from '@/components/ui/skeleton';
import { MetricCard } from '@/components/molecules';

// ─── Props ────────────────────────────────────────────────────────────────────

interface MetricCardsWidgetProps {
	analyticsParams: DashboardAnalyticsRequest;
	/** Controls which sub-groups are shown. Defaults to both true if absent. */
	config?: MetricCardsConfig;
}

// ─── Custom metric display name map ──────────────────────────────────────────

/**
 * Short display labels for known custom analytics metrics.
 * Key = item.id (slug) or item.name. Add entries as needed.
 */
const CUSTOM_ANALYTICS_DISPLAY_NAMES: Record<string, string> = {
	'revenue-per-minute': 'CPM',
};

// ─── Main Widget ──────────────────────────────────────────────────────────────

const DEFAULT_CONFIG: MetricCardsConfig = {
	show_custom_metrics: true,
	show_revenue_metric: true,
	show_cost_metrics: true,
};

/**
 * Renders three optional card groups in one flat auto-fill grid row:
 *   1. Revenue metric     — Revenue from cost analytics API
 *   2. Cost metrics       — Cost / Margin / Margin % from cost analytics API
 *   3. Custom metrics     — from revenue analytics custom_analytics[]
 *
 * Uses the same MetricCard molecule as the admin CostAnalytics page.
 * auto-fill grid ensures all cards sit on one line at full width.
 */
const MetricCardsWidget = ({ analyticsParams, config }: MetricCardsWidgetProps) => {
	const mergedConfig: MetricCardsConfig = { ...DEFAULT_CONFIG, ...config };
	const { show_custom_metrics: showCustom, show_revenue_metric: showRevenue, show_cost_metrics: showCost } = mergedConfig;

	// ── Revenue analytics (custom_analytics[]) ───────────────────────────────
	const {
		data: analyticsData,
		isLoading: analyticsLoading,
		isError: analyticsError,
	} = useQuery({
		queryKey: ['portal-analytics', analyticsParams],
		queryFn: () => CustomerPortalApi.getAnalytics(analyticsParams),
		enabled: showCustom,
	});

	// ── Cost analytics (Revenue / Cost / Margin / Margin %) ──────────────────
	const {
		data: costData,
		isLoading: costLoading,
		isError: costError,
	} = useQuery({
		queryKey: ['portal-cost-analytics', analyticsParams.start_time, analyticsParams.end_time],
		queryFn: () =>
			CustomerPortalApi.getCostAnalytics({
				start_time: analyticsParams.start_time,
				end_time: analyticsParams.end_time,
				expand: ['meter', 'price'],
			}),
		enabled: showRevenue || showCost,
	});

	useEffect(() => {
		if (analyticsError) toast.error('Failed to load analytics');
	}, [analyticsError]);

	useEffect(() => {
		if (costError) toast.error('Failed to load cost analytics');
	}, [costError]);

	const customItems: CustomAnalyticItem[] = analyticsData?.custom_analytics ?? [];
	const isLoading = (showCustom && analyticsLoading) || ((showRevenue || showCost) && costLoading);

	if (isLoading) {
		const revenueCount = showRevenue ? 1 : 0;
		const costCount = showCost ? 3 : 0;
		const customCount = showCustom ? 2 : 0;
		const skeletonCount = revenueCount + costCount + customCount || 4;
		return (
			<div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
				{Array.from({ length: skeletonCount }).map((_, i) => (
					<div key={i} className='bg-white border border-[#E5E7EB] p-[25px] rounded-md space-y-3'>
						<Skeleton className='h-4 w-24' />
						<Skeleton className='h-7 w-32' />
					</div>
				))}
			</div>
		);
	}

	const hasRevenueData = showRevenue && costData;
	const hasCostData = showCost && costData;
	const hasCustomData = showCustom && customItems.length > 0;

	if (!hasRevenueData && !hasCostData && !hasCustomData) return null;

	const currency = costData?.currency ?? 'USD';
	const totalRevenue = parseFloat(costData?.total_revenue ?? '0');
	const totalCost = parseFloat(costData?.total_cost ?? '0');
	const margin = parseFloat(costData?.margin ?? '0');
	const marginPercent = parseFloat(costData?.margin_percent ?? '0');

	// Calculate total card count for grid layout
	const revenueCardCount = hasRevenueData ? 1 : 0;
	const costCardCount = hasCostData ? 3 : 0;
	const customCardCount = hasCustomData ? customItems.length : 0;
	const totalCards = revenueCardCount + costCardCount + customCardCount;

	return (
		<div
			className='grid gap-3'
			style={{
				gridTemplateColumns: totalCards === 1 ? 'auto' : `repeat(${totalCards}, 1fr)`,
				width: totalCards === 1 ? '25%' : '100%',
			}}>
			{/* Revenue metric */}
			{hasRevenueData && <MetricCard title='Revenue' value={totalRevenue} currency={currency} />}

			{/* Cost metrics — 3 cards */}
			{hasCostData && (
				<>
					<MetricCard title='Cost' value={totalCost} currency={currency} />
					<MetricCard title='Margin' value={margin} currency={currency} showChangeIndicator isNegative={margin < 0} />
					<MetricCard title='Margin %' value={marginPercent} isPercent showChangeIndicator isNegative={marginPercent < 0} />
				</>
			)}

			{/* Custom metrics from custom_analytics[] */}
			{hasCustomData &&
				customItems.map((item) => {
					const value = parseFloat(item.value);
					const displayName = CUSTOM_ANALYTICS_DISPLAY_NAMES[item.id] ?? CUSTOM_ANALYTICS_DISPLAY_NAMES[item.name] ?? item.name;
					return <MetricCard key={item.id} title={displayName} value={isNaN(value) ? 0 : value} />;
				})}
		</div>
	);
};

export default MetricCardsWidget;
