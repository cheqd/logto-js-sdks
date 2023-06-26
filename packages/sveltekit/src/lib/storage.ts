import { PersistKey } from '@logto/client';
import type { Storage } from '@logto/client';
import type { Nullable } from '@silverhand/essentials';
import type { Cookies } from '@sveltejs/kit';
import type { CookieSerializeOptions } from 'cookie';

export const logtoStorageItemKeyPrefix = `logto`;

const defaultCookieOptions: CookieSerializeOptions = {
  path: '/',
  httpOnly: true,
  sameSite: 'lax',
};

export class CookieStore implements Storage<PersistKey> {
  private readonly storageKey: string;
  private readonly cookies: Cookies;
  private readonly cookieOptions: CookieSerializeOptions;

  constructor(appId: string, cookies: Cookies, cookieOptions?: CookieSerializeOptions) {
    this.storageKey = `${logtoStorageItemKeyPrefix}:${appId}`;
    this.cookies = cookies;
    this.cookieOptions = cookieOptions ?? defaultCookieOptions;
  }

  async getItem(key: PersistKey): Promise<Nullable<string>> {
    if (key === PersistKey.SignInSession) {
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

  async setItem(key: PersistKey, value: string): Promise<void> {
    if (key === PersistKey.SignInSession) {
      this.cookies.set(this.storageKey, value, this.cookieOptions);
      return;
    }

    this.cookies.set(`${this.storageKey}:${key}`, value, this.cookieOptions);
  }

  async removeItem(key: PersistKey): Promise<void> {
    if (key === PersistKey.SignInSession) {
      this.cookies.delete(this.storageKey, this.cookieOptions);

      return;
    }
    this.cookies.delete(`${this.storageKey}:${key}`, this.cookieOptions);
  }
}
