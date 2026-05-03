import type { TypedBackendFilter, TypedBackendSort } from '@/types/formatters/QueryBuilder';

/**
 * Shared TanStack Query key prefix for subscription edit page + related mutations.
 * `refetchQueries` / invalidate with this prefix refreshes core + paginated line items, etc.
 */
export const subscriptionEditScopeQueryKey = (subscriptionId: string) => ['subscriptionEdit', subscriptionId] as const;

export const subscriptionEditCoreQueryKey = (subscriptionId: string) => [...subscriptionEditScopeQueryKey(subscriptionId), 'core'] as const;

export const subscriptionEditLineItemsQueryKey = (
	subscriptionId: string,
	customerId: string,
	currentPeriodStart: string,
	page: number,
	limit: number,
	sanitizedFilters: TypedBackendFilter[],
	sanitizedSorts: TypedBackendSort[],
) =>
	[
		...subscriptionEditScopeQueryKey(subscriptionId),
		'lineItems',
		customerId,
		currentPeriodStart,
		page,
		limit,
		sanitizedFilters,
		sanitizedSorts,
	] as const;

export const subscriptionEditInheritedQueryKey = (subscriptionId: string) =>
	[...subscriptionEditScopeQueryKey(subscriptionId), 'inherited', 'plan+customer'] as const;
