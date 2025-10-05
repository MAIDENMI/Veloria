import { sqliteTable, text, integer, blob } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(), // From NextAuth
  name: text('name'),
  email: text('email').notNull().unique(),
  age: integer('age'),
  feeling: integer('feeling'),
  talkAbout: text('talk_about'),
  location: text('location'),
  onboarded: integer('onboarding_completed', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow(),
});
