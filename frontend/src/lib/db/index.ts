import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';
import { D1HttpDatabase } from './d1-http-client';

// Use Cloudflare D1 HTTP API in development, native binding in production
let _db: any = null;

function getDb() {
  if (_db) return _db;

  // Check if we're in Cloudflare Workers environment (production)
  if (typeof (globalThis as any).DB !== 'undefined') {
    // Production: D1 is bound by Cloudflare Workers
    console.log('✅ Using native Cloudflare D1 binding');
    _db = drizzle((globalThis as any).DB, { schema });
  } else {
    // Development: Use D1 HTTP API to connect to cloud database
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const databaseId = process.env.CLOUDFLARE_D1_DATABASE_ID || '753797e7-9b59-44fa-8ce2-f5fb711cf251';
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;

    if (!accountId || !apiToken) {
      console.error('⚠️  Missing Cloudflare credentials. Please set:');
      console.error('   CLOUDFLARE_ACCOUNT_ID');
      console.error('   CLOUDFLARE_API_TOKEN');
      console.error('   Get your API token from: https://dash.cloudflare.com/profile/api-tokens');
      throw new Error('Missing Cloudflare credentials');
    }

    console.log('☁️  Using Cloudflare D1 HTTP API (cloud database)');
    const d1Client = new D1HttpDatabase(accountId, databaseId, apiToken);
    _db = drizzle(d1Client as any, { schema });
  }

  return _db;
}

// Export a proxy that lazily initializes the connection
export const db = new Proxy({} as any, {
  get(target, prop) {
    const database = getDb();
    return database[prop];
  }
});
