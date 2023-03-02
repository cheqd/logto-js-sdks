import type { Storage, StorageKey } from '@logto/client';
import type { Nullable } from '@silverhand/essentials';
import type { Cookies } from '@sveltejs/kit';
import type { CookieSerializeOptions } from 'cookie';

export const logtoStorageItemKeyPrefix = `logto`;

const defaultCookieOptions: CookieSerializeOptions = {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
}

export class CookieStore implements Storage {
    private readonly storageKey: string;
    private cookies: Cookies;
    private readonly cookieOptions: CookieSerializeOptions;

    constructor(appId: string, cookies: Cookies, cookieOptions?: CookieSerializeOptions) {
        this.storageKey = `${logtoStorageItemKeyPrefix}:${appId}`;
        this.cookies = cookies;
        if (cookieOptions) {
            this.cookieOptions = cookieOptions
        } else {
            this.cookieOptions = defaultCookieOptions
        }
    }

    async getItem(key: StorageKey): Promise<Nullable<string>> {
        if (key === 'signInSession') {
            const cookie = this.cookies.get(this.storageKey);
            if (cookie) {
                return cookie;
            }

            return null;
        }

        const cookie = this.cookies.get(`${this.storageKey}:${key}`);
        if (cookie) {
            return decodeURIComponent(cookie);
        }

        return null;
    }

    async setItem(key: StorageKey, value: string): Promise<void> {
        if (key === 'signInSession') {
            this.cookies.set(this.storageKey, value, this.cookieOptions);
            return;
        }
        this.cookies.set(`${this.storageKey}:${key}`, value, this.cookieOptions);
    }

    async removeItem(key: StorageKey): Promise<void> {
        if (key === 'signInSession') {
            this.cookies.delete(this.storageKey);

            return;
        }
        return this.cookies.delete(`${this.storageKey}:${key}`);
    }
}
