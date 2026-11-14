import { error, json, methodNotAllowed, unauthorized } from '../_lib/response';
import type { AppContext } from '../_lib/types';

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

export async function onRequest(context: AppContext) {
  if (context.request.method !== 'POST') return methodNotAllowed();

  const user = context.data.user;
  if (!user) return unauthorized();

  const form = await context.request.formData();
  const file = form.get('file');
  if (!(file instanceof File)) return error('No file provided');

  const ext = EXT[file.type];
  if (!ext) return error('Unsupported image type');
  if (file.size > MAX_BYTES) return error('Image too large (max 5MB)');

  const key = `${crypto.randomUUID()}.${ext}`;
  await context.env.R2.put(key, file.stream(), {
    httpMetadata: { contentType: file.type },
  });

  return json({ url: `/api/covers/${key}` }, 201);
}
