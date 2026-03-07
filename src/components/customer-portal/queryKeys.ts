/**
 * React Query keys for customer portal.
 * Shared so widgets and pages can deduplicate cache (e.g. CustomerPortal pre-fetch + InvoicesWidget).
 */
export const portalInvoicesQueryKey = ['portal-invoices-tab'] as const;
