// src/db/schema.ts
// Describes every table in your database.
// Nothing here connects to the DB — it's just the blueprint.

import {
  pgTable,
  pgEnum,
  serial,
  text,
  boolean,
  timestamp,
  varchar,
  index,
  uuid,
} from 'drizzle-orm/pg-core';

// ─────────────────────────────────────────────
// ENUM: time_slot
// Restricts values to exactly these three.
// Postgres rejects anything else.
// ─────────────────────────────────────────────
export const timeSlotEnum = pgEnum('time_slot', [
  'morning',
  'afternoon',
  'tonight',
]);

// ─────────────────────────────────────────────
// TABLE 1: users
// ─────────────────────────────────────────────
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 256 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─────────────────────────────────────────────
// TABLE 2: sessions
// ─────────────────────────────────────────────
export const sessions = pgTable(
  'sessions',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index('sessions_user_id_idx').on(table.userId),
  })
);

// ─────────────────────────────────────────────
// TABLE 3: todos
// Now includes timeSlot and dueDate for the timeline UI.
// ─────────────────────────────────────────────
export const todos = pgTable(
  'todos',
  {
    id: serial('id').primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    completed: boolean('completed').default(false).notNull(),
    timeSlot: timeSlotEnum('time_slot').default('morning').notNull(),
    dueDate: timestamp('due_date'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index('todos_user_id_idx').on(table.userId),
  })
);

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

export type Todo = typeof todos.$inferSelect;
export type NewTodo = typeof todos.$inferInsert;

export type TimeSlot = 'morning' | 'afternoon' | 'tonight';