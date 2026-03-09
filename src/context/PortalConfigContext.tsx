import { createContext, useContext, useEffect, useState, FC, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import CustomerPortalApi from '@/api/CustomerPortalApi';
import { PortalConfig, DEFAULT_PORTAL_CONFIG } from '@/types/dto/PortalConfig';

interface PortalConfigContextProps {
	config: PortalConfig;
	isLoading: boolean;
}

const PortalConfigContext = createContext<PortalConfigContextProps | undefined>(undefined);

interface PortalConfigProviderProps {
	token: string;
	children: ReactNode;
}

/** Returns true if the hex color has low perceived luminance (i.e. is "dark"). */
function isColorDark(hex: string): boolean {
	const clean = hex.replace('#', '');
	if (clean.length < 6) return false;
	const r = parseInt(clean.slice(0, 2), 16);
	const g = parseInt(clean.slice(2, 4), 16);
	const b = parseInt(clean.slice(4, 6), 16);
	const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
	return luminance < 0.5;
}

/**
 * Fetches and provides the resolved PortalConfig for the current tenant.
 * Also injects theme CSS variables onto document.documentElement, and
 * cleans them up on unmount (prevents leaking into the main app).
 *
 * Auto-derives text colors from background brightness so tenants only
 * need to supply 4 brand colors.
 */
export const PortalConfigProvider: FC<PortalConfigProviderProps> = ({ token, children }) => {
	const [config, setConfig] = useState<PortalConfig>(DEFAULT_PORTAL_CONFIG);

	const { data, isLoading } = useQuery<PortalConfig>({
		queryKey: ['portal-config', token],
		queryFn: () => CustomerPortalApi.getConfig(),
		enabled: !!token,
		staleTime: 5 * 60 * 1000, // 5 minutes — config rarely changes mid-session
		gcTime: 0,
		retry: false, // getConfig() already falls back internally, no need to retry
	});

	// Apply resolved config when it arrives
	useEffect(() => {
		if (data) {
			setConfig(data);
		}
	}, [data]);

	// Inject theme CSS variables — cleanup on unmount
	useEffect(() => {
		const { theme } = config;
		if (!theme) return; // No theme configured — portal keeps its default light-mode look

		// Guard each value: only write the var if the string is non-empty.
		// An empty field must NOT override the CSS fallback values.
		const set = (varName: string, value?: string) => {
			if (value) document.documentElement.style.setProperty(varName, value);
		};

		set('--portal-primary', theme.primary_color);
		set('--portal-bg', theme.background_color);
		set('--portal-surface', theme.surface_color);
		set('--portal-border', theme.border_color);
		set('--portal-font', theme.font_family);

		// Auto-derive text colors from background brightness.
		// Tenants supply brand colors only; text adapts to dark/light automatically.
		if (theme.background_color) {
			const dark = isColorDark(theme.background_color);
			document.documentElement.style.setProperty('--portal-text-primary', dark ? '#ffffff' : '#09090b');
			document.documentElement.style.setProperty('--portal-text-secondary', dark ? '#a5a5a5' : '#71717a');
			// Chart-specific: grid lines and card bg inside the chart molecule
			document.documentElement.style.setProperty('--portal-chart-grid', dark ? 'rgba(255,255,255,0.06)' : 'rgba(243,244,246,0.8)');
		}

		return () => {
			document.documentElement.style.removeProperty('--portal-primary');
			document.documentElement.style.removeProperty('--portal-bg');
			document.documentElement.style.removeProperty('--portal-surface');
			document.documentElement.style.removeProperty('--portal-border');
			document.documentElement.style.removeProperty('--portal-font');
			document.documentElement.style.removeProperty('--portal-text-primary');
			document.documentElement.style.removeProperty('--portal-text-secondary');
			document.documentElement.style.removeProperty('--portal-chart-grid');
		};
	}, [config.theme]);

	const value: PortalConfigContextProps = {
		config,
		isLoading,
	};

	return <PortalConfigContext.Provider value={value}>{children}</PortalConfigContext.Provider>;
};

export const usePortalConfig = (): PortalConfigContextProps => {
	const context = useContext(PortalConfigContext);
	if (!context) {
		throw new Error('usePortalConfig must be used within a PortalConfigProvider');
	}
	return context;
};
