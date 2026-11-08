import { deletePasscode, updatePasscode } from '../../_lib/db';
import { error, json, methodNotAllowed } from '../../_lib/response';
import type { AppContext } from '../../_lib/types';

export async function onRequest(context: AppContext) {
  const id = context.params.id as string;

  if (context.request.method === 'PATCH') {
    const body = await context.request.json() as { active: boolean };
    if (typeof body.active !== 'boolean') return error('active must be a boolean');
    await updatePasscode(context.env.DB, id, body.active);
    return json({ ok: true });
  }

  if (context.request.method === 'DELETE') {
    await deletePasscode(context.env.DB, id);
    return json({ ok: true });
  }

  return methodNotAllowed();
}
