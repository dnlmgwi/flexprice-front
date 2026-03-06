import { Card, Chip } from '@/components/atoms';
import { Subscription, SUBSCRIPTION_STATUS } from '@/models/Subscription';
import { formatDateShort } from '@/utils/common/helper_functions';
import { Calendar, Clock } from 'lucide-react';
import EmptyState from '../EmptyState';

interface SubscriptionsWidgetProps {
	subscriptions: Subscription[];
	label?: string;
}

const getStatusChip = (status: SUBSCRIPTION_STATUS) => {
	const statusConfig: Record<SUBSCRIPTION_STATUS, { label: string; variant: 'success' | 'warning' | 'info' | 'default' | 'failed' }> = {
		[SUBSCRIPTION_STATUS.ACTIVE]: { label: 'Active', variant: 'success' },
		[SUBSCRIPTION_STATUS.TRIALING]: { label: 'Trialing', variant: 'info' },
		[SUBSCRIPTION_STATUS.CANCELLED]: { label: 'Cancelled', variant: 'failed' },
		[SUBSCRIPTION_STATUS.INCOMPLETE]: { label: 'Incomplete', variant: 'warning' },
		[SUBSCRIPTION_STATUS.DRAFT]: { label: 'Draft', variant: 'default' },
	};
	const config = statusConfig[status] || { label: status, variant: 'default' as const };
	return <Chip label={config.label} variant={config.variant} />;
};

const SubscriptionsWidget = ({ subscriptions, label }: SubscriptionsWidgetProps) => {
	const activeSubscriptions =
		subscriptions?.filter(
			(sub) => sub.subscription_status === SUBSCRIPTION_STATUS.ACTIVE || sub.subscription_status === SUBSCRIPTION_STATUS.TRIALING,
		) || [];

	if (activeSubscriptions.length === 0) {
		return (
			<Card className='bg-white border border-[#E9E9E9] rounded-xl p-6'>
				<EmptyState title='No active subscriptions' description='You do not have any active subscriptions at the moment' />
			</Card>
		);
	}

	return (
		<Card className='bg-white border border-[#E9E9E9] rounded-xl overflow-hidden'>
			<div className='p-6 border-b border-[#E9E9E9]'>
				<h3 className='text-base font-medium text-zinc-950'>{label || 'Subscriptions'}</h3>
			</div>
			<div className='p-6 space-y-4'>
				{activeSubscriptions.map((subscription) => (
					<div key={subscription.id} className='border border-[#E9E9E9] rounded-lg p-4 hover:bg-zinc-50 transition-colors'>
						<div className='flex items-start justify-between mb-3'>
							<div>
								<h4 className='text-sm font-medium text-zinc-950'>{subscription.plan?.name || 'Unknown Plan'}</h4>
								{subscription.plan?.description && (
									<p className='text-xs text-zinc-500 mt-0.5 line-clamp-1'>{subscription.plan.description}</p>
								)}
							</div>
							{getStatusChip(subscription.subscription_status)}
						</div>
						<div className='flex flex-wrap gap-4 text-xs text-zinc-500'>
							<div className='flex items-center gap-1.5'>
								<Calendar className='h-3.5 w-3.5' />
								<span>
									{formatDateShort(subscription.current_period_start)} - {formatDateShort(subscription.current_period_end)}
								</span>
							</div>
							{subscription.subscription_status === SUBSCRIPTION_STATUS.ACTIVE && (
								<div className='flex items-center gap-1.5'>
									<Clock className='h-3.5 w-3.5' />
									<span>Next billing: {formatDateShort(subscription.current_period_end)}</span>
								</div>
							)}
							{subscription.subscription_status === SUBSCRIPTION_STATUS.TRIALING && subscription.trial_end && (
								<div className='flex items-center gap-1.5 text-blue-600'>
									<Clock className='h-3.5 w-3.5' />
									<span>Trial ends: {formatDateShort(subscription.trial_end)}</span>
								</div>
							)}
						</div>
					</div>
				))}
			</div>
		</Card>
	);
};

export default SubscriptionsWidget;
