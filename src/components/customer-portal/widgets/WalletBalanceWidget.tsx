import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import CustomerPortalApi from '@/api/CustomerPortalApi';
import { Card, Chip } from '@/components/atoms';
import { WALLET_STATUS } from '@/models/Wallet';
import { formatAmount } from '@/components/atoms/Input/Input';
import { getCurrencySymbol } from '@/utils/common/helper_functions';
import { Wallet as WalletIcon } from 'lucide-react';
import EmptyState from '../EmptyState';

const getWalletStatusChip = (status: WALLET_STATUS) => {
	const statusConfig: Record<WALLET_STATUS, { label: string; variant: 'success' | 'warning' | 'failed' | 'default' }> = {
		[WALLET_STATUS.ACTIVE]: { label: 'Active', variant: 'success' },
		[WALLET_STATUS.FROZEN]: { label: 'Frozen', variant: 'warning' },
		[WALLET_STATUS.CLOSED]: { label: 'Closed', variant: 'failed' },
	};
	const config = statusConfig[status] || { label: status, variant: 'default' as const };
	return <Chip label={config.label} variant={config.variant} />;
};

/**
 * Shows real-time balance for the first active wallet.
 * Used as a summary card on the Overview section.
 */
const WalletBalanceWidget = () => {
	const {
		data: wallets,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ['portal-wallets'],
		queryFn: () => CustomerPortalApi.getWallets(),
	});

	const wallet = wallets?.find((w) => w.wallet_status === WALLET_STATUS.ACTIVE) || wallets?.[0];

	const { data: walletBalance, isLoading: balanceLoading } = useQuery({
		queryKey: ['portal-wallet-balance', wallet?.id],
		queryFn: () => CustomerPortalApi.getWalletBalance(wallet!.id),
		enabled: !!wallet?.id,
	});

	useEffect(() => {
		if (isError) toast.error('Failed to load wallet');
	}, [isError]);

	if (isError) return null;

	if (isLoading) {
		return (
			<Card className='bg-white border border-[#E9E9E9] rounded-xl overflow-hidden'>
				<div className='p-6 border-b border-[#E9E9E9]'>
					<div className='h-5 w-32 bg-zinc-100 animate-pulse rounded' />
				</div>
				<div className='p-6'>
					<div className='animate-pulse space-y-3'>
						<div className='h-4 bg-zinc-100 rounded w-20'></div>
						<div className='h-10 bg-zinc-100 rounded w-32'></div>
					</div>
				</div>
			</Card>
		);
	}

	if (!wallet) {
		return (
			<Card className='bg-white border border-[#E9E9E9] rounded-xl p-6'>
				<EmptyState title='No wallet' description='No wallet has been set up for this account' />
			</Card>
		);
	}

	const currencySymbol = getCurrencySymbol(walletBalance?.currency ?? wallet.currency ?? 'USD');

	return (
		<Card className='bg-white border border-[#E9E9E9] rounded-xl overflow-hidden'>
			<div className='p-6 border-b border-[#E9E9E9]'>
				<div className='flex items-center gap-3'>
					<div className='h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center'>
						<WalletIcon className='h-5 w-5 text-blue-600' />
					</div>
					<div>
						<h3 className='text-base font-medium text-zinc-950'>{wallet.name || 'Wallet'}</h3>
						{wallet.wallet_status && getWalletStatusChip(wallet.wallet_status)}
					</div>
				</div>
			</div>

			<div className='p-6'>
				{balanceLoading ? (
					<div className='animate-pulse space-y-3'>
						<div className='h-4 bg-zinc-100 rounded w-20'></div>
						<div className='h-10 bg-zinc-100 rounded w-32'></div>
					</div>
				) : (
					<div>
						<span className='text-sm text-zinc-500 block mb-2'>Balance</span>
						<div className='flex items-baseline gap-2'>
							<span className='text-4xl font-semibold text-zinc-950'>
								{formatAmount(walletBalance?.real_time_credit_balance ?? wallet.credit_balance?.toString() ?? '0')}
							</span>
							<span className='text-base font-normal text-zinc-500'>credits</span>
						</div>
						<p className='text-sm text-zinc-500 mt-1'>
							{currencySymbol}
							{formatAmount(walletBalance?.real_time_balance ?? wallet.balance?.toString() ?? '0')} value
						</p>
					</div>
				)}
			</div>
		</Card>
	);
};

export default WalletBalanceWidget;
