import BaseClient, { createRequester } from '@logto/client';
import type { LogtoConfig } from '@logto/client';
import { redirect } from '@sveltejs/kit';
import type { Handle, RequestEvent } from '@sveltejs/kit';

import { generateCodeChallenge, generateCodeVerifier, generateState } from './generators.js';
import { CookieStore } from './storage.js';

export type { LogtoConfig, LogtoClientErrorCode, UserInfoResponse } from '@logto/client';
export { generateCodeVerifier, generateCodeChallenge, generateState };
export { CookieStore } from './storage.js';
export {
	LogtoError,
	OidcError,
	Prompt,
	LogtoRequestError,
	LogtoClientError,
	ReservedScope,
	UserScope,
} from '@logto/client';

const navigate = (url: string) => {
	throw redirect(307, url);
};

export type LogtoSvelteConfig = LogtoConfig & {
	fetch: typeof fetch;
};

export class LogtoClient extends BaseClient {
	constructor(config: LogtoSvelteConfig, cookieStore: CookieStore) {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		const requester = createRequester(config.fetch);
		super(config, {
			requester,
			navigate,
			storage: cookieStore,
			generateCodeChallenge,
			generateCodeVerifier,
			generateState,
		});
	}

	generateCodeChallenge = async (codeVerifier: string) => {
		return await generateCodeChallenge(codeVerifier);
	};

	generateCodeVerifier = () => {
		return generateCodeVerifier();
	};

	generateState = () => {
		return generateState();
	};
}

export const LogtoAuthHandler = (
	appId: string,
	endpoint: string,
	scopes?: string[],
	resources?: string[],
	callbackUri = '/logto/callback',
	afterCallback?: (event: RequestEvent) => Promise<void>
): Handle => {
	return async function ({ event, resolve }) {
		const client = new LogtoClient(
			{
				appId,
				endpoint,
				fetch: event.fetch,
				scopes,
				resources,
			},
			new CookieStore(appId, event.cookies)
		);
		event.locals.logto = client;
		if (event.url.pathname === callbackUri) {
			try {
				await client.handleSignInCallback(event.url.toString());
			} catch (err) {
				event.locals.signInCallbackError = err as Error;
			}
			if (afterCallback) {
				await afterCallback(event);
			}
		}

		return resolve(event);
	};
};
