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
			<Card
				className='rounded-xl p-6'
				style={{ backgroundColor: 'var(--portal-surface, white)', border: '1px solid var(--portal-border, #E9E9E9)' }}>
				<EmptyState title='No active subscriptions' description='You do not have any active subscriptions at the moment' />
			</Card>
		);
	}

	return (
		<Card
			className='rounded-xl overflow-hidden'
			style={{ backgroundColor: 'var(--portal-surface, white)', border: '1px solid var(--portal-border, #E9E9E9)' }}>
			<div className='p-6' style={{ borderBottom: '1px solid var(--portal-border, #E9E9E9)' }}>
				<h3 className='text-base font-medium' style={{ color: 'var(--portal-text-primary, #09090b)' }}>
					{label || 'Subscriptions'}
				</h3>
			</div>
			<div className='p-6 space-y-4'>
				{activeSubscriptions.map((subscription) => (
					<div
						key={subscription.id}
						className='rounded-lg p-4 transition-colors'
						style={{ border: '1px solid var(--portal-border, #E9E9E9)' }}>
						<div className='flex items-start justify-between mb-3'>
							<div>
								<h4 className='text-sm font-medium' style={{ color: 'var(--portal-text-primary, #09090b)' }}>
									{subscription.plan?.name || 'Unknown Plan'}
								</h4>
								{subscription.plan?.description && (
									<p className='text-xs mt-0.5 line-clamp-1' style={{ color: 'var(--portal-text-secondary, #71717a)' }}>
										{subscription.plan.description}
									</p>
								)}
							</div>
							{getStatusChip(subscription.subscription_status)}
						</div>
						<div className='flex flex-wrap gap-4 text-xs' style={{ color: 'var(--portal-text-secondary, #71717a)' }}>
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
