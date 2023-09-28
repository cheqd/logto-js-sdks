import type { UserInfoResponse } from '@logto/client';
import BaseClient from '@logto/client';
// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
    namespace App {
        // interface Error {}
        // interface Platform {}
        interface Locals {
            getUser(): Promise<UserInfoResponse | null>;
            user: UserInfoResponse | null;
            logto: BaseClient;
            signInCallbackError?: unknown
        }
        interface PageData {
            user: UserInfoResponse | null;
        }
    }
}

export { };
