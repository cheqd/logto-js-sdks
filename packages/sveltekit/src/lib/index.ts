import BaseClient, { createRequester } from '@logto/client';
import type { LogtoConfig } from '@logto/client';
import { redirect } from '@sveltejs/kit';
import type { Handle } from '@sveltejs/kit';

import { generateCodeChallenge, generateCodeVerifier, generateState } from './generators.js';
import { CookieStore } from './storage.js';

export type { LogtoConfig, LogtoClientErrorCode, UserInfoResponse } from '@logto/client';

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
  // eslint-disable-next-line @typescript-eslint/no-throw-literal
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
}

export const LogtoAuthHandler = (
  appId: string,
  endpoint: string,
  scopes?: string[],
  resources?: string[]
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

    return resolve(event);
  };
};
