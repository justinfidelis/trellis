import { getSetting, setSetting } from '../_lib/db';
import { error, json, methodNotAllowed } from '../_lib/response';
import type { AppContext } from '../_lib/types';

const ALLOWED_KEYS = ['max_active_requests'] as const;

export async function onRequest(context: AppContext) {
  if (context.request.method === 'GET') {
    const entries = await Promise.all(
      ALLOWED_KEYS.map(async (key) => [key, await getSetting(context.env.DB, key)])
    );
    return json(Object.fromEntries(entries));
  }

  if (context.request.method === 'PATCH') {
    const body = await context.request.json() as Record<string, string>;
    for (const key of Object.keys(body)) {
      if (!ALLOWED_KEYS.includes(key as typeof ALLOWED_KEYS[number])) {
        return error(`Unknown setting: ${key}`);
      }
      await setSetting(context.env.DB, key, String(body[key]));
    }
    return json({ ok: true });
  }

  return methodNotAllowed();
}
