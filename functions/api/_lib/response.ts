export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export function error(message: string, status = 400): Response {
  return json({ error: message }, status);
}

export function unauthorized(): Response {
  return error('Unauthorized', 401);
}

export function forbidden(): Response {
  return error('Forbidden', 403);
}

export function notFound(): Response {
  return error('Not found', 404);
}

export function methodNotAllowed(): Response {
  return error('Method not allowed', 405);
}
