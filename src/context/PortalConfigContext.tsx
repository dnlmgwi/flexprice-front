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

/**
 * Fetches and provides the resolved PortalConfig for the current tenant.
 * Also injects theme CSS variables onto document.documentElement, and
 * cleans them up on unmount (prevents leaking into the main app).
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
		document.documentElement.style.setProperty('--portal-primary', theme.primary_color);
		document.documentElement.style.setProperty('--portal-secondary', theme.secondary_color);
		document.documentElement.style.setProperty('--portal-tertiary', theme.tertiary_color);
		if (theme.font_family) {
			document.documentElement.style.setProperty('--portal-font', theme.font_family);
		}

		return () => {
			document.documentElement.style.removeProperty('--portal-primary');
			document.documentElement.style.removeProperty('--portal-secondary');
			document.documentElement.style.removeProperty('--portal-tertiary');
			document.documentElement.style.removeProperty('--portal-font');
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
