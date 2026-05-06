import { lazy } from 'react';

export const preloadWebhookDashboard = () => import('./WebhookDashboard');

export const WebhookDashboardLazy = lazy(preloadWebhookDashboard);
