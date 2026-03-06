import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import CustomerPortalApi from '@/api/CustomerPortalApi';
import { Card, Loader, Select, ShortPagination } from '@/components/atoms';
import { WalletTransactionsTable } from '@/components/molecules';
import { WALLET_STATUS } from '@/models/Wallet';
import usePagination from '@/hooks/usePagination';
import EmptyState from '../EmptyState';

const WalletTransactionsWidget = () => {
	const { limit, offset } = usePagination();
	const [selectedWalletId, setSelectedWalletId] = useState<string>('');

	const {
		data: wallets,
		isLoading: walletsLoading,
		isError: walletsError,
	} = useQuery({
		queryKey: ['portal-wallets'],
		queryFn: () => CustomerPortalApi.getWallets(),
	});

	const activeWallet = selectedWalletId
		? wallets?.find((w) => w.id === selectedWalletId)
		: wallets?.find((w) => w.wallet_status === WALLET_STATUS.ACTIVE) || wallets?.[0];

	const {
		data: transactionsData,
		isLoading: transactionsLoading,
		isError: transactionsError,
	} = useQuery({
		queryKey: ['portal-wallet-transactions', activeWallet?.id, limit, offset],
		queryFn: () =>
			CustomerPortalApi.getWalletTransactions({
				walletId: activeWallet!.id,
				limit,
				offset,
			}),
		enabled: !!activeWallet?.id,
	});

	useEffect(() => {
		if (walletsError) toast.error('Failed to load wallets');
	}, [walletsError]);

	useEffect(() => {
		if (transactionsError) toast.error('Failed to load transactions');
	}, [transactionsError]);

	if (walletsLoading) {
		return (
			<div className='py-12'>
				<Loader />
			</div>
		);
	}

	if (!wallets || wallets.length === 0) {
		return (
			<Card className='bg-white border border-[#E9E9E9] rounded-xl p-6'>
				<EmptyState title='No wallet' description='No wallet has been set up for this account' />
			</Card>
		);
	}

	const walletOptions = wallets.map((w) => ({ value: w.id, label: w.name || `Wallet ${w.id.slice(0, 8)}` }));

	return (
		<div className='space-y-6'>
			{wallets.length > 1 && (
				<Select
					value={activeWallet?.id || ''}
					onChange={(value) => setSelectedWalletId(value)}
					options={walletOptions}
					className='w-full max-w-xs'
				/>
			)}

			{/* Transactions */}
			<Card className='bg-white border border-[#E9E9E9] rounded-xl overflow-hidden'>
				<div className='p-6 border-b border-[#E9E9E9]'>
					<h3 className='text-base font-medium text-zinc-950'>Transaction History</h3>
				</div>
				<div className='p-6'>
					{transactionsLoading ? (
						<div className='animate-pulse space-y-3'>
							{[1, 2, 3].map((i) => (
								<div key={i} className='h-12 bg-zinc-100 rounded'></div>
							))}
						</div>
					) : transactionsData?.items && transactionsData.items.length > 0 ? (
						<>
							<WalletTransactionsTable data={transactionsData.items} />
							<ShortPagination unit='transactions' totalItems={transactionsData.pagination?.total || 0} />
						</>
					) : (
						<EmptyState title='No transactions' description='Your transaction history will appear here' />
					)}
				</div>
			</Card>
		</div>
	);
};

export default WalletTransactionsWidget;
