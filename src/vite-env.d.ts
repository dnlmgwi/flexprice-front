/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_DEPLOYMENT_REGION?: string;
}

declare const __APP_VERSION__: string;
