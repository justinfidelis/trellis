import { createPasscode, getAllPasscodes } from '../_lib/db';
import { error, json, methodNotAllowed } from '../_lib/response';
import type { AppContext } from '../_lib/types';

export async function onRequest(context: AppContext) {
  if (context.request.method === 'GET') {
    const passcodes = await getAllPasscodes(context.env.DB);
    return json(passcodes);
  }

  if (context.request.method === 'POST') {
    const body = await context.request.json() as { code: string; label: string };
    if (!body.code || !body.label) return error('code and label are required');
    const id = await createPasscode(context.env.DB, body.code, body.label);
    return json({ id }, 201);
  }

  return methodNotAllowed();
}
