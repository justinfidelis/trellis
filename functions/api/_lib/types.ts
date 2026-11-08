export interface Env {
  DB: D1Database;
  R2: R2Bucket;
  ENVIRONMENT?: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  SESSION_SECRET: string;
  BOT_TOKEN: string;
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  tele_handle: string;
  role: 'lender' | 'admin';
}

export type AppContext = EventContext<Env, string, { user?: SessionUser }>;
