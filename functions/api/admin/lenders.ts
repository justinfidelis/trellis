import { createUser, getAllLenders } from '../_lib/db';
import { error, json, methodNotAllowed } from '../_lib/response';
import type { AppContext } from '../_lib/types';

export async function onRequest(context: AppContext) {
  if (context.request.method === 'GET') {
    const lenders = await getAllLenders(context.env.DB);
    return json(lenders);
  }

  if (context.request.method === 'POST') {
    const body = await context.request.json() as {
      email: string; name: string; tele_handle: string; role?: string;
    };
    if (!body.email || !body.name || !body.tele_handle) {
      return error('email, name and tele_handle are required');
    }
    const id = await createUser(context.env.DB, {
      email: body.email,
      name: body.name,
      tele_handle: body.tele_handle,
      role: body.role === 'admin' ? 'admin' : 'lender',
    });
    return json({ id }, 201);
  }

  return methodNotAllowed();
}
