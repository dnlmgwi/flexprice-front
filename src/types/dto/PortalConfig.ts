/**
 * Customer Portal Configuration Types
 *
 * The portal config is stored in the settings API under key: customer_portal_config
 * It is fetched on portal load and merged with DEFAULT_PORTAL_CONFIG.
 * Any field not set by the tenant falls back to the default.
 */

// ─── Theme ────────────────────────────────────────────────────────────────────

/**
 * Optional per-tenant theme. When absent the portal uses its default light-mode appearance.
 *
 * CSS variables injected:
 *   --portal-primary  → buttons, active tabs, accent
 *   --portal-bg       → page background
 *   --portal-surface  → card / panel backgrounds
 *   --portal-border   → card and table borders
 */
export interface PortalTheme {
	primary_color: string; // CSS var --portal-primary
	background_color: string; // CSS var --portal-bg
	surface_color: string; // CSS var --portal-surface
	border_color: string; // CSS var --portal-border
	logo_url?: string;
	font_family?: string;
}

// ─── Date Presets ─────────────────────────────────────────────────────────────

export const DatePreset = {
	Today: 'today',
	Last7Days: 'last_7_days',
	Last30Days: 'last_30_days',
	CurrentMonth: 'current_month',
	LastMonth: 'last_month',
} as const;

export type DatePreset = (typeof DatePreset)[keyof typeof DatePreset];

// ─── Widget Types ─────────────────────────────────────────────────────────────

export type TabType =
	| 'subscriptions'
	| 'current_usage'
	| 'usage_graph' // chart only
	| 'usage_breakdown' // table only (shares API cache with usage_graph)
	| 'invoices'
	| 'wallet_balance'
	| 'wallet_transactions'
	| 'metric_cards'; // custom + cost metrics in one grid (controlled by MetricCardsConfig)

// ─── Widget-specific Config ───────────────────────────────────────────────────

/**
 * Controls which sub-groups appear inside the metric_cards widget.
 *   show_custom_metrics  → cards from revenue analytics custom_analytics[]
 *   show_revenue_metric  → Revenue card from cost analytics API
 *   show_cost_metrics    → Cost / Margin / Margin % cards from cost analytics API
 * If the field is absent in the stored config, all default to true.
 */
export interface MetricCardsConfig {
	show_custom_metrics: boolean;
	show_revenue_metric: boolean;
	show_cost_metrics: boolean;
}

export interface UsageGraphConfig {
	date_presets: DatePreset[];
	default_preset: DatePreset;
	allow_custom_date_range: boolean;
	/** Controls which features appear in the chart */
	feature_filter_mode: 'all' | 'include_list' | 'exclude_list';
	/** feature_ids used when mode is include_list or exclude_list */
	feature_ids?: string[];
}

// ─── Tab (widget instance within a section) ───────────────────────────────────

export interface TabConfig {
	id: string; // unique instance key e.g. "1", "2"
	type: TabType;
	label?: string; // optional display label override (e.g., "Usage Trend" instead of default "Usage")
	enabled: boolean;
	order: number;
	/** Only used when type = "usage_graph" */
	usage_graph?: UsageGraphConfig;
	/** Only used when type = "metric_cards" — controls which sub-groups are shown */
	metric_cards?: MetricCardsConfig;
}

// ─── Section ──────────────────────────────────────────────────────────────────

export interface SectionConfig {
	id: string; // e.g. "overview", "usage", "invoices", "credits"
	label: string; // displayed in the top-level tab bar
	enabled: boolean;
	order: number;
	tabs: TabConfig[]; // widgets inside this section, sorted by order
}

// ─── Root Config ──────────────────────────────────────────────────────────────

export interface PortalConfig {
	version: string;
	/** Optional — when absent the portal renders with its default light-mode appearance */
	theme?: PortalTheme;
	sections: SectionConfig[];
}

// ─── Default Config ───────────────────────────────────────────────────────────

export const DEFAULT_PORTAL_CONFIG: PortalConfig = {
	version: '1.0',
	// No default theme — portals without a tenant theme use hardcoded light-mode styles
	sections: [
		{
			id: 'usage',
			label: 'Usage',
			enabled: true,
			order: 1,
			tabs: [
				{
					id: '1',
					type: 'metric_cards',
					enabled: true,
					order: 1,
					metric_cards: { show_custom_metrics: true, show_revenue_metric: true, show_cost_metrics: true },
				},
				{
					id: '2',
					type: 'usage_graph',
					enabled: true,
					order: 2,
					usage_graph: {
						date_presets: [DatePreset.Today, DatePreset.Last7Days, DatePreset.Last30Days, DatePreset.CurrentMonth, DatePreset.LastMonth],
						default_preset: DatePreset.Last7Days,
						allow_custom_date_range: true,
						feature_filter_mode: 'all',
					},
				},
				{ id: '3', type: 'usage_breakdown', enabled: true, order: 3 },
				{ id: '4', type: 'current_usage', enabled: true, order: 4 },
			],
		},
		{
			id: 'invoices',
			label: 'Invoices',
			enabled: true,
			order: 2,
			tabs: [{ id: '5', type: 'invoices', enabled: true, order: 1 }],
		},
		{
			id: 'credits',
			label: 'Credits',
			enabled: true,
			order: 3,
			tabs: [
				{ id: '6', type: 'wallet_balance', enabled: true, order: 1 },
				{ id: '7', type: 'wallet_transactions', enabled: true, order: 2 },
			],
		},
		{
			id: 'overview',
			label: 'Overview',
			enabled: true,
			order: 4,
			tabs: [
				{ id: '8', type: 'wallet_balance', enabled: true, order: 1 },
				{ id: '9', type: 'subscriptions', enabled: true, order: 2 },
				{ id: '10', type: 'current_usage', enabled: true, order: 3 },
			],
		},
	],
};

// ─── Deep Merge Utility ───────────────────────────────────────────────────────

/**
 * Deep merges tenant config on top of defaults.
 * Arrays (sections, tabs) from tenantConfig fully replace defaults if present —
 * this gives tenants full control over ordering and content.
 */
/** Returns true only if a theme object has at least one non-empty string value. */
function hasThemeValues(theme?: Partial<PortalTheme>): boolean {
	if (!theme) return false;
	return Object.values(theme).some((v) => typeof v === 'string' && v.length > 0);
}

export function deepMergePortalConfig(defaults: PortalConfig, tenant: Partial<PortalConfig>): PortalConfig {
	const mergedTheme = { ...(defaults.theme ?? {}), ...(tenant.theme ?? {}) } as PortalTheme;
	return {
		version: tenant.version ?? defaults.version,
		// Only set theme if the merged result actually has at least one value.
		// An empty {} from the backend must NOT override the light-mode defaults.
		theme: hasThemeValues(mergedTheme) ? mergedTheme : undefined,
		// Sections from tenant fully replace defaults if provided (they control order + content)
		sections: tenant.sections && tenant.sections.length > 0 ? tenant.sections : defaults.sections,
	};
}
