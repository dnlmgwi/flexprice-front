/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_DEPLOYMENT_REGION?: string;
}

declare const __APP_VERSION__: string;

interface ImportMetaEnv {
	readonly VITE_PADDLE_CLIENT_TOKEN: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
