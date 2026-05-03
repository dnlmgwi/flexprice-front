import SubscriptionApi from '@/api/SubscriptionApi';
import { EXPAND } from '@/models';
import { generateExpandQueryParams } from '@/utils/common/api_helper';
import { subscriptionEditCoreQueryKey } from '@/utils/subscription/subscriptionEditQueryKeys';
import { useQuery } from '@tanstack/react-query';
import type { SubscriptionResponse } from '@/types/dto/Subscription';

/**
 * Lightweight subscription payload for the edit page (plan + schedule for phase headings; no embedded line_items).
 */
export function useSubscriptionEditCoreQuery(subscriptionId: string | undefined) {
	return useQuery<SubscriptionResponse>({
		queryKey: subscriptionId ? subscriptionEditCoreQueryKey(subscriptionId) : ['subscriptionEdit', 'disabled', 'core'],
		queryFn: async () =>
			SubscriptionApi.getSubscriptionV2(subscriptionId!, {
				expand: generateExpandQueryParams([EXPAND.PLAN, EXPAND.SCHEDULE]),
			}),
		enabled: !!subscriptionId,
	});
}
