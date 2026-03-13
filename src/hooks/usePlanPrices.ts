import { useQuery } from '@tanstack/react-query';
import { PriceApi } from '@/api/PriceApi';
import { PRICE_ENTITY_TYPE } from '@/models';
import type { SearchPricesResponse } from '@/types/dto';
import type { Price } from '@/models/Price';

/** Shared query key for plan prices so all consumers share the same cache. */
export const PLAN_PRICES_QUERY_KEY = ['planPrices'] as const;

/**
 * Canonical "active" price filter: price has started (start_date <= now or absent)
 * and has not expired (end_date >= now or absent). Used so all consumers of plan
 * prices get the same filtered result and cache behavior is deterministic.
 */
function isPlanPriceActive(price: { start_date?: string; end_date?: string }): boolean {
	const now = new Date();
	if (price.start_date) {
		const startDate = new Date(price.start_date);
		if (!isNaN(startDate.getTime()) && startDate > now) return false;
	}
	if (price.end_date) {
		const endDate = new Date(price.end_date);
		if (!isNaN(endDate.getTime()) && endDate < now) return false;
	}
	return true;
}

/**
 * Fetches plan prices and returns only currently active prices (started and not expired).
 * Shared by CreateCustomerSubscriptionPage and SubscriptionForm so they use the same
 * cache key and filtering, avoiding cache races and non-deterministic data.
 */
export function usePlanPrices(planId: string | undefined) {
	return useQuery({
		queryKey: [...PLAN_PRICES_QUERY_KEY, planId],
		queryFn: async (): Promise<SearchPricesResponse | null> => {
			if (!planId) return null;
			const response = await PriceApi.searchPrices({
				entity_ids: [planId],
				entity_type: PRICE_ENTITY_TYPE.PLAN,
				allow_expired_prices: false,
				limit: 10000,
			});
			const filteredItems = response.items.filter((price: Price) => isPlanPriceActive(price));
			return { ...response, items: filteredItems };
		},
		enabled: !!planId,
		staleTime: 5 * 60 * 1000,
		refetchOnWindowFocus: false,
	});
}
