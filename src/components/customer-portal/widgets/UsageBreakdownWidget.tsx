import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import CustomerPortalApi from '@/api/CustomerPortalApi';
import { Card } from '@/components/atoms';
import { FlexpriceTable, type ColumnData } from '@/components/molecules';
import { UsageAnalyticItem } from '@/models';
import { DashboardAnalyticsRequest } from '@/types';
import { formatNumber, getCurrencySymbol } from '@/utils';

interface UsageBreakdownWidgetProps {
	analyticsParams: DashboardAnalyticsRequest;
	label?: string;
}

/**
 * Renders just the usage breakdown table.
 * Shares React Query cache with UsageGraphWidget (same key) — zero duplicate API calls.
 * Returns null if there are no items — no empty container shown.
 */
const UsageBreakdownWidget = ({ analyticsParams, label }: UsageBreakdownWidgetProps) => {
	const {
		data: analyticsData,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ['portal-analytics', analyticsParams],
		queryFn: () => CustomerPortalApi.getAnalytics(analyticsParams),
	});

	useEffect(() => {
		if (isError) toast.error('Failed to load usage breakdown');
	}, [isError]);

	const items = analyticsData?.items ?? [];

	// Return null if no data — no empty state container
	if (!isLoading && items.length === 0) return null;

	const columns: ColumnData<UsageAnalyticItem>[] = [
		{
			title: 'Feature',
			render: (row) => <span>{row.name || row.feature?.name || row.event_name || 'Unknown'}</span>,
		},
		{
			title: 'Total Usage',
			render: (row) => {
				let unit = '';
				if (row.unit) {
					unit = row.total_usage !== 1 ? ` ${row.unit_plural || row.unit + 's'}` : ` ${row.unit}`;
				}
				return (
					<span>
						{formatNumber(row.total_usage)}
						{unit}
					</span>
				);
			},
		},
		{
			title: 'Total Cost',
			render: (row) => {
				if (row.total_cost === 0 || !row.currency) return <span>-</span>;
				return (
					<span>
						{getCurrencySymbol(row.currency)}
						{formatNumber(row.total_cost, 2)}
					</span>
				);
			},
		},
	];

	const tableData = items.map((item) => ({
		...item,
		id: item.feature_id || item.source || 'unknown',
	}));

	if (isLoading) {
		return (
			<Card className='bg-white border border-[#E9E9E9] rounded-xl overflow-hidden'>
				<div className='p-6 border-b border-[#E9E9E9]'>
					<div className='h-5 w-40 bg-zinc-100 animate-pulse rounded' />
				</div>
				<div className='p-6 space-y-3'>
					{[1, 2, 3].map((i) => (
						<div key={i} className='h-8 bg-zinc-100 animate-pulse rounded' />
					))}
				</div>
			</Card>
		);
	}

	return (
		<Card className='bg-white border border-[#E9E9E9] rounded-xl overflow-hidden'>
			<div className='p-6 border-b border-[#E9E9E9]'>
				<h3 className='text-base font-medium text-zinc-950'>{label || 'Usage Breakdown'}</h3>
			</div>
			<FlexpriceTable columns={columns} data={tableData} showEmptyRow />
		</Card>
	);
};

export default UsageBreakdownWidget;
