declare global {
	namespace NodeJS {
		interface ProcessEnv {
			NODE_ENV: 'dev' | 'prod' | 'debug';
			BOT_TOKEN: string;
			DEV_GUILD: string;
			GUILD_CREATE_CHANNEL: string;
			GUILD_DELETE_CHANNEL: string;
			GUILD_COUNT_CHANNEL: string;
			POSTGRES_DB: string;
			POSTGRES_USER: string;
			POSTGRES_PASSWORD: string;
		}
	}
}

export {};
