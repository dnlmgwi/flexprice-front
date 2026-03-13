import { Pagination, Plan, Metadata } from '@/models';

// ============================================
// Plan Request Types
// ============================================

export interface CreatePlanRequest {
	name: string;
	lookup_key?: string;
	description?: string;
	display_order?: number;
	metadata?: Metadata;
}

export interface UpdatePlanRequest {
	name?: string;
	lookup_key?: string;
	description?: string;
	display_order?: number;
	metadata?: Metadata;
}

export interface ClonePlanRequest {
	name: string;
	lookup_key: string;
	description?: string;
	display_order?: number;
	metadata?: Metadata;
}

// ============================================
// Plan Response Types
// ============================================

export type PlanResponse = Plan;

export type CreatePlanResponse = Plan;

export interface ListPlansResponse {
	items: PlanResponse[];
	pagination: Pagination;
}

export interface SynchronizationSummary {
	subscriptions_processed: number;
	prices_processed: number;
	line_items_created: number;
	line_items_terminated: number;
	line_items_skipped: number;
	line_items_failed: number;
	skipped_already_terminated: number;
	skipped_overridden: number;
	skipped_incompatible: number;
	total_prices: number;
	active_prices: number;
	expired_prices: number;
}

export interface SynchronizePlanPricesWithSubscriptionResponse {
	message: string;
	plan_id: string;
	plan_name: string;
	synchronization_summary: SynchronizationSummary;
}
